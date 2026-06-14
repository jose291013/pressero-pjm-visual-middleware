import { prisma } from "../../config/prisma.js";
import type { PjmClient } from "./pjmClient.js";
import type {
  PjmEngineChoiceResponse,
  PjmEngineOptionResponse,
  PjmEngineOptionsResponse
} from "./pjmContracts.types.js";
import type { PjmCatalogSyncResult } from "./pjmSync.types.js";

type NormalizedOptionChoice = {
  pjmId: string;
  name: string;
  value: string;
  normalizedName: string;
  sortOrder: number;
};

type NormalizedEngineOption = {
  pjmId: string;
  name: string;
  displayName: string;
  optionType: string;
  sortOrder: number;
  isVisual: boolean;
  choices: NormalizedOptionChoice[];
};

export type PjmCatalogSyncClient = Pick<
  PjmClient,
  "listProductEngines" | "getEngineOptions"
>;

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function buildPriceGroupPjmId(priceGroupName: string): string {
  const normalized = normalizeText(priceGroupName);
  return `pjm-price-group-${normalized || "unknown"}`;
}

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function readEngineOptions(
  response: PjmEngineOptionsResponse
): PjmEngineOptionResponse[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.EngineOptions)) return response.EngineOptions;
  if (Array.isArray(response.Options)) return response.Options;
  return [];
}

function readChoices(option: PjmEngineOptionResponse): PjmEngineChoiceResponse[] {
  return option.Values ?? option.Choices ?? option.Options ?? [];
}

export function normalizePjmEngineOptionsResponse(
  enginePjmId: string,
  response: PjmEngineOptionsResponse
): NormalizedEngineOption[] {
  return readEngineOptions(response).map((option, optionIndex) => {
    const optionStableSource =
      option.Id ??
      option.Name ??
      option.Label ??
      `option-${optionIndex + 1}`;
    const optionPjmId = `${enginePjmId}:${normalizeText(String(optionStableSource))}`;
    const optionName =
      option.Name ?? option.Label ?? option.Id ?? `Option ${optionIndex + 1}`;

    return {
      pjmId: optionPjmId,
      name: optionName,
      displayName: option.Label ?? optionName,
      optionType: option.Type ?? "select",
      sortOrder: (optionIndex + 1) * 10,
      isVisual: false,
      choices: readChoices(option).map((choice, choiceIndex) => {
        const choiceStableSource =
          choice.Id ??
          choice.Value ??
          choice.Name ??
          choice.Label ??
          choice.Text ??
          `choice-${choiceIndex + 1}`;
        const choiceName =
          choice.Name ??
          choice.Label ??
          choice.Text ??
          stringifyValue(choice.Value) ??
          `Choice ${choiceIndex + 1}`;

        return {
          pjmId: `${optionPjmId}:${normalizeText(String(choiceStableSource))}`,
          name: choiceName,
          value: stringifyValue(choice.Value ?? choice.Id ?? choiceName),
          normalizedName: normalizeText(choiceName),
          sortOrder: (choiceIndex + 1) * 10
        };
      })
    };
  });
}

export async function syncPjmCatalog(
  client: PjmCatalogSyncClient
): Promise<PjmCatalogSyncResult> {
  const result: PjmCatalogSyncResult = {
    enginesProcessed: 0,
    priceGroupsProcessed: 0,
    mappingsProcessed: 0,
    optionsProcessed: 0,
    choicesProcessed: 0,
    warnings: []
  };

  const engines = await client.listProductEngines();

  for (const engine of engines) {
    const priceEngine = await prisma.pjmPriceEngine.upsert({
      where: { pjmId: engine.Id },
      update: {
        name: engine.Name,
        isActive: true
      },
      create: {
        pjmId: engine.Id,
        name: engine.Name,
        isActive: true
      }
    });
    result.enginesProcessed += 1;

    for (const mapping of engine.Mappings ?? []) {
      const priceGroupPjmId = buildPriceGroupPjmId(mapping.PriceGroupName);
      const priceGroup = await prisma.pjmPriceGroup.upsert({
        where: { pjmId: priceGroupPjmId },
        update: {
          name: mapping.PriceGroupName
        },
        create: {
          pjmId: priceGroupPjmId,
          name: mapping.PriceGroupName
        }
      });
      result.priceGroupsProcessed += 1;

      await prisma.pjmEnginePriceGroupMapping.upsert({
        where: {
          enginePriceGroupIntegrationId:
            mapping.EnginePriceGroupIntegrationId
        },
        update: {
          priceEngineId: priceEngine.id,
          priceGroupId: priceGroup.id
        },
        create: {
          enginePriceGroupIntegrationId:
            mapping.EnginePriceGroupIntegrationId,
          priceEngineId: priceEngine.id,
          priceGroupId: priceGroup.id
        }
      });
      result.mappingsProcessed += 1;
    }

    const optionProductId =
      engine.Mappings?.[0]?.EnginePriceGroupIntegrationId ?? engine.Id;

    try {
      const optionsResponse = await client.getEngineOptions(optionProductId);
      const options = normalizePjmEngineOptionsResponse(
        engine.Id,
        optionsResponse
      );

      for (const option of options) {
        const pjmOption = await prisma.pjmOption.upsert({
          where: { pjmId: option.pjmId },
          update: {
            priceEngineId: priceEngine.id,
            name: option.name,
            displayName: option.displayName,
            optionType: option.optionType,
            sortOrder: option.sortOrder,
            isVisual: option.isVisual
          },
          create: {
            pjmId: option.pjmId,
            priceEngineId: priceEngine.id,
            name: option.name,
            displayName: option.displayName,
            optionType: option.optionType,
            sortOrder: option.sortOrder,
            isVisual: option.isVisual
          }
        });
        result.optionsProcessed += 1;

        for (const choice of option.choices) {
          await prisma.pjmOptionChoice.upsert({
            where: { pjmId: choice.pjmId },
            update: {
              optionId: pjmOption.id,
              name: choice.name,
              value: choice.value,
              normalizedName: choice.normalizedName,
              sortOrder: choice.sortOrder,
              isActive: true
            },
            create: {
              pjmId: choice.pjmId,
              optionId: pjmOption.id,
              name: choice.name,
              value: choice.value,
              normalizedName: choice.normalizedName,
              sortOrder: choice.sortOrder,
              isActive: true
            }
          });
          result.choicesProcessed += 1;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result.warnings.push(
        `Unable to sync options for PJM engine ${engine.Id}: ${message}`
      );
    }
  }

  return result;
}
