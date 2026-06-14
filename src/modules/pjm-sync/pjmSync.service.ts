import { prisma } from "../../config/prisma.js";

export function getPjmSyncModuleName() {
  return "pjm-sync";
}

export async function listPjmProductCategories() {
  return prisma.pjmProductCategory.findMany({
    orderBy: [{ name: "asc" }]
  });
}

export async function listPjmPriceGroups() {
  return prisma.pjmPriceGroup.findMany({
    orderBy: [{ name: "asc" }]
  });
}

export async function listPjmPriceEngines() {
  return prisma.pjmPriceEngine.findMany({
    include: {
      productCategory: true,
      priceGroupMappings: {
        include: {
          priceGroup: true
        },
        orderBy: [{ createdAt: "asc" }]
      }
    },
    orderBy: [{ name: "asc" }]
  });
}

export async function listPjmPriceEngineOptions(engineIdOrPjmId: string) {
  const priceEngine = await prisma.pjmPriceEngine.findFirst({
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

  return priceEngine?.options ?? null;
}
