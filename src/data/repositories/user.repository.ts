import { col, fn, where } from "sequelize";

import type { UserRole } from "@/constants/user-roles";
import { NotFoundException } from "@/exceptions/not-found.exception";
import { User } from "@/data/entities";

export class UserRepository {
  async create(payload: {
    id: string;
    email: string;
    username: string;
    password: string;
    role: UserRole;
    verified?: boolean;
    personId?: string | null;
  }): Promise<User> {
    return User.create(payload);
  }

  async findById(id: string): Promise<User> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundException("User", id);
    }
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

  async updatePassword(id: string, password: string): Promise<User> {
    const user = await this.findById(id);
    await user.update({ password, verified: true });
    return this.findById(id);
  }

  async linkPerson(userId: string, personId: string): Promise<User> {
    const user = await this.findById(userId);
    await user.update({ personId });
    return this.findById(userId);
  }
}
