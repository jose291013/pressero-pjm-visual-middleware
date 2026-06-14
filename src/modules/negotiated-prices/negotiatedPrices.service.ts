import { buildNegotiatedPriceExcelPlan } from "./negotiatedPricesExcel.service.js";
import type {
  NegotiatedPriceCombinationInput,
  NegotiatedPriceExcelPlan
} from "./negotiatedPrices.types.js";

export function getNegotiatedPricesModuleName() {
  return "negotiated-prices";
}

export function previewNegotiatedPriceExcelPlan(
  input: NegotiatedPriceCombinationInput
): NegotiatedPriceExcelPlan {
  return buildNegotiatedPriceExcelPlan(input);
}
