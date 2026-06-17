import { createHash, randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { buildNegotiatedPriceExcelPlan } from "./negotiatedPricesExcel.service.js";
import { buildNegotiatedPriceWorkbookExport } from "./negotiatedPricesWorkbook.service.js";
import { createPjmClientFromEnv } from "../pjm-sync/pjmClient.js";
import {
  extractPjmOptionKey,
  normalizePjmEngineOptionsResponse
} from "../pjm-sync/pjmSyncCatalog.service.js";
import type {
  NegotiatedPriceCompatibleOptionsInput,
  NegotiatedPriceCompatibleOptionsResult,
  NegotiatedPriceCompatibilitySelection,
  NegotiatedPriceCompatibilityValidationResult,
  NegotiatedPriceCompatibleOption,
  NegotiatedPriceCombinationChoice,
  NegotiatedPriceCombinationInput,
  NegotiatedPriceDirectPriceInput,
  NegotiatedPriceDirectPreviewResult,
  NegotiatedPriceDirectSaveInput,
  NegotiatedPriceDirectSaveResult,
  NegotiatedPriceExcelPlan,
  NegotiatedPriceExistingProfileUpdateInput,
  NegotiatedPriceExistingProfilesInput,
  NegotiatedPriceExistingProfile,
  NegotiatedPriceMultiCombinationInput,
  NegotiatedPriceMultiSaveInput,
  NegotiatedPriceMultiSaveResult,
  NegotiatedPriceWorkbookExport
} from "./negotiatedPrices.types.js";

export function getNegotiatedPricesModuleName() {
  return "negotiated-prices";
}

export function previewNegotiatedPriceExcelPlan(
  input: NegotiatedPriceCombinationInput
): NegotiatedPriceExcelPlan {
  return buildNegotiatedPriceExcelPlan(input);
}

const existingProfileInclude = {
  combinations: {
    orderBy: {
      sortOrder: "asc"
    },
    include: {
      tiers: {
        orderBy: {
          tierValue: "asc"
        }
      }
    }
  }
} satisfies Prisma.NegotiatedPriceProfileInclude;

type ExistingProfileRecord = Prisma.NegotiatedPriceProfileGetPayload<{
  include: typeof existingProfileInclude;
}>;

export function exportNegotiatedPriceWorkbook(
  input: NegotiatedPriceCombinationInput
): Promise<NegotiatedPriceWorkbookExport> {
  return buildNegotiatedPriceWorkbookExport(input);
}

function hashJson(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(value))
    .digest("hex");
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 28)
    .toUpperCase() || "PRICE";
}

function generateMisId(input: NegotiatedPriceCombinationInput) {
  const engine = slugify(input.priceEngineName);
  const client = slugify(input.organizationName || input.clientId).slice(0, 14);
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `MIS-${client}-${engine}-${suffix}`;
}

function readOrganizationIntegrationId(input: { clientId: string }) {
  const organizationIntegrationId = input.clientId?.trim();

  if (!organizationIntegrationId) {
    throw new Error("Organisation ID est obligatoire.");
  }

  return organizationIntegrationId;
}

function readDirectProfileMode(input: NegotiatedPriceDirectSaveInput) {
  return input.profileMode === "multi" ? "multi" : "single";
}

function readDirectVisibilityMode(input: NegotiatedPriceDirectSaveInput) {
  return input.visibilityMode === "selectable" ? "selectable" : "hidden";
}

function readVisibilityMode(value: unknown) {
  return value === "selectable" ? "selectable" : "hidden";
}

function splitPricingBasisParameters(input: NegotiatedPriceCombinationInput) {
  const parameters = input.pricingBasis?.parameters ?? [];

  return {
    fixedParameters: parameters.filter((parameter) => parameter.role !== "clientVariable"),
    clientVariables: parameters.filter((parameter) => parameter.role === "clientVariable")
  };
}

function readSingleCombinationRow(input: NegotiatedPriceCombinationInput) {
  const plan = buildNegotiatedPriceExcelPlan({
    ...input,
    compatibilityFilter: undefined
  });

  if (plan.rows.length !== 1) {
    throw new Error("La saisie directe requiert une seule combinaison.");
  }

  return {
    plan,
    row: plan.rows[0]
  };
}

