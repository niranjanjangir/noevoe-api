import { z } from "zod";
import { CurriculumCapabilitySchema, CurriculumSchema, LessonOutlineSchema } from "./curriculum";
import { LessonSchema } from "./lesson";
import { CurrentLevelSchema, TargetLevelSchema } from "./levels";

const Range = z.strictObject({ min: z.number().int().min(1), max: z.number().int().min(1) });

export const GenerationConstraintsSchema = z.strictObject({
  capabilityCount: Range.default({ min: 5, max: 8 }),
  lessonMinutes: Range.default({ min: 3, max: 8 }),
  lessonsPerCapability: Range.default({ min: 2, max: 4 }),
  blocksPerLesson: Range.default({ min: 3, max: 10 }),
  allowGenericVisuals: z.boolean().default(true),
  allowImages: z.boolean().default(false),
  allowVideo: z.boolean().default(true),
});
export type GenerationConstraints = z.infer<typeof GenerationConstraintsSchema>;
export const DEFAULT_CONSTRAINTS: GenerationConstraints = GenerationConstraintsSchema.parse({});

export const CurriculumGenerateRequestSchema = z.strictObject({
  hobbyDescription: z.string().trim().min(3).max(500),
  targetLevel: TargetLevelSchema,
  currentLevel: CurrentLevelSchema,
  currentLevelNote: z.string().trim().max(300).optional(),
  constraints: GenerationConstraintsSchema.default(DEFAULT_CONSTRAINTS),
});
export type CurriculumGenerateRequest = z.infer<typeof CurriculumGenerateRequestSchema>;

export const CurriculumGenerateResponseSchema = z.discriminatedUnion("status", [
  z.strictObject({ status: z.literal("ok"), curriculum: CurriculumSchema }),
  z.strictObject({ status: z.literal("rejected"), reason: z.string().min(1).max(300) }),
]);
export type CurriculumGenerateResponse = z.infer<typeof CurriculumGenerateResponseSchema>;

export const LessonGenerateRequestSchema = z.strictObject({
  hobby: z.string().trim().min(1).max(80),
  goal: z.string().trim().min(1).max(200),
  targetLevel: TargetLevelSchema,
  currentLevel: CurrentLevelSchema,
  currentLevelNote: z.string().trim().max(300).optional(),
  capability: CurriculumCapabilitySchema,
  lessonOutline: LessonOutlineSchema,
  lessonId: z.string().min(1).max(80),
  capabilityId: z.string().min(1).max(80),
  constraints: GenerationConstraintsSchema.default(DEFAULT_CONSTRAINTS),
});
export type LessonGenerateRequest = z.infer<typeof LessonGenerateRequestSchema>;

export const LessonGenerateResponseSchema = z.strictObject({ lesson: LessonSchema });
export type LessonGenerateResponse = z.infer<typeof LessonGenerateResponseSchema>;

export const CLIENT_REPORT_KINDS = ["unknown_block_type", "render_failure", "local_restore_failure", "schema_mismatch"] as const;
export const ClientReportSchema = z.strictObject({
  kind: z.enum(CLIENT_REPORT_KINDS),
  lessonId: z.string().max(80).optional(),
  blockType: z.string().max(64).optional(),
  schemaVersion: z.string().max(16).optional(),
  message: z.string().max(1000),
  at: z.string().datetime(),
});
export type ClientReport = z.infer<typeof ClientReportSchema>;

export const API_ERROR_CODES = [
  "bad_request",
  "hobby_rejected",
  "generation_failed",
  "upstream_unavailable",
  "not_found",
  "internal",
] as const;
export const ApiErrorSchema = z.strictObject({
  error: z.strictObject({
    code: z.enum(API_ERROR_CODES),
    message: z.string(),
    detail: z.unknown().optional(),
    requestId: z.string().optional(),
  }),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
