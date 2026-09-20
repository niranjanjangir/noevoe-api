import type { ZodError } from "zod";

export interface ValidationIssue {
  code: string; // `code` values are stable strings used by tests, logs and repair prompts
  path: string;
  message: string;
}

export type ValidationResult<T> =
  | { ok: true; value: T; issues: [] }
  | { ok: false; value?: undefined; issues: ValidationIssue[] };
  
export function issue(code: string, path: string, message: string): ValidationIssue {
  return { code, path, message };
}

export function zodIssues(error: ZodError, code = "schema"): ValidationIssue[] {
  return error.issues.map((i) => ({
    code: `${code}.${i.code}`,
    path: i.path.map(String).join(".") || "$",
    message: i.message,
  }));
}

export function ok<T>(value: T): ValidationResult<T> {
  return { ok: true, value, issues: [] };
}

export function fail<T>(issues: ValidationIssue[]): ValidationResult<T> {
  return { ok: false, issues };
}
