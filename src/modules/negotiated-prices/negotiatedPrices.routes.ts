import { Router } from "express";
import {
  getNegotiatedPricesStatus,
  postNegotiatedPricesCompatibleOptions,
  postNegotiatedPricesExport,
  postNegotiatedPricesPreview,
  postNegotiatedPricesValidateCombinations
} from "./negotiatedPrices.controller.js";

export const negotiatedPricesRouter = Router();

negotiatedPricesRouter.get("/", getNegotiatedPricesStatus);
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
