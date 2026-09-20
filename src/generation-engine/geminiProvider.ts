import { GoogleGenAI } from "@google/genai";
import type { CurriculumGenerateRequest, LessonGenerateRequest, ValidationIssue } from "../schema";
import { AppError } from "../../errors";
import { buildCurriculumPrompt } from "./system-prompts/curriculum.prompt";
import { buildLessonPrompt } from "./system-prompts/lesson.prompt";
import { curriculumOutputJsonSchema, lessonOutputJsonSchema } from "./schema";

export type ContentProvider = {
  name: "gemini";
  generateCurriculum(request: CurriculumGenerateRequest, previousIssues: ValidationIssue[]): Promise<unknown>;
  generateLesson(request: LessonGenerateRequest, previousIssues: ValidationIssue[]): Promise<unknown>;
};

export function createGeminiProvider(apiKey: string, model: string, timeoutMs: number): ContentProvider {
  const client = new GoogleGenAI({ apiKey });

  async function ask(system: string, user: string, jsonSchema: unknown): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await client.models.generateContent({
        model,
        contents: user,
        config: {
          systemInstruction: system,
          responseMimeType: "application/json",
          responseJsonSchema: jsonSchema,
          temperature: 0.7,
          abortSignal: controller.signal,
        },
      });
      const text = response.text;
      if (!text) throw new Error("Gemini returned an empty response");
      return JSON.parse(text);
    } catch (err) {
      if (isRateLimit(err)) {
        throw new AppError("upstream_unavailable", 429, "The AI service is unavailable, please try again in a moment");
      }
      if (controller.signal.aborted) throw new Error("Gemini call timed out after " + timeoutMs + " ms");
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    name: "gemini",
    generateCurriculum(request: CurriculumGenerateRequest, previousIssues: ValidationIssue[]) {
      const prompt = buildCurriculumPrompt(request, previousIssues);
      return ask(prompt.system, prompt.user, curriculumOutputJsonSchema);
    },
    generateLesson(request: LessonGenerateRequest, previousIssues: ValidationIssue[]) {
      const prompt = buildLessonPrompt(request, previousIssues);
      return ask(prompt.system, prompt.user, lessonOutputJsonSchema);
    },
  };
}

function isRateLimit(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const anyErr = err as { status?: unknown; message?: unknown };
  if (anyErr.status === 429) return true;
  const message = typeof anyErr.message === "string" ? anyErr.message : "";
  return message.includes("429") || message.includes("RESOURCE_EXHAUSTED");
}
