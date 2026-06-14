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
  "docs/sprints/sprint-10-negotiated-prices-excel-plan.md",
  "scripts/test-sprint-10-negotiated-prices-excel-plan.mjs",
  "src/modules/negotiated-prices/negotiatedPrices.types.ts",
  "src/modules/negotiated-prices/combinationGenerator.service.ts",
  "src/modules/negotiated-prices/negotiatedPricesExcel.service.ts",
  "src/modules/negotiated-prices/negotiatedPrices.service.ts",
  "src/modules/negotiated-prices/negotiatedPrices.controller.ts",
  "src/modules/negotiated-prices/negotiatedPrices.routes.ts"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(
  packageJson.scripts["test:sprint10"],
  "node scripts/test-sprint-10-negotiated-prices-excel-plan.mjs"
);

const app = await readText("src/app.ts");
assert.match(app, /negotiatedPricesRouter/);
assert.match(app, /app\.use\(["']\/negotiated-prices["'],\s*negotiatedPricesRouter\)/);

const types = await readText("src/modules/negotiated-prices/negotiatedPrices.types.ts");
assert.match(types, /NegotiatedPriceCombinationInput/);
assert.match(types, /quantityTiersText:\s*string/);
assert.match(types, /NegotiatedPriceExcelPlan/);
assert.match(types, /kind:\s*"technical"\s*\|\s*"context"\s*\|\s*"option"\s*\|\s*"pjmPrice"\s*\|\s*"negotiatedPrice"/);

const generator = await readText("src/modules/negotiated-prices/combinationGenerator.service.ts");
assert.match(generator, /parseQuantityTiersText/);
assert.match(generator, /split\(\/\[\\n,;\]\+\//);
assert.match(generator, /buildChoiceCombinations/);
assert.match(generator, /countChoiceCombinations/);
assert.match(generator, /createHash/);
assert.match(generator, /buildTierCombinationHash/);
assert.match(generator, /quantity/);
assert.match(generator, /optionChoiceIds/);

const excel = await readText("src/modules/negotiated-prices/negotiatedPricesExcel.service.ts");
assert.match(excel, /buildNegotiatedPriceExcelPlan/);
assert.match(excel, /Prix PJM \$\{quantity\}/);
assert.match(excel, /Prix negocie \$\{quantity\}/);
assert.match(excel, /combinationCount:\s*rows\.length/);
assert.match(excel, /buildContextColumns/);
assert.match(excel, /buildOptionColumns/);
assert.match(excel, /buildTierColumns/);

const service = await readText("src/modules/negotiated-prices/negotiatedPrices.service.ts");
assert.match(service, /previewNegotiatedPriceExcelPlan/);
assert.match(service, /buildNegotiatedPriceExcelPlan/);

const controller = await readText("src/modules/negotiated-prices/negotiatedPrices.controller.ts");
assert.match(controller, /status:\s*"excel_plan_foundation"/);
assert.match(controller, /postNegotiatedPricesPreview/);
assert.match(controller, /res\.status\(400\)\.json/);

const routes = await readText("src/modules/negotiated-prices/negotiatedPrices.routes.ts");
assert.match(routes, /negotiatedPricesRouter\.get\(["']\/["']/);
assert.match(routes, /negotiatedPricesRouter\.post\(["']\/preview["']/);

const contracts = await readText("src/modules/pjm-sync/pjmContracts.types.ts");
assert.match(contracts, /PjmCreateJobsRequest/);
assert.match(contracts, /PjmCreateJobItem/);
assert.match(contracts, /organizationIntegrationId:\s*string/);
assert.match(contracts, /engineIntegrationId:\s*string/);
assert.match(contracts, /engineValues:\s*PjmJobEngineValue\[\]/);

const pjmClient = await readText("src/modules/pjm-sync/pjmClient.ts");
assert.match(pjmClient, /createJobs/);
assert.match(pjmClient, /\/public\/jobs/);

const endpointsDoc = await readText("docs/architecture/pjm-endpoints.md");
assert.match(endpointsDoc, /POST https:\/\/ams\.printjobmanager\.com\/api\/public\/jobs/);
assert.match(endpointsDoc, /negotiated price/);

const excelDoc = await readText("docs/architecture/negotiated-prices-excel-model.md");
assert.match(excelDoc, /one row per option-choice combination/);
assert.match(excelDoc, /one quantity per line/);
assert.match(excelDoc, /Prix PJM 1/);
assert.match(excelDoc, /Prix negocie 1/);
assert.match(excelDoc, /optionsandprice/);

const sprintDoc = await readText("docs/sprints/sprint-10-negotiated-prices-excel-plan.md");
assert.match(sprintDoc, /POST \/negotiated-prices\/preview/);
assert.match(sprintDoc, /Aucun modele Prisma/);
assert.match(sprintDoc, /POST \/public\/jobs/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 10 negotiated prices Excel plan checks passed.");
