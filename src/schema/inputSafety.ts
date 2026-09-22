const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions?/i,
  /disregard\s+(all\s+)?(previous|system)\s+instructions?/i,
  /(?:reveal|show|print|repeat)\s+(the\s+)?(?:system|developer)\s+prompt/i,
  /(?:system|developer)\s+(prompt|message|instruction)/i,
  /jailbreak|dan\s+mode|do\s+anything\s+now/i,
  /follow\s+these\s+instructions\s+instead/i,
];

const HARMFUL_ACTION_PATTERNS = [
  /(?:make|build|assemble|detonate|improve|deploy)\b.{0,40}\b(?:bomb|explosive|weapon|poison)/i,
  /(?:hack|break\s+into|steal\s+from|bypass)\b.{0,40}\b(?:account|password|security|system|device)/i,
  /(?:make|write|deploy|spread)\b.{0,40}\b(?:malware|ransomware|virus|keylogger)/i,
  /(?:how\s+to|instructions?\s+for|ways?\s+to)\b.{0,40}\b(?:hurt|kill|harm)\s+(?:myself|someone|people)/i,
];

export type LearnerInputSafety =
  | { safe: true; value: string }
  | { safe: false; reason: string };

export function normalizeLearnerInput(value: string): string {
  return value.normalize("NFKC").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}

export function checkLearnerInput(value: string): LearnerInputSafety {
  const normalized = normalizeLearnerInput(value);

  if (PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return { safe: false, reason: "Your provided description seemed inappropriate or unrelated." };
  }

  if (HARMFUL_ACTION_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return { safe: false, reason: "That request is not something we can turn into a learning path." };
  }

  return { safe: true, value: normalized };
}