function buildFixedEngineValues(input: NegotiatedPriceCombinationInput) {
  const values = input.optionSelections.flatMap((option) => {
    return option.choices.slice(0, 1).map((choice) => ({
      Key: option.pjmKey,
      Value: choice.pjmValue
    }));
  });

  for (const parameter of input.pricingBasis?.parameters ?? []) {
    if (parameter.role !== "clientVariable") {
      values.push({
        Key: parameter.pjmKey,
        Value: parameter.fixedValue ?? ""
      });
    }
  }

  return values;
}

function readClientVariableParameters(input: NegotiatedPriceCombinationInput) {
  return (input.pricingBasis?.parameters ?? []).filter((parameter) => {
    return parameter.role === "clientVariable";
  });
}

function readPjmPrice(response: unknown): number | null {
  if (!response || typeof response !== "object") return null;
  const value = (response as { Price?: unknown; price?: unknown }).Price ??
    (response as { price?: unknown }).price;
  const price = Number(value);
  return Number.isFinite(price) ? price : null;
}

function readPjmWarning(response: unknown): string | undefined {
  if (!response || typeof response !== "object") return undefined;
  const error = (response as { Error?: unknown; error?: unknown }).Error ??
    (response as { error?: unknown }).error;
  const errorCode =
    (response as { ErrorCode?: unknown; errorCode?: unknown }).ErrorCode ??
    (response as { errorCode?: unknown }).errorCode;

  if (error) return String(error);
  if (errorCode) return `PJM ErrorCode ${String(errorCode)}`;
  return undefined;
}

export async function previewDirectNegotiatedPrices(
  input: NegotiatedPriceCombinationInput
): Promise<NegotiatedPriceDirectPreviewResult> {
  const { plan } = readSingleCombinationRow(input);
  const clientVariables = readClientVariableParameters(input);
  const warnings: string[] = [];

  if (clientVariables.length !== 1) {
    const message =
      "Le calcul PJM direct requiert exactement une variable client pour affecter les paliers.";
    return {
      rowCount: plan.rows.length,
      combinationKey: plan.rows[0]?.combinationKey ?? "",
      tiers: plan.quantities.map((quantity) => ({
        quantity,
        pjmPrice: null,
        warning: message
      })),
      warnings: [message]
    };
  }

  const client = createPjmClientFromEnv();
  const fixedValues = buildFixedEngineValues(input);
  const tierVariable = clientVariables[0];
  const tiers = [];

  for (const quantity of plan.quantities) {
    const response = await client.getOptionsAndPrice(
      input.enginePriceGroupIntegrationId,
      [
        ...fixedValues,
        {
          Key: tierVariable.pjmKey,
          Value: quantity
        }
      ]
    );
    const warning = readPjmWarning(response);
    if (warning) warnings.push(`${quantity}: ${warning}`);
    tiers.push({
      quantity,
      pjmPrice: readPjmPrice(response),
      warning
    });
  }

  return {
    rowCount: plan.rows.length,
    combinationKey: plan.rows[0]?.combinationKey ?? "",
    tiers,
    warnings
  };
}

function summarizeOptionSelections(value: unknown) {
  if (!Array.isArray(value)) return "";

  return value
    .flatMap((option) => {
      if (!option || typeof option !== "object") return [];
      const optionName = "optionName" in option ? String(option.optionName) : "Option";
      const choices: unknown[] = "choices" in option && Array.isArray(option.choices)
        ? option.choices as unknown[]
        : [];

      return choices.map((choice) => {
        const choiceName = choice && typeof choice === "object" && "choiceName" in choice
          ? String(choice.choiceName)
          : "Choix";
        return `${optionName}: ${choiceName}`;
      });
    })
    .join(" | ");
}

function readExistingProfilesInput(input: NegotiatedPriceExistingProfilesInput) {
  return {
    organizationIntegrationId: input.clientId?.trim() ?? "",
    priceEngineId: input.priceEngineId?.trim() ?? "",
    enginePriceGroupIntegrationId: input.enginePriceGroupIntegrationId?.trim() ?? ""
  };
}

