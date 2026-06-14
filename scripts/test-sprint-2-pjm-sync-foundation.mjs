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
  "docs/sprints/sprint-2-pjm-sync-foundation.md",
  "scripts/seed-pjm-mock.mjs",
  "scripts/test-sprint-2-pjm-sync-foundation.mjs",
  "src/modules/pjm-sync/pjmSync.mockData.ts",
  "src/modules/pjm-sync/pjmSync.routes.ts",
  "src/modules/pjm-sync/pjmSync.controller.ts",
  "src/modules/pjm-sync/pjmSync.service.ts",
  "src/modules/pjm-sync/pjmSync.types.ts"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(packageJson.scripts["test:sprint2"], "node scripts/test-sprint-2-pjm-sync-foundation.mjs");
assert.equal(packageJson.scripts["seed:pjm-mock"], "node scripts/seed-pjm-mock.mjs");
assert.equal(packageJson.scripts["prisma:validate"], "prisma validate");

const devCheck = await readText("scripts/dev-check.mjs");
assert.match(devCheck, /test-sprint-\\d\+/);
assert.match(devCheck, /prisma:validate/);
assert.match(devCheck, /prisma:generate/);

const app = await readText("src/app.ts");
assert.match(app, /import \{ pjmSyncRouter \}/);
assert.match(app, /app\.use\(["']\/pjm-sync["'],\s*pjmSyncRouter\)/);

const routes = await readText("src/modules/pjm-sync/pjmSync.routes.ts");
const expectedRoutes = [
  "pjmSyncRouter.get(\"/\", getPjmSyncStatus)",
  "pjmSyncRouter.get(\"/categories\", getPjmProductCategories)",
  "pjmSyncRouter.get(\"/price-groups\", getPjmPriceGroups)",
  "pjmSyncRouter.get(\"/price-engines\", getPjmPriceEngines)",
  "pjmSyncRouter.get(\"/price-engines/:id/options\", getPjmPriceEngineOptions)"
];

for (const expectedRoute of expectedRoutes) {
  assert.ok(routes.includes(expectedRoute), `Missing route: ${expectedRoute}`);
}

const controller = await readText("src/modules/pjm-sync/pjmSync.controller.ts");
assert.match(controller, /status:\s*"mock_foundation"/);
assert.match(controller, /sprint:\s*2/);
assert.match(controller, /res\.status\(404\)\.json/);

const service = await readText("src/modules/pjm-sync/pjmSync.service.ts");
const requiredDelegates = [
  "prisma.pjmProductCategory.findMany",
  "prisma.pjmPriceGroup.findMany",
  "prisma.pjmPriceEngine.findMany",
  "prisma.pjmPriceEngine.findFirst"
];

for (const delegate of requiredDelegates) {
  assert.ok(service.includes(delegate), `Missing Prisma read delegate: ${delegate}`);
}

const mockData = await readText("src/modules/pjm-sync/pjmSync.mockData.ts");
const expectedMockIds = [
  "pjm-cat-signage",
  "pjm-group-standard",
  "pjm-engine-poster-a3",
  "pjm-option-paper",
  "pjm-choice-paper-135"
];

for (const mockId of expectedMockIds) {
  assert.ok(mockData.includes(mockId), `Missing mock PJM id: ${mockId}`);
}

const seed = await readText("scripts/seed-pjm-mock.mjs");
assert.match(seed, /new PrismaClient\(\)/);
assert.match(seed, /upsert/);
assert.match(seed, /findUniqueOrThrow/);

const forbiddenConnectorPatterns = [
  /\bfetch\s*\(/,
  /\baxios\b/,
  /\bgot\b/,
  /\bnode-fetch\b/,
  /PJM_API/i,
  /PRINT_JOB_MANAGER_API/i
];

for (const pattern of forbiddenConnectorPatterns) {
  assert.doesNotMatch(seed, pattern, `Seed script must not include a real PJM connector: ${pattern}`);
  assert.doesNotMatch(service, pattern, `PJM sync service must not include a real PJM connector: ${pattern}`);
}

const sprintDoc = await readText("docs/sprints/sprint-2-pjm-sync-foundation.md");
assert.match(sprintDoc, /GET \/pjm-sync\/categories/);
assert.match(sprintDoc, /GET \/pjm-sync\/price-engines\/:id\/options/);
assert.match(sprintDoc, /ne cree pas de connecteur PJM reel/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /Options_1_Value/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 2 PJM sync foundation checks passed.");
