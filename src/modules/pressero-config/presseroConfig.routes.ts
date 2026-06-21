import { Router } from "express";
import {
  deletePresseroProductConfigById,
  getPresseroConfigStatus,
  getPresseroProductConfigs,
  getPublicPresseroVisualConfig,
  postPresseroProductConfig,
  putPresseroProductConfig
} from "./presseroConfig.controller.js";

export const presseroConfigRouter = Router();

presseroConfigRouter.get("/", getPresseroConfigStatus);
presseroConfigRouter.get(
  "/public/products/:misProductId/visual-config",
  getPublicPresseroVisualConfig
);
presseroConfigRouter.get("/admin/product-configs", getPresseroProductConfigs);
presseroConfigRouter.post("/admin/product-configs", postPresseroProductConfig);
presseroConfigRouter.put(
  "/admin/product-configs/:configId",
  putPresseroProductConfig
);
presseroConfigRouter.delete(
  "/admin/product-configs/:configId",
  deletePresseroProductConfigById
);
