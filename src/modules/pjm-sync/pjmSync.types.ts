export type PjmSyncModuleStatus = "mock_foundation";

export type PjmSyncChoiceSeed = {
  pjmId: string;
  name: string;
  value: string;
  normalizedName: string;
  sortOrder: number;
};

export type PjmSyncOptionSeed = {
  pjmId: string;
  name: string;
  displayName: string;
  optionType: string;
  sortOrder: number;
  isVisual: boolean;
  choices: PjmSyncChoiceSeed[];
};

export type PjmSyncPriceEngineSeed = {
  pjmId: string;
  name: string;
  description: string;
  isActive: boolean;
  categoryPjmId: string;
  mappings: Array<{
    enginePriceGroupIntegrationId: string;
    priceGroupPjmId: string;
  }>;
  options: PjmSyncOptionSeed[];
};

export type PjmSyncMockDataset = {
  categories: Array<{
    pjmId: string;
    name: string;
    slug: string;
  }>;
  priceGroups: Array<{
    pjmId: string;
    name: string;
    description: string;
  }>;
  priceEngines: PjmSyncPriceEngineSeed[];
};
