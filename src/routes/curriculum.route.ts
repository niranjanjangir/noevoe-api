import { Router } from "express";
import { generateWithRepair } from "../generation-engine/generateWithRepair";
import { CurriculumGenerateRequestSchema, validateCurriculumOutput, type CurriculumGenerationOutput } from "../schema";
import { AppError } from "../errors";
import type {AppDependencies} from "../app"

export function curriculumRouter(deps: AppDependencies): Router {
  const router = Router();

  router.post("/generate", async (req, res, next) => {
    try {
      const parsed = CurriculumGenerateRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("bad_request", 400, "Invalid request body", parsed.error.issues);
      }
      const request = parsed.data;

      const output: CurriculumGenerationOutput = await generateWithRepair(
        (previousIssues) => deps.provider.generateCurriculum(request, previousIssues),
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
