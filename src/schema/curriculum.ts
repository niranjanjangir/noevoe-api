import { z } from "zod";

export const SlugId = z.string().regex(/^[a-z0-9][a-z0-9_]{1,39}$/, "lowercase slug id");

export const LessonOutlineSchema = z.strictObject({
  id: SlugId,
  title: z.string().trim().min(1).max(120),
  objective: z.string().trim().min(1).max(300),
});
export type LessonOutline = z.infer<typeof LessonOutlineSchema>;

export const CurriculumCapabilitySchema = z.strictObject({
  id: SlugId,
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(600),
  order: z.number().int().min(1),
  masteryCriteria: z.array(z.string().trim().min(1).max(300)).min(1).max(5),
  lessons: z.array(LessonOutlineSchema).min(1).max(6),
});
export type CurriculumCapability = z.infer<typeof CurriculumCapabilitySchema>;

export const CurriculumSchema = z.strictObject({
  schemaVersion: z.string().regex(/^\d+\.\d+$/),
  hobby: z.string().trim().min(1).max(80),
  goal: z.string().trim().min(1).max(200),
  capabilities: z.array(CurriculumCapabilitySchema).min(1).max(12),
});
export type Curriculum = z.infer<typeof CurriculumSchema>;

export const CurriculumGenerationOutputSchema = z.discriminatedUnion("status", [
  z.strictObject({ status: z.literal("ok"), curriculum: CurriculumSchema }),
  z.strictObject({ status: z.literal("rejected"), reason: z.string().trim().min(1).max(300) }),
]);
export type CurriculumGenerationOutput = z.infer<typeof CurriculumGenerationOutputSchema>;
