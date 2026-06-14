export type PjmAuthenticateRequest = {
  UserName: string;
  Password: string;
};

export type PjmAuthenticateResponse = {
  Token?: string;
  token?: string;
  AccessToken?: string;
  accessToken?: string;
  access_token?: string;
};

export type PjmProductEngineListMappingResponse = {
  EnginePriceGroupIntegrationId: string;
  PriceGroupName: string;
};

export type PjmProductEngineListItemResponse = {
  Id: string;
  Name: string;
  Mappings: PjmProductEngineListMappingResponse[];
};

export type PjmProductEngineListEnvelopeResponse = {
  ProductEngines?: PjmProductEngineListItemResponse[];
  productEngines?: PjmProductEngineListItemResponse[];
  Engines?: PjmProductEngineListItemResponse[];
  engines?: PjmProductEngineListItemResponse[];
  Items?: PjmProductEngineListItemResponse[];
  items?: PjmProductEngineListItemResponse[];
  Data?: PjmProductEngineListItemResponse[] | PjmProductEngineListEnvelopeResponse;
  data?: PjmProductEngineListItemResponse[] | PjmProductEngineListEnvelopeResponse;
  Result?: PjmProductEngineListItemResponse[] | PjmProductEngineListEnvelopeResponse;
  result?: PjmProductEngineListItemResponse[] | PjmProductEngineListEnvelopeResponse;
  Results?: PjmProductEngineListItemResponse[] | PjmProductEngineListEnvelopeResponse;
  results?: PjmProductEngineListItemResponse[] | PjmProductEngineListEnvelopeResponse;
};

export type PjmProductEngineListResponse =
  | PjmProductEngineListItemResponse[]
  | PjmProductEngineListEnvelopeResponse;

export type PjmEngineOperation = "options" | "optionsandprice";

export type PjmEngineOptionValue = {
  Name: string;
  Value: string | number | boolean | null;
};

export type PjmEngineRequest = {
  Operation: PjmEngineOperation;
  Product: string;
  Options: PjmEngineOptionValue[];
};

export type PjmEngineChoiceResponse = {
  Id?: string;
  Name?: string;
  Value?: string | number | boolean | null;
  Label?: string;
  Text?: string;
};

export type PjmEngineOptionResponse = {
  Id?: string;
  Name?: string;
  Label?: string;
  Type?: string;
  Values?: PjmEngineChoiceResponse[];
  Choices?: PjmEngineChoiceResponse[];
  Options?: PjmEngineChoiceResponse[];
  Suppress?: boolean;
};

export type PjmEngineOptionsResponse =
  | PjmEngineOptionResponse[]
  | {
      EngineOptions?: PjmEngineOptionResponse[];
      Options?: PjmEngineOptionResponse[];
    };

export type PjmOptionsAndPriceResponse = {
  Price?: number;
  Weight?: number;
  WeightUnit?: string;
  Quantity?: number;
  Attributes?: Array<{
    Name?: string;
    Value?: string | number | boolean | null;
  }>;
  ErrorCode?: string | number;
  Error?: string;
  EngineOptions?: PjmEngineOptionResponse[];
};

export type PjmJobEngineValue = {
  Key: string;
  Value: string | number | boolean | null;
};

export type PjmCreateJobItem = {
  jobId: string;
  jobName: string;
  quantity: number;
  jobNumber: number;
  cost: number;
  price: number;
  discount: number;
  shipping: number;
  customerJobNotes?: string | null;
  productionNotes?: string | null;
  shippingMethod?: string | null;
  reqShipDate?: string | null;
  statusName?: string;
  engineIntegrationId: string;
  engineValues: PjmJobEngineValue[];
  productionFiles?: unknown[];
  uploadedFiles?: unknown[];
  [key: string]: unknown;
};

export type PjmCreateJobsRequest = {
  orderId: string;
  orderNumber: number;
  organizationIntegrationId: string;
  CSREmail?: string | null;
  SalesRepEmail?: string | null;
  customerOrderNotes?: string | null;
  poNumber?: string | null;
  reqShipDate?: string | null;
  jobs: PjmCreateJobItem[];
  customer?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
    fax?: string | null;
  };
  payments?: unknown[];
  [key: string]: unknown;
};

export type PjmCreateJobsResponse = Record<string, unknown>;
