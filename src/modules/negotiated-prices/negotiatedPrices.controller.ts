import type { Request, Response } from "express";
import {
  exportNegotiatedPriceWorkbook,
  listExistingNegotiatedPriceProfiles,
  listCompatiblePjmOptions,
  previewNegotiatedPriceExcelPlan,
  previewDirectNegotiatedPrices,
  saveDirectNegotiatedPrices,
  saveMultiNegotiatedPrices,
  validateNegotiatedPriceCompatibility
} from "./negotiatedPrices.service.js";
import type {
  NegotiatedPriceCombinationInput,
  NegotiatedPriceCompatibleOptionsInput,
  NegotiatedPriceDirectSaveInput,
  NegotiatedPriceExistingProfilesInput,
  NegotiatedPriceMultiSaveInput
} from "./negotiatedPrices.types.js";

export function getNegotiatedPricesStatus(_req: Request, res: Response) {
  res.status(200).json({
    module: "negotiated-prices",
    status: "excel_plan_foundation",
    sprint: 10
  });
}

function readPreviewInput(value: unknown): NegotiatedPriceCombinationInput {
  if (typeof value !== "object" || value === null) {
    throw new Error("Request body must be an object.");
  }

  return value as NegotiatedPriceCombinationInput;
}

function readDirectSaveInput(value: unknown): NegotiatedPriceDirectSaveInput {
  if (typeof value !== "object" || value === null) {
    throw new Error("Request body must be an object.");
  }

  return value as NegotiatedPriceDirectSaveInput;
}

function readMultiSaveInput(value: unknown): NegotiatedPriceMultiSaveInput {
  if (typeof value !== "object" || value === null) {
    throw new Error("Request body must be an object.");
  }

  return value as NegotiatedPriceMultiSaveInput;
}

function readExistingProfilesInput(value: Request["query"]): NegotiatedPriceExistingProfilesInput {
  return {
    clientId: typeof value.clientId === "string" ? value.clientId : undefined,
    priceEngineId: typeof value.priceEngineId === "string" ? value.priceEngineId : undefined,
    enginePriceGroupIntegrationId:
      typeof value.enginePriceGroupIntegrationId === "string"
        ? value.enginePriceGroupIntegrationId
        : undefined
  };
}

function readCompatibleOptionsInput(
  value: unknown
): NegotiatedPriceCompatibleOptionsInput {
  if (typeof value !== "object" || value === null) {
    throw new Error("Request body must be an object.");
  }

  return value as NegotiatedPriceCompatibleOptionsInput;
}

export function postNegotiatedPricesPreview(req: Request, res: Response) {
  try {
    const plan = previewNegotiatedPriceExcelPlan(readPreviewInput(req.body));
    res.status(200).json({ data: plan });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(400).json({ error: message });
  }
}

export async function getNegotiatedPricesProfiles(req: Request, res: Response) {
  try {
    const profiles = await listExistingNegotiatedPriceProfiles(
      readExistingProfilesInput(req.query)
    );
    res.status(200).json({ data: profiles });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(400).json({ error: message });
  }
}

export async function postNegotiatedPricesExport(req: Request, res: Response) {
  try {
    const exportResult = await exportNegotiatedPriceWorkbook(
      readPreviewInput(req.body)
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

export async function postNegotiatedPricesCompatibleOptions(
  req: Request,
  res: Response
) {
  try {
    const result = await listCompatiblePjmOptions(
      readCompatibleOptionsInput(req.body)
    );
    res.status(200).json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(400).json({ error: message });
  }
}

export async function postNegotiatedPricesValidateCombinations(
  req: Request,
  res: Response
) {
  try {
    const result = await validateNegotiatedPriceCompatibility(
      readPreviewInput(req.body)
    );
    res.status(200).json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(400).json({ error: message });
  }
}

export async function postNegotiatedPricesDirectPreview(
  req: Request,
  res: Response
) {
  try {
    const result = await previewDirectNegotiatedPrices(
      readPreviewInput(req.body)
    );
    res.status(200).json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(400).json({ error: message });
  }
}

export async function postNegotiatedPricesDirectSave(
  req: Request,
  res: Response
) {
  try {
    const result = await saveDirectNegotiatedPrices(
      readDirectSaveInput(req.body)
    );
    res.status(200).json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(400).json({ error: message });
  }
}

export async function postNegotiatedPricesMultiSave(
  req: Request,
  res: Response
) {
  try {
    const result = await saveMultiNegotiatedPrices(
      readMultiSaveInput(req.body)
    );
    res.status(200).json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(400).json({ error: message });
  }
}
