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
  "docs/sprints/sprint-5-pjm-sync-runner.md",
  "scripts/test-sprint-5-pjm-sync-runner.mjs",
  "src/modules/pjm-sync/pjmSyncCatalog.service.ts",
  "src/modules/pjm-sync/pjmSync.runner.ts"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(packageJson.scripts["test:sprint5"], "node scripts/test-sprint-5-pjm-sync-runner.mjs");
assert.equal(packageJson.scripts["sync:pjm"], "tsx src/modules/pjm-sync/pjmSync.runner.ts");

const catalogService = await readText("src/modules/pjm-sync/pjmSyncCatalog.service.ts");
assert.match(catalogService, /export async function syncPjmCatalog/);
assert.match(catalogService, /client\.listProductEngines\(\)/);
assert.match(catalogService, /readPjmProductEnginesResponse/);
assert.match(catalogService, /ProductEngines/);
assert.match(catalogService, /Data/);
assert.match(catalogService, /Items/);
assert.match(catalogService, /client\.getEngineOptions\(optionProductId\)/);
assert.match(catalogService, /prisma\.pjmPriceEngine\.upsert/);
assert.match(catalogService, /prisma\.pjmPriceGroup\.upsert/);
assert.match(catalogService, /prisma\.pjmEnginePriceGroupMapping\.upsert/);
assert.match(catalogService, /prisma\.pjmOption\.upsert/);
assert.match(catalogService, /prisma\.pjmOptionChoice\.upsert/);
assert.match(catalogService, /buildPriceGroupPjmId/);
assert.match(catalogService, /normalizePjmEngineOptionsResponse/);
assert.match(catalogService, /EnginePriceGroupIntegrationId/);
assert.match(catalogService, /engine\.Mappings\?\.\[0\]\?\.EnginePriceGroupIntegrationId/);
assert.doesNotMatch(catalogService, /getOptionsAndPrice/);
assert.doesNotMatch(catalogService, /optionsandprice/);

const runner = await readText("src/modules/pjm-sync/pjmSync.runner.ts");
assert.match(runner, /createPjmClientFromEnv/);
assert.match(runner, /syncPjmCatalog/);
assert.match(runner, /prisma\.\$disconnect\(\)/);
assert.match(runner, /process\.exitCode\s*=\s*1/);

const app = await readText("src/app.ts");
assert.doesNotMatch(app, /pjmSync\.runner|syncPjmCatalog|createPjmClientFromEnv/);

const server = await readText("src/server.ts");
assert.doesNotMatch(server, /pjmSync\.runner|syncPjmCatalog|createPjmClientFromEnv/);

const syncTypes = await readText("src/modules/pjm-sync/pjmSync.types.ts");
assert.match(syncTypes, /PjmCatalogSyncResult/);
assert.match(syncTypes, /enginesProcessed:\s*number/);
assert.match(syncTypes, /warnings:\s*string\[\]/);

const sprintDoc = await readText("docs/sprints/sprint-5-pjm-sync-runner.md");
assert.match(sprintDoc, /npm run sync:pjm/);
assert.match(sprintDoc, /Aucun endpoint HTTP n'est ajoute/);
assert.match(sprintDoc, /absence de calcul prix/);

const endpointsDoc = await readText("docs/architecture/pjm-endpoints.md");
assert.match(endpointsDoc, /Sprint 5 Sync Runner/);
assert.match(endpointsDoc, /does not call `optionsandprice`/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /Options_1_Value/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 5 PJM sync runner checks passed.");
