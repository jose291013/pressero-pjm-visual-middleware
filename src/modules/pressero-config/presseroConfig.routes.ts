import { Router } from "express";
import {
  deletePresseroProductConfigById,
  getPresseroConfigStatus,
  getPresseroProductConfigs,
  postPresseroProductConfig,
  putPresseroProductConfig
} from "./presseroConfig.controller.js";

export const presseroConfigRouter = Router();

presseroConfigRouter.get("/", getPresseroConfigStatus);
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
