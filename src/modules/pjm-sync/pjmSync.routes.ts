import { Router } from "express";
import {
  getPjmSyncAdminPriceEngineDetail,
  getPjmSyncAdminPriceEngineMappings,
  getPjmSyncAdminPriceEngineOptions,
  getPjmSyncAdminPriceEngines,
  getPjmSyncAdminOrganizations,
  getPjmSyncAdminSummary,
  getPjmPriceEngineOptions,
  getPjmPriceEngines,
  getPjmPriceGroups,
  getPjmProductCategories,
  getPjmSyncStatus,
  postPjmSyncAdminCatalogSync
} from "./pjmSync.controller.js";

export const pjmSyncRouter = Router();

pjmSyncRouter.get("/", getPjmSyncStatus);
pjmSyncRouter.get("/admin/summary", getPjmSyncAdminSummary);
pjmSyncRouter.post("/admin/sync", postPjmSyncAdminCatalogSync);
pjmSyncRouter.get("/admin/organizations", getPjmSyncAdminOrganizations);
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
