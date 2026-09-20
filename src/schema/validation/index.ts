import { DEFAULT_CONSTRAINTS, type GenerationConstraints } from "../api";
import { CurriculumGenerationOutputSchema, type Curriculum, type CurriculumGenerationOutput } from "../curriculum";
import { fail, ok, zodIssues, type ValidationIssue, type ValidationResult } from "../issues";
import { GeneratedLessonSchema, LessonSchema, type Lesson } from "../lesson";
import { LESSON_SCHEMA_VERSION } from "../versions";
import { validateAssetRefs } from "./assets.validation";
import { validateCurriculumSemantics } from "./curriculum.validation";
import { validateLessonSemantics } from "./lesson.validation";

export * from "./assets.validation";
export * from "./curriculum.validation";
export * from "./lesson.validation";

export function validateCurriculumOutput(
  raw: unknown,
  constraints: GenerationConstraints = DEFAULT_CONSTRAINTS,
): ValidationResult<CurriculumGenerationOutput> {
  const parsed = CurriculumGenerationOutputSchema.safeParse(raw);
  if (!parsed.success) return fail(zodIssues(parsed.error));
  if (parsed.data.status === "rejected") return ok(parsed.data);
  const curriculum = parsed.data.curriculum;

  const issues = validateCurriculumSemantics(curriculum, constraints).map((i) => ({ ...i, path: `curriculum.${i.path}` }));
  return issues.length ? fail(issues) : ok(parsed.data);
}

export interface LessonStamp {
  lessonId: string;
  capabilityId: string;
}

export function validateGeneratedLesson(raw: unknown, stamp: LessonStamp, constraints?: GenerationConstraints): ValidationResult<Lesson> {
  const parsed = GeneratedLessonSchema.safeParse(raw);
  if (!parsed.success) return fail(zodIssues(parsed.error));
  const lesson: Lesson = {
    ...parsed.data,
    id: stamp.lessonId,
    capabilityId: stamp.capabilityId,
    schemaVersion: LESSON_SCHEMA_VERSION,
  };
  return validateLesson(lesson, constraints);
}

export function validateLesson(raw: unknown, generationConstraints?: GenerationConstraints): ValidationResult<Lesson> {
  const parsed = LessonSchema.safeParse(raw);
  if (!parsed.success) return fail(zodIssues(parsed.error));
  const lesson = parsed.data;

  const constraints = generationConstraints ?? DEFAULT_CONSTRAINTS;
  const issues = [
    ...validateLessonSemantics(lesson, constraints ),
    ...validateAssetRefs(lesson.blocks),
  ];
  return issues.length ? fail(issues) : ok(lesson);
}