function serializeExistingProfile(
  profile: ExistingProfileRecord
): NegotiatedPriceExistingProfile {
  const tierCount = profile.combinations.reduce((total, combination) => {
    return total + combination.tiers.length;
  }, 0);

  return {
    id: profile.id,
    misId: profile.misId || profile.name,
    profileMode: profile.profileMode,
    visibilityMode: profile.visibilityMode,
    enginePriceGroupIntegrationId: profile.enginePriceGroupIntegrationId,
    priceGroupName: profile.priceGroupName,
    combinationCount: profile.combinations.length,
    tierCount,
    combinations: profile.combinations.map((combination) => ({
      id: combination.id,
      combinationKey: combination.combinationKey,
      label: combination.label,
      optionSummary: summarizeOptionSelections(combination.optionSelections),
      tierCount: combination.tiers.length,
      tiers: combination.tiers.map((tier) => ({
        id: tier.id,
        tierValue: tier.tierValue.toString(),
        pjmPrice: tier.pjmPrice?.toString() ?? null,
        negotiatedPrice: tier.negotiatedPrice?.toString() ?? null
      }))
    }))
  };
}

export async function listExistingNegotiatedPriceProfiles(
  input: NegotiatedPriceExistingProfilesInput
): Promise<NegotiatedPriceExistingProfile[]> {
  const context = readExistingProfilesInput(input);

  if (
    !context.organizationIntegrationId ||
    !context.priceEngineId
  ) {
    return [];
  }

  const where: Prisma.NegotiatedPriceProfileWhereInput = {
    organizationIntegrationId: context.organizationIntegrationId,
    priceEngineId: context.priceEngineId,
    isActive: true
  };

  if (context.enginePriceGroupIntegrationId) {
    where.enginePriceGroupIntegrationId = context.enginePriceGroupIntegrationId;
  }

  const profiles = await prisma.negotiatedPriceProfile.findMany({
    where,
    include: existingProfileInclude,
    orderBy: {
      updatedAt: "desc"
    }
  });

  return profiles.map(serializeExistingProfile);
}

function readProfileId(profileId: string) {
  const id = profileId.trim();
  if (!id) {
    throw new Error("Profile ID obligatoire.");
  }
  return id;
}

function assertEditableNegotiatedPrice(value: number | null, tierValue: string) {
  if (value === null) {
    return;
  }

  if (!Number.isFinite(Number(value))) {
    throw new Error(`Prix negocie invalide pour le palier ${tierValue}.`);
  }
}

export async function updateExistingNegotiatedPriceProfile(
  profileId: string,
  input: NegotiatedPriceExistingProfileUpdateInput
): Promise<NegotiatedPriceExistingProfile> {
  const id = readProfileId(profileId);
  const profile = await prisma.negotiatedPriceProfile.findFirst({
    where: {
      id,
      isActive: true
    },
    include: existingProfileInclude
  });

  if (!profile) {
    throw new Error("MIS ID introuvable ou inactif.");
  }

  const combinationsById = new Map(
    profile.combinations.map((combination) => [combination.id, combination])
  );

  for (const combinationInput of input.combinations ?? []) {
    const combination = combinationsById.get(combinationInput.id);
    if (!combination) {
      throw new Error("Combinaison introuvable pour ce MIS ID.");
    }

    const tiersById = new Map(combination.tiers.map((tier) => [tier.id, tier]));
    for (const tierInput of combinationInput.tiers ?? []) {
      const tier = tiersById.get(tierInput.id);
      if (!tier) {
        throw new Error("Palier introuvable pour cette combinaison.");
      }
      assertEditableNegotiatedPrice(tierInput.negotiatedPrice, tier.tierValue.toString());
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (input.visibilityMode) {
      await tx.negotiatedPriceProfile.update({
        where: {
          id: profile.id
        },
        data: {
          visibilityMode: readVisibilityMode(input.visibilityMode)
        }
      });
    }

    for (const combinationInput of input.combinations ?? []) {
      const combination = combinationsById.get(combinationInput.id);
      if (!combination) continue;

      for (const tierInput of combinationInput.tiers ?? []) {
        const tier = combination.tiers.find((candidate) => candidate.id === tierInput.id);
        if (!tier) continue;

        await tx.negotiatedPriceTier.update({
          where: {
            id: tier.id
          },
          data: {
            negotiatedPrice:
              tierInput.negotiatedPrice === null ? null : Number(tierInput.negotiatedPrice)
          }
        });

        await tx.negotiatedPriceCombinationSet.updateMany({
          where: {
            profileId: profile.id,
            combinationHash: hashJson({
              misId: profile.misId || profile.name,
              combinationKey: combination.combinationKey,
              quantity: Number(tier.tierValue)
            })
          },
          data: {
            negotiatedPrice:
              tierInput.negotiatedPrice === null ? null : Number(tierInput.negotiatedPrice)
          }
        });
      }
    }

    return tx.negotiatedPriceProfile.findFirstOrThrow({
      where: {
        id: profile.id,
        isActive: true
      },
      include: existingProfileInclude
    });
  });

  return serializeExistingProfile(updated);
}

