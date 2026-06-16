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
  "docs/sprints/sprint-21-negotiated-profile-identity.md",
  "scripts/test-sprint-21-negotiated-profile-identity.mjs",
  "prisma/schema.prisma",
  "src/modules/negotiated-prices/negotiatedPrices.service.ts",
  "src/modules/negotiated-prices/negotiatedPrices.types.ts"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(
  packageJson.scripts["test:sprint21"],
  "node scripts/test-sprint-21-negotiated-profile-identity.mjs"
);

const schema = await readText("prisma/schema.prisma");
assert.match(schema, /enum NegotiatedPriceProfileMode/);
assert.match(schema, /enum NegotiatedPriceVisibilityMode/);
assert.match(schema, /organizationIntegrationId\s+String\?/);
assert.match(schema, /misId\s+String\?/);
assert.match(schema, /enginePriceGroupIntegrationId\s+String\?/);
assert.match(schema, /profileMode\s+NegotiatedPriceProfileMode\s+@default\(single\)/);
assert.match(schema, /visibilityMode\s+NegotiatedPriceVisibilityMode\s+@default\(hidden\)/);
assert.match(schema, /@@index\(\[organizationIntegrationId,\s*priceEngineId,\s*misId\]\)/);
assert.match(schema, /model NegotiatedPriceCombination\s+\{/);
assert.match(schema, /model NegotiatedPriceTier\s+\{/);
assert.match(schema, /@@unique\(\[profileId,\s*combinationKey\]\)/);
assert.match(schema, /@@unique\(\[combinationId,\s*tierValue\]\)/);

const types = await readText("src/modules/negotiated-prices/negotiatedPrices.types.ts");
assert.match(types, /NegotiatedPriceProfileMode\s*=\s*"single"\s*\|\s*"multi"/);
assert.match(types, /NegotiatedPriceVisibilityMode\s*=\s*"hidden"\s*\|\s*"selectable"/);
assert.match(types, /profileKey:\s*\{/);
assert.match(types, /organizationIntegrationId:\s*string/);
assert.match(types, /combinationId:\s*string/);

const service = await readText("src/modules/negotiated-prices/negotiatedPrices.service.ts");
assert.match(service, /readOrganizationIntegrationId/);
assert.match(service, /readDirectProfileMode/);
assert.match(service, /readDirectVisibilityMode/);
assert.match(service, /organizationIntegrationId,\s*\n\s*misId/);
assert.match(service, /enginePriceGroupIntegrationId:\s*input\.enginePriceGroupIntegrationId/);
assert.match(service, /profileMode:\s*readDirectProfileMode\(input\)/);
assert.match(service, /visibilityMode:\s*readDirectVisibilityMode\(input\)/);
assert.match(service, /negotiatedPriceCombination\.create/);
assert.match(service, /tiers:\s*\{\s*\n\s*create:/);
assert.match(service, /profileKey:\s*\{/);

const adminDoc = await readText("docs/architecture/admin-api.md");
assert.match(adminDoc, /Sprint 21 Negotiated Profile Identity/);
assert.match(adminDoc, /Organisation \+ moteur de prix \+ MISID/);

const negotiatedDoc = await readText("docs/architecture/negotiated-prices-excel-model.md");
assert.match(negotiatedDoc, /Sprint 21 Negotiated Profile Identity/);
assert.match(negotiatedDoc, /Profile -> Combination -> Tier/);

const sprintDoc = await readText("docs/sprints/sprint-21-negotiated-profile-identity.md");
assert.match(sprintDoc, /Organisation \+ moteur de prix \+ MISID/);
assert.match(sprintDoc, /multi-combinaison/);
assert.match(sprintDoc, /contrainte unique stricte/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 21 negotiated profile identity checks passed.");
