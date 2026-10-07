import { randomBytes } from "node:crypto";

import bcrypt from "bcryptjs";

import { AUTH_TOKEN_PURPOSES } from "@/constants/auth-tokens";
import { USER_ROLES } from "@/constants/user-roles";
import {
  parseForgotPassword,
  parseLogin,
  parseRegister,
  parseResetPassword,
  parseVerifyEmail,
  toCreateUserPayload,
} from "@/data/dtos/auth.dto";
import { passwordPairSchema } from "@/data/dtos/password.dto";
import type { Person } from "@/data/entities/person";
import { PasswordResetRepository } from "@/data/repositories/password-reset.repository";
import { UserRepository } from "@/data/repositories/user.repository";
import { ConflictException } from "@/exceptions/conflict.exception";
import { UnauthorizedException } from "@/exceptions/unauthorized.exception";
import { ValidationException } from "@/exceptions/validation.exception";
import { nanoid, tokenId } from "@/lib/api/id";
import { hashToken } from "@/lib/api/request-context";
import { signSession, toPublicUser, type PublicUser } from "@/lib/api/session";
import { isMailConfigured } from "@/lib/integrations/env";
import { logger } from "@/lib/logger";
import { normalizeYfId, yfGuestEmail, yfGuestHandle } from "@/lib/people/yf-id";
import { auditService } from "@/services/audit/audit.service";
import { notificationService } from "@/services/notifications/notification.service";

const userRepository = new UserRepository();
const passwordResetRepository = new PasswordResetRepository();

const AUTH_TOKEN_MS = 2 * 60 * 60 * 1000;
const VERIFY_TOKEN_MS = 48 * 60 * 60 * 1000;

export type AuthSessionResult = { token: string; user: PublicUser };
export type RegisterResult =
  | AuthSessionResult
  | { sent: true; requiresVerification: true };

export class AuthService {
  async login(body: unknown): Promise<AuthSessionResult> {
    const input = parseLogin(body);
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const matches = await bcrypt.compare(input.password, user.password);
    if (!matches) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    if (!user.verified) {
      throw new UnauthorizedException(
        "Verify your email before signing in."
      );
    }

    void auditService.record({
      action: "login",
      entity: "User",
      entityId: user.id,
    });

    return this.sessionFor(user);
  }

  async register(body: unknown): Promise<RegisterResult> {
    const input = parseRegister(body);
    const payload = toCreateUserPayload(input);
    const existing = await userRepository.findByEmail(payload.email);
    if (existing) {
      throw new ConflictException("An account with this email already exists.");
    }

    const mailReady = isMailConfigured();
    const user = await userRepository.create({
      id: nanoid(),
      email: payload.email,
      username: payload.username,
      password: await bcrypt.hash(payload.password, 10),
      role: payload.role,
      verified: !mailReady,
    });

    await auditService.record({
      action: "create",
      entity: "User",
      entityId: user.id,
      after: user,
    });

    if (mailReady) {
      await this.issueEmailVerification(user.id, user.email, user.username);
      return { sent: true, requiresVerification: true };
    }

    await notificationService.welcome({
      to: user.email,
      firstName: user.username,
    });
    return this.sessionFor(user);
  }

  async verifyEmail(body: unknown): Promise<AuthSessionResult> {
    const input = parseVerifyEmail(body);
    const reset = await passwordResetRepository.findValid(
      hashToken(input.token),
      AUTH_TOKEN_PURPOSES.VERIFY_EMAIL
    );
    const user = await userRepository.markVerified(reset.userId);
    await passwordResetRepository.markUsed(reset.id);
    await auditService.record({
      action: "email_verified",
      entity: "User",
      entityId: user.id,
    });
    return this.sessionFor(user);
  }

