export type PresseroPricingMode = "pjmLive" | "negotiated";

export type PresseroProductConfigInput = {
  misProductId?: string;
  name: string;
  pricingMode: PresseroPricingMode;
  organizationIntegrationId: string;
  organizationName?: string;
  priceEngineId: string;
  enginePriceGroupIntegrationId?: string;
  priceGroupName?: string;
  negotiatedProfileId?: string | null;
  notes?: string;
};

export type PresseroProductConfigSummary = {
  id: string;
  misProductId: string;
  name: string;
  pricingMode: PresseroPricingMode;
  organizationIntegrationId: string;
  organizationName: string | null;
  priceEngineId: string;
  priceEngineName: string;
  enginePriceGroupIntegrationId: string;
  priceGroupName: string | null;
  negotiatedProfileId: string | null;
  negotiatedMisId: string | null;
  negotiatedPricingMisId: string | null;
  notes: string | null;
  isActive: boolean;
  updatedAt: string;
};

export type PresseroVisualProductChoice = {
  id: string;
  pjmId: string;
  value: string;
  label: string;
  sortOrder: number;
  image: {
    key: string;
    url: string;
    altText: string | null;
    mimeType: string;
    width: number | null;
    height: number | null;
  };
};

export type PresseroVisualProductOption = {
  id: string;
  pjmId: string;
  name: string;
  label: string;
  optionType: string | null;
  sortOrder: number;
  choices: PresseroVisualProductChoice[];
};

export type PresseroVisualProductConfig = {
  misProductId: string;
  name: string;
  pricingMode: PresseroPricingMode;
  organizationIntegrationId: string;
  organizationName: string | null;
  priceEngine: {
    id: string;
    pjmId: string;
    name: string;
  };
  priceGroup: {
    enginePriceGroupIntegrationId: string;
    name: string | null;
  };
  options: PresseroVisualProductOption[];
  counts: {
    visualOptions: number;
    visualChoices: number;
  };
};
