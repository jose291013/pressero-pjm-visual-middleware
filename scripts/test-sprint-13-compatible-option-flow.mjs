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
  "docs/sprints/sprint-13-compatible-option-flow.md",
  "scripts/test-sprint-13-compatible-option-flow.mjs",
  "src/modules/negotiated-prices/negotiatedPrices.controller.ts",
  "src/modules/negotiated-prices/negotiatedPrices.routes.ts",
  "src/modules/negotiated-prices/negotiatedPrices.service.ts",
  "src/modules/negotiated-prices/negotiatedPrices.types.ts",
  "src/modules/pjm-sync/pjmClient.ts",
  "src/public/admin/admin.js"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(
  packageJson.scripts["test:sprint13"],
  "node scripts/test-sprint-13-compatible-option-flow.mjs"
);

const contracts = await readText("src/modules/pjm-sync/pjmContracts.types.ts");
assert.match(contracts, /Key\?:\s*string/);
assert.match(contracts, /Name\?:\s*string/);

const pjmClient = await readText("src/modules/pjm-sync/pjmClient.ts");
assert.match(pjmClient, /buildPjmEngineOptionsRequest\(\s*engineIntegrationId:\s*string,\s*options:\s*PjmEngineOptionValue\[\]\s*=\s*\[\]/);
assert.match(pjmClient, /Operation:\s*"options"/);
assert.match(pjmClient, /getEngineOptions\(\s*engineIntegrationId:\s*string,\s*options:\s*PjmEngineOptionValue\[\]\s*=\s*\[\]/);

const catalogService = await readText("src/modules/pjm-sync/pjmSyncCatalog.service.ts");
assert.match(catalogService, /export function extractPjmOptionKey/);
assert.match(catalogService, /split\(":\"\)/);

const types = await readText("src/modules/negotiated-prices/negotiatedPrices.types.ts");
assert.match(types, /NegotiatedPriceCompatibleOptionsInput/);
assert.match(types, /NegotiatedPriceCompatibilitySelection/);
assert.match(types, /pjmKey:\s*string/);
assert.match(types, /pjmValue:\s*string/);

const service = await readText("src/modules/negotiated-prices/negotiatedPrices.service.ts");
assert.match(service, /listCompatiblePjmOptions/);
assert.match(service, /createPjmClientFromEnv/);
assert.match(service, /client\.getEngineOptions/);
assert.match(service, /Key:\s*selection\.pjmKey/);
assert.match(service, /Value:\s*selection\.pjmValue/);
assert.match(service, /normalizePjmEngineOptionsResponse/);

const controller = await readText("src/modules/negotiated-prices/negotiatedPrices.controller.ts");
assert.match(controller, /postNegotiatedPricesCompatibleOptions/);
assert.match(controller, /readCompatibleOptionsInput/);

const routes = await readText("src/modules/negotiated-prices/negotiatedPrices.routes.ts");
assert.match(routes, /negotiatedPricesRouter\.post\(\s*["']\/compatible-options["']/);

const adminJs = await readText("src/public/admin/admin.js");
assert.match(adminJs, /state\.negotiatedOptions/);
assert.match(adminJs, /refreshCompatibleNegotiatedOptions/);
assert.match(adminJs, /\/negotiated-prices\/compatible-options/);
assert.match(adminJs, /buildCompatibilitySelections/);
assert.match(adminJs, /getVisibleNegotiatedOptions/);
assert.match(adminJs, /choiceSelectionKey/);
assert.match(adminJs, /els\.npPriceGroupSelect\.addEventListener\("change"/);

const adminDoc = await readText("docs/architecture/admin-api.md");
assert.match(adminDoc, /Sprint 13 Compatible Options/);
assert.match(adminDoc, /POST \/negotiated-prices\/compatible-options/);

const endpointsDoc = await readText("docs/architecture/pjm-endpoints.md");
assert.match(endpointsDoc, /Compatible Options Flow/);
assert.match(endpointsDoc, /"Key": "pjm-option-id"/);

const excelDoc = await readText("docs/architecture/negotiated-prices-excel-model.md");
assert.match(excelDoc, /branch-by-branch compatibility checks/);

const sprintDoc = await readText("docs/sprints/sprint-13-compatible-option-flow.md");
assert.match(sprintDoc, /Operation": "options"/);
assert.match(sprintDoc, /premier choix coche/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 13 compatible option flow checks passed.");
