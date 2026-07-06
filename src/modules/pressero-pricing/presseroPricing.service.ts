import type {
  Prisma,
  PresseroPricingMode
} from "@prisma/client";
import type {
  PresseroPricingDebugResponse,
  PresseroPricingJsonResponse,
  PresseroPricingParameter,
  PresseroPricingParameterOption,
  PresseroPricingProviderMode,
  PresseroPricingRequestBody
} from "./presseroPricing.types.js";
import { prisma } from "../../config/prisma.js";
import { createPjmClientFromEnv } from "../pjm-sync/pjmClient.js";
import type { PjmEngineOptionValue } from "../pjm-sync/pjmContracts.types.js";

const diagnosticUnitPrice = 12.34;
const quantityOptionPatterns = [
  "quantity",
  "quantite",
  "quantité",
  "exemplaire",
  "exemplaires"
];

const pricingConfigInclude = {
  priceEngine: {
    include: {
      options: {
        include: {
          choices: true
        }
      }
    }
  },
  negotiatedProfile: {
    include: {
      combinations: {
        where: {
          status: "active"
        },
        orderBy: {
          sortOrder: "asc"
        },
        include: {
          tiers: {
            orderBy: {
              tierValue: "asc"
            }
          }
        }
      }
    }
  }
} satisfies Prisma.PresseroProductConfigInclude;

type PricingConfigRecord = Prisma.PresseroProductConfigGetPayload<{
  include: typeof pricingConfigInclude;
}>;

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
    "id",
    "ID",
    "misProductId",
    "MISProductID",
    "MISProductId",
    "MisProductId"
  ]);
}

function readProductIdFromValue(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return readProductIdFromSource(readObject(value));
}

function readOperationValue(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  const record = readObject(value);
  return readStringFrom(record, [
    "name",
    "Name",
    "method",
    "Method",
    "action",
    "Action",
    "type",
    "Type"
  ]);
}

