import { Router } from "express";
import { generateWithRepair } from "../generation-engine/generateWithRepair";
import { checkLearnerInput, CurriculumGenerateRequestSchema, validateCurriculumOutput, ValidationIssue, type CurriculumGenerationOutput } from "../schema";
import { AppError } from "../errors";
import type {AppDependencies} from "../app";

export function curriculumRouter(deps: AppDependencies): Router {
  const router = Router();

  router.post("/generate", async (req, res, next) => {
    try {
      const parsed = CurriculumGenerateRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("bad_request", 400, "Invalid request body", parsed.error.issues);
      }
      const request = parsed.data;
      const inputValues = [request.hobbyDescription, request.currentLevelNote].filter((value): value is string => Boolean(value));
      const checkInputSafety = inputValues.map(checkLearnerInput).find((result) => !result.safe);
      if (checkInputSafety && !checkInputSafety.safe) {
        throw new AppError("hobby_rejected", 422, checkInputSafety.reason);
      }

      const output: CurriculumGenerationOutput = await generateWithRepair(
        deps.providers.map((provider) => ({
          name: provider.name,
          generate: (previousIssues: ValidationIssue[]) => provider.generateCurriculum(request, previousIssues),
        })),
        (raw) => validateCurriculumOutput(raw, request.constraints),
        deps.config.maxGenerationAttempts,
        req.requestId,
      );

      if (output.status === "rejected") {
        res.status(422).json({ status: "rejected", reason: output.reason });
        return;
      }
      res.json({ status: "ok", curriculum: output.curriculum });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
