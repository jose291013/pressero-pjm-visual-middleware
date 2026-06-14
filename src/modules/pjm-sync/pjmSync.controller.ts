import type { Request, Response } from "express";
import { createPjmClientFromEnv } from "./pjmClient.js";
import {
  getPjmSyncAdminPriceEngine as getPjmSyncAdminPriceEngineFromStore,
  getPjmSyncAdminSummary as getPjmSyncAdminSummaryFromStore,
  listPjmSyncAdminEngineMappings as listPjmSyncAdminEngineMappingsFromStore,
  listPjmSyncAdminEngineOptions as listPjmSyncAdminEngineOptionsFromStore,
  listPjmSyncAdminOrganizations as listPjmSyncAdminOrganizationsFromStore,
  listPjmSyncAdminPriceEngines as listPjmSyncAdminPriceEnginesFromStore
} from "./pjmSyncAdmin.service.js";
import {
  listPjmPriceEngineOptions,
  listPjmPriceEngines,
  listPjmPriceGroups,
  listPjmProductCategories
} from "./pjmSync.service.js";
import { syncPjmCatalog } from "./pjmSyncCatalog.service.js";

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

export async function getPjmSyncAdminSummary(_req: Request, res: Response) {
  const summary = await getPjmSyncAdminSummaryFromStore();
  res.status(200).json({ data: summary });
}

export async function postPjmSyncAdminCatalogSync(
  _req: Request,
  res: Response
) {
  try {
    const result = await syncPjmCatalog(createPjmClientFromEnv());
    res.status(200).json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      error: message
    });
  }
}

export async function getPjmSyncAdminPriceEngines(
  _req: Request,
  res: Response
) {
  const priceEngines = await listPjmSyncAdminPriceEnginesFromStore();
  res.status(200).json({ data: priceEngines });
}

export async function getPjmSyncAdminOrganizations(
  _req: Request,
  res: Response
) {
  const organizations = await listPjmSyncAdminOrganizationsFromStore();
  res.status(200).json({ data: organizations });
}

export async function getPjmSyncAdminPriceEngineDetail(
  req: Request,
  res: Response
) {
  const engineId = String(req.params.id);
  const priceEngine = await getPjmSyncAdminPriceEngineFromStore(engineId);

  if (!priceEngine) {
    res.status(404).json({
      error: "PJM price engine not found",
      id: engineId
    });
    return;
  }

  res.status(200).json({ data: priceEngine });
}

export async function getPjmSyncAdminPriceEngineMappings(
  req: Request,
  res: Response
) {
  const engineId = String(req.params.id);
  const mappings = await listPjmSyncAdminEngineMappingsFromStore(engineId);

  if (!mappings) {
    res.status(404).json({
      error: "PJM price engine not found",
      id: engineId
    });
    return;
  }

  res.status(200).json({ data: mappings });
}

export async function getPjmSyncAdminPriceEngineOptions(
  req: Request,
  res: Response
) {
  const engineId = String(req.params.id);
  const options = await listPjmSyncAdminEngineOptionsFromStore(engineId);

  if (!options) {
    res.status(404).json({
      error: "PJM price engine not found",
      id: engineId
    });
    return;
  }

  res.status(200).json({ data: options });
}