export async function deleteExistingNegotiatedPriceProfile(profileId: string) {
  const id = readProfileId(profileId);
  const profile = await prisma.negotiatedPriceProfile.findFirst({
    where: {
      id,
      isActive: true
    },
    select: {
      id: true,
      misId: true,
      name: true
    }
  });

  if (!profile) {
    throw new Error("MIS ID introuvable ou deja supprime.");
  }

  await prisma.$transaction([
    prisma.negotiatedPriceCombination.updateMany({
      where: {
        profileId: profile.id
      },
      data: {
        status: "deleted"
      }
    }),
    prisma.negotiatedPriceProfile.update({
      where: {
        id: profile.id
      },
      data: {
        isActive: false
      }
    })
  ]);

  return {
    profileId: profile.id,
    misId: profile.misId || profile.name,
    deleted: true
  };
}

function assertValidDirectPrices(directPrices: NegotiatedPriceDirectPriceInput[]) {
  if (!directPrices.length) {
    throw new Error("Aucun prix negocie a enregistrer.");
  }

  for (const price of directPrices) {
    if (!Number.isSafeInteger(Number(price.quantity)) || Number(price.quantity) <= 0) {
      throw new Error("Chaque prix direct doit avoir un palier valide.");
    }

    if (price.negotiatedPrice === null || price.negotiatedPrice === undefined) {
      throw new Error(`Prix negocie manquant pour le palier ${price.quantity}.`);
    }

    if (!Number.isFinite(Number(price.negotiatedPrice))) {
      throw new Error(`Prix negocie invalide pour le palier ${price.quantity}.`);
    }
  }
}

function assertDirectPricesMatchPlan(
  directPrices: NegotiatedPriceDirectPriceInput[],
  plan: NegotiatedPriceExcelPlan
) {
  const quantities = new Set(plan.quantities);

  for (const price of directPrices) {
    if (!quantities.has(Number(price.quantity))) {
      throw new Error(`Le palier ${price.quantity} ne fait pas partie de la preview.`);
    }
  }
}

function buildOptionChoiceSignature(
  input: NegotiatedPriceCombinationInput,
  misId: string,
  organizationIntegrationId: string,
  plan: NegotiatedPriceExcelPlan,
  choices: NegotiatedPriceCombinationChoice[]
) {
  return JSON.stringify({
    misId,
    organizationIntegrationId,
    priceEngineId: input.priceEngineId,
    priceEngineName: input.priceEngineName,
    enginePriceGroupIntegrationId: input.enginePriceGroupIntegrationId,
    priceGroupName: input.priceGroupName,
    pricingBasis: plan.pricingBasis,
    choices
  });
}

async function assertNoExistingCombinationForContext(
  input: NegotiatedPriceCombinationInput,
  organizationIntegrationId: string,
  combinationKeys: string[]
) {
  const existing = await prisma.negotiatedPriceCombination.findFirst({
    where: {
      combinationKey: {
        in: combinationKeys
      },
      profile: {
        organizationIntegrationId,
        priceEngineId: input.priceEngineId,
        enginePriceGroupIntegrationId: input.enginePriceGroupIntegrationId,
        isActive: true
      }
    },
    include: {
      profile: true
    }
  });

  if (existing) {
    const existingMisId = existing.profile.misId || existing.profile.name;
    throw new Error(`Cette combinaison existe deja dans le MISID ${existingMisId}.`);
  }
}

