import { z } from "zod";
import { LessonBlockSchema } from "./blocks";

export const CompletionCriteriaSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("complete_required_blocks"),
    requiredBlockIds: z.array(z.string().min(1).max(64)).min(1).max(20),
  }),
]);
export type CompletionCriteria = z.infer<typeof CompletionCriteriaSchema>;

export const LessonSchema = z.strictObject({
  id: z.string().min(1).max(80),
  schemaVersion: z.string().regex(/^\d+\.\d+$/),
  capabilityId: z.string().min(1).max(80),
  title: z.string().trim().min(1).max(120),
  objective: z.string().trim().min(1).max(300),
  estimatedMinutes: z.number().int().min(1).max(30),
  blocks: z.array(LessonBlockSchema).min(1).max(20),
  completionCriteria: CompletionCriteriaSchema,
});
export type Lesson = z.infer<typeof LessonSchema>;

export const GeneratedLessonSchema = LessonSchema.omit({
  id: true,
  schemaVersion: true,
  capabilityId: true,
});
export type GeneratedLesson = z.infer<typeof GeneratedLessonSchema>;
