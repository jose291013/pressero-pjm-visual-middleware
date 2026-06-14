import type { Request, Response } from "express";
import {
  listPjmPriceEngineOptions,
  listPjmPriceEngines,
  listPjmPriceGroups,
  listPjmProductCategories
} from "./pjmSync.service.js";

export function getPjmSyncStatus(_req: Request, res: Response) {
  res.status(200).json({
    module: "pjm-sync",
    status: "mock_foundation",
    sprint: 2
  });
}

export async function getPjmProductCategories(_req: Request, res: Response) {
  const categories = await listPjmProductCategories();
  res.status(200).json({ data: categories });
}

export async function getPjmPriceGroups(_req: Request, res: Response) {
  const priceGroups = await listPjmPriceGroups();
  res.status(200).json({ data: priceGroups });
}

export async function getPjmPriceEngines(_req: Request, res: Response) {
  const priceEngines = await listPjmPriceEngines();
  res.status(200).json({ data: priceEngines });
}

export async function getPjmPriceEngineOptions(req: Request, res: Response) {
  const engineId = String(req.params.id);
  const options = await listPjmPriceEngineOptions(engineId);

  if (!options) {
    res.status(404).json({
      error: "PJM price engine not found",
      id: engineId
    });
    return;
  }

  res.status(200).json({ data: options });
}
