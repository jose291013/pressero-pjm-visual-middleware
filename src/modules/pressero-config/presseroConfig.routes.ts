import { Router } from "express";
import { getPresseroConfigStatus } from "./presseroConfig.controller.js";

export const presseroConfigRouter = Router();

presseroConfigRouter.get("/", getPresseroConfigStatus);
