export type PresseroPricingModuleStatus = "json_diagnostic_pricing";

export type PresseroPricingParameters = {
  Q1?: string | number | null;
  Quantity?: string | number | null;
  quantity?: string | number | null;
  hdnTotalCost?: string | number | null;
  hdnTotalWeight?: string | number | null;
  KitParameters?: unknown;
  [key: string]: unknown;
};

export type PresseroPricingRequestBody = {
  pricingParameters?: PresseroPricingParameters;
  PricingParameters?: PresseroPricingParameters;
  misProductId?: string;
  MISProductID?: string;
  MisProductId?: string;
  [key: string]: unknown;
};

export type PresseroPricingJsonResponse = {
  Price: number;
  Cost: number;
  Weight: number;
  TotalPrice: number;
  TotalCost: number;
  TotalWeight: number;
  price: number;
  cost: number;
  weight: number;
  success: boolean;
};

export type PresseroPricingDebugResponse = {
  module: "pressero-pricing";
  status: PresseroPricingModuleStatus;
  received: {
    quantity: number;
    misProductId: string | null;
    pricingParameterKeys: string[];
  };
  pricing: PresseroPricingJsonResponse;
};
