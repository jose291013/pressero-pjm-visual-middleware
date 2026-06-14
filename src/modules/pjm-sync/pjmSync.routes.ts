import { Router } from "express";
import {
  getPjmPriceEngineOptions,
  getPjmPriceEngines,
  getPjmPriceGroups,
  getPjmProductCategories,
  getPjmSyncStatus
} from "./pjmSync.controller.js";

export const pjmSyncRouter = Router();

pjmSyncRouter.get("/", getPjmSyncStatus);
pjmSyncRouter.get("/categories", getPjmProductCategories);
pjmSyncRouter.get("/price-groups", getPjmPriceGroups);
pjmSyncRouter.get("/price-engines", getPjmPriceEngines);
pjmSyncRouter.get("/price-engines/:id/options", getPjmPriceEngineOptions);
