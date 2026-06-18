import express from "express";
import path from "node:path";
import { env } from "./config/env.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { mediaLibraryRouter } from "./modules/media-library/mediaLibrary.routes.js";
import { negotiatedPricesRouter } from "./modules/negotiated-prices/negotiatedPrices.routes.js";
import { pjmSyncRouter } from "./modules/pjm-sync/pjmSync.routes.js";
import { presseroConfigRouter } from "./modules/pressero-config/presseroConfig.routes.js";
import { visualOptionsRouter } from "./modules/visual-options/visualOptions.routes.js";

export function createApp() {
  const app = express();
  const publicRoot = path.join(process.cwd(), "src", "public");

  app.disable("x-powered-by");
  app.use(express.json());
  app.use("/public/media/assets", express.static(env.media.assetsDir));
  app.use("/public", express.static(publicRoot));

  app.use("/health", healthRouter);
  app.use("/media-library", mediaLibraryRouter);
  app.use("/pjm-sync", pjmSyncRouter);
  app.use("/negotiated-prices", negotiatedPricesRouter);
  app.use("/pressero-config", presseroConfigRouter);
  app.use("/visual-options", visualOptionsRouter);
  app.get("/admin", (_req, res) => {
    res.sendFile("index.html", {
      root: path.join(publicRoot, "admin")
    });
  });

  return app;
}
