import type { ValidationIssue } from "../../../schema";

export function issuesToText(issues: ValidationIssue[]): string {
  const lines: string[] = [];
  for (const issue of issues.slice(0, 20)) {
    lines.push(`- at "${issue.path}": ${issue.message} (${issue.code})`);
  }
  if (issues.length > 20) lines.push(`- and ${issues.length - 20} more`);
  return lines.join("\n");
}
