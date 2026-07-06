import { Router } from "express";
import {
  getPresseroOptionsForProduct,
  getPresseroPricingJson,
  getPresseroPricingStatus,
  postPresseroPricingJson
} from "./presseroPricing.controller.js";

export const presseroPricingRouter = Router();

presseroPricingRouter.get("/", getPresseroPricingStatus);
presseroPricingRouter.get("/json", getPresseroPricingJson);
presseroPricingRouter.post("/json", postPresseroPricingJson);
presseroPricingRouter.get("/json/GetOptionsForProduct", getPresseroOptionsForProduct);
presseroPricingRouter.post("/json/GetOptionsForProduct", getPresseroOptionsForProduct);
presseroPricingRouter.get("/json/GetPriceForProduct", getPresseroPricingJson);
presseroPricingRouter.post("/json/GetPriceForProduct", postPresseroPricingJson);
