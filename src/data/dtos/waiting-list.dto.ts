import { z } from "zod";

import { createPersonSchema } from "@/data/dtos/person.dto";

export const registerWaitingListSchema = createPersonSchema.extend({
  email: z.string().trim().email().max(128).toLowerCase(),
});

export const approveWaitingListSchema = z.object({
  ids: z.array(z.string().trim().min(1).max(20)).min(1).max(100),
});

export type RegisterWaitingList = z.infer<typeof registerWaitingListSchema>;

export function parseRegisterWaitingList(body: unknown): RegisterWaitingList {
  return registerWaitingListSchema.parse(body);
}

export function parseApproveWaitingList(body: unknown): string[] {
  return approveWaitingListSchema.parse(body).ids;
}
