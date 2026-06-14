import express from "express";
import { healthRouter } from "./modules/health/health.routes.js";
import { pjmSyncRouter } from "./modules/pjm-sync/pjmSync.routes.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/pjm-sync", pjmSyncRouter);

  return app;
}
