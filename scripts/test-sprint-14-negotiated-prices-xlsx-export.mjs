import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function resolvePath(relativePath) {
  return path.join(repoRoot, relativePath);
}

async function readText(relativePath) {
  return readFile(resolvePath(relativePath), "utf8");
}

function assertFile(relativePath) {
  assert.ok(existsSync(resolvePath(relativePath)), `Missing required path: ${relativePath}`);
}

const requiredPaths = [
  "docs/sprints/sprint-14-negotiated-prices-xlsx-export.md",
  "scripts/test-sprint-14-negotiated-prices-xlsx-export.mjs",
  "src/modules/negotiated-prices/negotiatedPricesWorkbook.service.ts",
  "src/modules/negotiated-prices/negotiatedPrices.controller.ts",
  "src/modules/negotiated-prices/negotiatedPrices.routes.ts",
  "src/public/admin/index.html",
  "src/public/admin/admin.js",
  "package-lock.json"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(
  packageJson.scripts["test:sprint14"],
  "node scripts/test-sprint-14-negotiated-prices-xlsx-export.mjs"
);
assert.ok(packageJson.dependencies.exceljs, "exceljs dependency is required.");

const lockJson = JSON.parse(await readText("package-lock.json"));
assert.ok(lockJson.packages["node_modules/exceljs"], "exceljs must be locked.");

const workbookService = await readText("src/modules/negotiated-prices/negotiatedPricesWorkbook.service.ts");
assert.match(workbookService, /import ExcelJS from "exceljs"/);
assert.match(workbookService, /buildNegotiatedPriceWorkbookExport/);
assert.match(workbookService, /buildNegotiatedPriceExcelPlan/);
assert.match(workbookService, /workbook\.addWorksheet\("Prix negocies"\)/);
assert.match(workbookService, /workbook\.addWorksheet\("Aide"\)/);
assert.match(workbookService, /hidden:\s*true/);
assert.match(workbookService, /Prix PJM/);
assert.match(workbookService, /Prix negocie/);
assert.match(workbookService, /writeBuffer\(\)/);
assert.doesNotMatch(workbookService, /getOptionsAndPrice|optionsandprice/);

const types = await readText("src/modules/negotiated-prices/negotiatedPrices.types.ts");
assert.match(types, /NegotiatedPriceWorkbookExport/);
assert.match(types, /buffer:\s*Buffer/);

const service = await readText("src/modules/negotiated-prices/negotiatedPrices.service.ts");
assert.match(service, /exportNegotiatedPriceWorkbook/);
assert.match(service, /buildNegotiatedPriceWorkbookExport/);

const controller = await readText("src/modules/negotiated-prices/negotiatedPrices.controller.ts");
assert.match(controller, /postNegotiatedPricesExport/);
assert.match(controller, /Content-Type/);
assert.match(controller, /spreadsheetml\.sheet/);
assert.match(controller, /Content-Disposition/);

const routes = await readText("src/modules/negotiated-prices/negotiatedPrices.routes.ts");
assert.match(routes, /negotiatedPricesRouter\.post\(["']\/export["']/);

const html = await readText("src/public/admin/index.html");
assert.match(html, /id="npExportButton"/);
assert.match(html, /Exporter Excel/);

const js = await readText("src/public/admin/admin.js");
assert.match(js, /npExportButton/);
assert.match(js, /exportNegotiatedPrices/);
assert.match(js, /\/negotiated-prices\/export/);
assert.match(js, /response\.blob\(\)/);
assert.match(js, /link\.download/);

const adminDoc = await readText("docs/architecture/admin-api.md");
assert.match(adminDoc, /Sprint 14 XLSX Export/);
assert.match(adminDoc, /POST \/negotiated-prices\/export/);

const excelDoc = await readText("docs/architecture/negotiated-prices-excel-model.md");
assert.match(excelDoc, /Sprint 14 XLSX Export/);
assert.match(excelDoc, /hidden technical columns/);

const sprintDoc = await readText("docs/sprints/sprint-14-negotiated-prices-xlsx-export.md");
assert.match(sprintDoc, /Exporter Excel/);
assert.match(sprintDoc, /Ce sprint ne calcule pas encore les prix PJM/);

const sprint11 = await readText("scripts/test-sprint-11-negotiated-prices-admin-preview.mjs");
assert.doesNotMatch(sprint11, /download\|xlsx\|ExcelJS/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 14 negotiated prices XLSX export checks passed.");
