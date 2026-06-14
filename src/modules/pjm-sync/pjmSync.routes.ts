import { Router } from "express";
import { getPjmSyncStatus } from "./pjmSync.controller.js";

export const pjmSyncRouter = Router();

pjmSyncRouter.get("/", getPjmSyncStatus);