function readPresseroOperation(
  body: PresseroPricingRequestBody,
  query: Record<string, unknown> = {}
) {
  return (
    readOperationValue(body.operation) ??
    readOperationValue(body.Operation) ??
    readOperationValue(query.operation) ??
    readOperationValue(query.Operation) ??
    readOperationValue(query.method) ??
    readOperationValue(query.Method) ??
    readOperationValue(query.action) ??
    readOperationValue(query.Action)
  );
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

  const nestedProduct = readProductIdFromValue(body.product);
  if (nestedProduct) return nestedProduct;

  const nestedProductUpper = readProductIdFromValue(body.Product);
  if (nestedProductUpper) return nestedProductUpper;

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

function normalizeComparable(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function readPjmPrice(response: unknown): number | null {
  if (!response || typeof response !== "object") return null;
  const record = response as Record<string, unknown>;
  const value = record.Price ?? record.price ?? record.TotalPrice ?? record.totalPrice;
  const price = Number(value);
  return Number.isFinite(price) ? price : null;
}

function readPjmError(response: unknown) {
  if (!response || typeof response !== "object") return null;
  const record = response as Record<string, unknown>;
  const error = record.Error ?? record.error;
  const errorCode = record.ErrorCode ?? record.errorCode;
  if (error) return String(error);
  if (errorCode) return `PJM ErrorCode ${String(errorCode)}`;
  return null;
}

function buildPricingResponse(
  price: number,
  source: PresseroPricingJsonResponse["source"],
  options: PresseroPricingParameterOption[],
  error: string | null = null
): PresseroPricingJsonResponse {
  const safePrice = Number.isFinite(price) ? Number(price.toFixed(2)) : 0;

  return {
    Error: error,
    Price: safePrice,
    Cost: 0,
    Weight: 0,
    TotalPrice: safePrice,
    TotalCost: 0,
    TotalWeight: 0,
    price: safePrice,
    cost: 0,
    weight: 0,
    success: !error,
    Options: options,
    source
  };
}

function findQuantityOption(config: PricingConfigRecord) {
  return config.priceEngine.options.find((option) => {
    const label = normalizeComparable(
      `${option.name} ${option.displayName ?? ""} ${option.optionType ?? ""}`
    );
    return quantityOptionPatterns.some((pattern) => label.includes(pattern));
  });
}

function findConfigOptionByPresseroKey(
  config: PricingConfigRecord,
  key: string
) {
  const normalizedKey = normalizeComparable(key);
  return config.priceEngine.options.find((option) => {
    return [
      option.pjmId,
      option.name,
      option.displayName,
      option.id
    ].some((value) => normalizeComparable(value) === normalizedKey);
  });
}

function findConfigChoiceByPresseroValue(
  option: PricingConfigRecord["priceEngine"]["options"][number],
  value: string
) {
  const normalizedValue = normalizeComparable(value);
  return option.choices.find((choice) => {
    return [
      choice.value,
      choice.pjmId,
      choice.name,
      choice.normalizedName,
      choice.id
    ].some((candidate) => normalizeComparable(candidate) === normalizedValue);
  });
}

function buildResolvedPjmEngineValue(
  config: PricingConfigRecord,
  selectedOption: PresseroPricingParameterOption
): PjmEngineOptionValue {
  const option = findConfigOptionByPresseroKey(config, selectedOption.Key);
  if (!option) {
    return {
      Key: selectedOption.Key,
      Value: selectedOption.Value
    };
  }

  const choice = findConfigChoiceByPresseroValue(option, selectedOption.Value);
  return {
    Key: option.pjmId,
    Value: choice?.value || choice?.pjmId || selectedOption.Value
  };
}

function buildPjmEngineValues(
  config: PricingConfigRecord,
  body: PresseroPricingRequestBody
) {
  const selectedOptions = readSelectedOptions(body);
  const values: PjmEngineOptionValue[] = selectedOptions.map((option) =>
    buildResolvedPjmEngineValue(config, option)
  );
  const quantityOption = findQuantityOption(config);

  if (quantityOption) {
    const quantity = String(readPresseroPricingQuantity(body));
    const quantityKey = normalizeComparable(quantityOption.pjmId);
    const existingQuantity = values.find((value) => {
      return normalizeComparable(value.Key) === quantityKey ||
        normalizeComparable(value.Name) === quantityKey;
    });

    if (existingQuantity) {
      existingQuantity.Key = quantityOption.pjmId;
      existingQuantity.Value = quantity;
    } else {
      values.push({
        Key: quantityOption.pjmId,
        Value: quantity
      });
    }
  }

  return values;
}

function readCombinationSelections(combination: {
  optionSelections: Prisma.JsonValue;
}) {
  if (!Array.isArray(combination.optionSelections)) {
    return [];
  }

  return combination.optionSelections.flatMap((option) => {
    if (!option || typeof option !== "object") return [];
    const optionRecord = option as Record<string, unknown>;
    const key = String(optionRecord.pjmKey ?? "");
    const choices = Array.isArray(optionRecord.choices)
      ? optionRecord.choices
      : [];

    return choices.flatMap((choice) => {
      if (!choice || typeof choice !== "object") return [];
      const choiceRecord = choice as Record<string, unknown>;
      const value = String(choiceRecord.pjmValue ?? "");
      return key && value ? [{ Key: key, Value: value }] : [];
    });
  });
}

function selectedOptionsMatchCombination(
  selectedOptions: PresseroPricingParameterOption[],
  combination: {
    optionSelections: Prisma.JsonValue;
  }
) {
  const selectedMap = new Map(
    selectedOptions.map((option) => [
      normalizeComparable(option.Key),
      normalizeComparable(option.Value)
    ])
  );
  const combinationSelections = readCombinationSelections(combination);

  return combinationSelections.every((selection) => {
    return selectedMap.get(normalizeComparable(selection.Key)) ===
      normalizeComparable(selection.Value);
  });
}

function interpolateTierPrice(
  tiers: Array<{
    tierValue: Prisma.Decimal;
    negotiatedPrice: Prisma.Decimal | null;
  }>,
  quantity: number
) {
  const pricedTiers = tiers
    .map((tier) => ({
      quantity: Number(tier.tierValue),
      price: tier.negotiatedPrice === null ? null : Number(tier.negotiatedPrice)
    }))
    .filter((tier): tier is { quantity: number; price: number } => {
      return Number.isFinite(tier.quantity) && Number.isFinite(tier.price);
    })
    .sort((left, right) => left.quantity - right.quantity);

  if (!pricedTiers.length) {
    return null;
  }

  const exact = pricedTiers.find((tier) => tier.quantity === quantity);
  if (exact) return exact.price;

  const lower = [...pricedTiers].reverse().find((tier) => tier.quantity < quantity);
  const upper = pricedTiers.find((tier) => tier.quantity > quantity);

  if (!lower) return pricedTiers[0].price;
  if (!upper) return pricedTiers[pricedTiers.length - 1].price;

  const ratio = (quantity - lower.quantity) / (upper.quantity - lower.quantity);
  return lower.price + (upper.price - lower.price) * ratio;
}

async function readPricingConfig(productId: string) {
  const config = await prisma.presseroProductConfig.findFirst({
    where: {
      misProductId: productId,
      isActive: true
    },
    include: pricingConfigInclude
  });

  if (!config) {
    throw new Error("MIS Product ID introuvable ou inactif dans le middleware.");
  }

  return config;
}

export function describePresseroPricingRequest(
  body: PresseroPricingRequestBody,
  query: Record<string, unknown> = {},
  path = ""
) {
  const parameters = readPricingParameters(body);
  const selectedOptions = readSelectedOptions(body);
  const productValue = body.product ?? body.Product;
  const product = readObject(productValue);
  const rawOptions = body.options ?? body.Options;
  const rawOptionsArray = Array.isArray(rawOptions) ? rawOptions : [];

  return {
    path,
    operation: readPresseroOperation(body, query),
    mode: readPresseroProviderMode(body, query, path),
    productId: readPresseroProductId(body, query),
    quantity: readPresseroPricingQuantity(body),
    bodyKeys: Object.keys(body),
    queryKeys: Object.keys(query),
    productType: Array.isArray(productValue) ? "array" : typeof productValue,
    productPreview:
      typeof productValue === "string" ? productValue.slice(0, 80) : null,
    productKeys: Object.keys(product),
    rawOptionCount: rawOptionsArray.length,
    pricingParameterKeys: Object.keys(parameters),
    selectedOptionCount: selectedOptions.length
  };
}

async function calculatePjmLivePrice(
  config: PricingConfigRecord,
  body: PresseroPricingRequestBody
) {
  const client = createPjmClientFromEnv();
  const response = await client.getOptionsAndPrice(
    config.enginePriceGroupIntegrationId,
    buildPjmEngineValues(config, body)
  );
  const pjmError = readPjmError(response);

  if (pjmError) {
    throw new Error(pjmError);
  }

  const price = readPjmPrice(response);
  if (price === null) {
    throw new Error("PJM n'a pas retourne de prix exploitable.");
  }

  return price;
}

function calculateNegotiatedPrice(
  config: PricingConfigRecord,
  body: PresseroPricingRequestBody
) {
  const profile = config.negotiatedProfile;
  if (!profile) {
    throw new Error("Profil de prix negocie introuvable pour ce produit Pressero.");
  }

  const selectedOptions = readSelectedOptions(body);
  const quantity = readPresseroPricingQuantity(body);
  const matchingCombination = profile.combinations.find((combination) => {
    return selectedOptionsMatchCombination(selectedOptions, combination);
  });

  if (!matchingCombination) {
    throw new Error("Aucune combinaison negociee ne correspond aux options choisies.");
  }

  const price = interpolateTierPrice(matchingCombination.tiers, quantity);
  if (price === null) {
    throw new Error("Aucun palier de prix negocie exploitable pour cette combinaison.");
  }

  return price;
}

async function calculateConfiguredPrice(
  config: PricingConfigRecord,
  body: PresseroPricingRequestBody
) {
  if ((config.pricingMode as PresseroPricingMode) === "negotiated") {
    return {
      price: calculateNegotiatedPrice(config, body),
      source: "negotiated" as const
    };
  }

  return {
    price: await calculatePjmLivePrice(config, body),
    source: "pjmLive" as const
  };
}

export function readPresseroProviderMode(
  body: PresseroPricingRequestBody,
  query: Record<string, unknown> = {},
  path = ""
): PresseroPricingProviderMode {
  const method = [
    path,
    readPresseroOperation(body, query),
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

  return buildPricingResponse(price, "diagnostic", selectedOptions);
}

export async function buildPresseroPricingResponse(
  productId: string | null,
  body: PresseroPricingRequestBody
): Promise<PresseroPricingJsonResponse> {
  const selectedOptions = readSelectedOptions(body);

  if (!productId) {
    return buildPricingResponse(
      0,
      "diagnostic",
      selectedOptions,
      "MIS Product ID manquant. Pressero doit envoyer product."
    );
  }

  try {
    const config = await readPricingConfig(productId);
    const calculated = await calculateConfiguredPrice(config, body);
    return buildPricingResponse(calculated.price, calculated.source, selectedOptions);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur de calcul inconnue.";
    return buildPricingResponse(0, "diagnostic", selectedOptions, message);
  }
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
