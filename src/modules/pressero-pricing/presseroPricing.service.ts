import type {
  PresseroPricingDebugResponse,
  PresseroPricingJsonResponse,
  PresseroPricingRequestBody
} from "./presseroPricing.types.js";

const diagnosticUnitPrice = 12.34;

export function getPresseroPricingModuleName() {
  return "pressero-pricing";
}

function readNumber(value: unknown, fallback: number) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : fallback;
}

function readPricingParameters(body: PresseroPricingRequestBody) {
  return body.pricingParameters ?? body.PricingParameters ?? {};
}

function readMisProductId(body: PresseroPricingRequestBody) {
  const value = body.misProductId ?? body.MISProductID ?? body.MisProductId;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function readPresseroPricingQuantity(body: PresseroPricingRequestBody) {
  const parameters = readPricingParameters(body);
  return readNumber(parameters.Q1 ?? parameters.Quantity ?? parameters.quantity, 1);
}

export function buildDiagnosticPresseroPricingResponse(
  body: PresseroPricingRequestBody
): PresseroPricingJsonResponse {
  const quantity = readPresseroPricingQuantity(body);
  const price = Number((quantity * diagnosticUnitPrice).toFixed(2));

  return {
    Price: price,
    Cost: 0,
    Weight: 0,
    TotalPrice: price,
    TotalCost: 0,
    TotalWeight: 0,
    price,
    cost: 0,
    weight: 0,
    success: true
  };
}

export function buildDiagnosticPresseroPricingPayload(
  body: PresseroPricingRequestBody
): PresseroPricingDebugResponse {
  const parameters = readPricingParameters(body);

  return {
    module: "pressero-pricing",
    status: "json_diagnostic_pricing",
    received: {
      quantity: readPresseroPricingQuantity(body),
      misProductId: readMisProductId(body),
      pricingParameterKeys: Object.keys(parameters)
    },
    pricing: buildDiagnosticPresseroPricingResponse(body)
  };
}
