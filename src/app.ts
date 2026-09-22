import { randomUUID } from "node:crypto";
import { Config } from "./config";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { logLine } from "./logger";
import { errorHandler, notFoundHandler } from "./errors";
import type { ContentProvider } from "./generation-engine/provider"
import { curriculumRouter } from "./routes/curriculum.route";
import { lessonsRouter } from "./routes/lesson.route";
import { reportsRouter } from "./routes/report.route";

export type AppDependencies = {
    providers: ContentProvider[];
    config: Config;
};

export function createApp(deps: AppDependencies): Express {
    const app = express();

    app.use(express.json({ limit: "256kb" }));

    app.use((req: Request, res: Response, next: NextFunction) => {
        const headerId = req.header("x-request-id");
        req.requestId = headerId ? headerId : randomUUID();
        res.setHeader("x-request-id", req.requestId);
        const started = Date.now();
        res.on("finish", () => {
            logLine({ msg: "request", requestId: req.requestId, method: req.method, path: req.originalUrl, status: res.statusCode, ms: Date.now() - started });
        });
        next();
    });

    app.get("/health", (_req, res) => {
        res.json({ ok: true, message: "API Running!" });
    });

    app.use('/v1/curriculum', curriculumRouter(deps));
    app.use('/v1/lessons', lessonsRouter(deps));
    app.use('/v1/reports', reportsRouter());

    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
}