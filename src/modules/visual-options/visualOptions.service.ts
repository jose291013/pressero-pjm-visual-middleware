import ExcelJS from "exceljs";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { normalizeMediaKey } from "../media-library/mediaLibrary.service.js";
import type {
  VisualOptionChoiceMappingRow,
  VisualOptionEngineMappingSummary,
  VisualOptionMappingImportResult,
  VisualOptionMappingWorkbookExport
} from "./visualOptions.types.js";

const visualEngineInclude = {
  options: {
    include: {
      choices: {
        include: {
          visualMapping: {
            include: {
              mediaAsset: true
            }
          }
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
      }
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
  }
} satisfies Prisma.PjmPriceEngineInclude;

type VisualEngineRecord = Prisma.PjmPriceEngineGetPayload<{
  include: typeof visualEngineInclude;
}>;

type ExcelWorkbookLoadBuffer = Parameters<ExcelJS.Workbook["xlsx"]["load"]>[0];
type WorkbookRowValue = string | number | boolean | null | undefined;

export function getVisualOptionsModuleName() {
  return "visual-options";
}

function sanitizeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "visual-option-mappings";
}

async function findEngine(engineIdOrPjmId: string): Promise<VisualEngineRecord> {
  const engine = await prisma.pjmPriceEngine.findFirst({
    where: {
      OR: [{ id: engineIdOrPjmId }, { pjmId: engineIdOrPjmId }]
    },
    include: visualEngineInclude
  });

  if (!engine) {
    throw new Error("Moteur PJM introuvable.");
  }

  return engine;
}

function buildCounts(rows: VisualOptionChoiceMappingRow[]) {
  return {
    totalChoices: rows.length,
    mapped: rows.filter((row) => row.status === "mapped").length,
    autoMatch: rows.filter((row) => row.status === "auto_match").length,
    missing: rows.filter((row) => row.status === "missing").length
  };
}

export async function buildVisualOptionMappingSummary(
  engineIdOrPjmId: string
): Promise<VisualOptionEngineMappingSummary> {
  const engine = await findEngine(engineIdOrPjmId);
  const mediaAssets = await prisma.mediaAsset.findMany({
    orderBy: [{ key: "asc" }]
  });
  const mediaByKey = new Map(mediaAssets.map((asset) => [asset.key, asset]));
  const rows: VisualOptionChoiceMappingRow[] = [];

  for (const option of engine.options) {
    for (const choice of option.choices) {
      const normalizedChoiceKey = normalizeMediaKey(choice.name);
      const mappedAsset = choice.visualMapping?.mediaAsset ?? null;
      const suggestedAsset = mappedAsset ? null : mediaByKey.get(normalizedChoiceKey) ?? null;
      const status = mappedAsset ? "mapped" : suggestedAsset ? "auto_match" : "missing";

      rows.push({
        engineId: engine.id,
        enginePjmId: engine.pjmId,
        engineName: engine.name,
        optionId: option.id,
        optionPjmId: option.pjmId,
        optionLabel: option.displayName || option.name,
        choiceId: choice.id,
        choicePjmId: choice.pjmId,
        choiceLabel: choice.name,
        normalizedChoiceKey,
        expectedImageFile: `${normalizedChoiceKey}.webp`,
        mappedAssetKey: mappedAsset?.key ?? null,
        mappedAssetUrl: mappedAsset?.url ?? null,
        suggestedAssetKey: suggestedAsset?.key ?? null,
        suggestedAssetUrl: suggestedAsset?.url ?? null,
        status
      });
    }
  }

  return {
    engineId: engine.id,
    enginePjmId: engine.pjmId,
    engineName: engine.name,
    rows,
    counts: buildCounts(rows)
  };
}

function styleMappingWorkbook(worksheet: ExcelJS.Worksheet) {
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: worksheet.columnCount }
  };

  worksheet.getRow(1).font = {
    bold: true,
    color: { argb: "FFFFFFFF" }
  };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF263647" }
  };
  worksheet.getRow(1).alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true
  };

  for (const column of worksheet.columns) {
    column.alignment = {
      vertical: "top",
      wrapText: true
    };
  }

  ["engineId", "enginePjmId", "optionId", "optionPjmId", "choiceId", "choicePjmId"].forEach(
    (key) => {
      const column = worksheet.getColumn(key);
      column.hidden = true;
    }
  );
}

