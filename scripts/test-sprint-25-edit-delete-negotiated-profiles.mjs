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
  "docs/sprints/sprint-25-edit-delete-negotiated-profiles.md",
  "scripts/test-sprint-25-edit-delete-negotiated-profiles.mjs",
  "src/modules/negotiated-prices/negotiatedPrices.controller.ts",
  "src/modules/negotiated-prices/negotiatedPrices.routes.ts",
  "src/modules/negotiated-prices/negotiatedPrices.service.ts",
  "src/modules/negotiated-prices/negotiatedPrices.types.ts",
  "src/public/admin/admin.css",
  "src/public/admin/admin.js"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(
  packageJson.scripts["test:sprint25"],
  "node scripts/test-sprint-25-edit-delete-negotiated-profiles.mjs"
);

const types = await readText("src/modules/negotiated-prices/negotiatedPrices.types.ts");
assert.match(types, /NegotiatedPriceExistingProfileUpdateInput/);
assert.match(types, /NegotiatedPriceExistingCombinationUpdateInput/);
assert.match(types, /NegotiatedPriceExistingTierUpdateInput/);
assert.match(types, /pjmPrice:\s*string \| null/);

const service = await readText("src/modules/negotiated-prices/negotiatedPrices.service.ts");
assert.match(service, /updateExistingNegotiatedPriceProfile/);
assert.match(service, /deleteExistingNegotiatedPriceProfile/);
assert.match(service, /negotiatedPriceTier\.update/);
assert.match(service, /negotiatedPriceCombinationSet\.updateMany/);
assert.match(service, /isActive:\s*false/);
assert.match(service, /status:\s*"deleted"/);

const controller = await readText("src/modules/negotiated-prices/negotiatedPrices.controller.ts");
assert.match(controller, /putNegotiatedPricesProfile/);
assert.match(controller, /deleteNegotiatedPricesProfile/);
assert.match(controller, /readExistingProfileUpdateInput/);

const routes = await readText("src/modules/negotiated-prices/negotiatedPrices.routes.ts");
assert.match(routes, /put\("\/profiles\/:profileId"/);
assert.match(routes, /delete\("\/profiles\/:profileId"/);

const js = await readText("src/public/admin/admin.js");
assert.match(js, /editingExistingProfileId/);
assert.match(js, /renderExistingTierEditor/);
assert.match(js, /buildExistingProfileUpdatePayload/);
assert.match(js, /saveExistingProfile/);
assert.match(js, /deleteExistingProfile/);
assert.match(js, /data-existing-action="edit"/);
assert.match(js, /data-existing-action="delete"/);
assert.match(js, /method:\s*"PUT"/);
assert.match(js, /method:\s*"DELETE"/);

const css = await readText("src/public/admin/admin.css");
assert.match(css, /\.existing-profile-actions/);
assert.match(css, /\.existing-profile-editor/);
assert.match(css, /\.existing-tier-row/);

const adminDoc = await readText("docs/architecture/admin-api.md");
assert.match(adminDoc, /Sprint 25 Edit Delete Negotiated Profiles/);
assert.match(adminDoc, /PUT \/negotiated-prices\/profiles\/:profileId/);
assert.match(adminDoc, /DELETE \/negotiated-prices\/profiles\/:profileId/);

const negotiatedDoc = await readText("docs/architecture/negotiated-prices-excel-model.md");
assert.match(negotiatedDoc, /Sprint 25 Edit Delete Negotiated Profiles/);
assert.match(negotiatedDoc, /Deletion is soft/);

const sprintDoc = await readText("docs/sprints/sprint-25-edit-delete-negotiated-profiles.md");
assert.match(sprintDoc, /Modifier/);
assert.match(sprintDoc, /Supprimer/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 25 edit/delete negotiated profile checks passed.");