  async forgotPassword(body: unknown): Promise<{ sent: boolean }> {
    const input = parseForgotPassword(body);
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      logger.info("auth.forgot_unknown_email");
      return { sent: true };
    }
    if (!user.verified) {
      await this.issueEmailVerification(user.id, user.email, user.username);
      return { sent: true };
    }
    if (!isMailConfigured()) {
      logger.warn("auth.password_reset_skipped_no_mail", { userId: user.id });
      return { sent: true };
    }
    await this.issuePasswordReset(user.id, user.email, false);
    await auditService.record({
      action: "password_reset_requested",
      entity: "User",
      entityId: user.id,
    });
    return { sent: true };
  }

  async resetPassword(
    body: unknown
  ): Promise<{ token: string; user: PublicUser }> {
    const input = parseResetPassword(body);
    const reset = await passwordResetRepository.findValid(
      hashToken(input.token),
      AUTH_TOKEN_PURPOSES.RESET_PASSWORD
    );
    const password = await bcrypt.hash(input.password, 10);
    const user = await userRepository.updatePassword(reset.userId, password);
    await passwordResetRepository.markUsed(reset.id);
    await auditService.record({
      action: "password_reset",
      entity: "User",
      entityId: user.id,
    });
    await notificationService.passwordChanged({ to: user.email });
    return this.sessionFor(user);
  }

  async hasAccountForPerson(person: Person): Promise<boolean> {
    const byPerson = await userRepository.findByPersonId(person.id);
    if (byPerson) {
      return true;
    }
    const yfId = normalizeYfId(person.yfId);
    if (!yfId) {
      return false;
    }
    return Boolean(await userRepository.findByYfId(yfId));
  }

  async completeGuestInvite(
    person: Person,
    options: {
      password?: string;
      verifiedByYfId?: boolean;
      actor?: { id: string } | null;
    } = {}
  ): Promise<{ created: boolean; token: string; user: PublicUser }> {
    const yfId = normalizeYfId(person.yfId) || null;
    const existingByPerson = await userRepository.findByPersonId(person.id);
    const existingByYf = yfId ? await userRepository.findByYfId(yfId) : null;
    if (
      existingByYf &&
      ((existingByPerson && existingByYf.id !== existingByPerson.id) ||
        (existingByYf.personId && existingByYf.personId !== person.id))
    ) {
      throw new ConflictException(
        "This Young Foundations ID is already used by another account."
      );
    }
    const existing = existingByPerson ?? existingByYf;

    if (existing) {
      const signedIn = options.actor?.id === existing.id;
      if (!signedIn && !options.verifiedByYfId) {
        if (!options.password) {
          throw new ValidationException(
            "Sign in with your existing password to accept this invitation."
          );
        }
        const matches = await bcrypt.compare(
          options.password,
          existing.password
        );
        if (!matches) {
          throw new UnauthorizedException("Invalid email or password.");
        }
      }
      let user = existing.personId
        ? existing
        : await userRepository.linkPerson(existing.id, person.id);
      if (yfId && user.yfId !== yfId) {
        user = await userRepository.setYfId(user.id, yfId);
      }
      user = await this.releaseSharedContactEmail(user, person);
      const verified = user.verified
        ? user
        : await userRepository.markVerified(user.id);
      return {
        created: false,
        ...this.sessionFor(verified),
      };
    }

    const chosenPassword = options.password;
    const password = chosenPassword ?? randomBytes(32).toString("hex");
    if (!chosenPassword && !options.verifiedByYfId) {
      throw new ValidationException("Create a password to open your account.");
    }

    const email = yfGuestEmail(person);
    const username = email.split("@")[0] || `yf-${yfGuestHandle(person)}`;

    const user = await userRepository.create({
      id: nanoid(),
      email,
      yfId,
      username,
      password: await bcrypt.hash(password, 10),
      role: USER_ROLES.GUEST,
      verified: true,
      passwordChosen: Boolean(chosenPassword),
      personId: person.id,
    });

    await auditService.record({
      action: "create",
      entity: "User",
      entityId: user.id,
      after: user,
    });

    return {
      created: true,
      ...this.sessionFor(user),
    };
  }

  async choosePassword(userId: string, body: unknown) {
    const input = passwordPairSchema.parse(body);
    const user = await userRepository.choosePassword(
      userId,
      await bcrypt.hash(input.password, 10)
    );
    await auditService.record({
      action: "password_set",
      entity: "User",
      entityId: user.id,
    });
    return toPublicUser(user);
  }

  private async releaseSharedContactEmail(
    user: Awaited<ReturnType<UserRepository["findById"]>>,
    person: Person
  ) {
    const contact = person.email?.trim().toLowerCase();
    if (
      user.role !== USER_ROLES.GUEST ||
      !contact ||
      user.email.trim().toLowerCase() !== contact
    ) {
      return user;
    }
    const synthetic = yfGuestEmail(person);
    if (user.email === synthetic) {
      return user;
    }
    const taken = await userRepository.findByEmail(synthetic);
    if (taken && taken.id !== user.id) {
      return user;
    }
    return userRepository.updateEmail(user.id, synthetic);
  }

  private sessionFor(user: Awaited<ReturnType<UserRepository["findById"]>>): AuthSessionResult {
    return {
      token: signSession(user),
      user: toPublicUser(user),
    };
  }

  private async createOneTimeToken(
    userId: string,
    ttlMs: number,
    purpose: (typeof AUTH_TOKEN_PURPOSES)[keyof typeof AUTH_TOKEN_PURPOSES]
  ) {
    const token = tokenId();
    await passwordResetRepository.create({
      id: nanoid(),
      userId,
      tokenHash: hashToken(token),
      purpose,
      expiresAt: new Date(Date.now() + ttlMs),
      usedAt: null,
    });
    return token;
  }

  private async issueEmailVerification(
    userId: string,
    email: string,
    firstName?: string
  ) {
    const token = await this.createOneTimeToken(
      userId,
      VERIFY_TOKEN_MS,
      AUTH_TOKEN_PURPOSES.VERIFY_EMAIL
    );
    await notificationService.verifyEmail({
      to: email,
      firstName,
      token,
    });
  }

  private async issuePasswordReset(
    userId: string,
    email: string,
    setPassword: boolean,
    firstName?: string
  ) {
    if (!isMailConfigured()) {
      logger.warn("auth.password_reset_skipped_no_mail", { userId });
      return;
    }
    const token = await this.createOneTimeToken(
      userId,
      AUTH_TOKEN_MS,
      AUTH_TOKEN_PURPOSES.RESET_PASSWORD
    );
    await notificationService.passwordReset({
      to: email,
      firstName,
      token,
      setPassword,
    });
  }
}

export const authService = new AuthService();
