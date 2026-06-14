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
  "docs/architecture/admin-api.md",
  "docs/sprints/sprint-6-admin-read-api.md",
  "scripts/test-sprint-6-admin-read-api.mjs",
  "src/modules/pjm-sync/pjmSyncAdmin.service.ts"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(packageJson.scripts["test:sprint6"], "node scripts/test-sprint-6-admin-read-api.mjs");

const routes = await readText("src/modules/pjm-sync/pjmSync.routes.ts");
const expectedRoutes = [
  "pjmSyncRouter.get(\"/admin/summary\", getPjmSyncAdminSummary)",
  "pjmSyncRouter.get(\"/admin/price-engines\", getPjmSyncAdminPriceEngines)",
  "\"/admin/price-engines/:id/mappings\"",
  "\"/admin/price-engines/:id/options\"",
  "\"/admin/price-engines/:id\""
];

for (const expectedRoute of expectedRoutes) {
  assert.ok(routes.includes(expectedRoute), `Missing admin route: ${expectedRoute}`);
}

const controller = await readText("src/modules/pjm-sync/pjmSync.controller.ts");
const expectedControllerExports = [
  "getPjmSyncAdminSummary",
  "getPjmSyncAdminPriceEngines",
  "getPjmSyncAdminPriceEngineDetail",
  "getPjmSyncAdminPriceEngineMappings",
  "getPjmSyncAdminPriceEngineOptions"
];

for (const controllerExport of expectedControllerExports) {
  assert.match(controller, new RegExp(`export async function ${controllerExport}`));
}

assert.match(controller, /getPjmSyncAdminSummaryFromStore/);
assert.match(controller, /res\.status\(404\)\.json/);
assert.match(controller, /PJM price engine not found/);

const adminService = await readText("src/modules/pjm-sync/pjmSyncAdmin.service.ts");
const expectedDelegates = [
  "prisma.pjmPriceEngine.count()",
  "prisma.pjmPriceGroup.count()",
  "prisma.pjmEnginePriceGroupMapping.count()",
  "prisma.pjmOption.count()",
  "prisma.pjmOptionChoice.count()",
  "prisma.pjmPriceEngine.findMany",
  "prisma.pjmPriceEngine.findFirst"
];

for (const delegate of expectedDelegates) {
  assert.ok(adminService.includes(delegate), `Missing Prisma delegate: ${delegate}`);
}

assert.match(adminService, /priceGroupMappings:\s*\{/);
assert.match(adminService, /priceGroup:\s*true/);
assert.match(adminService, /options:\s*\{/);
assert.match(adminService, /choices:\s*\{/);
assert.doesNotMatch(adminService, /createPjmClientFromEnv|syncPjmCatalog|getEngineOptions|listProductEngines/);

const types = await readText("src/modules/pjm-sync/pjmSync.types.ts");
assert.match(types, /PjmSyncAdminSummary/);
assert.match(types, /latestUpdatedAt:\s*string \| null/);

const adminDoc = await readText("docs/architecture/admin-api.md");
assert.match(adminDoc, /GET \/pjm-sync\/admin\/summary/);
assert.match(adminDoc, /GET \/pjm-sync\/admin\/price-engines\/:id\/options/);
assert.match(adminDoc, /read-only/);

const sprintDoc = await readText("docs/sprints/sprint-6-admin-read-api.md");
assert.match(sprintDoc, /GET \/pjm-sync\/admin\/price-engines\/:id\/mappings/);
assert.match(sprintDoc, /Aucun modele Prisma n'est ajoute/);
assert.match(sprintDoc, /sans lancer de nouvelle synchronisation/);

const app = await readText("src/app.ts");
assert.doesNotMatch(app, /syncPjmCatalog|createPjmClientFromEnv/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /Options_1_Value/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 6 admin read API checks passed.");