export async function saveDirectNegotiatedPrices(
  input: NegotiatedPriceDirectSaveInput
): Promise<NegotiatedPriceDirectSaveResult> {
  assertValidDirectPrices(input.directPrices);
  const { plan, row } = readSingleCombinationRow(input);
  assertDirectPricesMatchPlan(input.directPrices, plan);

  const misId = generateMisId(input);
  const organizationIntegrationId = readOrganizationIntegrationId(input);
  await assertNoExistingCombinationForContext(
    input,
    organizationIntegrationId,
    [row.combinationKey]
  );
  const parameterGroups = splitPricingBasisParameters(input);
  const optionChoiceSignature = buildOptionChoiceSignature(
    input,
    misId,
    organizationIntegrationId,
    plan,
    row.choices
  );

  const result = await prisma.$transaction(async (tx) => {
    const profile = await tx.negotiatedPriceProfile.create({
      data: {
        clientId: input.clientId,
        organizationIntegrationId,
        misId,
        name: misId,
        priceEngineId: input.priceEngineId,
        enginePriceGroupIntegrationId: input.enginePriceGroupIntegrationId,
        priceGroupName: input.priceGroupName,
        profileMode: readDirectProfileMode(input),
        visibilityMode: readDirectVisibilityMode(input)
      }
    });

    const combination = await tx.negotiatedPriceCombination.create({
      data: {
        profileId: profile.id,
        combinationKey: row.combinationKey,
        label: input.priceEngineName,
        optionSelections: input.optionSelections,
        pricingBasisSnapshot: plan.pricingBasis,
        fixedParameters: parameterGroups.fixedParameters,
        clientVariables: parameterGroups.clientVariables,
        isDefault: true,
        tiers: {
          create: input.directPrices.map((price) => ({
            tierValue: Number(price.quantity),
            tierLabel: String(price.quantity),
            pjmPrice:
              price.pjmPrice === null || price.pjmPrice === undefined
                ? null
                : Number(price.pjmPrice),
            negotiatedPrice: Number(price.negotiatedPrice)
          }))
        }
      }
    });

    for (const price of input.directPrices) {
      await tx.negotiatedPriceCombinationSet.create({
        data: {
          profileId: profile.id,
          quantity: Number(price.quantity),
          optionChoiceSignature,
          combinationHash: hashJson({
            misId,
            combinationKey: row.combinationKey,
            quantity: Number(price.quantity)
          }),
          pjmPrice:
            price.pjmPrice === null || price.pjmPrice === undefined
              ? null
              : Number(price.pjmPrice),
          negotiatedPrice: Number(price.negotiatedPrice)
        }
      });
    }

    return {
      profile,
      combination
    };
  });

  return {
    misId,
    profileKey: {
      organizationIntegrationId,
      priceEngineId: input.priceEngineId,
      misId
    },
    profileId: result.profile.id,
    combinationId: result.combination.id,
    rowsSaved: input.directPrices.length
  };
}

function assertMultiCombinationContext(
  input: NegotiatedPriceMultiSaveInput,
  combination: NegotiatedPriceMultiCombinationInput,
  firstCombination: NegotiatedPriceMultiCombinationInput
) {
  if (combination.clientId !== input.clientId) {
    throw new Error("Toutes les combinaisons doivent partager la meme organisation.");
  }

  if (combination.priceEngineId !== input.priceEngineId) {
    throw new Error("Toutes les combinaisons doivent partager le meme moteur PJM.");
  }

  if (combination.enginePriceGroupIntegrationId !== input.enginePriceGroupIntegrationId) {
    throw new Error("Toutes les combinaisons doivent partager le meme groupe de prix.");
  }

  if (combination.quantityTiersText !== firstCombination.quantityTiersText) {
    throw new Error("Toutes les combinaisons doivent partager les memes paliers.");
  }

  if (hashJson(combination.pricingBasis ?? null) !== hashJson(firstCombination.pricingBasis ?? null)) {
    throw new Error("Toutes les combinaisons doivent partager la meme base de calcul.");
  }
}

