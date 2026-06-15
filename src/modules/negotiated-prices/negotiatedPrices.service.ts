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
