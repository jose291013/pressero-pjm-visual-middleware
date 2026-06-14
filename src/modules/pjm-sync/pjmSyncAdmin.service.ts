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
    enginePriceGroupMappings,
    options,
    optionChoices,
    latestEngine,
    latestPriceGroup,
    latestMapping,
    latestOption,
    latestChoice
  ] = await Promise.all([
    prisma.pjmPriceEngine.count(),
    prisma.pjmPriceGroup.count(),
    prisma.pjmEnginePriceGroupMapping.count(),
    prisma.pjmOption.count(),
    prisma.pjmOptionChoice.count(),
    findLatestUpdatedAt(prisma.pjmPriceEngine),
    findLatestUpdatedAt(prisma.pjmPriceGroup),
    findLatestUpdatedAt(prisma.pjmEnginePriceGroupMapping),
    findLatestUpdatedAt(prisma.pjmOption),
    findLatestUpdatedAt(prisma.pjmOptionChoice)
  ]);

  return {
    priceEngines,
    priceGroups,
    enginePriceGroupMappings,
    options,
    optionChoices,
    latestUpdatedAt: maxDate([
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
