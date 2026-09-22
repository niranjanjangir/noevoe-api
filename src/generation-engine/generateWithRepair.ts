import type { ValidationIssue, ValidationResult } from "../schema";
import { AppError } from "../errors";
import { logLine } from "../logger";

export type GenerateFn = (previousIssues: ValidationIssue[]) => Promise<unknown>;
export type ValidateFn<T> = (raw: unknown) => ValidationResult<T>;
export type GenerateProvider = { name: string; generate: GenerateFn };

export async function generateWithRepair<T>(
  providers: GenerateProvider[],
  validate: ValidateFn<T>,
  maxAttempts: number,
  requestId: string,
): Promise<T> {
  let issues: ValidationIssue[] = [];

  for (const provider of providers) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const started = Date.now();
      let raw: unknown;
      try {
        raw = await provider.generate(issues);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        issues = [{ code: "provider_error", path: "$", message }];
        logLine({ msg: "generation_attempt", requestId, provider: provider.name, attempt, ok: false, error: message, ms: Date.now() - started });
        continue;
      }

      const result = validate(raw);
      const codes: string[] = [];
      for (const issue of result.issues) codes.push(issue.code);
      logLine({ msg: "generation_attempt", requestId, provider: provider.name, attempt, ok: result.ok, issueCodes: codes, ms: Date.now() - started });

      if (result.ok) return result.value;
      issues = result.issues;
    }
  }

  throw new AppError("generation_failed", 502, "Could not generate valid content", { issues });
}
