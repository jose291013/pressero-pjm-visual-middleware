import { Router } from "express";
import {
  deleteNegotiatedPricesProfile,
  getNegotiatedPricesStatus,
  getNegotiatedPricesProfiles,
  postNegotiatedPricesCompatibleOptions,
  postNegotiatedPricesDirectPreview,
  postNegotiatedPricesDirectSave,
  postNegotiatedPricesExport,
  postNegotiatedPricesMultiSave,
  postNegotiatedPricesPreview,
  postNegotiatedPricesValidateCombinations,
  putNegotiatedPricesProfile
} from "./negotiatedPrices.controller.js";

export const negotiatedPricesRouter = Router();

negotiatedPricesRouter.get("/", getNegotiatedPricesStatus);
negotiatedPricesRouter.get("/profiles", getNegotiatedPricesProfiles);
negotiatedPricesRouter.put("/profiles/:profileId", putNegotiatedPricesProfile);
negotiatedPricesRouter.delete("/profiles/:profileId", deleteNegotiatedPricesProfile);
negotiatedPricesRouter.post("/preview", postNegotiatedPricesPreview);
negotiatedPricesRouter.post("/export", postNegotiatedPricesExport);
negotiatedPricesRouter.post(
  "/compatible-options",
  postNegotiatedPricesCompatibleOptions
);
negotiatedPricesRouter.post(
  "/validate-combinations",
  postNegotiatedPricesValidateCombinations
);
negotiatedPricesRouter.post(
  "/direct-preview",
  postNegotiatedPricesDirectPreview
);
negotiatedPricesRouter.post(
  "/direct-save",
  postNegotiatedPricesDirectSave
);
negotiatedPricesRouter.post(
  "/multi-save",
  postNegotiatedPricesMultiSave
);
