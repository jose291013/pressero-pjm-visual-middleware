import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const dataset = {
  categories: [
    {
      pjmId: "pjm-cat-signage",
      name: "Signaletique",
      slug: "signaletique"
    }
  ],
  priceGroups: [
    {
      pjmId: "pjm-group-standard",
      name: "Tarif standard",
      description: "Groupe de prix mocke pour valider la fondation pjm-sync."
    },
    {
      pjmId: "pjm-group-premium",
      name: "Groupe premium + 25%",
      description: "Deuxieme groupe mocke pour valider les mappings multiples."
    }
  ],
  priceEngines: [
    {
      pjmId: "pjm-engine-poster-a3",
      name: "Affiche A3",
      description: "Moteur PJM mocke pour tester categories, options et choix.",
      isActive: true,
      categoryPjmId: "pjm-cat-signage",
      mappings: [
        {
          enginePriceGroupIntegrationId: "pjm-map-poster-a3-standard",
          priceGroupPjmId: "pjm-group-standard"
        },
        {
          enginePriceGroupIntegrationId: "pjm-map-poster-a3-premium",
          priceGroupPjmId: "pjm-group-premium"
        }
      ],
      options: [
        {
          pjmId: "pjm-option-paper",
          name: "Paper",
          displayName: "Papier",
          optionType: "select",
          sortOrder: 10,
          isVisual: true,
          choices: [
            {
              pjmId: "pjm-choice-paper-135",
              name: "Papier couche 135 g",
              value: "paper_135",
              normalizedName: "papier-couche-135g",
              sortOrder: 10
            },
            {
              pjmId: "pjm-choice-paper-250",
              name: "Papier couche 250 g",
              value: "paper_250",
              normalizedName: "papier-couche-250g",
              sortOrder: 20
            }
          ]
        },
        {
          pjmId: "pjm-option-finish",
          name: "Finish",
          displayName: "Finition",
          optionType: "select",
          sortOrder: 20,
          isVisual: true,
          choices: [
            {
              pjmId: "pjm-choice-finish-matte",
              name: "Mat",
              value: "finish_matte",
              normalizedName: "mat",
              sortOrder: 10
            },
            {
              pjmId: "pjm-choice-finish-gloss",
              name: "Brillant",
              value: "finish_gloss",
              normalizedName: "brillant",
              sortOrder: 20
            }
          ]
        }
      ]
    }
  ]
};

async function seed() {
  for (const category of dataset.categories) {
    await prisma.pjmProductCategory.upsert({
      where: { pjmId: category.pjmId },
      update: {
        name: category.name,
        slug: category.slug
      },
      create: category
    });
  }

  for (const priceGroup of dataset.priceGroups) {
    await prisma.pjmPriceGroup.upsert({
      where: { pjmId: priceGroup.pjmId },
      update: {
        name: priceGroup.name,
        description: priceGroup.description
      },
      create: priceGroup
    });
  }

  for (const engine of dataset.priceEngines) {
    const category = await prisma.pjmProductCategory.findUniqueOrThrow({
      where: { pjmId: engine.categoryPjmId }
    });

    const priceEngine = await prisma.pjmPriceEngine.upsert({
      where: { pjmId: engine.pjmId },
      update: {
        name: engine.name,
        description: engine.description,
        isActive: engine.isActive,
        productCategoryId: category.id
      },
      create: {
        pjmId: engine.pjmId,
        name: engine.name,
        description: engine.description,
        isActive: engine.isActive,
        productCategoryId: category.id
      }
    });

    for (const mapping of engine.mappings) {
      const priceGroup = await prisma.pjmPriceGroup.findUniqueOrThrow({
        where: { pjmId: mapping.priceGroupPjmId }
      });

      await prisma.pjmEnginePriceGroupMapping.upsert({
        where: {
          enginePriceGroupIntegrationId:
            mapping.enginePriceGroupIntegrationId
        },
        update: {
          priceEngineId: priceEngine.id,
          priceGroupId: priceGroup.id
        },
        create: {
          enginePriceGroupIntegrationId:
            mapping.enginePriceGroupIntegrationId,
          priceEngineId: priceEngine.id,
          priceGroupId: priceGroup.id
        }
      });
    }

    for (const option of engine.options) {
      const pjmOption = await prisma.pjmOption.upsert({
        where: { pjmId: option.pjmId },
        update: {
          name: option.name,
          displayName: option.displayName,
          optionType: option.optionType,
          sortOrder: option.sortOrder,
          isVisual: option.isVisual,
          priceEngineId: priceEngine.id
        },
        create: {
          pjmId: option.pjmId,
          name: option.name,
          displayName: option.displayName,
          optionType: option.optionType,
          sortOrder: option.sortOrder,
          isVisual: option.isVisual,
          priceEngineId: priceEngine.id
        }
      });

      for (const choice of option.choices) {
        await prisma.pjmOptionChoice.upsert({
          where: { pjmId: choice.pjmId },
          update: {
            name: choice.name,
            value: choice.value,
            normalizedName: choice.normalizedName,
            sortOrder: choice.sortOrder,
            optionId: pjmOption.id
          },
          create: {
            pjmId: choice.pjmId,
            name: choice.name,
            value: choice.value,
            normalizedName: choice.normalizedName,
            sortOrder: choice.sortOrder,
            optionId: pjmOption.id
          }
        });
      }
    }
  }
}

try {
  await seed();
  console.log("PJM mock dataset seeded.");
} finally {
  await prisma.$disconnect();
}
