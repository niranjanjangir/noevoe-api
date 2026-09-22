import type { CurriculumGenerateRequest, LessonGenerateRequest, ValidationIssue } from "../schema";
import { AppError } from "../errors";
import { buildCurriculumPrompt } from "./system-prompts/curriculum.prompt";
import { buildLessonPrompt } from "./system-prompts/lesson.prompt";
import { curriculumOutputGroqSchema, lessonOutputGroqSchema } from "./schema";
import { ContentProvider } from "./index";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export function createGroqProvider(apiKey: string, model: string, timeoutMs: number): ContentProvider {
  async function ask(system: string, user: string, schemaName: string, jsonSchema: unknown): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: 0.7,
          response_format: {
            type: "json_schema",
            json_schema: { name: schemaName, strict: true, schema: jsonSchema },
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new AppError("upstream_unavailable", 429, "The AI service is unavailable, please try again in a moment");
        }
        const detail = await response.text();
        throw new Error(`Groq request failed with status ${response.status}: ${detail}`);
      }

      const payload = await response.json() as { choices?: Array<{ message?: { content?: unknown } }> };
      const content = payload.choices?.[0]?.message?.content;
      if (typeof content !== "string" || content.trim() === "") throw new Error("Groq returned an empty response");
      const parsed = removeNullProperties(JSON.parse(content));
      if (schemaName === "curriculum") return normalizeCurriculumOutput(parsed);
      return parsed;
    } catch (err) {
      if (err instanceof AppError) throw err;
      if (controller.signal.aborted) throw new Error("Groq call timed out after " + timeoutMs + " ms");
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    name: "groq",
    generateCurriculum(request: CurriculumGenerateRequest, previousIssues: ValidationIssue[]) {
      const prompt = buildCurriculumPrompt(request, previousIssues);
      return ask(prompt.system, prompt.user, "curriculum", curriculumOutputGroqSchema);
    },
    generateLesson(request: LessonGenerateRequest, previousIssues: ValidationIssue[]) {
      const prompt = buildLessonPrompt(request, previousIssues);
      return ask(prompt.system, prompt.user, "lesson", lessonOutputGroqSchema);
    },
  };
}

function normalizeCurriculumOutput(value: unknown): unknown {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return value;
  const output = { ...(value as Record<string, unknown>) };
  if (output.status === "ok" && output.reason === null) delete output.reason;
  if (output.status === "rejected" && output.curriculum === null) delete output.curriculum;
  return output;
}

function removeNullProperties(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(removeNullProperties);
  if (typeof value !== "object" || value === null) return value;

  const output: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (child !== null) output[key] = removeNullProperties(child);
  }
  return output;
}