export async function saveMultiNegotiatedPrices(
  input: NegotiatedPriceMultiSaveInput
): Promise<NegotiatedPriceMultiSaveResult> {
  if (!input.combinations?.length) {
    throw new Error("Ajoutez au moins une combinaison au MISID.");
  }

  const organizationIntegrationId = readOrganizationIntegrationId(input);
  const firstCombination = input.combinations[0];
  const preparedCombinations = input.combinations.map((combination, index) => {
    assertMultiCombinationContext(input, combination, firstCombination);
    assertValidDirectPrices(combination.directPrices);

    const { plan, row } = readSingleCombinationRow(combination);
    assertDirectPricesMatchPlan(combination.directPrices, plan);

    return {
      input: combination,
      index,
      plan,
      row,
      parameterGroups: splitPricingBasisParameters(combination)
    };
  });

  const duplicate = new Set<string>();
  for (const item of preparedCombinations) {
    if (duplicate.has(item.row.combinationKey)) {
      throw new Error("Une meme combinaison ne peut pas etre ajoutee deux fois au MISID.");
    }
    duplicate.add(item.row.combinationKey);
  }

  const misId = generateMisId(firstCombination);
  await assertNoExistingCombinationForContext(
    firstCombination,
    organizationIntegrationId,
    preparedCombinations.map((combination) => combination.row.combinationKey)
  );

  const result = await prisma.$transaction(async (tx) => {
    const profile = await tx.negotiatedPriceProfile.create({
      data: {
        clientId: input.clientId,
        organizationIntegrationId,
        misId,
        name: misId,
        priceEngineId: input.priceEngineId,
        enginePriceGroupIntegrationId: input.enginePriceGroupIntegrationId,
        priceGroupName: input.priceGroupName,
        profileMode: "multi",
        visibilityMode: readVisibilityMode(input.visibilityMode)
      }
    });

    const combinationIds: string[] = [];
    let rowsSaved = 0;

    for (const item of preparedCombinations) {
      const combination = await tx.negotiatedPriceCombination.create({
        data: {
          profileId: profile.id,
          combinationKey: item.row.combinationKey,
          label: item.input.label || `Combinaison ${item.index + 1}`,
          optionSelections: item.input.optionSelections,
          pricingBasisSnapshot: item.plan.pricingBasis,
          fixedParameters: item.parameterGroups.fixedParameters,
          clientVariables: item.parameterGroups.clientVariables,
          isDefault: item.index === 0,
          sortOrder: item.index,
          tiers: {
            create: item.input.directPrices.map((price) => ({
              tierValue: Number(price.quantity),
              tierLabel: String(price.quantity),
              pjmPrice:
                price.pjmPrice === null || price.pjmPrice === undefined
                  ? null
                  : Number(price.pjmPrice),
              negotiatedPrice: Number(price.negotiatedPrice)
            }))
          }
        }
      });
      combinationIds.push(combination.id);

      const optionChoiceSignature = buildOptionChoiceSignature(
        item.input,
        misId,
        organizationIntegrationId,
        item.plan,
        item.row.choices
      );

      for (const price of item.input.directPrices) {
        await tx.negotiatedPriceCombinationSet.create({
          data: {
            profileId: profile.id,
            quantity: Number(price.quantity),
            optionChoiceSignature,
            combinationHash: hashJson({
              misId,
              combinationKey: item.row.combinationKey,
              quantity: Number(price.quantity)
            }),
            pjmPrice:
              price.pjmPrice === null || price.pjmPrice === undefined
                ? null
                : Number(price.pjmPrice),
            negotiatedPrice: Number(price.negotiatedPrice)
          }
        });
        rowsSaved += 1;
      }
    }

    return {
      profile,
      combinationIds,
      rowsSaved
    };
  });

  return {
    misId,
    profileKey: {
      organizationIntegrationId,
      priceEngineId: input.priceEngineId,
      misId
    },
    profileId: result.profile.id,
    combinationId: result.combinationIds[0],
    combinationIds: result.combinationIds,
    profileMode: "multi",
    combinationsSaved: result.combinationIds.length,
    rowsSaved: result.rowsSaved
  };
}

function buildSelectionsCacheKey(
  selections: NegotiatedPriceCompatibilitySelection[]
) {
  return JSON.stringify(
    selections.map((selection) => ({
      Key: selection.pjmKey,
      Value: selection.pjmValue
    }))
  );
}

function readCompatibilitySelections(
  input: NegotiatedPriceCompatibleOptionsInput
) {
  return (input.selections ?? [])
    .filter((selection) => selection.pjmKey && selection.pjmValue)
    .map((selection) => ({
      pjmKey: String(selection.pjmKey),
      pjmValue: String(selection.pjmValue)
    }));
}

