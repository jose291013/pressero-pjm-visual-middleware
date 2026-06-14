import { createHash } from "node:crypto";
import type {
  NegotiatedPriceCombinationChoice,
  NegotiatedPriceCombinationInput,
  NegotiatedPriceCombinationRow,
  NegotiatedPriceOptionSelection
} from "./negotiatedPrices.types.js";

export function parseQuantityTiersText(value: string): number[] {
  const seen = new Set<number>();
  const quantities: number[] = [];
  const tokens = String(value || "")
    .split(/[\n,;]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  for (const token of tokens) {
    if (!/^\d+$/.test(token)) {
      throw new Error(`Invalid quantity tier: ${token}`);
    }

    const quantity = Number(token);
    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new Error(`Invalid quantity tier: ${token}`);
    }

    if (!seen.has(quantity)) {
      seen.add(quantity);
      quantities.push(quantity);
    }
  }

  if (!quantities.length) {
    throw new Error("At least one quantity tier is required.");
  }

  return quantities;
}

function hashJson(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(value))
    .digest("hex");
}

export function buildBaseCombinationKey(
  input: NegotiatedPriceCombinationInput,
  choices: NegotiatedPriceCombinationChoice[]
): string {
  return hashJson({
    clientId: input.clientId,
    priceEngineId: input.priceEngineId,
    enginePriceGroupIntegrationId: input.enginePriceGroupIntegrationId,
    optionChoices: choices.map((choice) => ({
      optionId: choice.optionId,
      choiceId: choice.choiceId
    }))
  });
}

export function buildTierCombinationHash(
  input: NegotiatedPriceCombinationInput,
  choices: NegotiatedPriceCombinationChoice[],
  quantity: number
): string {
  return hashJson({
    clientId: input.clientId,
    priceEngineId: input.priceEngineId,
    enginePriceGroupIntegrationId: input.enginePriceGroupIntegrationId,
    quantity,
    pages: null,
    optionChoiceIds: choices.map((choice) => choice.choiceId)
  });
}

function assertValidOptionSelections(
  optionSelections: NegotiatedPriceOptionSelection[]
) {
  if (!optionSelections.length) {
    throw new Error("At least one option selection is required.");
  }

  for (const option of optionSelections) {
    if (!option.optionId || !option.optionName || !option.pjmKey) {
      throw new Error("Every selected option requires optionId, optionName and pjmKey.");
    }

    if (!option.choices.length) {
      throw new Error(`Option ${option.optionName} must include at least one choice.`);
    }
  }
}

export function countChoiceCombinations(
  optionSelections: NegotiatedPriceOptionSelection[]
): number {
  assertValidOptionSelections(optionSelections);

  return optionSelections.reduce((count, option) => {
    return count * option.choices.length;
  }, 1);
}

export function buildChoiceCombinations(
  input: NegotiatedPriceCombinationInput,
  quantities: number[]
): NegotiatedPriceCombinationRow[] {
  assertValidOptionSelections(input.optionSelections);

  const rows: NegotiatedPriceCombinationRow[] = [];

  function walk(
    optionIndex: number,
    choices: NegotiatedPriceCombinationChoice[]
  ) {
    if (optionIndex >= input.optionSelections.length) {
      rows.push({
        rowNumber: rows.length + 1,
        combinationKey: buildBaseCombinationKey(input, choices),
        choices,
        tierHashes: quantities.map((quantity) => ({
          quantity,
          combinationHash: buildTierCombinationHash(input, choices, quantity)
        }))
      });
      return;
    }

    const option = input.optionSelections[optionIndex];
    for (const choice of option.choices) {
      walk(optionIndex + 1, [
        ...choices,
        {
          optionId: option.optionId,
          optionName: option.optionName,
          choiceId: choice.choiceId,
          choiceName: choice.choiceName,
          pjmKey: option.pjmKey,
          pjmValue: choice.pjmValue
        }
      ]);
    }
  }

  walk(0, []);
  return rows;
}
