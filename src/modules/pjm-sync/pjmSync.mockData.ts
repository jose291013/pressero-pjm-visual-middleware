import type { PjmSyncMockDataset } from "./pjmSync.types.js";

export const pjmSyncMockDataset: PjmSyncMockDataset = {
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
    }
  ],
  priceEngines: [
    {
      pjmId: "pjm-engine-poster-a3",
      name: "Affiche A3",
      description: "Moteur PJM mocke pour tester categories, options et choix.",
      isActive: true,
      categoryPjmId: "pjm-cat-signage",
      priceGroupPjmId: "pjm-group-standard",
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