export async function buildVisualOptionMappingWorkbookExport(
  engineIdOrPjmId: string
): Promise<VisualOptionMappingWorkbookExport> {
  const summary = await buildVisualOptionMappingSummary(engineIdOrPjmId);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Pressero PJM Visual Middleware";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Mappings");
  worksheet.columns = [
    { key: "engineId", header: "engineId", width: 18 },
    { key: "enginePjmId", header: "enginePjmId", width: 18 },
    { key: "engineName", header: "Moteur PJM", width: 34 },
    { key: "optionId", header: "optionId", width: 18 },
    { key: "optionPjmId", header: "optionPjmId", width: 18 },
    { key: "optionLabel", header: "Option", width: 30 },
    { key: "choiceId", header: "choiceId", width: 18 },
    { key: "choicePjmId", header: "choicePjmId", width: 18 },
    { key: "choiceLabel", header: "Choix", width: 34 },
    { key: "normalizedChoiceKey", header: "Cle choix normalisee", width: 28 },
    { key: "expectedImageFile", header: "Image attendue", width: 28 },
    { key: "mediaAssetKey", header: "Cle image a associer", width: 28 },
    { key: "mediaAssetUrl", header: "URL image associee", width: 42 },
    { key: "status", header: "Statut", width: 16 }
  ];

  for (const row of summary.rows) {
    worksheet.addRow({
      engineId: row.engineId,
      enginePjmId: row.enginePjmId,
      engineName: row.engineName,
      optionId: row.optionId,
      optionPjmId: row.optionPjmId,
      optionLabel: row.optionLabel,
      choiceId: row.choiceId,
      choicePjmId: row.choicePjmId,
      choiceLabel: row.choiceLabel,
      normalizedChoiceKey: row.normalizedChoiceKey,
      expectedImageFile: row.expectedImageFile,
      mediaAssetKey: row.mappedAssetKey || row.suggestedAssetKey || "",
      mediaAssetUrl: row.mappedAssetUrl || row.suggestedAssetUrl || "",
      status: row.status
    });
  }

  styleMappingWorkbook(worksheet);
  const help = workbook.addWorksheet("Aide");
  help.columns = [
    { key: "field", header: "Champ", width: 26 },
    { key: "description", header: "Description", width: 80 }
  ];
  help.addRows([
    {
      field: "Cle image a associer",
      description:
        "Renseigner la cle MediaAsset a associer au choix PJM. Laisser vide pour ignorer la ligne."
    },
    {
      field: "Colonnes techniques",
      description:
        "Les colonnes engineId, optionId et choiceId identifient les vrais objets PJM synchronises."
    }
  ]);
  help.getRow(1).font = { bold: true };

  const rawBuffer = await workbook.xlsx.writeBuffer();
  return {
    fileName: `visual-mapping-${sanitizeFileName(summary.engineName)}.xlsx`,
    buffer: Buffer.isBuffer(rawBuffer) ? rawBuffer : Buffer.from(rawBuffer)
  };
}

function readWorkbookCell(value: WorkbookRowValue) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export async function importVisualOptionMappingWorkbook(
  engineIdOrPjmId: string,
  buffer: Buffer
): Promise<VisualOptionMappingImportResult> {
  const engine = await findEngine(engineIdOrPjmId);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(buffer) as unknown as ExcelWorkbookLoadBuffer);
  const worksheet = workbook.getWorksheet("Mappings") || workbook.worksheets[0];
  if (!worksheet) {
    throw new Error("Aucune feuille de mapping trouvee dans le fichier.");
  }

  const headerRow = worksheet.getRow(1);
  const headerToColumn = new Map<string, number>();
  headerRow.eachCell((cell, columnNumber) => {
    headerToColumn.set(readWorkbookCell(cell.value as WorkbookRowValue), columnNumber);
  });

  const choiceIdColumn = headerToColumn.get("choiceId");
  const mediaAssetKeyColumn = headerToColumn.get("Cle image a associer");
  if (!choiceIdColumn || !mediaAssetKeyColumn) {
    throw new Error("Colonnes choiceId et Cle image a associer obligatoires.");
  }

  const engineChoiceIds = new Set(
    engine.options.flatMap((option) => option.choices.map((choice) => choice.id))
  );
  const errors: string[] = [];
  let mapped = 0;
  let skipped = 0;

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const choiceId = readWorkbookCell(row.getCell(choiceIdColumn).value as WorkbookRowValue);
    const mediaAssetKey = readWorkbookCell(
      row.getCell(mediaAssetKeyColumn).value as WorkbookRowValue
    );

    if (!choiceId && !mediaAssetKey) {
      continue;
    }

    if (!choiceId || !mediaAssetKey) {
      skipped += 1;
      errors.push(`Ligne ${rowNumber}: choiceId ou cle image manquante.`);
      continue;
    }

    if (!engineChoiceIds.has(choiceId)) {
      skipped += 1;
      errors.push(`Ligne ${rowNumber}: choix PJM hors moteur selectionne.`);
      continue;
    }

    const mediaAsset = await prisma.mediaAsset.findUnique({
      where: {
        key: normalizeMediaKey(mediaAssetKey)
      }
    });

    if (!mediaAsset) {
      skipped += 1;
      errors.push(`Ligne ${rowNumber}: image introuvable (${mediaAssetKey}).`);
      continue;
    }

    await prisma.visualOptionMapping.upsert({
      where: {
        optionChoiceId: choiceId
      },
      create: {
        optionChoiceId: choiceId,
        mediaAssetId: mediaAsset.id,
        displayOrder: rowNumber - 2,
        isEnabled: true
      },
      update: {
        mediaAssetId: mediaAsset.id,
        displayOrder: rowNumber - 2,
        isEnabled: true
      }
    });
    mapped += 1;
  }

  return {
    mapped,
    skipped,
    errors
  };
}

export async function autoMatchVisualOptionMappings(engineIdOrPjmId: string) {
  const summary = await buildVisualOptionMappingSummary(engineIdOrPjmId);
  let mapped = 0;

  for (const row of summary.rows) {
    if (row.status !== "auto_match" || !row.suggestedAssetKey) {
      continue;
    }

    const mediaAsset = await prisma.mediaAsset.findUnique({
      where: {
        key: row.suggestedAssetKey
      }
    });
    if (!mediaAsset) {
      continue;
    }

    await prisma.visualOptionMapping.upsert({
      where: {
        optionChoiceId: row.choiceId
      },
      create: {
        optionChoiceId: row.choiceId,
        mediaAssetId: mediaAsset.id,
        displayOrder: mapped,
        isEnabled: true
      },
      update: {
        mediaAssetId: mediaAsset.id,
        isEnabled: true
      }
    });
    mapped += 1;
  }

  return {
    mapped,
    skipped: summary.counts.autoMatch - mapped
  };
}
