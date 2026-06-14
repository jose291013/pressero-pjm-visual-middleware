import { Router } from "express";
import { getVisualOptionsStatus } from "./visualOptions.controller.js";

export const visualOptionsRouter = Router();

visualOptionsRouter.get("/", getVisualOptionsStatus);
