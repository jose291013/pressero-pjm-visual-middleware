export type NegotiatedPricesModuleStatus = "excel_plan_foundation";

export type NegotiatedPriceCompatibilitySelection = {
  pjmKey: string;
  pjmValue: string;
};

export type NegotiatedPriceCompatibleChoice = {
  choiceId: string;
  choiceName: string;
  pjmValue: string;
};

export type NegotiatedPriceCompatibleOption = {
  optionId: string;
  optionName: string;
  pjmKey: string;
  choices: NegotiatedPriceCompatibleChoice[];
};

export type NegotiatedPriceCompatibleOptionsInput = {
  enginePriceGroupIntegrationId: string;
  selections: NegotiatedPriceCompatibilitySelection[];
};

export type NegotiatedPriceCompatibleOptionsResult = {
  enginePriceGroupIntegrationId: string;
  selections: NegotiatedPriceCompatibilitySelection[];
  options: NegotiatedPriceCompatibleOption[];
};

export type NegotiatedPriceChoiceSelection = {
  choiceId: string;
  choiceName: string;
  pjmValue: string;
};

export type NegotiatedPriceOptionSelection = {
  optionId: string;
  optionName: string;
  pjmKey: string;
  choices: NegotiatedPriceChoiceSelection[];
};

export type NegotiatedPricePricingBasisMode = "quantity" | "areaM2";

export type NegotiatedPriceCalculationParameter = {
  key: string;
  label: string;
  pjmKey: string;
};

export type NegotiatedPricePricingBasis = {
  mode: NegotiatedPricePricingBasisMode;
  formula: string;
  parameters: NegotiatedPriceCalculationParameter[];
};

export type NegotiatedPriceCombinationInput = {
  clientId: string;
  organizationName?: string;
  priceEngineId: string;
  priceEngineName: string;
  enginePriceGroupIntegrationId: string;
  priceGroupName: string;
  quantityTiersText: string;
  pricingBasis?: NegotiatedPricePricingBasis;
  optionSelections: NegotiatedPriceOptionSelection[];
};

export type NegotiatedPriceCombinationChoice = {
  optionId: string;
  optionName: string;
  choiceId: string;
  choiceName: string;
  pjmKey: string;
  pjmValue: string;
};

export type NegotiatedPriceCombinationRow = {
  rowNumber: number;
  combinationKey: string;
  choices: NegotiatedPriceCombinationChoice[];
  tierHashes: Array<{
    quantity: number;
    combinationHash: string;
  }>;
};

export type NegotiatedPriceExcelColumn = {
  key: string;
  label: string;
  kind: "technical" | "context" | "option" | "pjmPrice" | "negotiatedPrice";
  quantity?: number;
};

export type NegotiatedPriceWorkbookExport = {
  fileName: string;
  buffer: Buffer;
};

export type NegotiatedPriceExcelPlan = {
  clientId: string;
  organizationName: string | null;
  priceEngineId: string;
  priceEngineName: string;
  enginePriceGroupIntegrationId: string;
  priceGroupName: string;
  pricingBasis: NegotiatedPricePricingBasis;
  quantities: number[];
  combinationCount: number;
  columns: NegotiatedPriceExcelColumn[];
  rows: NegotiatedPriceCombinationRow[];
};
