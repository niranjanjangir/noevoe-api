import { Router } from "express";
import { ClientReportSchema } from "../schema";
import { AppError } from "../errors";
import { logLine } from "../logger";

export function reportsRouter(): Router {
  const router = Router();

  router.post("/client", (req, res, next) => {
    try {
      const parsed = ClientReportSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("bad_request", 400, "Invalid report", parsed.error.issues);
      }
      logLine({ msg: "client_report", requestId: req.requestId, ...parsed.data });
      res.status(202).json({ received: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
