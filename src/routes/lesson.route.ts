import { Router } from "express";
import { generateWithRepair } from "../generation-engine/generateWithRepair";
import type { AppDependencies } from "../app";
import { checkLearnerInput, LessonGenerateRequestSchema, validateGeneratedLesson, ValidationIssue, type Lesson } from "../schema";
import { AppError } from "../errors";

export function lessonsRouter(deps: AppDependencies): Router {
    const router = Router();

    router.post("/generate", async (req, res, next) => {
        try {
            const parsed = LessonGenerateRequestSchema.safeParse(req.body);
            if (!parsed.success) {
                throw new AppError("bad_request", 400, "Invalid request body", parsed.error.issues);
            }
            const request = parsed.data;
            const inputValues = [request.hobby, request.currentLevelNote].filter((value): value is string => Boolean(value));
            const checkInputSafety = inputValues.map(checkLearnerInput).find((result) => !result.safe);
            if (checkInputSafety && !checkInputSafety.safe) {
                throw new AppError("hobby_rejected", 422, checkInputSafety.reason);
            }

            const lesson: Lesson = await generateWithRepair(
                deps.providers.map((provider) => ({
                    name: provider.name,
                    generate: (previousIssues: ValidationIssue[]) => provider.generateLesson(request, previousIssues),
                })),
                (raw) =>
                    validateGeneratedLesson(
                        raw,
                        { lessonId: request.lessonId, capabilityId: request.capabilityId, },
                        request.constraints,
                    ),
                deps.config.maxGenerationAttempts,
                req.requestId,
            );

            res.json({ lesson });
        } catch (err) {
            next(err);
        }
    });

    return router;
}
