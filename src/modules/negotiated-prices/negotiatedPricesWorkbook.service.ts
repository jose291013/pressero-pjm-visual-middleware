import ExcelJS from "exceljs";
import { buildNegotiatedPriceExcelPlan } from "./negotiatedPricesExcel.service.js";
import type {
  NegotiatedPriceCombinationInput,
  NegotiatedPriceExcelPlan,
  NegotiatedPriceWorkbookExport
} from "./negotiatedPrices.types.js";

type WorkbookColumn = {
  key: string;
  header: string;
  width: number;
  hidden?: boolean;
  kind: "technical" | "context" | "option" | "pjmPrice" | "negotiatedPrice";
};

function sanitizeFileName(value: string): string {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);

  return normalized || "prix-negocies";
}

function buildWorkbookColumns(plan: NegotiatedPriceExcelPlan): WorkbookColumn[] {
  const optionColumns = plan.columns
    .filter((column) => column.kind === "option")
    .map((column) => ({
      key: column.key,
      header: column.label,
      width: 26,
      kind: "option" as const
    }));

  const tierHashColumns = plan.quantities.map((quantity) => ({
    key: `tierHash:${quantity}`,
    header: `Hash palier ${quantity}`,
    width: 18,
    hidden: true,
    kind: "technical" as const
  }));

  const priceColumns = plan.columns
    .filter((column) => {
      return column.kind === "pjmPrice" || column.kind === "negotiatedPrice";
    })
    .map((column) => ({
      key: column.key,
      header: column.label,
      width: 18,
      kind: column.kind
    }));

  return [
    {
      key: "combinationKey",
      header: "Combination Key",
      width: 18,
      hidden: true,
      kind: "technical"
    },
    {
      key: "clientId",
      header: "Organisation ID",
      width: 38,
      kind: "context"
    },
    {
      key: "organizationName",
      header: "Organisation",
      width: 26,
      kind: "context"
    },
    {
      key: "priceEngineId",
      header: "Moteur PJM ID",
      width: 18,
      hidden: true,
      kind: "technical"
    },
    {
      key: "priceEngineName",
      header: "Moteur PJM",
      width: 34,
      kind: "context"
    },
    {
      key: "enginePriceGroupIntegrationId",
      header: "Groupe PJM mapping ID",
      width: 18,
      hidden: true,
      kind: "technical"
    },
    {
      key: "priceGroupName",
      header: "Groupe de prix",
      width: 24,
      kind: "context"
    },
    {
      key: "pricingBasisMode",
      header: "Mode palier",
      width: 14,
      kind: "context"
    },
    {
      key: "pricingBasisFormula",
      header: "Formule palier",
      width: 34,
      kind: "context"
    },
    {
      key: "pricingBasisParameters",
      header: "Parametres formule",
      width: 18,
      hidden: true,
      kind: "technical"
    },
    ...optionColumns,
    ...tierHashColumns,
    ...priceColumns
  ];
}

function buildRowValues(
  plan: NegotiatedPriceExcelPlan,
  columns: WorkbookColumn[],
  rowIndex: number
) {
  const row = plan.rows[rowIndex];
  const values: Record<string, string | number | null> = {
    combinationKey: row.combinationKey,
    clientId: plan.clientId,
    organizationName: plan.organizationName,
    priceEngineId: plan.priceEngineId,
    priceEngineName: plan.priceEngineName,
    enginePriceGroupIntegrationId: plan.enginePriceGroupIntegrationId,
    priceGroupName: plan.priceGroupName,
    pricingBasisMode: plan.pricingBasis.mode === "areaM2" ? "m2" : "quantite",
    pricingBasisFormula: plan.pricingBasis.formula,
    pricingBasisParameters: JSON.stringify(plan.pricingBasis.parameters)
  };

  for (const choice of row.choices) {
    values[`option:${choice.optionId}`] = choice.choiceName;
  }

  for (const tier of row.tierHashes) {
    values[`tierHash:${tier.quantity}`] = tier.combinationHash;
    values[`pjmPrice:${tier.quantity}`] = null;
    values[`negotiatedPrice:${tier.quantity}`] = null;
  }

  return columns.map((column) => values[column.key] ?? null);
}

function styleWorksheet(
  worksheet: ExcelJS.Worksheet,
  columns: WorkbookColumn[]
) {
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length }
  };

  const headerRow = worksheet.getRow(1);
  headerRow.height = 24;
  headerRow.font = {
    bold: true,
    color: { argb: "FFFFFFFF" }
  };
  headerRow.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true
  };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF17202A" }
    };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FFD9E0E8" } }
    };
  });

  columns.forEach((column, index) => {
    const excelColumn = worksheet.getColumn(index + 1);
    excelColumn.width = column.width;
    excelColumn.hidden = Boolean(column.hidden);

    if (column.kind === "pjmPrice" || column.kind === "negotiatedPrice") {
      excelColumn.numFmt = "0.00";
    }
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.alignment = {
      vertical: "top",
      wrapText: true
    };
    row.eachCell((cell) => {
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFE7ECF2" } }
      };
    });
  });
}

function addHelpSheet(workbook: ExcelJS.Workbook, plan: NegotiatedPriceExcelPlan) {
  const worksheet = workbook.addWorksheet("Aide");
  worksheet.columns = [
    { key: "label", width: 28 },
    { key: "value", width: 80 }
  ];
  worksheet.addRows([
    ["Fichier", "Export des prix negocies"],
    ["Moteur PJM", plan.priceEngineName],
    ["Groupe de prix", plan.priceGroupName],
    ["Organisation ID", plan.clientId],
    ["Mode palier", plan.pricingBasis.mode === "areaM2" ? "m2" : "quantite"],
    ["Formule palier", plan.pricingBasis.formula || "(vide)"],
    ["Nombre de lignes", plan.combinationCount],
    ["Paliers", plan.quantities.join(", ")],
    [
      "Sprint 15",
      "Le mode de palier et la formule sont exportes. Les colonnes Prix PJM et Prix negocie restent vides."
    ],
    [
      "Colonnes techniques",
      "Certaines colonnes sont masquees pour permettre le futur import sans gener l'edition."
    ]
  ]);

  worksheet.getRow(1).font = { bold: true };
  worksheet.getColumn(1).font = { bold: true };
  worksheet.eachRow((row) => {
    row.alignment = { vertical: "top", wrapText: true };
  });
}

export async function buildNegotiatedPriceWorkbookExport(
  input: NegotiatedPriceCombinationInput
): Promise<NegotiatedPriceWorkbookExport> {
  const plan = buildNegotiatedPriceExcelPlan(input);
  const columns = buildWorkbookColumns(plan);
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Pressero PJM Middleware";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Prix negocies");
  worksheet.columns = columns.map((column) => ({
    key: column.key,
    header: column.header,
    width: column.width,
    hidden: column.hidden
  }));

  plan.rows.forEach((_row, index) => {
    worksheet.addRow(buildRowValues(plan, columns, index));
  });

  styleWorksheet(worksheet, columns);
  addHelpSheet(workbook, plan);

  const rawBuffer = await workbook.xlsx.writeBuffer();
  const fileName = `${sanitizeFileName(
    `${plan.organizationName || plan.clientId}-${plan.priceEngineName}`
  )}.xlsx`;

  return {
    fileName,
    buffer: Buffer.from(rawBuffer)
  };
}
