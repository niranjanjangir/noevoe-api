import { z } from "zod";

export const TARGET_LEVELS = ["enjoy_basics", "comfortable_hobbyist", "advanced_hobbyist"] as const;
export const CURRENT_LEVELS = ["complete_beginner", "basic_knowledge", "some_experience"] as const;


export const TargetLevelSchema = z.enum(TARGET_LEVELS);
export const CurrentLevelSchema = z.enum(CURRENT_LEVELS);
export type TargetLevel = z.infer<typeof TargetLevelSchema>;
export type CurrentLevel = z.infer<typeof CurrentLevelSchema>;

export const TARGET_LEVEL_LABELS: Record<TargetLevel, { title: string; description: string }> = {
  enjoy_basics: {
    title: "Enjoy the hobby",
    description: "Get past the frustrating beginner stage and have fun with it.",
  },
  comfortable_hobbyist: {
    title: "Comfortable hobbyist",
    description: "Do the core things confidently without looking everything up.",
  },
  advanced_hobbyist: {
    title: "Advanced hobbyist",
    description: "Go deeper than most hobbyists.",
  },
};

export const CURRENT_LEVEL_LABELS: Record<CurrentLevel, { title: string; description: string }> = {
  complete_beginner: { title: "Complete beginner", description: "I have never really tried this." },
  basic_knowledge: { title: "Know a little", description: "I know some basics and have dabbled." },
  some_experience: { title: "Can do the basics, but not a pro", description: "I get by, but I want to improve." },
};
