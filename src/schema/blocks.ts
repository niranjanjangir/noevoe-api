import { z } from "zod";

export const BLOCK_TYPES = [
  "text",
  "image",
  "illustration",
  "video",
  "multiple_choice",
  "true_false",
  "practice",
  "self_check",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export const ACTIVE_BLOCK_TYPES: readonly BlockType[] = [
  "multiple_choice",
  "true_false",
  "practice",
  "self_check",
];

const BlockId = z.string().min(1).max(64);
const ShortText = z.string().trim().min(1).max(300);
const MediumText = z.string().trim().min(1).max(600);
const HttpsUrl = z.string().trim().regex(/^https:\/\/\S+$/, "must be an https URL").max(2048);

export const TextPayloadSchema = z.strictObject({
  markdown: z.string().trim().min(1).max(1200), // TODO: check later if it can be plain text.
  emphasis: z.enum(["none", "tip", "warning"]).default("none"),
});

export const ImagePayloadSchema = z
  .strictObject({
    assetId: z.string().trim().min(1).max(100).optional(),
    url: HttpsUrl.optional(),
    alt: ShortText,
    caption: ShortText.optional(),
    cropHint: z.enum(["none", "top", "center", "bottom"]).default("none"),
  })
  .refine((p) => Boolean(p.assetId || p.url), { message: "image needs assetId or url", path: ["url"] });

export const IllustrationLabelSchema = z.strictObject({
  label: z.string().trim().min(1).max(60),
  description: ShortText,
});

export const IllustrationPayloadSchema = z.strictObject({
  title: ShortText,
  caption: ShortText.optional(),
  layout: z.enum(["list", "steps", "compare"]).default("list"),
  labels: z.array(IllustrationLabelSchema).min(2).max(8),
});

export const VideoPayloadSchema = z.strictObject({
  url: HttpsUrl,
  title: ShortText,
  whyUseful: ShortText,
});

export const MultipleChoiceOptionSchema = z.strictObject({
  id: z.string().trim().min(1).max(16),
  text: ShortText,
});

export const MultipleChoicePayloadSchema = z.strictObject({
  question: MediumText,
  options: z.array(MultipleChoiceOptionSchema).min(2).max(5),
  correctOptionId: z.string().trim().min(1).max(16),
  explanation: MediumText,
});

export const TrueFalsePayloadSchema = z.strictObject({
  statement: MediumText,
  answer: z.boolean(),
  explanation: MediumText,
});

export const PracticePayloadSchema = z.strictObject({
  instruction: z.string().trim().min(1).max(800),
  durationMinutes: z.number().int().min(1).max(30).optional(),
  repetitions: z.number().int().min(1).max(100).optional(),
  successCriterion: MediumText,
});

export const SelfCheckPayloadSchema = z.strictObject({
  prompt: MediumText,
  checklist: z.array(ShortText).min(1).max(8),
});

const base = { id: BlockId, order: z.number().int().min(1) };

export const LessonBlockSchema = z.discriminatedUnion("type", [
  z.strictObject({ ...base, type: z.literal("text"), payload: TextPayloadSchema }),
  z.strictObject({ ...base, type: z.literal("image"), payload: ImagePayloadSchema }),
  z.strictObject({ ...base, type: z.literal("illustration"), payload: IllustrationPayloadSchema }),
  z.strictObject({ ...base, type: z.literal("video"), payload: VideoPayloadSchema }),
  z.strictObject({ ...base, type: z.literal("multiple_choice"), payload: MultipleChoicePayloadSchema }),
  z.strictObject({ ...base, type: z.literal("true_false"), payload: TrueFalsePayloadSchema }),
  z.strictObject({ ...base, type: z.literal("practice"), payload: PracticePayloadSchema }),
  z.strictObject({ ...base, type: z.literal("self_check"), payload: SelfCheckPayloadSchema }),
]);

export type LessonBlock = z.infer<typeof LessonBlockSchema>;
export type LessonBlockOfType<T extends BlockType> = Extract<LessonBlock, { type: T }>;

export type TextPayload = z.infer<typeof TextPayloadSchema>;
export type ImagePayload = z.infer<typeof ImagePayloadSchema>;
export type IllustrationPayload = z.infer<typeof IllustrationPayloadSchema>;
export type VideoPayload = z.infer<typeof VideoPayloadSchema>;
export type MultipleChoicePayload = z.infer<typeof MultipleChoicePayloadSchema>;
export type TrueFalsePayload = z.infer<typeof TrueFalsePayloadSchema>;
export type PracticePayload = z.infer<typeof PracticePayloadSchema>;
export type SelfCheckPayload = z.infer<typeof SelfCheckPayloadSchema>;

export function isActiveBlock(block: Pick<LessonBlock, "type">): boolean {
  return ACTIVE_BLOCK_TYPES.includes(block.type);
}

export function isKnownBlockType(type: unknown): type is BlockType {
  return typeof type === "string" && (BLOCK_TYPES as readonly string[]).includes(type);
}
