import type { LessonBlock } from "../blocks";
import { issue, type ValidationIssue } from "../issues";

const YOUTUBE_PATTERNS = [
  /^https:\/\/(?:www\.|m\.)?youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_-]{11})(?:[&#].*)?$/,
  /^https:\/\/(?:www\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]{11})(?:[?#].*)?$/,
  /^https:\/\/youtu\.be\/([A-Za-z0-9_-]{11})(?:[?#].*)?$/,
];

export function extractYouTubeId(url: string): string | null {
  for (const regExp of YOUTUBE_PATTERNS) {
    const match = regExp.exec(url.trim());
    if (match?.[1]) return match[1];
  }
  return null;
}

export function youTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function validateAssetRefs(blocks: LessonBlock[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  blocks.forEach((b, i) => {
    const p = `blocks.${i}.payload`;
    if (b.type === "video" && !extractYouTubeId(b.payload.url)) {
      issues.push(issue("video_not_youtube", `${p}.url`, "video url must be a YouTube watch, shorts or youtu.be link"));
    }
  });
  return issues;
}
