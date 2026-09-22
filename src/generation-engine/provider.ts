import type { CurriculumGenerateRequest, LessonGenerateRequest, ValidationIssue } from "../schema";

export type ContentProvider = {
  name: string;
  generateCurriculum(request: CurriculumGenerateRequest, previousIssues: ValidationIssue[]): Promise<unknown>;
  generateLesson(request: LessonGenerateRequest, previousIssues: ValidationIssue[]): Promise<unknown>;
};
