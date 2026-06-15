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
  "docs/sprints/sprint-18-fixed-calculation-parameters.md",
  "scripts/test-sprint-18-fixed-calculation-parameters.mjs",
  "src/modules/negotiated-prices/combinationGenerator.service.ts",
  "src/modules/negotiated-prices/negotiatedPrices.types.ts",
  "src/modules/negotiated-prices/negotiatedPricesExcel.service.ts",
  "src/modules/negotiated-prices/negotiatedPricesWorkbook.service.ts",
  "src/public/admin/admin.css",
  "src/public/admin/admin.js",
  "src/public/admin/index.html"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(
  packageJson.scripts["test:sprint18"],
  "node scripts/test-sprint-18-fixed-calculation-parameters.mjs"
);

const html = await readText("src/public/admin/index.html");
assert.match(html, /Options PJM/);
assert.match(html, /id="npParameterList"/);
assert.match(html, /id="npParameterCount"/);
assert.match(html, /Parametres libres/);

const css = await readText("src/public/admin/admin.css");
assert.match(css, /\.parameter-picker/);
assert.match(css, /\.parameter-item/);
assert.match(css, /\.parameter-badge/);

const js = await readText("src/public/admin/admin.js");
assert.match(js, /normalizeFormulaToken/);
assert.match(js, /readFormulaTokens/);
assert.match(js, /decorateCalculationParameters/);
assert.match(js, /renderParameterList/);
assert.match(js, /clientVariable/);
assert.match(js, /adminFixed/);
assert.match(js, /data-parameter-fixed-value/);
assert.match(js, /type="radio"/);
assert.match(js, /Renseignez la valeur fixe/);

const types = await readText("src/modules/negotiated-prices/negotiatedPrices.types.ts");
assert.match(types, /NegotiatedPriceCalculationParameterRole/);
assert.match(types, /"clientVariable"/);
assert.match(types, /"adminFixed"/);
assert.match(types, /fixedValue\?:\s*string/);

const excelService = await readText("src/modules/negotiated-prices/negotiatedPricesExcel.service.ts");
assert.match(excelService, /role:\s*parameter\.role === "clientVariable"/);
assert.match(excelService, /fixedValue:\s*parameter\.role === "clientVariable"/);

const combinationService = await readText("src/modules/negotiated-prices/combinationGenerator.service.ts");
assert.match(combinationService, /readPricingBasisSignature/);
assert.match(combinationService, /fixedValue:\s*parameter\.fixedValue/);

const workbookService = await readText("src/modules/negotiated-prices/negotiatedPricesWorkbook.service.ts");
assert.match(workbookService, /formatClientVariableParameters/);
assert.match(workbookService, /formatAdminFixedParameters/);
assert.match(workbookService, /Variables client/);
assert.match(workbookService, /Parametres fixes/);

const adminDoc = await readText("docs/architecture/admin-api.md");
assert.match(adminDoc, /Sprint 18 Fixed Calculation Parameters/);

const excelDoc = await readText("docs/architecture/negotiated-prices-excel-model.md");
assert.match(excelDoc, /Sprint 18 Fixed Calculation Parameters/);

const sprintDoc = await readText("docs/sprints/sprint-18-fixed-calculation-parameters.md");
assert.match(sprintDoc, /Nombre de pages/);
assert.match(sprintDoc, /Variable client/);
assert.match(sprintDoc, /Valeur fixe/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 18 fixed calculation parameters checks passed.");
