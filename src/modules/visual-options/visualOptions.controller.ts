import type { Request, Response } from "express";
import {
  autoMatchVisualOptionMappings,
  buildVisualOptionMappingSummary,
  buildVisualOptionMappingWorkbookExport,
  getVisualOptionsModuleName,
  importVisualOptionMappingWorkbook
} from "./visualOptions.service.js";

export function getVisualOptionsStatus(_req: Request, res: Response) {
  res.status(200).json({
    module: getVisualOptionsModuleName(),
    status: "mapping_admin",
    sprint: 33
  });
}

function readRouteParam(value: string | string[] | undefined, name: string) {
  if (typeof value !== "string") {
    throw new Error(`${name} is required.`);
  }

  return value;
}

export async function getAdminEngineVisualOptions(req: Request, res: Response) {
  try {
    const summary = await buildVisualOptionMappingSummary(
      readRouteParam(req.params.engineId, "engineId")
    );
    res.status(200).json({ data: summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(400).json({ error: message });
  }
}

export async function postAdminEngineVisualAutoMatch(
  req: Request,
  res: Response
) {
  try {
    const result = await autoMatchVisualOptionMappings(
      readRouteParam(req.params.engineId, "engineId")
    );
    res.status(200).json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(400).json({ error: message });
  }
}

export async function getAdminEngineVisualMappingExport(
  req: Request,
  res: Response
) {
  try {
    const exportResult = await buildVisualOptionMappingWorkbookExport(
      readRouteParam(req.params.engineId, "engineId")
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${exportResult.fileName}"`
    );
    res.status(200).send(exportResult.buffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(400).json({ error: message });
  }
}

export async function postAdminEngineVisualMappingImport(
  req: Request,
  res: Response
) {
  try {
    if (!req.file?.buffer) {
      throw new Error("Fichier Excel obligatoire.");
    }

    const result = await importVisualOptionMappingWorkbook(
      readRouteParam(req.params.engineId, "engineId"),
      req.file.buffer
    );
    res.status(200).json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(400).json({ error: message });
  }
}
