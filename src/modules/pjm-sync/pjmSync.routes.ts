import { Router } from "express";
import {
  getPjmSyncAdminPriceEngineDetail,
  getPjmSyncAdminPriceEngineMappings,
  getPjmSyncAdminPriceEngineOptions,
  getPjmSyncAdminPriceEngines,
  getPjmSyncAdminSummary,
  getPjmPriceEngineOptions,
  getPjmPriceEngines,
  getPjmPriceGroups,
  getPjmProductCategories,
  getPjmSyncStatus
} from "./pjmSync.controller.js";

export const pjmSyncRouter = Router();

pjmSyncRouter.get("/", getPjmSyncStatus);
pjmSyncRouter.get("/admin/summary", getPjmSyncAdminSummary);
pjmSyncRouter.get("/admin/price-engines", getPjmSyncAdminPriceEngines);
pjmSyncRouter.get(
  "/admin/price-engines/:id/mappings",
  getPjmSyncAdminPriceEngineMappings
);
pjmSyncRouter.get(
  "/admin/price-engines/:id/options",
  getPjmSyncAdminPriceEngineOptions
);
pjmSyncRouter.get(
  "/admin/price-engines/:id",
  getPjmSyncAdminPriceEngineDetail
);
pjmSyncRouter.get("/categories", getPjmProductCategories);
pjmSyncRouter.get("/price-groups", getPjmPriceGroups);
pjmSyncRouter.get("/price-engines", getPjmPriceEngines);
pjmSyncRouter.get("/price-engines/:id/options", getPjmPriceEngineOptions);
