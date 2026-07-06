import type {
  PresseroPricingDebugResponse,
  PresseroPricingJsonResponse,
  PresseroPricingParameter,
  PresseroPricingParameterOption,
  PresseroPricingProviderMode,
  PresseroPricingRequestBody
} from "./presseroPricing.types.js";
import { prisma } from "../../config/prisma.js";

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

function readObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
}

function readStringFrom(
  source: Record<string, unknown>,
  keys: string[]
) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function readProductIdFromSource(source: Record<string, unknown>) {
  return readStringFrom(source, [
    "productID",
    "productId",
    "ProductID",
    "ProductId",
    "product_id",
    "misProductId",
    "MISProductID",
    "MisProductId"
  ]);
}

export function readPresseroProductId(
  body: PresseroPricingRequestBody,
  query: Record<string, unknown> = {}
) {
  const direct = readProductIdFromSource(readObject(body)) ?? readProductIdFromSource(query);
  if (direct) return direct;

  const nestedRequest = readProductIdFromSource(readObject(body.request));
  if (nestedRequest) return nestedRequest;

  const nestedData = readProductIdFromSource(readObject(body.data));
  if (nestedData) return nestedData;

  return null;
}

function readSelectedOptions(body: PresseroPricingRequestBody) {
  const rawOptions = body.options ?? body.Options;
  if (!Array.isArray(rawOptions)) {
    return [];
  }

  return rawOptions
    .map((option) => {
      const record = readObject(option);
      const key = record.Key ?? record.key ?? record.ID ?? record.id;
      const value = record.Value ?? record.value;
      if (typeof key !== "string" || typeof value !== "string") {
        return null;
      }

      return {
        Key: key,
        Value: value
      };
    })
    .filter((option): option is PresseroPricingParameterOption => Boolean(option));
}

export function readPresseroPricingQuantity(body: PresseroPricingRequestBody) {
  const parameters = readPricingParameters(body);
  return readNumber(
    body.quantity ??
      body.Quantity ??
      parameters.Q1 ??
      parameters.Quantity ??
      parameters.quantity,
    1
  );
}

export function readPresseroProviderMode(
  body: PresseroPricingRequestBody,
  query: Record<string, unknown> = {},
  path = ""
): PresseroPricingProviderMode {
  const method = [
    path,
    query.method,
    query.Method,
    query.action,
    query.Action,
    body.method,
    body.Method,
    body.action,
    body.Action
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();

  if (method.includes("getoptionsforproduct") || method.includes("options")) {
    return "options";
  }

  if (method.includes("getpriceforproduct") || method.includes("price")) {
    return "price";
  }

  const parameters = readPricingParameters(body);
  if (Object.keys(parameters).length === 0 && readPresseroProductId(body, query)) {
    return "options";
  }

  return "price";
}

export async function buildPresseroOptionsForProduct(
  productId: string
): Promise<PresseroPricingParameter[]> {
  const config = await prisma.presseroProductConfig.findFirst({
    where: {
      misProductId: productId,
      isActive: true
    },
    include: {
      priceEngine: {
        include: {
          options: {
            include: {
              choices: {
                include: {
                  visualMapping: true
                },
                orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
              }
            },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
          }
        }
      }
    }
  });

  if (!config) {
    throw new Error("MIS Product ID introuvable ou inactif dans le middleware.");
  }

  return config.priceEngine.options
    .map((option) => {
      const choices = option.choices
        .filter((choice) => choice.isActive && choice.visualMapping?.isEnabled)
        .map((choice) => ({
          Key: choice.name,
          Value: choice.value || choice.pjmId
        }));

      if (!choices.length) return null;

      return {
        ID: option.pjmId,
        Label: option.displayName || option.name,
        Options: choices
      };
    })
    .filter((option): option is PresseroPricingParameter => Boolean(option));
}

export function buildDiagnosticPresseroPricingResponse(
  body: PresseroPricingRequestBody
): PresseroPricingJsonResponse {
  const quantity = readPresseroPricingQuantity(body);
  const price = Number((quantity * diagnosticUnitPrice).toFixed(2));
  const selectedOptions = readSelectedOptions(body);

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
    success: true,
    Options: selectedOptions
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
      misProductId: readPresseroProductId(body),
      pricingParameterKeys: Object.keys(parameters),
      selectedOptions: readSelectedOptions(body)
    },
    pricing: buildDiagnosticPresseroPricingResponse(body)
  };
}
