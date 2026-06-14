import { prisma } from "../../config/prisma.js";
import type { PjmClient } from "./pjmClient.js";
import type {
  PjmEngineChoiceResponse,
  PjmEngineOptionResponse,
  PjmEngineOptionsResponse,
  PjmProductEngineListItemResponse,
  PjmProductEngineListResponse
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

const PRODUCT_ENGINE_ARRAY_KEYS = [
  "ProductEngines",
  "productEngines",
  "Engines",
  "engines",
  "Items",
  "items",
  "Data",
  "data",
  "Result",
  "result",
  "Results",
  "results"
];

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

export function extractPjmOptionKey(optionPjmId: string): string {
  const parts = optionPjmId.split(":").filter(Boolean);
  return parts.at(-1) ?? optionPjmId;
}

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function firstStringValue(...values: unknown[]): string | null {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (text) return text;
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function findProductEngineArray(
  value: unknown,
  depth = 0
): PjmProductEngineListItemResponse[] | null {
  if (Array.isArray(value)) return value as PjmProductEngineListItemResponse[];
  if (!isRecord(value) || depth > 4) return null;

  for (const key of PRODUCT_ENGINE_ARRAY_KEYS) {
    const candidate = value[key];
    if (Array.isArray(candidate)) {
      return candidate as PjmProductEngineListItemResponse[];
    }
  }

  for (const key of PRODUCT_ENGINE_ARRAY_KEYS) {
    const nested = findProductEngineArray(value[key], depth + 1);
    if (nested !== null) return nested;
  }

  return null;
}

export function readPjmProductEnginesResponse(
  response: PjmProductEngineListResponse
): PjmProductEngineListItemResponse[] {
  const engines = findProductEngineArray(response);

  if (engines === null) {
    throw new Error(
      "PJM productEngines/list response did not include an engine array."
    );
  }

  return engines;
}

function readEngineOptions(
  response: PjmEngineOptionsResponse
): PjmEngineOptionResponse[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.EngineOptions)) return response.EngineOptions;
  if (Array.isArray(response.engineOptions)) return response.engineOptions;
  if (Array.isArray(response.Options)) return response.Options;
  if (Array.isArray(response.options)) return response.options;
  if (Array.isArray(response.Values)) return response.Values;
  if (Array.isArray(response.values)) return response.values;
  return [];
}

function readChoices(option: PjmEngineOptionResponse): PjmEngineChoiceResponse[] {
  return (
    option.Values ??
    option.values ??
    option.Choices ??
    option.choices ??
    option.Options ??
    option.options ??
    []
  );
}

export function normalizePjmEngineOptionsResponse(
  enginePjmId: string,
  response: PjmEngineOptionsResponse
): NormalizedEngineOption[] {
  return readEngineOptions(response).map((option, optionIndex) => {
    const optionStableSource =
      option.Id ??
      option.id ??
      option.Name ??
      option.name ??
      option.Label ??
      option.label ??
      `option-${optionIndex + 1}`;
    const optionPjmId = `${enginePjmId}:${normalizeText(String(optionStableSource))}`;
    const optionName =
      firstStringValue(
        option.Label,
        option.label,
        option.DisplayName,
        option.displayName,
        option.Title,
        option.title,
        option.Name,
        option.name,
        option.Id,
        option.id
      ) ?? `Option ${optionIndex + 1}`;
    const optionDisplayName =
      firstStringValue(
        option.Label,
        option.label,
        option.DisplayName,
        option.displayName,
        option.Title,
        option.title,
        optionName
      ) ?? optionName;

    return {
      pjmId: optionPjmId,
      name: optionName,
      displayName: optionDisplayName,
      optionType: option.Type ?? option.type ?? "select",
      sortOrder: (optionIndex + 1) * 10,
      isVisual: false,
      choices: readChoices(option).map((choice, choiceIndex) => {
        const choiceStableSource =
          choice.Id ??
          choice.id ??
          choice.Value ??
          choice.value ??
          choice.Name ??
          choice.name ??
          choice.Key ??
          choice.key ??
          choice.Label ??
          choice.label ??
          choice.Text ??
          choice.text ??
          `choice-${choiceIndex + 1}`;
        const choiceName =
          firstStringValue(
            choice.Key,
            choice.key,
            choice.Label,
            choice.label,
            choice.Text,
            choice.text,
            choice.DisplayName,
            choice.displayName,
            choice.Title,
            choice.title,
            choice.Description,
            choice.description,
            choice.Name,
            choice.name,
            choice.Value,
            choice.value
          ) ?? `Choice ${choiceIndex + 1}`;

        return {
          pjmId: `${optionPjmId}:${normalizeText(String(choiceStableSource))}`,
          name: choiceName,
          value: stringifyValue(
            choice.Value ??
              choice.value ??
              choice.Id ??
              choice.id ??
              choice.Key ??
              choice.key ??
              choiceName
          ),
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

  const engines = readPjmProductEnginesResponse(
    await client.listProductEngines()
  );

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
