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
import type {
  PjmEngineChoiceResponse,
  PjmEngineOptionResponse,
  PjmEngineOptionsResponse,
  PjmEngineOptionValue
} from "../pjm-sync/pjmContracts.types.js";

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
type PricingConfigOptionsRecord = Pick<PricingConfigRecord, "priceEngine">;

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
      if (
        typeof key !== "string" ||
        !["string", "number", "boolean"].includes(typeof value)
      ) {
        return null;
      }

      return {
        Key: key,
        Value: String(value)
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

function normalizeComparableParts(value: unknown) {
  const normalized = normalizeComparable(value);
  return normalized
    .split(":")
    .map((part) => part.trim())
    .filter(Boolean);
}

function comparableMatches(value: unknown, candidate: unknown) {
  const normalizedValue = normalizeComparable(value);
  const normalizedCandidate = normalizeComparable(candidate);
  if (!normalizedValue || !normalizedCandidate) return false;
  if (normalizedValue === normalizedCandidate) return true;

  return normalizeComparableParts(value).includes(normalizedCandidate) ||
    normalizeComparableParts(candidate).includes(normalizedValue);
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

function isFreeInputOption(
  option: PricingConfigRecord["priceEngine"]["options"][number]
) {
  return option.choices.filter((choice) => choice.isActive).length === 0;
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
    ].some((value) =>
      normalizeComparable(value) === normalizedKey ||
      comparableMatches(key, value)
    );
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
    ].some((candidate) =>
      normalizeComparable(candidate) === normalizedValue ||
      comparableMatches(value, candidate)
    );
  });
}

function selectedOptionMatchesConfigOption(
  config: PricingConfigRecord,
  selectedOption: PresseroPricingParameterOption,
  configOption: PricingConfigRecord["priceEngine"]["options"][number]
) {
  const resolved = findConfigOptionByPresseroKey(config, selectedOption.Key);
  if (resolved) {
    return resolved.id === configOption.id;
  }

  const selectedKey = normalizeComparable(selectedOption.Key);
  return [
    configOption.pjmId,
    configOption.name,
    configOption.displayName,
    configOption.id
  ].some((value) =>
    normalizeComparable(value) === selectedKey ||
    comparableMatches(selectedOption.Key, value)
  );
}

function readSelectedQuantityValue(
  config: PricingConfigRecord,
  selectedOptions: PresseroPricingParameterOption[]
) {
  const quantityOption = findQuantityOption(config);
  if (!quantityOption) return null;

  const selectedQuantity = selectedOptions.find((option) =>
    selectedOptionMatchesConfigOption(config, option, quantityOption)
  );
  if (!selectedQuantity) return null;

  const quantity = Number(String(selectedQuantity.Value).replace(",", "."));
  return Number.isFinite(quantity) && quantity > 0 ? quantity : null;
}

function buildPjmEngineValues(
  _config: unknown,
  body: PresseroPricingRequestBody
) {
  return readSelectedOptions(body).map((option) => ({
    Key: option.Key,
    Value: option.Value
  }));
}

function readPjmOptionId(option: PjmEngineOptionResponse) {
  return option.Id ?? option.id ?? "";
}

function readPjmOptionLabel(option: PjmEngineOptionResponse) {
  return option.Label ??
    option.label ??
    option.Name ??
    option.name ??
    option.DisplayName ??
    option.displayName ??
    option.Title ??
    option.title ??
    "";
}

function readPjmChoiceValue(choice: PjmEngineChoiceResponse) {
  const value = choice.Value ?? choice.value ?? choice.Id ?? choice.id;
  return value === undefined || value === null ? "" : String(value);
}

function readPjmChoiceLabel(choice: PjmEngineChoiceResponse) {
  return choice.Key ??
    choice.key ??
    choice.Label ??
    choice.label ??
    choice.Text ??
    choice.text ??
    choice.Name ??
    choice.name ??
    "";
}

function readPjmOptionChoices(option: PjmEngineOptionResponse) {
  return option.Options ??
    option.options ??
    option.Values ??
    option.values ??
    option.Choices ??
    option.choices ??
    [];
}

function readPjmOptionsArray(response: PjmEngineOptionsResponse) {
  if (Array.isArray(response)) {
    return response;
  }

  return response.Options ??
    response.options ??
    response.EngineOptions ??
    response.engineOptions ??
    response.Values ??
    response.values ??
    [];
}

function pjmOptionMatchesValue(
  option: PjmEngineOptionResponse,
  value: PjmEngineOptionValue
) {
  return [
    readPjmOptionId(option),
    readPjmOptionLabel(option)
  ].some((candidate) =>
    comparableMatches(value.Key, candidate) ||
    comparableMatches(value.Name, candidate)
  );
}

