import { z } from "zod";

export const BLOCK_RESULT_STATUSES = ["success", "incorrect", "completed", "abandoned"] as const;
export const BlockResultStatusSchema = z.enum(BLOCK_RESULT_STATUSES);
export type BlockResultStatus = z.infer<typeof BlockResultStatusSchema>;

export const BlockResultSchema = z.strictObject({
  blockId: z.string().min(1).max(64),
  status: BlockResultStatusSchema,
  attempts: z.number().int().min(0),
  detail: z.record(z.string(), z.unknown()).optional(),
  at: z.string().datetime(),
});
export type BlockResult = z.infer<typeof BlockResultSchema>;

export function satisfiesCompletion(result: Pick<BlockResult, "status">): boolean {
  return result.status === "success" || result.status === "completed";
}
