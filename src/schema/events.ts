import { z } from "zod";

export const PROGRESS_EVENT_TYPES = [
  "path_created",
  "path_viewed",
  "lesson_started",
  "block_completed",
  "lesson_completed",
  "lesson_abandoned",
  "lesson_retired",
  "lesson_restored",
  "capability_completed",
  "capability_retired",
  "capability_restored",
] as const;
export const ProgressEventTypeSchema = z.enum(PROGRESS_EVENT_TYPES);
export type ProgressEventType = z.infer<typeof ProgressEventTypeSchema>;

export const ProgressEventSchema = z.strictObject({
  id: z.string().min(1).max(80),
  pathId: z.string().min(1).max(80),
  capabilityId: z.string().min(1).max(80).optional(),
  lessonId: z.string().min(1).max(80).optional(),
  blockId: z.string().min(1).max(80).optional(),
  eventType: ProgressEventTypeSchema,
  metadata: z.record(z.string(), z.unknown()).default({}),
  timestamp: z.string().datetime(),
});
export type ProgressEvent = z.infer<typeof ProgressEventSchema>;
