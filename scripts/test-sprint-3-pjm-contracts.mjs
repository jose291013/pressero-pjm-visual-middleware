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
  "docs/architecture/pjm-endpoints.md",
  "docs/sprints/sprint-3-pjm-contracts.md",
  "scripts/test-sprint-3-pjm-contracts.mjs",
  "src/modules/pjm-sync/pjmContracts.types.ts"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(packageJson.scripts["test:sprint3"], "node scripts/test-sprint-3-pjm-contracts.mjs");

const gitignore = await readText(".gitignore");
assert.match(gitignore, /docs\/reference\/\*\.zip/);

const envExample = await readText(".env.example");
assert.match(envExample, /PJM_PUBLIC_BASE_URL="https:\/\/ams\.printjobmanager\.com\/api"/);
assert.match(envExample, /PJM_USERNAME=""/);
assert.match(envExample, /PJM_PASSWORD=""/);

const prismaSchema = await readText("prisma/schema.prisma");
assert.match(prismaSchema, /model\s+PjmEnginePriceGroupMapping\s+\{/);
assert.match(prismaSchema, /enginePriceGroupIntegrationId\s+String\s+@unique/);
assert.match(prismaSchema, /priceGroupMappings\s+PjmEnginePriceGroupMapping\[\]/);
assert.match(prismaSchema, /engineMappings\s+PjmEnginePriceGroupMapping\[\]/);
assert.doesNotMatch(prismaSchema, /priceGroupId\s+String\?/);
assert.doesNotMatch(prismaSchema, /priceGroup\s+PjmPriceGroup\?/);

const contracts = await readText("src/modules/pjm-sync/pjmContracts.types.ts");
const requiredContracts = [
  "PjmAuthenticateRequest",
  "PjmAuthenticateResponse",
  "PjmProductEngineListMappingResponse",
  "PjmProductEngineListItemResponse",
  "PjmProductEngineListResponse",
  "PjmEngineOperation",
  "PjmEngineRequest",
  "PjmEngineOptionsResponse",
  "PjmOptionsAndPriceResponse"
];

for (const contract of requiredContracts) {
  assert.ok(contracts.includes(contract), `Missing PJM contract type: ${contract}`);
}

assert.match(contracts, /EnginePriceGroupIntegrationId:\s*string/);
assert.match(contracts, /PriceGroupName:\s*string/);
assert.match(contracts, /Operation:\s*PjmEngineOperation/);
assert.match(contracts, /Product:\s*string/);
assert.match(contracts, /Price\?:\s*number/);
assert.match(contracts, /Weight\?:\s*number/);

const mockData = await readText("src/modules/pjm-sync/pjmSync.mockData.ts");
assert.match(mockData, /mappings:\s*\[/);
assert.match(mockData, /enginePriceGroupIntegrationId:\s*"pjm-map-poster-a3-standard"/);
assert.match(mockData, /enginePriceGroupIntegrationId:\s*"pjm-map-poster-a3-premium"/);
assert.doesNotMatch(mockData, /priceGroupPjmId:\s*"pjm-group-standard",\s*options:/);

const seed = await readText("scripts/seed-pjm-mock.mjs");
assert.match(seed, /prisma\.pjmEnginePriceGroupMapping\.upsert/);
assert.match(seed, /enginePriceGroupIntegrationId/);
assert.doesNotMatch(seed, /priceGroupId:\s*priceGroup\.id,\s*\n\s*\}\s*\n\s*\}\s*\);/);

const service = await readText("src/modules/pjm-sync/pjmSync.service.ts");
assert.match(service, /priceGroupMappings:\s*\{/);
assert.match(service, /priceGroup:\s*true/);

const endpointsDoc = await readText("docs/architecture/pjm-endpoints.md");
assert.match(endpointsDoc, /POST https:\/\/ams\.printjobmanager\.com\/api\/public\/productEngines\/list/);
assert.match(endpointsDoc, /EnginePriceGroupIntegrationId/);
assert.match(endpointsDoc, /POST https:\/\/ams\.printjobmanager\.com\/api\/public\/engine/);
assert.match(endpointsDoc, /"Operation": "options"/);
assert.match(endpointsDoc, /"Operation": "optionsandprice"/);
assert.match(endpointsDoc, /must not calculate prices itself/);

const sprintDoc = await readText("docs/sprints/sprint-3-pjm-contracts.md");
assert.match(sprintDoc, /PjmEnginePriceGroupMapping/);
assert.match(sprintDoc, /Aucun endpoint interne n'est ajoute/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /Options_1_Value/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 3 PJM contracts checks passed.");
