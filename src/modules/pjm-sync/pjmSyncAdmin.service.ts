import { prisma } from "../../config/prisma.js";
import type { PjmSyncAdminSummary } from "./pjmSync.types.js";

function maxDate(values: Array<Date | null | undefined>): string | null {
  const timestamps = values
    .filter((value): value is Date => value instanceof Date)
    .map((value) => value.getTime());

  if (!timestamps.length) return null;

  return new Date(Math.max(...timestamps)).toISOString();
}

async function findLatestUpdatedAt(model: {
  findFirst: (args: {
    orderBy: { updatedAt: "desc" };
    select: { updatedAt: true };
  }) => Promise<{ updatedAt: Date } | null>;
}) {
  return model.findFirst({
    orderBy: { updatedAt: "desc" },
    select: { updatedAt: true }
  });
}

export async function getPjmSyncAdminSummary(): Promise<PjmSyncAdminSummary> {
  const [
    priceEngines,
    priceGroups,
    productCategories,
    enginePriceGroupMappings,
    options,
    optionChoices,
    latestCategory,
    latestEngine,
    latestPriceGroup,
    latestMapping,
    latestOption,
    latestChoice
  ] = await Promise.all([
    prisma.pjmPriceEngine.count(),
    prisma.pjmPriceGroup.count(),
    prisma.pjmProductCategory.count(),
    prisma.pjmEnginePriceGroupMapping.count(),
    prisma.pjmOption.count(),
    prisma.pjmOptionChoice.count(),
    findLatestUpdatedAt(prisma.pjmProductCategory),
    findLatestUpdatedAt(prisma.pjmPriceEngine),
    findLatestUpdatedAt(prisma.pjmPriceGroup),
    findLatestUpdatedAt(prisma.pjmEnginePriceGroupMapping),
    findLatestUpdatedAt(prisma.pjmOption),
    findLatestUpdatedAt(prisma.pjmOptionChoice)
  ]);

  return {
    priceEngines,
    priceGroups,
    productCategories,
    enginePriceGroupMappings,
    options,
    optionChoices,
    latestUpdatedAt: maxDate([
      latestCategory?.updatedAt,
      latestEngine?.updatedAt,
      latestPriceGroup?.updatedAt,
      latestMapping?.updatedAt,
      latestOption?.updatedAt,
      latestChoice?.updatedAt
    ])
  };
}

export async function listPjmSyncAdminPriceEngines() {
  return prisma.pjmPriceEngine.findMany({
    include: {
      productCategory: true,
      priceGroupMappings: {
        include: {
          priceGroup: true
        },
        orderBy: [{ createdAt: "asc" }]
      },
      _count: {
        select: {
          options: true,
          priceGroupMappings: true
        }
      }
    },
    orderBy: [{ name: "asc" }]
  });
}

export async function listPjmSyncAdminOrganizations() {
  const profiles = await prisma.negotiatedPriceProfile.findMany({
    select: {
      clientId: true,
      name: true,
      priceEngineId: true
    },
    orderBy: [{ clientId: "asc" }, { name: "asc" }]
  });

  const organizations = new Map<
    string,
    { clientId: string; name: string; priceEngineIds: Set<string> }
  >();

  for (const profile of profiles) {
    const existing = organizations.get(profile.clientId) ?? {
      clientId: profile.clientId,
      name: profile.name,
      priceEngineIds: new Set<string>()
    };

    if (profile.priceEngineId) {
      existing.priceEngineIds.add(profile.priceEngineId);
    }

    organizations.set(profile.clientId, existing);
  }

  return Array.from(organizations.values()).map((organization) => ({
    clientId: organization.clientId,
    name: organization.name,
    priceEngineIds: Array.from(organization.priceEngineIds)
  }));
}

export async function getPjmSyncAdminPriceEngine(engineIdOrPjmId: string) {
  return prisma.pjmPriceEngine.findFirst({
    where: {
      OR: [{ id: engineIdOrPjmId }, { pjmId: engineIdOrPjmId }]
    },
    include: {
      productCategory: true,
      priceGroupMappings: {
        include: {
          priceGroup: true
        },
        orderBy: [{ createdAt: "asc" }]
      },
      options: {
        include: {
          choices: {
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
          }
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
      }
    }
  });
}

export async function listPjmSyncAdminEngineMappings(
  engineIdOrPjmId: string
) {
  const engine = await prisma.pjmPriceEngine.findFirst({
    where: {
      OR: [{ id: engineIdOrPjmId }, { pjmId: engineIdOrPjmId }]
    },
    include: {
      priceGroupMappings: {
        include: {
          priceGroup: true
        },
        orderBy: [{ createdAt: "asc" }]
      }
    }
  });

  return engine?.priceGroupMappings ?? null;
}

export async function listPjmSyncAdminEngineOptions(engineIdOrPjmId: string) {
  const engine = await prisma.pjmPriceEngine.findFirst({
    where: {
      OR: [{ id: engineIdOrPjmId }, { pjmId: engineIdOrPjmId }]
    },
    include: {
      options: {
        include: {
          choices: {
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
          }
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
      }
    }
  });

  return engine?.options ?? null;
}
