import { z } from "zod";
import { CurriculumGenerationOutputSchema, GeneratedLessonSchema } from "../schema";

type JsonObject = Record<string, unknown>;

const REMOVED_KEYWORDS = ["$schema", "additionalProperties", "default", "pattern", "propertyNames", "$id", "id"];

export function toGeminiSchema(node: unknown): unknown {
  if (Array.isArray(node)) {
    const out: unknown[] = [];
    for (const item of node) out.push(toGeminiSchema(item));
    return out;
  }
  if (typeof node !== "object" || node === null) return node;

  const input = node as JsonObject;
  const output: JsonObject = {};
  for (const key of Object.keys(input)) {
    if (REMOVED_KEYWORDS.includes(key)) continue;
    if (key === "const") {
      output.enum = [input[key]];
      continue;
    }
    output[key] = toGeminiSchema(input[key]);
  }
  return output;
}

export const curriculumOutputJsonSchema = toGeminiSchema(z.toJSONSchema(CurriculumGenerationOutputSchema));

export const lessonOutputJsonSchema = toGeminiSchema(z.toJSONSchema(GeneratedLessonSchema));
