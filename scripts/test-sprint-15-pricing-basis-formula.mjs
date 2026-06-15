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
  "docs/sprints/sprint-15-pricing-basis-formula.md",
  "scripts/test-sprint-15-pricing-basis-formula.mjs",
  "src/modules/negotiated-prices/combinationGenerator.service.ts",
  "src/modules/negotiated-prices/negotiatedPrices.types.ts",
  "src/modules/negotiated-prices/negotiatedPricesExcel.service.ts",
  "src/modules/negotiated-prices/negotiatedPricesWorkbook.service.ts",
  "src/public/admin/index.html",
  "src/public/admin/admin.js",
  "src/public/admin/admin.css"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(
  packageJson.scripts["test:sprint15"],
  "node scripts/test-sprint-15-pricing-basis-formula.mjs"
);

const types = await readText("src/modules/negotiated-prices/negotiatedPrices.types.ts");
assert.match(types, /NegotiatedPricePricingBasisMode\s*=\s*"quantity"\s*\|\s*"areaM2"/);
assert.match(types, /NegotiatedPriceCalculationParameter/);
assert.match(types, /pricingBasis\?:\s*NegotiatedPricePricingBasis/);

const excelService = await readText("src/modules/negotiated-prices/negotiatedPricesExcel.service.ts");
assert.match(excelService, /normalizePricingBasis/);
assert.match(excelService, /pricingBasisMode/);
assert.match(excelService, /pricingBasisFormula/);

const combinationService = await readText("src/modules/negotiated-prices/combinationGenerator.service.ts");
assert.match(combinationService, /pricingBasis/);
assert.match(combinationService, /mode:\s*input\.pricingBasis\?\.mode/);
assert.match(combinationService, /formula:\s*input\.pricingBasis\?\.formula/);

const workbookService = await readText("src/modules/negotiated-prices/negotiatedPricesWorkbook.service.ts");
assert.match(workbookService, /Mode palier/);
assert.match(workbookService, /Formule palier/);
assert.match(workbookService, /Parametres formule/);
assert.match(workbookService, /JSON\.stringify\(plan\.pricingBasis\.parameters\)/);

const html = await readText("src/public/admin/index.html");
assert.match(html, /id="npPricingMode"/);
assert.match(html, /value="areaM2"/);
assert.match(html, /id="npTierFormula"/);
assert.match(html, /id="npFormulaTokenSelect"/);
assert.match(html, /id="npInsertFormulaToken"/);

const js = await readText("src/public/admin/admin.js");
assert.match(js, /collectCalculationParameters/);
assert.match(js, /renderCalculationParameters/);
assert.match(js, /insertFormulaToken/);
assert.match(js, /buildPricingBasisPayload/);
assert.match(js, /La formule de calcul m2 est obligatoire/);
assert.match(js, /pricingBasis:\s*buildPricingBasisPayload\(\)/);

const css = await readText("src/public/admin/admin.css");
assert.match(css, /\.formula-tools/);
assert.match(css, /\.formula-field textarea/);

const adminDoc = await readText("docs/architecture/admin-api.md");
assert.match(adminDoc, /Sprint 15 Pricing Basis Formula/);
assert.match(adminDoc, /pricingBasis/);

const excelDoc = await readText("docs/architecture/negotiated-prices-excel-model.md");
assert.match(excelDoc, /Sprint 15 Pricing Basis Formula/);
assert.match(excelDoc, /Mode palier/);

const sprintDoc = await readText("docs/sprints/sprint-15-pricing-basis-formula.md");
assert.match(sprintDoc, /m2/);
assert.match(sprintDoc, /formule/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 15 pricing basis formula checks passed.");
