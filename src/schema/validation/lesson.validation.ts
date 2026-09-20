import type { GenerationConstraints } from "../api";
import { isActiveBlock, type LessonBlock } from "../blocks";
import { issue, type ValidationIssue } from "../issues";
import type { GeneratedLesson, Lesson } from "../lesson";

const MAX_TOTAL_TEXT = 6000;

export function validateLessonSemantics(
  lesson: Lesson | GeneratedLesson,
  constraints: GenerationConstraints,
): ValidationIssue[] {
      const issues: ValidationIssue[] = [];
  const { lessonMinutes, blocksPerLesson, allowVideo, allowImages } = constraints;

  if (lesson.estimatedMinutes < lessonMinutes.min || lesson.estimatedMinutes > lessonMinutes.max) {
    issues.push(issue("lesson_minutes", "estimatedMinutes", `expected ${lessonMinutes.min}-${lessonMinutes.max} minutes`));
  }
  if (lesson.blocks.length < blocksPerLesson.min || lesson.blocks.length > blocksPerLesson.max) {
    issues.push(issue("block_count", "blocks", `expected ${blocksPerLesson.min}-${blocksPerLesson.max} blocks`));
  }

  const ids = new Set<string>();
  lesson.blocks.forEach((b, i) => {
    if (ids.has(b.id)) issues.push(issue("duplicate_block_id", `blocks.${i}.id`, `duplicate block id "${b.id}"`));
    ids.add(b.id);
  });

  const orders = lesson.blocks.map((b) => b.order).sort((a, b) => a - b);
  if (!orders.every((o, i) => o === i + 1)) {
    issues.push(issue("bad_block_order", "blocks", "block order values must be contiguous starting at 1"));
  }

  if (!lesson.blocks.some(isActiveBlock)) {
    issues.push(issue("no_active_block", "blocks", "lesson needs at least one quiz, practice, self-check or interactive block"));
  }

  let totalText = 0;
  let videoCount = 0;
  lesson.blocks.forEach((b, i) => {
    const p = `blocks.${i}`;
    totalText += blockTextLength(b);
    switch (b.type) {
      case "multiple_choice": {
        const optionIds = new Set(b.payload.options.map((o) => o.id));
        if (optionIds.size !== b.payload.options.length) {
          issues.push(issue("duplicate_option_id", `${p}.payload.options`, "option ids must be unique"));
        }
        if (!optionIds.has(b.payload.correctOptionId)) {
          issues.push(issue("missing_correct_option", `${p}.payload.correctOptionId`, "correctOptionId must match an option"));
        }
        break;
      }
      case "video":
        videoCount += 1;
        if (!allowVideo) issues.push(issue("video_not_allowed", p, "video blocks are not allowed"));
        break;
      case "image":
        if (!allowImages) issues.push(issue("image_not_allowed", p, "image blocks are not allowed in this version"));
        break;
      default:
        break;
    }
  });

  if (videoCount > 1) issues.push(issue("too_many_videos", "blocks", "at most one video block per lesson"));
  if (totalText > MAX_TOTAL_TEXT) issues.push(issue("too_much_text", "blocks", `total text exceeds ${MAX_TOTAL_TEXT} characters`));

  const criteria = lesson.completionCriteria;
  if (criteria.kind === "complete_required_blocks") {
    const seen = new Set<string>();
    criteria.requiredBlockIds.forEach((id, i) => {
      const p = `completionCriteria.requiredBlockIds.${i}`;
      if (seen.has(id)) issues.push(issue("duplicate_required_block", p, `"${id}" listed twice`));
      seen.add(id);
      const block = lesson.blocks.find((b) => b.id === id);
      if (!block) issues.push(issue("unknown_required_block", p, `"${id}" is not a block in this lesson`));
      else if (!isActiveBlock(block)) issues.push(issue("required_block_not_active", p, `"${id}" is not an active block`));
    });
  }

  return issues;
}

function blockTextLength(b: LessonBlock): number {
  switch (b.type) {
    case "text":
      return b.payload.markdown.length;
    case "illustration":
      return b.payload.title.length + b.payload.labels.reduce((n, l) => n + l.label.length + l.description.length, 0);
    case "multiple_choice":
      return b.payload.question.length + b.payload.explanation.length + b.payload.options.reduce((n, o) => n + o.text.length, 0);
    case "true_false":
      return b.payload.statement.length + b.payload.explanation.length;
    case "practice":
      return b.payload.instruction.length + b.payload.successCriterion.length;
    case "self_check":
      return b.payload.prompt.length + b.payload.checklist.reduce((n, c) => n + c.length, 0);
    default:
      return 0;
  }
}