function sanitizePjmEngineValuesAgainstOptions(
  values: PjmEngineOptionValue[],
  optionsResponse: PjmEngineOptionsResponse
) {
  const liveOptions = readPjmOptionsArray(optionsResponse);
  if (!liveOptions.length) {
    return values;
  }

  return values.flatMap((value) => {
    const liveOption = liveOptions.find((option) =>
      pjmOptionMatchesValue(option, value)
    );
    if (!liveOption) return [];

    const key = readPjmOptionId(liveOption);
    if (!key) return [];

    const choices = readPjmOptionChoices(liveOption);
    if (!choices.length) {
      const rawValue = value.Value;
      if (rawValue === null || rawValue === undefined || String(rawValue).trim() === "") {
        return [];
      }

      return [{
        Key: key,
        Value: String(rawValue)
      }];
    }

    const selectedChoice = choices.find((choice) => {
      return comparableMatches(value.Value, readPjmChoiceValue(choice)) ||
        comparableMatches(value.Value, readPjmChoiceLabel(choice));
    });

    if (!selectedChoice) return [];

    return [{
      Key: key,
      Value: readPjmChoiceValue(selectedChoice)
    }];
  });
}

function findConfigOptionByPjmId(
  config: PricingConfigOptionsRecord,
  pjmId: string
) {
  return config.priceEngine.options.find((option) =>
    comparableMatches(option.pjmId, pjmId) ||
    comparableMatches(option.name, pjmId) ||
    comparableMatches(option.displayName, pjmId)
  );
}

function findConfigChoiceByPjmValue(
  option: PricingConfigRecord["priceEngine"]["options"][number] | undefined,
  pjmValue: string
) {
  if (!option) return null;

  return option.choices.find((choice) =>
    comparableMatches(choice.value, pjmValue) ||
    comparableMatches(choice.pjmId, pjmValue) ||
    comparableMatches(choice.name, pjmValue) ||
    comparableMatches(choice.normalizedName, pjmValue)
  ) ?? null;
}

function buildPresseroOptionsFromPjmResponse(
  config: PricingConfigOptionsRecord,
  optionsResponse: PjmEngineOptionsResponse
): PresseroPricingParameter[] {
  return readPjmOptionsArray(optionsResponse).flatMap((liveOption) => {
    const optionId = readPjmOptionId(liveOption);
    if (!optionId) return [];

    const configOption = findConfigOptionByPjmId(config, optionId);
    const choices = readPjmOptionChoices(liveOption).flatMap((choice) => {
      const choiceValue = readPjmChoiceValue(choice);
      if (!choiceValue) return [];

      const configChoice = findConfigChoiceByPjmValue(configOption, choiceValue);
      return [{
        Key: readPjmChoiceLabel(choice) || configChoice?.name || choiceValue,
        Value: choiceValue
      }];
    });

    return [{
      ID: optionId,
      Label:
        readPjmOptionLabel(liveOption) ||
        configOption?.displayName ||
        configOption?.name ||
        optionId,
      Options: choices
    }];
  });
}

function summarizePjmValues(values: PjmEngineOptionValue[]) {
  return values.map((value) => ({
    Key: String(value.Key ?? value.Name ?? "").slice(0, 80),
    Value: String(value.Value ?? "").slice(0, 80)
  }));
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
  const initialValues = buildPjmEngineValues(config, body);
  const refreshedOptions = await client.getEngineOptions(
    config.enginePriceGroupIntegrationId,
    initialValues
  );
  const sanitizedValues = sanitizePjmEngineValuesAgainstOptions(
    initialValues,
    refreshedOptions
  );

  console.info("[pressero-pricing] pjm-live-flow", JSON.stringify({
    productId: config.misProductId,
    mode: "options-then-optionsandprice",
    initialValueCount: initialValues.length,
    refreshedOptionCount: readPjmOptionsArray(refreshedOptions).length,
    sanitizedValueCount: sanitizedValues.length,
    initialValues: summarizePjmValues(initialValues),
    sanitizedValues: summarizePjmValues(sanitizedValues)
  }));

  const response = await client.getOptionsAndPrice(
    config.enginePriceGroupIntegrationId,
    sanitizedValues
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
  productId: string,
  body: PresseroPricingRequestBody = {}
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

  if ((config.pricingMode as PresseroPricingMode) !== "negotiated") {
    const client = createPjmClientFromEnv();
    const initialValues = buildPjmEngineValues(config, body);
    const refreshedOptions = await client.getEngineOptions(
      config.enginePriceGroupIntegrationId,
      initialValues
    );
    const liveOptions = buildPresseroOptionsFromPjmResponse(
      config,
      refreshedOptions
    );

    if (liveOptions.length) {
      return liveOptions;
    }
  }

  return config.priceEngine.options
    .map((option) => {
      const activeChoices = option.choices.filter((choice) => choice.isActive);
      const choices = activeChoices
        .map((choice) => ({
          Key: choice.name,
          Value: choice.value || choice.pjmId
        }));

      if (!choices.length && !isFreeInputOption(option)) return null;

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
