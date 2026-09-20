import { z } from "zod";
import { CurrentLevelSchema, TargetLevelSchema } from "./levels";

export const CAPABILITY_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "RETIRED"] as const;

export const CapabilityStatusSchema = z.enum(CAPABILITY_STATUSES);
export type CapabilityStatus = z.infer<typeof CapabilityStatusSchema>;

export const LESSON_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "ABANDONED", "RETIRED"] as const;
export const LessonStatusSchema = z.enum(LESSON_STATUSES);
export type LessonStatus = z.infer<typeof LessonStatusSchema>;

export const OnboardingInputSchema = z.strictObject({
  hobbyDescription: z.string().trim().min(3).max(500),
  targetLevel: TargetLevelSchema,
  currentLevel: CurrentLevelSchema,
  currentLevelNote: z.string().trim().max(300).optional(),
});
export type OnboardingInput = z.infer<typeof OnboardingInputSchema>;

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

export const HobbyPathSchema = z.strictObject({
  id: z.string().min(1).max(80),
  hobby: z.string().min(1).max(80),
  goal: z.string().min(1).max(200),
  targetLevel: TargetLevelSchema,
  currentLevel: CurrentLevelSchema,
  currentLevelNote: z.string().max(300).optional(),
  capabilities: z.array(CapabilitySchema).min(1).max(12),
  createdAt: z.string().datetime(),
});
export type HobbyPath = z.infer<typeof HobbyPathSchema>;
