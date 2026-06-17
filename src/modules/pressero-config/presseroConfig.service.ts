import { randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import type {
  PresseroPricingMode,
  PresseroProductConfigInput,
  PresseroProductConfigSummary
} from "./presseroConfig.types.js";

const productConfigInclude = {
  priceEngine: true,
  negotiatedProfile: true
} satisfies Prisma.PresseroProductConfigInclude;

type ProductConfigRecord = Prisma.PresseroProductConfigGetPayload<{
  include: typeof productConfigInclude;
}>;

export function getPresseroConfigModuleName() {
  return "pressero-config";
}

function serializeProductConfig(
  config: ProductConfigRecord
): PresseroProductConfigSummary {
  return {
    id: config.id,
    misProductId: config.misProductId,
    name: config.name,
    pricingMode: config.pricingMode,
    organizationIntegrationId: config.organizationIntegrationId,
    organizationName: config.organizationName,
    priceEngineId: config.priceEngineId,
    priceEngineName: config.priceEngine.name,
    enginePriceGroupIntegrationId: config.enginePriceGroupIntegrationId,
    priceGroupName: config.priceGroupName,
    negotiatedProfileId: config.negotiatedProfileId,
    negotiatedMisId: config.negotiatedProfile?.misId ?? null,
    negotiatedPricingMisId: config.negotiatedProfile?.misId ?? null,
    notes: config.notes,
    isActive: config.isActive,
    updatedAt: config.updatedAt.toISOString()
  };
}

function readPricingMode(value: string): PresseroPricingMode {
  return value === "negotiated" ? "negotiated" : "pjmLive";
}

function normalizeIdentifierPart(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase()
    .slice(0, 18);
}

async function generateMiddlewareProductMisId(
  input: ReturnType<typeof normalizeInput>
) {
  const organizationPart = normalizeIdentifierPart(input.organizationIntegrationId).slice(0, 8);
  const engine = await prisma.pjmPriceEngine.findUnique({
    where: {
      id: input.priceEngineId
    },
    select: {
      name: true
    }
  });
  const enginePart = normalizeIdentifierPart(engine?.name || input.priceEngineId) || "PJM";

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = randomBytes(3).toString("hex").toUpperCase();
    const candidate = `MWP-${organizationPart || "ORG"}-${enginePart}-${suffix}`;
    const existing = await prisma.presseroProductConfig.findUnique({
      where: {
        misProductId: candidate
      }
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Impossible de generer un MIS Product ID unique.");
}

function normalizeInput(input: PresseroProductConfigInput) {
  const pricingMode = readPricingMode(input.pricingMode);
  return {
    misProductId: input.misProductId?.trim() ?? "",
    name: input.name?.trim() ?? "",
    pricingMode,
    organizationIntegrationId: input.organizationIntegrationId?.trim() ?? "",
    organizationName: input.organizationName?.trim() || null,
    priceEngineId: input.priceEngineId?.trim() ?? "",
    enginePriceGroupIntegrationId: input.enginePriceGroupIntegrationId?.trim() ?? "",
    priceGroupName: input.priceGroupName?.trim() || null,
    negotiatedProfileId:
      pricingMode === "negotiated" ? input.negotiatedProfileId?.trim() || null : null,
    notes: input.notes?.trim() || null
  };
}

async function assertProductConfigContext(
  input: ReturnType<typeof normalizeInput>
) {
  if (!input.name) {
    throw new Error("Nom de configuration obligatoire.");
  }

  if (!input.organizationIntegrationId) {
    throw new Error("Organisation ID obligatoire.");
  }

  if (!input.priceEngineId) {
    throw new Error("Moteur PJM obligatoire.");
  }

  if (input.pricingMode === "negotiated") {
    if (!input.negotiatedProfileId) {
      throw new Error("MISID negocie obligatoire pour le mode prix negocie.");
    }

    const profile = await prisma.negotiatedPriceProfile.findFirst({
      where: {
        id: input.negotiatedProfileId,
        isActive: true
      }
    });

    if (!profile) {
      throw new Error("MISID negocie introuvable ou inactif.");
    }

    if (
      profile.organizationIntegrationId !== input.organizationIntegrationId ||
      profile.priceEngineId !== input.priceEngineId
    ) {
      throw new Error("Le MISID negocie ne correspond pas au contexte Pressero.");
    }

    if (!profile.enginePriceGroupIntegrationId) {
      throw new Error("Le MISID negocie n'a pas de groupe PJM de reference.");
    }

    return {
      enginePriceGroupIntegrationId: profile.enginePriceGroupIntegrationId,
      priceGroupName: profile.priceGroupName
    };
  }

  if (!input.enginePriceGroupIntegrationId) {
    throw new Error("Groupe de prix obligatoire.");
  }

  const mapping = await prisma.pjmEnginePriceGroupMapping.findFirst({
    where: {
      priceEngineId: input.priceEngineId,
      enginePriceGroupIntegrationId: input.enginePriceGroupIntegrationId
    },
    include: {
      priceGroup: true
    }
  });

  if (!mapping) {
    throw new Error("Le groupe de prix ne correspond pas au moteur PJM choisi.");
  }

  return {
    enginePriceGroupIntegrationId: input.enginePriceGroupIntegrationId,
    priceGroupName: input.priceGroupName || mapping.priceGroup.name
  };
}

function readConfigId(configId: string) {
  const id = configId.trim();
  if (!id) {
    throw new Error("Configuration ID obligatoire.");
  }
  return id;
}

export async function listPresseroProductConfigs() {
  const configs = await prisma.presseroProductConfig.findMany({
    where: {
      isActive: true
    },
    include: productConfigInclude,
    orderBy: {
      updatedAt: "desc"
    }
  });

  return configs.map(serializeProductConfig);
}

export async function createPresseroProductConfig(
  input: PresseroProductConfigInput
): Promise<PresseroProductConfigSummary> {
  const normalized = normalizeInput(input);
  const context = await assertProductConfigContext(normalized);
  const misProductId =
    normalized.misProductId || await generateMiddlewareProductMisId(normalized);

  const config = await prisma.presseroProductConfig.create({
    data: {
      ...normalized,
      misProductId,
      enginePriceGroupIntegrationId: context.enginePriceGroupIntegrationId,
      priceGroupName: context.priceGroupName
    },
    include: productConfigInclude
  });

  return serializeProductConfig(config);
}

export async function updatePresseroProductConfig(
  configId: string,
  input: PresseroProductConfigInput
): Promise<PresseroProductConfigSummary> {
  const id = readConfigId(configId);
  const normalized = normalizeInput(input);
  const context = await assertProductConfigContext(normalized);

  const existing = await prisma.presseroProductConfig.findFirst({
    where: {
      id,
      isActive: true
    }
  });

  if (!existing) {
    throw new Error("Configuration Pressero introuvable ou inactive.");
  }

  const config = await prisma.presseroProductConfig.update({
    where: {
      id
    },
    data: {
      ...normalized,
      misProductId: normalized.misProductId || existing.misProductId,
      enginePriceGroupIntegrationId: context.enginePriceGroupIntegrationId,
      priceGroupName: context.priceGroupName
    },
    include: productConfigInclude
  });

  return serializeProductConfig(config);
}

export async function deletePresseroProductConfig(configId: string) {
  const id = readConfigId(configId);
  const existing = await prisma.presseroProductConfig.findFirst({
    where: {
      id,
      isActive: true
    }
  });

  if (!existing) {
    throw new Error("Configuration Pressero introuvable ou deja supprimee.");
  }

  const config = await prisma.presseroProductConfig.update({
    where: {
      id
    },
    data: {
      isActive: false
    },
    include: productConfigInclude
  });

  return {
    id: config.id,
    misProductId: config.misProductId,
    deleted: true
  };
}
