import type { NextFunction, Request, Response } from "express";
import { logLine } from "./logger";

export type ErrorCode = "bad_request" | "hobby_rejected" | "generation_failed" | "upstream_unavailable" | "not_found" | "internal";

export class AppError extends Error {
  code: ErrorCode;
  status: number;
  detail?: unknown;

  constructor(code: ErrorCode, status: number, message: string, detail?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.detail = detail;
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: { code: "not_found", message: "No route " + req.method + " " + req.path, requestId: req.requestId } });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    logLine({ level: "warn", msg: "request_failed", requestId: req.requestId, code: err.code, detail: err.detail });
    res.status(err.status).json({ error: { code: err.code, message: err.message, detail: err.detail, requestId: req.requestId } });
    return;
  }
  const message = err instanceof Error ? err.message : String(err);
  logLine({ level: "error", msg: "unhandled_error", requestId: req.requestId, error: message });
  res.status(500).json({ error: { code: "internal", message: "Something went wrong", requestId: req.requestId } });
}
