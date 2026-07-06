import { Router } from "express";
import {
  getPresseroPricingStatus,
  postPresseroPricingJson
} from "./presseroPricing.controller.js";

export const presseroPricingRouter = Router();

presseroPricingRouter.get("/", getPresseroPricingStatus);
presseroPricingRouter.post("/json", postPresseroPricingJson);
