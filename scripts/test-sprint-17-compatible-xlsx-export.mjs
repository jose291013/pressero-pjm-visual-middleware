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
  "docs/sprints/sprint-17-compatible-xlsx-export.md",
  "scripts/test-sprint-17-compatible-xlsx-export.mjs",
  "src/modules/negotiated-prices/negotiatedPrices.types.ts",
  "src/modules/negotiated-prices/negotiatedPricesExcel.service.ts",
  "src/modules/negotiated-prices/negotiatedPricesWorkbook.service.ts",
  "src/modules/negotiated-prices/negotiatedPrices.service.ts",
  "src/public/admin/admin.js"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(
  packageJson.scripts["test:sprint17"],
  "node scripts/test-sprint-17-compatible-xlsx-export.mjs"
);

const types = await readText("src/modules/negotiated-prices/negotiatedPrices.types.ts");
assert.match(types, /NegotiatedPriceCompatibilityExportFilter/);
assert.match(types, /compatibilityFilter\?:\s*NegotiatedPriceCompatibilityExportFilter/);
assert.match(types, /rawCombinationCount:\s*number/);
assert.match(types, /compatibilityFilter:\s*NegotiatedPriceCompatibilityExportFilter \| null/);

const excelService = await readText("src/modules/negotiated-prices/negotiatedPricesExcel.service.ts");
assert.match(excelService, /normalizeCompatibilityFilter/);
assert.match(excelService, /compatibilityFilter:\s*undefined/);
assert.match(excelService, /rawRows\.filter/);
assert.match(excelService, /compatibleCombinationKeys\.includes\(row\.combinationKey\)/);
assert.match(excelService, /Compatibility filter does not match the current combination count/);
assert.match(excelService, /Compatibility filter does not match the current compatible rows/);

const service = await readText("src/modules/negotiated-prices/negotiatedPrices.service.ts");
assert.match(service, /compatibilityFilter:\s*undefined/);

const workbookService = await readText("src/modules/negotiated-prices/negotiatedPricesWorkbook.service.ts");
assert.match(workbookService, /Combinaisons brutes/);
assert.match(workbookService, /Combinaisons exportees/);
assert.match(workbookService, /Combinaisons exclues/);
assert.match(workbookService, /Sprint 17/);

const adminJs = await readText("src/public/admin/admin.js");
assert.match(adminJs, /negotiatedCompatibility/);
assert.match(adminJs, /buildPayloadSignature/);
assert.match(adminJs, /requestCompatibilityValidation/);
assert.match(adminJs, /ensureCompatibilityValidation/);
assert.match(adminJs, /buildExportPayload/);
assert.match(adminJs, /compatibilityFilter/);
assert.match(adminJs, /Aucune combinaison compatible a exporter/);

const adminDoc = await readText("docs/architecture/admin-api.md");
assert.match(adminDoc, /Sprint 17 Compatible XLSX Export/);
assert.match(adminDoc, /Exporter Excel/);

const excelDoc = await readText("docs/architecture/negotiated-prices-excel-model.md");
assert.match(excelDoc, /Sprint 17 Compatible XLSX Export/);
assert.match(excelDoc, /uniquement les lignes compatibles/);

const sprintDoc = await readText("docs/sprints/sprint-17-compatible-xlsx-export.md");
assert.match(sprintDoc, /verification automatique/);
assert.match(sprintDoc, /compatibles/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 17 compatible XLSX export checks passed.");
