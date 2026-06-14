import type { Request, Response } from "express";
import {
  listCompatiblePjmOptions,
  previewNegotiatedPriceExcelPlan
} from "./negotiatedPrices.service.js";
import type {
  NegotiatedPriceCombinationInput,
  NegotiatedPriceCompatibleOptionsInput
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
