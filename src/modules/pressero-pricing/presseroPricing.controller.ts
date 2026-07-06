import type { Request, Response } from "express";
import {
  buildPresseroOptionsForProduct,
  buildDiagnosticPresseroPricingPayload,
  buildPresseroPricingResponse,
  describePresseroPricingRequest,
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

function logPresseroPricingEvent(
  event: string,
  payload: Record<string, unknown>
) {
  console.info(`[pressero-pricing] ${event} ${JSON.stringify(payload)}`);
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
  const query = req.query as Record<string, unknown>;
  const mode = readPresseroProviderMode(
    body,
    query,
    req.path
  );
  const requestSummary = describePresseroPricingRequest(body, query, req.path);

  logPresseroPricingEvent("request", {
    method: req.method,
    ...requestSummary
  });

  if (req.query.debug === "1" || req.query.debug === "true") {
    res.status(200).json(buildDiagnosticPresseroPricingPayload(body));
    return;
  }

  if (mode === "options") {
    const productId = readPresseroProductId(body, query);
    if (!productId) {
      logPresseroPricingEvent("options-error", {
        reason: "missing_product_id",
        ...requestSummary
      });

      res.status(400).json({
        Error: "MIS Product ID manquant. Pressero doit envoyer productID."
      });
      return;
    }

    try {
      const options = await buildPresseroOptionsForProduct(productId, body);
      logPresseroPricingEvent("options-response", {
        productId,
        selectedOptionCount: requestSummary.selectedOptionCount,
        optionCount: options.length,
        choiceCount: options.reduce((total, option) => total + option.Options.length, 0)
      });

      res.status(200).json(options);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inconnue.";
      logPresseroPricingEvent("options-error", {
        productId,
        message
      });

      res.status(404).json({
        Error: message
      });
      return;
    }
  }

  const pricing = await buildPresseroPricingResponse(
    requestSummary.productId,
    body
  );
  logPresseroPricingEvent("price-response", {
    productId: requestSummary.productId,
    quantity: requestSummary.quantity,
    price: pricing.Price,
    source: pricing.source,
    error: pricing.Error ?? null,
    selectedOptionCount: requestSummary.selectedOptionCount
  });

  res.status(200).json(pricing);
}

export async function getPresseroPricingJson(req: Request, res: Response) {
  await sendPresseroPricingJson(req, res);
}

export async function postPresseroPricingJson(req: Request, res: Response) {
  await sendPresseroPricingJson(req, res);
}

export async function getPresseroOptionsForProduct(req: Request, res: Response) {
  const body = readBody(req.body);
  const query = req.query as Record<string, unknown>;
  const productId = readPresseroProductId(body, query);
  const requestSummary = describePresseroPricingRequest(body, query, req.path);

  logPresseroPricingEvent("request", {
    method: req.method,
    ...requestSummary
  });

  if (!productId) {
    logPresseroPricingEvent("options-error", {
      reason: "missing_product_id",
      ...requestSummary
    });

    res.status(400).json({
      Error: "MIS Product ID manquant. Pressero doit envoyer productID."
    });
    return;
  }

  try {
    const options = await buildPresseroOptionsForProduct(productId, body);
    logPresseroPricingEvent("options-response", {
      productId,
      selectedOptionCount: requestSummary.selectedOptionCount,
      optionCount: options.length,
      choiceCount: options.reduce((total, option) => total + option.Options.length, 0)
    });

    res.status(200).json(options);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    logPresseroPricingEvent("options-error", {
      productId,
      message
    });

    res.status(404).json({
      Error: message
    });
  }
}