export async function listCompatiblePjmOptions(
  input: NegotiatedPriceCompatibleOptionsInput
): Promise<NegotiatedPriceCompatibleOptionsResult> {
  const enginePriceGroupIntegrationId =
    input.enginePriceGroupIntegrationId?.trim();

  if (!enginePriceGroupIntegrationId) {
    throw new Error("enginePriceGroupIntegrationId is required.");
  }

  const selections = readCompatibilitySelections(input);
  const pjmOptions = selections.map((selection) => ({
    Key: selection.pjmKey,
    Value: selection.pjmValue
  }));

  const client = createPjmClientFromEnv();
  const response = await client.getEngineOptions(
    enginePriceGroupIntegrationId,
    pjmOptions
  );
  const normalizedOptions = normalizePjmEngineOptionsResponse(
    enginePriceGroupIntegrationId,
    response
  );

  return {
    enginePriceGroupIntegrationId,
    selections,
    options: normalizedOptions.map((option) => ({
      optionId: option.pjmId,
      optionName: option.displayName || option.name,
      pjmKey: extractPjmOptionKey(option.pjmId),
      choices: option.choices.map((choice) => ({
        choiceId: choice.pjmId,
        choiceName: choice.name,
        pjmValue: choice.value
      }))
    }))
  };
}

function choiceIsAvailable(
  options: NegotiatedPriceCompatibleOption[],
  choice: NegotiatedPriceCombinationChoice
) {
  const option = options.find((candidate) => candidate.pjmKey === choice.pjmKey);

  if (!option) {
    return false;
  }

  return option.choices.some((candidate) => {
    return candidate.pjmValue === choice.pjmValue || candidate.choiceId === choice.choiceId;
  });
}

export async function validateNegotiatedPriceCompatibility(
  input: NegotiatedPriceCombinationInput
): Promise<NegotiatedPriceCompatibilityValidationResult> {
  const plan = buildNegotiatedPriceExcelPlan({
    ...input,
    compatibilityFilter: undefined
  });
  const enginePriceGroupIntegrationId =
    input.enginePriceGroupIntegrationId?.trim();

  if (!enginePriceGroupIntegrationId) {
    throw new Error("enginePriceGroupIntegrationId is required.");
  }

  const client = createPjmClientFromEnv();
  const optionsCache = new Map<string, NegotiatedPriceCompatibleOption[]>();
  let pjmRequestCount = 0;

  async function readOptionsForSelections(
    selections: NegotiatedPriceCompatibilitySelection[]
  ) {
    const cacheKey = buildSelectionsCacheKey(selections);
    const cached = optionsCache.get(cacheKey);
    if (cached) return cached;

    const response = await client.getEngineOptions(
      enginePriceGroupIntegrationId,
      selections.map((selection) => ({
        Key: selection.pjmKey,
        Value: selection.pjmValue
      }))
    );
    pjmRequestCount += 1;

    const normalizedOptions = normalizePjmEngineOptionsResponse(
      enginePriceGroupIntegrationId,
      response
    ).map((option) => ({
      optionId: option.pjmId,
      optionName: option.displayName || option.name,
      pjmKey: extractPjmOptionKey(option.pjmId),
      choices: option.choices.map((choice) => ({
        choiceId: choice.pjmId,
        choiceName: choice.name,
        pjmValue: choice.value
      }))
    }));

    optionsCache.set(cacheKey, normalizedOptions);
    return normalizedOptions;
  }

  const compatibleCombinationKeys: string[] = [];
  const incompatibleCombinationKeys: string[] = [];

  for (const row of plan.rows) {
    const selections: NegotiatedPriceCompatibilitySelection[] = [];
    let compatible = true;

    for (const choice of row.choices) {
      const options = await readOptionsForSelections(selections);

      if (!choiceIsAvailable(options, choice)) {
        compatible = false;
        break;
      }

      selections.push({
        pjmKey: choice.pjmKey,
        pjmValue: choice.pjmValue
      });
    }

    if (compatible) {
      compatibleCombinationKeys.push(row.combinationKey);
    } else {
      incompatibleCombinationKeys.push(row.combinationKey);
    }
  }

  return {
    rawCombinationCount: plan.combinationCount,
    compatibleCombinationCount: compatibleCombinationKeys.length,
    incompatibleCombinationCount: incompatibleCombinationKeys.length,
    pjmRequestCount,
    compatibleCombinationKeys,
    incompatibleCombinationKeys
  };
}
