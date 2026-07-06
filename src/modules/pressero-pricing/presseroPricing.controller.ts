import type { Request, Response } from "express";
import {
  buildDiagnosticPresseroPricingPayload,
  buildDiagnosticPresseroPricingResponse,
  getPresseroPricingModuleName
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
    status: "json_diagnostic_pricing",
    sprint: 39
  });
}

export function postPresseroPricingJson(req: Request, res: Response) {
  const body = readBody(req.body);

  if (req.query.debug === "1" || req.query.debug === "true") {
    res.status(200).json(buildDiagnosticPresseroPricingPayload(body));
    return;
  }

  res.status(200).json(buildDiagnosticPresseroPricingResponse(body));
}
