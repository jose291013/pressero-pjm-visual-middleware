import { buildNegotiatedPriceExcelPlan } from "./negotiatedPricesExcel.service.js";
import { buildNegotiatedPriceWorkbookExport } from "./negotiatedPricesWorkbook.service.js";
import { createPjmClientFromEnv } from "../pjm-sync/pjmClient.js";
import {
  extractPjmOptionKey,
  normalizePjmEngineOptionsResponse
} from "../pjm-sync/pjmSyncCatalog.service.js";
import type {
  NegotiatedPriceCompatibleOptionsInput,
  NegotiatedPriceCompatibleOptionsResult,
  NegotiatedPriceCompatibilitySelection,
  NegotiatedPriceCompatibilityValidationResult,
  NegotiatedPriceCompatibleOption,
  NegotiatedPriceCombinationChoice,
  NegotiatedPriceCombinationInput,
  NegotiatedPriceExcelPlan,
  NegotiatedPriceWorkbookExport
} from "./negotiatedPrices.types.js";

export function getNegotiatedPricesModuleName() {
  return "negotiated-prices";
}

export function previewNegotiatedPriceExcelPlan(
  input: NegotiatedPriceCombinationInput
): NegotiatedPriceExcelPlan {
  return buildNegotiatedPriceExcelPlan(input);
}

export function exportNegotiatedPriceWorkbook(
  input: NegotiatedPriceCombinationInput
): Promise<NegotiatedPriceWorkbookExport> {
  return buildNegotiatedPriceWorkbookExport(input);
}

function buildSelectionsCacheKey(
  selections: NegotiatedPriceCompatibilitySelection[]
) {
  return JSON.stringify(
    selections.map((selection) => ({
      Key: selection.pjmKey,
      Value: selection.pjmValue
    }))
  );
}

function readCompatibilitySelections(
  input: NegotiatedPriceCompatibleOptionsInput
) {
  return (input.selections ?? [])
    .filter((selection) => selection.pjmKey && selection.pjmValue)
    .map((selection) => ({
      pjmKey: String(selection.pjmKey),
      pjmValue: String(selection.pjmValue)
    }));
}

export async function listCompatiblePjmOptions(
  input: NegotiatedPriceCompatibleOptionsInput
): Promise<NegotiatedPriceCompatibleOptionsResult> {
  const enginePriceGroupIntegrationId =
    input.enginePriceGroupIntegrationId?.trim();

  if (!enginePriceGroupIntegrationId) {
    throw new Error("enginePriceGroupIntegrationId is required.");
  }

  const selections = readCompatibilitySelections(input);
  const pjmOptions = selections.map((selection) => ({
    Key: selection.pjmKey,
    Value: selection.pjmValue
  }));

  const client = createPjmClientFromEnv();
  const response = await client.getEngineOptions(
    enginePriceGroupIntegrationId,
    pjmOptions
  );
  const normalizedOptions = normalizePjmEngineOptionsResponse(
    enginePriceGroupIntegrationId,
    response
  );

  return {
    enginePriceGroupIntegrationId,
    selections,
    options: normalizedOptions.map((option) => ({
      optionId: option.pjmId,
      optionName: option.displayName || option.name,
      pjmKey: extractPjmOptionKey(option.pjmId),
      choices: option.choices.map((choice) => ({
        choiceId: choice.pjmId,
        choiceName: choice.name,
        pjmValue: choice.value
      }))
    }))
  };
}

function choiceIsAvailable(
  options: NegotiatedPriceCompatibleOption[],
  choice: NegotiatedPriceCombinationChoice
) {
  const option = options.find((candidate) => candidate.pjmKey === choice.pjmKey);

  if (!option) {
    return false;
  }

  return option.choices.some((candidate) => {
    return candidate.pjmValue === choice.pjmValue || candidate.choiceId === choice.choiceId;
  });
}

export async function validateNegotiatedPriceCompatibility(
  input: NegotiatedPriceCombinationInput
): Promise<NegotiatedPriceCompatibilityValidationResult> {
  const plan = buildNegotiatedPriceExcelPlan({
    ...input,
    compatibilityFilter: undefined
  });
  const enginePriceGroupIntegrationId =
    input.enginePriceGroupIntegrationId?.trim();

  if (!enginePriceGroupIntegrationId) {
    throw new Error("enginePriceGroupIntegrationId is required.");
  }

  const client = createPjmClientFromEnv();
  const optionsCache = new Map<string, NegotiatedPriceCompatibleOption[]>();
  let pjmRequestCount = 0;

  async function readOptionsForSelections(
    selections: NegotiatedPriceCompatibilitySelection[]
  ) {
    const cacheKey = buildSelectionsCacheKey(selections);
    const cached = optionsCache.get(cacheKey);
    if (cached) return cached;

    const response = await client.getEngineOptions(
      enginePriceGroupIntegrationId,
      selections.map((selection) => ({
        Key: selection.pjmKey,
        Value: selection.pjmValue
      }))
    );
    pjmRequestCount += 1;

    const normalizedOptions = normalizePjmEngineOptionsResponse(
      enginePriceGroupIntegrationId,
      response
    ).map((option) => ({
      optionId: option.pjmId,
      optionName: option.displayName || option.name,
      pjmKey: extractPjmOptionKey(option.pjmId),
      choices: option.choices.map((choice) => ({
        choiceId: choice.pjmId,
        choiceName: choice.name,
        pjmValue: choice.value
      }))
    }));

    optionsCache.set(cacheKey, normalizedOptions);
    return normalizedOptions;
  }

  const compatibleCombinationKeys: string[] = [];
  const incompatibleCombinationKeys: string[] = [];

  for (const row of plan.rows) {
    const selections: NegotiatedPriceCompatibilitySelection[] = [];
    let compatible = true;

    for (const choice of row.choices) {
      const options = await readOptionsForSelections(selections);

      if (!choiceIsAvailable(options, choice)) {
        compatible = false;
        break;
      }

      selections.push({
        pjmKey: choice.pjmKey,
        pjmValue: choice.pjmValue
      });
    }

    if (compatible) {
      compatibleCombinationKeys.push(row.combinationKey);
    } else {
      incompatibleCombinationKeys.push(row.combinationKey);
    }
  }

  return {
    rawCombinationCount: plan.combinationCount,
    compatibleCombinationCount: compatibleCombinationKeys.length,
    incompatibleCombinationCount: incompatibleCombinationKeys.length,
    pjmRequestCount,
    compatibleCombinationKeys,
    incompatibleCombinationKeys
  };
}
