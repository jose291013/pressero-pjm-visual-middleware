export type PresseroPricingMode = "pjmLive" | "negotiated";

export type PresseroProductConfigInput = {
  misProductId: string;
  name: string;
  pricingMode: PresseroPricingMode;
  organizationIntegrationId: string;
  organizationName?: string;
  priceEngineId: string;
  enginePriceGroupIntegrationId: string;
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
  notes: string | null;
  isActive: boolean;
  updatedAt: string;
};
