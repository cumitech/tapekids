import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH)
  .max(PASSWORD_MAX_LENGTH);

const passwordPairShape = {
  password: passwordSchema,
  confirmPassword: passwordSchema,
};

type PasswordPairOptions = {
  passthrough?: boolean;
};

export const passwordPairSchema = z
  .object(passwordPairShape)
  .refine((value) => value.password === value.confirmPassword, {
    message: "Your passwords do not match.",
    path: ["confirmPassword"],
  });

export function matchingPasswordPair<T extends z.ZodRawShape>(
  shape: T,
  options: PasswordPairOptions = {}
) {
  const object = z.object({
    ...passwordPairShape,
    ...shape,
  });
  const schema = options.passthrough ? object.passthrough() : object;
  return schema.refine((value) => value.password === value.confirmPassword, {
    message: "Your passwords do not match.",
    path: ["confirmPassword"],
  });
}
