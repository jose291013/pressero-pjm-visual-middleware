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

export type PjmOrganizationListItemResponse = {
  ID?: string;
  Id?: string;
  id?: string;
  OrganizationIntegrationId?: string;
  organizationIntegrationId?: string;
  IntegrationID?: string;
  IntegrationId?: string;
  integrationId?: string;
  Name?: string;
  name?: string;
  DisplayName?: string;
  displayName?: string;
  Title?: string;
  title?: string;
  IsActive?: boolean;
  isActive?: boolean;
  IsDeleted?: boolean | string;
  isDeleted?: boolean | string;
};

export type PjmOrganizationListEnvelopeResponse = {
  Total?: number;
  total?: number;
  Organizations?: PjmOrganizationListItemResponse[];
  organizations?: PjmOrganizationListItemResponse[];
  Items?: PjmOrganizationListItemResponse[];
  items?: PjmOrganizationListItemResponse[];
  Data?: PjmOrganizationListItemResponse[] | PjmOrganizationListEnvelopeResponse;
  data?: PjmOrganizationListItemResponse[] | PjmOrganizationListEnvelopeResponse;
  Result?: PjmOrganizationListItemResponse[] | PjmOrganizationListEnvelopeResponse;
  result?: PjmOrganizationListItemResponse[] | PjmOrganizationListEnvelopeResponse;
  Results?: PjmOrganizationListItemResponse[] | PjmOrganizationListEnvelopeResponse;
  results?: PjmOrganizationListItemResponse[] | PjmOrganizationListEnvelopeResponse;
};

export type PjmOrganizationListResponse =
  | PjmOrganizationListItemResponse[]
  | PjmOrganizationListEnvelopeResponse;

export type PjmEngineOperation = "options" | "optionsandprice";

export type PjmEngineOptionValue = {
  Key?: string;
  Name?: string;
  Value: string | number | boolean | null;
};

export type PjmEngineRequest = {
  Operation: PjmEngineOperation;
  Product: string;
  Options: PjmEngineOptionValue[];
};

export type PjmEngineChoiceResponse = {
  Id?: string;
  id?: string;
  Key?: string;
  key?: string;
  Name?: string;
  name?: string;
  Value?: string | number | boolean | null;
  value?: string | number | boolean | null;
  Label?: string;
  label?: string;
  Text?: string;
  text?: string;
  Description?: string;
  description?: string;
  DisplayName?: string;
  displayName?: string;
  Title?: string;
  title?: string;
};

export type PjmEngineOptionResponse = {
  Id?: string;
  id?: string;
  Name?: string;
  name?: string;
  Label?: string;
  label?: string;
  DisplayName?: string;
  displayName?: string;
  Title?: string;
  title?: string;
  Type?: string;
  type?: string;
  Values?: PjmEngineChoiceResponse[];
  Choices?: PjmEngineChoiceResponse[];
  Options?: PjmEngineChoiceResponse[];
  values?: PjmEngineChoiceResponse[];
  choices?: PjmEngineChoiceResponse[];
  options?: PjmEngineChoiceResponse[];
  Suppress?: boolean;
  suppress?: boolean;
};

export type PjmEngineOptionsResponse =
  | PjmEngineOptionResponse[]
  | {
      EngineOptions?: PjmEngineOptionResponse[];
      engineOptions?: PjmEngineOptionResponse[];
      Options?: PjmEngineOptionResponse[];
      options?: PjmEngineOptionResponse[];
      Values?: PjmEngineOptionResponse[];
      values?: PjmEngineOptionResponse[];
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
