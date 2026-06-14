import { Router } from "express";
import {
  getNegotiatedPricesStatus,
  postNegotiatedPricesCompatibleOptions,
  postNegotiatedPricesPreview
} from "./negotiatedPrices.controller.js";

export const negotiatedPricesRouter = Router();

negotiatedPricesRouter.get("/", getNegotiatedPricesStatus);
negotiatedPricesRouter.post("/preview", postNegotiatedPricesPreview);
negotiatedPricesRouter.post(
  "/compatible-options",
  postNegotiatedPricesCompatibleOptions
);
