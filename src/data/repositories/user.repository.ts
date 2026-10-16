import { col, fn, where } from "sequelize";

import type { UserRole } from "@/constants/user-roles";
import { User } from "@/data/entities";
import { USER_SESSION_ATTRIBUTES } from "@/data/query-shape";
import { NotFoundException } from "@/exceptions/not-found.exception";
import { normalizeYfId } from "@/lib/people/yf-id";

const SESSION_CACHE_MS = 60_000;
const sessionUserCache = new Map<string, { at: number; user: User }>();

export class UserRepository {
  invalidateSessionCache(id?: string) {
    if (id) {
      sessionUserCache.delete(id);
      return;
    }
    sessionUserCache.clear();
  }

  async create(payload: {
    id: string;
    email: string;
    yfId?: string | null;
    username: string;
    password: string;
    role: UserRole;
    verified?: boolean;
    passwordChosen?: boolean;
    personId?: string | null;
  }): Promise<User> {
    return User.create(payload);
  }

  async findById(id: string): Promise<User> {
    const cached = sessionUserCache.get(id);
    if (cached && Date.now() - cached.at < SESSION_CACHE_MS) {
      return cached.user;
    }
    const user = await User.findByPk(id, {
      attributes: [...USER_SESSION_ATTRIBUTES],
    });
    if (!user) {
      throw new NotFoundException("User", id);
    }
    sessionUserCache.set(id, { at: Date.now(), user });
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({
      where: where(fn("LOWER", col("email")), email.trim().toLowerCase()),
    });
  }

  async findByPersonId(personId: string): Promise<User | null> {
    return User.findOne({ where: { personId } });
  }

  async findByYfId(yfId: string): Promise<User | null> {
    const normalized = normalizeYfId(yfId);
    if (!normalized) {
      return null;
    }
    return User.findOne({ where: { yfId: normalized } });
  }

  async setYfId(id: string, yfId: string | null): Promise<User> {
    const user = await this.findById(id);
    await user.update({ yfId });
    this.invalidateSessionCache(id);
    return this.findById(id);
  }

  async updateEmail(id: string, email: string): Promise<User> {
    const user = await this.findById(id);
    await user.update({ email });
    this.invalidateSessionCache(id);
    return this.findById(id);
  }

  async markVerified(id: string): Promise<User> {
    const user = await this.findById(id);
    await user.update({ verified: true });
    this.invalidateSessionCache(id);
    return this.findById(id);
  }

  async choosePassword(id: string, password: string): Promise<User> {
    const user = await this.findById(id);
    await user.update({ password, passwordChosen: true });
    this.invalidateSessionCache(id);
    return this.findById(id);
  }

  async updatePassword(id: string, password: string): Promise<User> {
    const user = await this.findById(id);
    await user.update({ password, passwordChosen: true });
    await user.increment("sessionVersion");
    this.invalidateSessionCache(id);
    return this.findById(id);
  }

  async linkPerson(userId: string, personId: string): Promise<User> {
    const user = await this.findById(userId);
    await user.update({ personId });
    this.invalidateSessionCache(userId);
    return this.findById(userId);
  }
}
