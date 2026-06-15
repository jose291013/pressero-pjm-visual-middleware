import {
  buildChoiceCombinations,
  parseQuantityTiersText
} from "./combinationGenerator.service.js";
import type {
  NegotiatedPriceCombinationInput,
  NegotiatedPriceExcelColumn,
  NegotiatedPriceExcelPlan,
  NegotiatedPriceCompatibilityExportFilter,
  NegotiatedPricePricingBasis
} from "./negotiatedPrices.types.js";

function buildContextColumns(): NegotiatedPriceExcelColumn[] {
  return [
    { key: "combinationKey", label: "Combination Key", kind: "technical" },
    { key: "clientId", label: "Organisation ID", kind: "context" },
    { key: "organizationName", label: "Organisation", kind: "context" },
    { key: "priceEngineName", label: "Moteur PJM", kind: "context" },
    { key: "priceGroupName", label: "Groupe de prix", kind: "context" },
    { key: "pricingBasisMode", label: "Mode palier", kind: "context" },
    { key: "pricingBasisFormula", label: "Formule palier", kind: "context" }
  ];
}

function normalizePricingBasis(
  input: NegotiatedPriceCombinationInput
): NegotiatedPricePricingBasis {
  return {
    mode: input.pricingBasis?.mode === "areaM2" ? "areaM2" : "quantity",
    formula: input.pricingBasis?.formula?.trim() ?? "",
    parameters: (input.pricingBasis?.parameters ?? []).map((parameter) => ({
      key: parameter.key,
      label: parameter.label,
      pjmKey: parameter.pjmKey,
      role: parameter.role === "clientVariable" ? "clientVariable" : "adminFixed",
      fixedValue: parameter.role === "clientVariable"
        ? ""
        : parameter.fixedValue?.trim() ?? ""
    }))
  };
}

function normalizeCompatibilityFilter(
  input: NegotiatedPriceCombinationInput
): NegotiatedPriceCompatibilityExportFilter | null {
  const filter = input.compatibilityFilter;

  if (!filter) {
    return null;
  }

  return {
    rawCombinationCount: Number(filter.rawCombinationCount || 0),
    compatibleCombinationCount: Number(filter.compatibleCombinationCount || 0),
    incompatibleCombinationCount: Number(filter.incompatibleCombinationCount || 0),
    compatibleCombinationKeys: Array.from(
      new Set((filter.compatibleCombinationKeys ?? []).filter(Boolean))
    )
  };
}

function buildOptionColumns(
  input: NegotiatedPriceCombinationInput
): NegotiatedPriceExcelColumn[] {
  return input.optionSelections.map((option) => ({
    key: `option:${option.optionId}`,
    label: option.optionName,
    kind: "option"
  }));
}

function buildTierColumns(quantities: number[]): NegotiatedPriceExcelColumn[] {
  return quantities.flatMap((quantity) => [
    {
      key: `pjmPrice:${quantity}`,
      label: `Prix PJM ${quantity}`,
      kind: "pjmPrice" as const,
      quantity
    },
    {
      key: `negotiatedPrice:${quantity}`,
      label: `Prix negocie ${quantity}`,
      kind: "negotiatedPrice" as const,
      quantity
    }
  ]);
}

export function buildNegotiatedPriceExcelPlan(
  input: NegotiatedPriceCombinationInput
): NegotiatedPriceExcelPlan {
  const quantities = parseQuantityTiersText(input.quantityTiersText);
  const pricingBasis = normalizePricingBasis(input);
  const normalizedInput: NegotiatedPriceCombinationInput = {
    ...input,
    pricingBasis,
    compatibilityFilter: undefined
  };
  const rawRows = buildChoiceCombinations(normalizedInput, quantities);
  const compatibilityFilter = normalizeCompatibilityFilter(input);
  const rows = compatibilityFilter
    ? rawRows.filter((row) => {
        return compatibilityFilter.compatibleCombinationKeys.includes(row.combinationKey);
      })
    : rawRows;

  if (
    compatibilityFilter &&
    compatibilityFilter.rawCombinationCount !== rawRows.length
  ) {
    throw new Error("Compatibility filter does not match the current combination count.");
  }

  if (
    compatibilityFilter &&
    compatibilityFilter.compatibleCombinationCount !== rows.length
  ) {
    throw new Error("Compatibility filter does not match the current compatible rows.");
  }

  return {
    clientId: input.clientId,
    organizationName: input.organizationName ?? null,
    priceEngineId: input.priceEngineId,
    priceEngineName: input.priceEngineName,
    enginePriceGroupIntegrationId: input.enginePriceGroupIntegrationId,
    priceGroupName: input.priceGroupName,
    pricingBasis,
    rawCombinationCount: rawRows.length,
    compatibilityFilter,
    quantities,
    combinationCount: rows.length,
    columns: [
      ...buildContextColumns(),
      ...buildOptionColumns(input),
      ...buildTierColumns(quantities)
    ],
    rows
  };
}
