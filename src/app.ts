import express from "express";
import path from "node:path";
import { healthRouter } from "./modules/health/health.routes.js";
import { pjmSyncRouter } from "./modules/pjm-sync/pjmSync.routes.js";

export function createApp() {
  const app = express();
  const publicRoot = path.join(process.cwd(), "src", "public");

  app.disable("x-powered-by");
  app.use(express.json());
  app.use("/public", express.static(publicRoot));

  app.use("/health", healthRouter);
  app.use("/pjm-sync", pjmSyncRouter);
  app.get("/admin", (_req, res) => {
    res.sendFile("index.html", {
      root: path.join(publicRoot, "admin")
    });
  });

  return app;
}
