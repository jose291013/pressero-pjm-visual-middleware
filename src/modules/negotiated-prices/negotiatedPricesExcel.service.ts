import {
  buildChoiceCombinations,
  parseQuantityTiersText
} from "./combinationGenerator.service.js";
import type {
  NegotiatedPriceCombinationInput,
  NegotiatedPriceExcelColumn,
  NegotiatedPriceExcelPlan
} from "./negotiatedPrices.types.js";

function buildContextColumns(): NegotiatedPriceExcelColumn[] {
  return [
    { key: "combinationKey", label: "Combination Key", kind: "technical" },
    { key: "clientId", label: "Organisation ID", kind: "context" },
    { key: "organizationName", label: "Organisation", kind: "context" },
    { key: "priceEngineName", label: "Moteur PJM", kind: "context" },
    { key: "priceGroupName", label: "Groupe de prix", kind: "context" }
  ];
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
  const rows = buildChoiceCombinations(input, quantities);

  return {
    clientId: input.clientId,
    organizationName: input.organizationName ?? null,
    priceEngineId: input.priceEngineId,
    priceEngineName: input.priceEngineName,
    enginePriceGroupIntegrationId: input.enginePriceGroupIntegrationId,
    priceGroupName: input.priceGroupName,
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
