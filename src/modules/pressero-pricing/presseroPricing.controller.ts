import type { Request, Response } from "express";
import {
  buildPresseroOptionsForProduct,
  buildDiagnosticPresseroPricingPayload,
  buildDiagnosticPresseroPricingResponse,
  getPresseroPricingModuleName,
  readPresseroProductId,
  readPresseroProviderMode
} from "./presseroPricing.service.js";
import type { PresseroPricingRequestBody } from "./presseroPricing.types.js";

function readBody(value: unknown): PresseroPricingRequestBody {
  if (typeof value !== "object" || value === null) {
    return {};
  }

  return value as PresseroPricingRequestBody;
}

export function getPresseroPricingStatus(_req: Request, res: Response) {
  res.status(200).json({
    module: getPresseroPricingModuleName(),
    status: "json_provider",
    sprint: 40,
    diagnostic: {
      status: "json_diagnostic_pricing",
      sprint: 39
    }
  });
}

async function sendPresseroPricingJson(req: Request, res: Response) {
  const body = readBody(req.body);
  const mode = readPresseroProviderMode(
    body,
    req.query as Record<string, unknown>,
    req.path
  );

  if (req.query.debug === "1" || req.query.debug === "true") {
    res.status(200).json(buildDiagnosticPresseroPricingPayload(body));
    return;
  }

  if (mode === "options") {
    const productId = readPresseroProductId(body, req.query as Record<string, unknown>);
    if (!productId) {
      res.status(400).json({
        Error: "MIS Product ID manquant. Pressero doit envoyer productID."
      });
      return;
    }

    res.status(200).json(await buildPresseroOptionsForProduct(productId));
    return;
  }

  res.status(200).json(buildDiagnosticPresseroPricingResponse(body));
}

export async function getPresseroPricingJson(req: Request, res: Response) {
  await sendPresseroPricingJson(req, res);
}

export async function postPresseroPricingJson(req: Request, res: Response) {
  await sendPresseroPricingJson(req, res);
}

export async function getPresseroOptionsForProduct(req: Request, res: Response) {
  const body = readBody(req.body);
  const productId = readPresseroProductId(body, req.query as Record<string, unknown>);

  if (!productId) {
    res.status(400).json({
      Error: "MIS Product ID manquant. Pressero doit envoyer productID."
    });
    return;
  }

  res.status(200).json(await buildPresseroOptionsForProduct(productId));
}
