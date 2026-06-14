import { Router } from "express";
import {
  getNegotiatedPricesStatus,
  postNegotiatedPricesPreview
} from "./negotiatedPrices.controller.js";

export const negotiatedPricesRouter = Router();

negotiatedPricesRouter.get("/", getNegotiatedPricesStatus);
negotiatedPricesRouter.post("/preview", postNegotiatedPricesPreview);
