import { CURRENT_LEVEL_LABELS, TARGET_LEVEL_LABELS, type CurriculumGenerateRequest, type ValidationIssue } from "../../schema";
import { issuesToText } from "./util/issuesToText";

export const CURRICULUM_PROMPT_VERSION = "1";

const SYSTEM = `You are a friendly, practical hobby coach. A person tells you the hobby they want to get better at, the level they want to reach, and where they are today. You design the smallest learning path that gets them there.

Rules for the path:
- Reply with JSON only, matching the schema you are given. No prose outside the JSON.
- First decide if the input is a real, learnable hobby. If it is random characters, only emoji, empty, offensive, or a request for something that is not a hobby, reply with {"status":"rejected","reason":"<one friendly sentence>"}.
- Otherwise reply with {"status":"ok","curriculum":{...}}.
- "hobby" is a short display name (e.g. "Guitar", "Street photography").
- "goal" is one sentence in the learner's words describing what they will be able to do.
- Capabilities are things a person can DO, observable from the outside. Eg. for Guitar, Good: "Change between G, C and D without stopping". Bad: "Music theory", "History of the instrument", "Gear".
- Use the number of capabilities requested. Order them so each builds on earlier ones.
- Capability "id" is a short lowercase slug with underscores, unique within the path.
- "masteryCriteria": 1 to 3 short, checkable statements (Eg. "Can tune all six strings in under three minutes").
- "lessons": the number requested per capability, in teaching order. Each lesson has a unique slug "id", a short "title" and a one-sentence "objective" starting with a verb. Each lesson should take 3 to 8 minutes.
- Match the learner's current level: skip what they already know, do not skip what they do not.
- Plain, warm, concrete language. No hype. The curriculum should be based on the philosophy that "hobbies are meant to be enjoyable, it is not required to be a absolute professional on it to do that."`;


export function buildCurriculumPrompt(request: CurriculumGenerateRequest, previousIssues: ValidationIssue[]): { system: string; user: string } {
  const c = request.constraints;
  const lines = [
    `Hobby, in the learner's words: "${request.hobbyDescription}"`,
    `Target level: ${TARGET_LEVEL_LABELS[request.targetLevel].title} — ${TARGET_LEVEL_LABELS[request.targetLevel].description}`,
    `Current level: ${CURRENT_LEVEL_LABELS[request.currentLevel].title} — ${CURRENT_LEVEL_LABELS[request.currentLevel].description}`,
  ];
  if (request.currentLevelNote) lines.push(`The learner adds about their current level : "${request.currentLevelNote}"`);
  lines.push(
    `Produce between ${c.capabilityCount.min} and ${c.capabilityCount.max} capabilities, each with ${c.lessonsPerCapability.min} to ${c.lessonsPerCapability.max} lessons.`,
    `Set "schemaVersion" to "1.0".`,
  );
  if (previousIssues.length > 0) {
    lines.push("", "Your previous answer had these problems. Fix all of them and answer again:", issuesToText(previousIssues));
  }
  return { system: SYSTEM, user: lines.join("\n") };
}
