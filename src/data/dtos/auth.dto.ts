import { z } from "zod";

import { USER_ROLES } from "@/constants/user-roles";
import { matchingPasswordPair } from "@/data/dtos/password.dto";

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

export const registerSchema = matchingPasswordPair({
  email: z.string().trim().email().toLowerCase(),
  username: z.string().trim().min(2).max(50),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
});

export const resetPasswordSchema = matchingPasswordPair({
  token: z.string().trim().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export type CreateUserPayload = {
  email: string;
  username: string;
  password: string;
  role: typeof USER_ROLES.GUEST;
};

export const verifyEmailSchema = z.object({
  token: z.string().trim().min(1),
});

export function parseLogin(body: unknown): LoginInput {
  return loginSchema.parse(body);
}

export function parseRegister(body: unknown): RegisterInput {
  return registerSchema.parse(body);
}

export function parseForgotPassword(body: unknown) {
  return forgotPasswordSchema.parse(body);
}

export function parseResetPassword(body: unknown) {
  return resetPasswordSchema.parse(body);
}

export function toCreateUserPayload(input: RegisterInput): CreateUserPayload {
  return {
    email: input.email,
    username: input.username,
    password: input.password,
    role: USER_ROLES.GUEST,
  };
}

export function parseVerifyEmail(body: unknown) {
  return verifyEmailSchema.parse(body);
}
