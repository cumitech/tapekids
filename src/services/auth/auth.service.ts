import bcrypt from "bcryptjs";

import { USER_ROLES } from "@/constants/user-roles";
import {
  parseForgotPassword,
  parseLogin,
  parseRegister,
  parseResetPassword,
  toCreateUserPayload,
} from "@/data/dtos/auth.dto";
import type { Person } from "@/data/entities/person";
import { PasswordResetRepository } from "@/data/repositories/password-reset.repository";
import { UserRepository } from "@/data/repositories/user.repository";
import { ConflictException } from "@/exceptions/conflict.exception";
import { UnauthorizedException } from "@/exceptions/unauthorized.exception";
import { ValidationException } from "@/exceptions/validation.exception";
import { nanoid } from "@/lib/api/id";
import { hashToken } from "@/lib/api/request-context";
import { signSession, toPublicUser, type PublicUser } from "@/lib/api/session";
import { isMailConfigured } from "@/lib/integrations/env";
import { logger } from "@/lib/logger";
import { auditService } from "@/services/audit/audit.service";
import { notificationService } from "@/services/notifications/notification.service";

const userRepository = new UserRepository();
const passwordResetRepository = new PasswordResetRepository();

export class AuthService {
  async login(body: unknown): Promise<{ token: string; user: PublicUser }> {
    const input = parseLogin(body);
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const matches = await bcrypt.compare(input.password, user.password);
    if (!matches) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    void auditService.record({
      action: "login",
      entity: "User",
      entityId: user.id,
    });

    return {
      token: signSession(user),
      user: toPublicUser(user),
    };
  }

  async register(body: unknown): Promise<{ token: string; user: PublicUser }> {
    const input = parseRegister(body);
    const payload = toCreateUserPayload(input);
    const existing = await userRepository.findByEmail(payload.email);
    if (existing) {
      throw new ConflictException("An account with this email already exists.");
    }

    const user = await userRepository.create({
      id: nanoid(),
      email: payload.email,
      username: payload.username,
      password: await bcrypt.hash(payload.password, 10),
      role: payload.role,
      verified: false,
    });

    await auditService.record({
      action: "create",
      entity: "User",
      entityId: user.id,
      after: user,
    });
    await notificationService.welcome({ to: user.email });

    return {
      token: signSession(user),
      user: toPublicUser(user),
    };
  }

  async forgotPassword(body: unknown): Promise<{ sent: boolean }> {
    if (!isMailConfigured()) {
      throw new ValidationException("Mail is not configured.");
    }
    const input = parseForgotPassword(body);
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      logger.info("auth.forgot_unknown_email");
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
      hashToken(input.token)
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
    return {
      token: signSession(user),
      user: toPublicUser(user),
    };
  }

  async completeGuestInvite(
    person: Person,
    password: string
  ): Promise<{ created: boolean; token: string; user: PublicUser }> {
    const passwordHash = await bcrypt.hash(password, 10);
    const existing =
      (await userRepository.findByPersonId(person.id)) ??
      (await userRepository.findByEmail(person.email));

    if (existing) {
      if (!existing.personId) {
        await userRepository.linkPerson(existing.id, person.id);
      }
      const user = await userRepository.updatePassword(existing.id, passwordHash);
      return {
        created: false,
        token: signSession(user),
        user: toPublicUser(user),
      };
    }

    const user = await userRepository.create({
      id: nanoid(),
      email: person.email,
      username: person.email.split("@")[0] || "guest",
      password: passwordHash,
      role: USER_ROLES.GUEST,
      verified: true,
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
      token: signSession(user),
      user: toPublicUser(user),
    };
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
    const token = nanoid(48);
    await passwordResetRepository.create({
      id: nanoid(),
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      usedAt: null,
    });
    await notificationService.passwordReset({
      to: email,
      firstName,
      token,
      setPassword,
    });
  }
}

export const authService = new AuthService();
