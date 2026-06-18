import { Router } from "express";
import multer from "multer";
import {
  getAdminEngineVisualMappingExport,
  getAdminEngineVisualOptions,
  getVisualOptionsStatus,
  postAdminEngineVisualAutoMatch,
  postAdminEngineVisualMappingImport
} from "./visualOptions.controller.js";

export const visualOptionsRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

visualOptionsRouter.get("/", getVisualOptionsStatus);
visualOptionsRouter.get(
  "/admin/engines/:engineId/options",
  getAdminEngineVisualOptions
);
visualOptionsRouter.post(
  "/admin/engines/:engineId/auto-match",
  postAdminEngineVisualAutoMatch
);
visualOptionsRouter.get(
  "/admin/engines/:engineId/export",
  getAdminEngineVisualMappingExport
);
visualOptionsRouter.post(
  "/admin/engines/:engineId/import",
  upload.single("workbook"),
  postAdminEngineVisualMappingImport
);
