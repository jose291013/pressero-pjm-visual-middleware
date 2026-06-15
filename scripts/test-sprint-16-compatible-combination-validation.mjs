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
  "docs/sprints/sprint-16-compatible-combination-validation.md",
  "scripts/test-sprint-16-compatible-combination-validation.mjs",
  "src/modules/negotiated-prices/negotiatedPrices.controller.ts",
  "src/modules/negotiated-prices/negotiatedPrices.routes.ts",
  "src/modules/negotiated-prices/negotiatedPrices.service.ts",
  "src/modules/negotiated-prices/negotiatedPrices.types.ts",
  "src/public/admin/index.html",
  "src/public/admin/admin.js"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(
  packageJson.scripts["test:sprint16"],
  "node scripts/test-sprint-16-compatible-combination-validation.mjs"
);

const types = await readText("src/modules/negotiated-prices/negotiatedPrices.types.ts");
assert.match(types, /NegotiatedPriceCompatibilityValidationResult/);
assert.match(types, /rawCombinationCount:\s*number/);
assert.match(types, /compatibleCombinationKeys:\s*string\[\]/);
assert.match(types, /incompatibleCombinationKeys:\s*string\[\]/);

const service = await readText("src/modules/negotiated-prices/negotiatedPrices.service.ts");
assert.match(service, /validateNegotiatedPriceCompatibility/);
assert.match(service, /buildNegotiatedPriceExcelPlan\(input\)/);
assert.match(service, /new Map<string,\s*NegotiatedPriceCompatibleOption\[\]>\(\)/);
assert.match(service, /client\.getEngineOptions/);
assert.match(service, /choiceIsAvailable/);
assert.match(service, /pjmRequestCount/);

const controller = await readText("src/modules/negotiated-prices/negotiatedPrices.controller.ts");
assert.match(controller, /postNegotiatedPricesValidateCombinations/);
assert.match(controller, /validateNegotiatedPriceCompatibility/);

const routes = await readText("src/modules/negotiated-prices/negotiatedPrices.routes.ts");
assert.match(routes, /negotiatedPricesRouter\.post\(\s*["']\/validate-combinations["']/);

const html = await readText("src/public/admin/index.html");
assert.match(html, /id="npValidateButton"/);
assert.match(html, /Verifier/);
assert.match(html, /id="npCompatibleCount"/);
assert.match(html, /id="npIncompatibleCount"/);

const js = await readText("src/public/admin/admin.js");
assert.match(js, /npValidateButton/);
assert.match(js, /renderCompatibilityValidation/);
assert.match(js, /validateNegotiatedCompatibility/);
assert.match(js, /\/negotiated-prices\/validate-combinations/);
assert.match(js, /compatibleCombinationCount/);
assert.match(js, /incompatibleCombinationCount/);

const adminDoc = await readText("docs/architecture/admin-api.md");
assert.match(adminDoc, /Sprint 16 Compatible Combination Validation/);
assert.match(adminDoc, /POST \/negotiated-prices\/validate-combinations/);

const excelDoc = await readText("docs/architecture/negotiated-prices-excel-model.md");
assert.match(excelDoc, /Sprint 16 Compatible Combination Validation/);
assert.match(excelDoc, /combinaisons compatibles/);

const sprintDoc = await readText("docs/sprints/sprint-16-compatible-combination-validation.md");
assert.match(sprintDoc, /Verifier/);
assert.match(sprintDoc, /PJM/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 16 compatible combination validation checks passed.");
