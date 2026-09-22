import type { Config } from "../config";
import { createGeminiProvider } from "./geminiProvider";
import { createGroqProvider } from "./groqProvider";
import type { CurriculumGenerateRequest, LessonGenerateRequest, ValidationIssue } from "../schema";

export type ContentProvider = {
  name: string;
  generateCurriculum(request: CurriculumGenerateRequest, previousIssues: ValidationIssue[]): Promise<unknown>;
  generateLesson(request: LessonGenerateRequest, previousIssues: ValidationIssue[]): Promise<unknown>;
};

export function createProvider(config: Config): ContentProvider[] | null{
  const providers: ContentProvider[] = [];
  if(config.geminiApiKey) {
    providers.push(createGeminiProvider(config.geminiApiKey, config.geminiModel, config.generationTimeoutMs));
  }
  if (config.groqApiKey) {
    providers.push(createGroqProvider(config.groqApiKey, config.groqModel, config.generationTimeoutMs));
  }
  return providers.length > 0 ? providers : null;
}
