import { z } from "zod";
import { CurriculumGenerationOutputSchema, GeneratedLessonSchema } from "../schema";

type JsonObject = Record<string, unknown>;

const REMOVED_KEYWORDS = [
  "$schema",
  "additionalProperties",
  "default",
  "maxLength",
  "maxItems",
  "maximum",
  "minLength",
  "minItems",
  "minimum",
  "pattern",
  "propertyNames",
  "$id",
];

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

export function toGroqSchema(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(toGroqSchema);
  if (typeof node !== "object" || node === null) return node;

  const input = node as JsonObject;
  const output: JsonObject = {};
  for (const [key, value] of Object.entries(input)) {
    output[key === "oneOf" ? "anyOf" : key] = toGroqSchema(value);
  }
  if (input.type === "object" && input.properties && typeof input.properties === "object") {
    const properties = output.properties as JsonObject;
    const required = new Set(Array.isArray(input.required) ? input.required : []);
    for (const [key, value] of Object.entries(properties)) {
      if (!required.has(key)) properties[key] = makeGroqNullable(value);
    }
    output.required = Object.keys(properties);
    output.additionalProperties = false;
  }
  return output;
}

function makeGroqNullable(node: unknown): unknown {
  if (typeof node !== "object" || node === null || Array.isArray(node)) return node;
  const input = node as JsonObject;
  if (typeof input.type === "string") return { ...input, type: [input.type, "null"] };
  if (Array.isArray(input.type) && !input.type.includes("null")) return { ...input, type: [...input.type, "null"] };
  return input;
}

const curriculumGroqObjectSchema = toGroqSchema(z.toJSONSchema(CurriculumGenerationOutputSchema)) as JsonObject;
const curriculumBranches = curriculumGroqObjectSchema.anyOf as JsonObject[];
const curriculumOkBranch = curriculumBranches[0]!;
const curriculumRejectedBranch = curriculumBranches[1]!;

export const curriculumOutputGroqSchema = {
  type: "object",
  properties: {
    status: { type: "string", enum: ["ok", "rejected"] },
    curriculum: {
      ...((curriculumOkBranch.properties as JsonObject).curriculum as JsonObject),
      type: ["object", "null"],
    },
    reason: {
      ...((curriculumRejectedBranch.properties as JsonObject).reason as JsonObject),
      type: ["string", "null"],
    },
  },
  required: ["status", "curriculum", "reason"],
  additionalProperties: false,
};

export const lessonOutputGroqSchema = toGroqSchema(lessonOutputJsonSchema);
