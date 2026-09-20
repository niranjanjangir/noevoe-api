import type { GenerationConstraints } from "../api";
import type { Curriculum } from "../curriculum";
import { issue, type ValidationIssue } from "../issues";

export function validateCurriculumSemantics(
  curriculum: Curriculum,
  constraints: GenerationConstraints,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const capabilities = curriculum.capabilities;
  const { min, max } = constraints.capabilityCount;

  if (capabilities.length < min || capabilities.length > max) {
    issues.push(issue("capability_count", "capabilities", `expected ${min}-${max} capabilities, got ${capabilities.length}`));
  }

  const ids = new Set<string>();
  const titles = new Set<string>();
  capabilities.forEach((cap, i) => {
    const p = `capabilities.${i}`;
    if (ids.has(cap.id)) issues.push(issue("duplicate_capability", `${p}.id`, `duplicate capability id "${cap.id}"`));
    ids.add(cap.id);
    const t = cap.title.toLowerCase();
    if (titles.has(t)) issues.push(issue("duplicate_capability", `${p}.title`, `duplicate capability title "${cap.title}"`));
    titles.add(t);

    const lessonIds = new Set<string>();
    cap.lessons.forEach((l, j) => {
      if (lessonIds.has(l.id)) issues.push(issue("duplicate_lesson", `${p}.lessons.${j}.id`, `duplicate lesson id "${l.id}"`));
      lessonIds.add(l.id);
    });
    const { min: lmin, max: lmax } = constraints.lessonsPerCapability;
    if (cap.lessons.length < lmin || cap.lessons.length > lmax) {
      issues.push(issue("lesson_count", `${p}.lessons`, `expected ${lmin}-${lmax} lessons, got ${cap.lessons.length}`));
    }
  });

  const sortedOrders = capabilities.map((c) => c.order).sort((a, b) => a - b);
  const contiguous = sortedOrders.every((o, i) => o === i + 1);
  if (!contiguous) issues.push(issue("bad_order", "capabilities", "order values must be contiguous starting at 1"));

  return issues;
}
