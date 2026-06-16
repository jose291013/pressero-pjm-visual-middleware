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
  "docs/sprints/sprint-24-existing-negotiated-profiles.md",
  "scripts/test-sprint-24-existing-negotiated-profiles.mjs",
  "src/modules/negotiated-prices/negotiatedPrices.controller.ts",
  "src/modules/negotiated-prices/negotiatedPrices.routes.ts",
  "src/modules/negotiated-prices/negotiatedPrices.service.ts",
  "src/modules/negotiated-prices/negotiatedPrices.types.ts",
  "src/public/admin/admin.css",
  "src/public/admin/admin.js",
  "src/public/admin/index.html"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(
  packageJson.scripts["test:sprint24"],
  "node scripts/test-sprint-24-existing-negotiated-profiles.mjs"
);

const types = await readText("src/modules/negotiated-prices/negotiatedPrices.types.ts");
assert.match(types, /NegotiatedPriceExistingProfilesInput/);
assert.match(types, /NegotiatedPriceExistingProfile/);
assert.match(types, /combinationKey:\s*string/);

const service = await readText("src/modules/negotiated-prices/negotiatedPrices.service.ts");
assert.match(service, /listExistingNegotiatedPriceProfiles/);
assert.match(service, /assertNoExistingCombinationForContext/);
assert.match(service, /organizationIntegrationId/);
assert.match(service, /priceEngineId/);
assert.match(service, /enginePriceGroupIntegrationId/);
assert.match(service, /Cette combinaison existe deja dans le MISID/);

const controller = await readText("src/modules/negotiated-prices/negotiatedPrices.controller.ts");
assert.match(controller, /getNegotiatedPricesProfiles/);
assert.match(controller, /readExistingProfilesInput/);

const routes = await readText("src/modules/negotiated-prices/negotiatedPrices.routes.ts");
assert.match(routes, /\/profiles/);

const html = await readText("src/public/admin/index.html");
assert.match(html, /MIS ID existants/);
assert.match(html, /id="npExistingProfileCount"/);
assert.match(html, /id="npExistingProfileList"/);

const js = await readText("src/public/admin/admin.js");
assert.match(js, /existingProfiles:\s*\[\]/);
assert.match(js, /loadExistingProfiles/);
assert.match(js, /existingCombinationKeys/);
assert.match(js, /\/negotiated-prices\/profiles/);
assert.match(js, /Cette combinaison existe deja dans un MIS ID existant/);
assert.match(js, /await loadExistingProfiles\(\)/);

const css = await readText("src/public/admin/admin.css");
assert.match(css, /\.existing-profiles-panel/);
assert.match(css, /\.existing-profile-item/);

const adminDoc = await readText("docs/architecture/admin-api.md");
assert.match(adminDoc, /Sprint 24 Existing Negotiated Profiles/);
assert.match(adminDoc, /GET \/negotiated-prices\/profiles/);

const negotiatedDoc = await readText("docs/architecture/negotiated-prices-excel-model.md");
assert.match(negotiatedDoc, /Sprint 24 Existing Negotiated Profiles/);
assert.match(negotiatedDoc, /Organisation \+ moteur de prix \+ groupe de prix/);

const sprintDoc = await readText("docs/sprints/sprint-24-existing-negotiated-profiles.md");
assert.match(sprintDoc, /MIS ID existants/);
assert.match(sprintDoc, /doublon/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 24 existing negotiated profile checks passed.");
