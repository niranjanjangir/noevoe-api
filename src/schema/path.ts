import { z } from "zod";
import { CurrentLevelSchema, TargetLevelSchema } from "./levels";

export const LessonRefSchema = z.strictObject({
  id: z.string().min(1).max(80),
  sourceId: z.string().min(1).max(80),
  capabilityId: z.string().min(1).max(80),
  title: z.string().min(1).max(120),
  objective: z.string().min(1).max(300),
  order: z.number().int().min(1),
});
export type LessonRef = z.infer<typeof LessonRefSchema>;

export const CapabilitySchema = z.strictObject({
  id: z.string().min(1).max(80),
  pathId: z.string().min(1).max(80),
  sourceId: z.string().min(1).max(80),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(600),
  order: z.number().int().min(1),
  masteryCriteria: z.array(z.string().min(1).max(300)).min(1).max(5),
  lessons: z.array(LessonRefSchema).min(1).max(6),
});
export type Capability = z.infer<typeof CapabilitySchema>;
