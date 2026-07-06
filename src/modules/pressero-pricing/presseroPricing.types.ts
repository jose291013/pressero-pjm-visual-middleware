export type PresseroPricingModuleStatus =
  | "json_diagnostic_pricing"
  | "json_provider";

export type PresseroPricingProviderMode = "options" | "price";

export type PresseroPricingParameterOption = {
  Key: string;
  Value: string;
};

export type PresseroPricingParameter = {
  ID: string;
  Label: string;
  Options: PresseroPricingParameterOption[];
};

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
  user?: string;
  accessToken?: string;
  productID?: string;
  productId?: string;
  ProductID?: string;
  ProductId?: string;
  pricingParameters?: PresseroPricingParameters;
  PricingParameters?: PresseroPricingParameters;
  misProductId?: string;
  MISProductID?: string;
  MisProductId?: string;
  quantity?: string | number | null;
  Quantity?: string | number | null;
  options?: PresseroPricingParameterOption[];
  Options?: PresseroPricingParameterOption[];
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
  Options: PresseroPricingParameterOption[];
};

export type PresseroPricingDebugResponse = {
  module: "pressero-pricing";
  status: PresseroPricingModuleStatus;
  received: {
    quantity: number;
    misProductId: string | null;
    pricingParameterKeys: string[];
    selectedOptions: PresseroPricingParameterOption[];
  };
  pricing: PresseroPricingJsonResponse;
};
