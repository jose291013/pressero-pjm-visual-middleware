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
  "docs/sprints/sprint-30-pressero-negotiated-without-group.md",
  "scripts/test-sprint-30-pressero-negotiated-without-group.mjs",
  "src/modules/negotiated-prices/negotiatedPrices.service.ts",
  "src/modules/negotiated-prices/negotiatedPrices.types.ts",
  "src/modules/pressero-config/presseroConfig.service.ts",
  "src/modules/pressero-config/presseroConfig.types.ts",
  "src/public/admin/admin.js",
  "src/public/admin/admin.css",
  "src/public/admin/index.html",
  "docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(
  packageJson.scripts["test:sprint30"],
  "node scripts/test-sprint-30-pressero-negotiated-without-group.mjs"
);

const negotiatedTypes = await readText("src/modules/negotiated-prices/negotiatedPrices.types.ts");
assert.match(negotiatedTypes, /enginePriceGroupIntegrationId:\s*string \| null/);
assert.match(negotiatedTypes, /priceGroupName:\s*string \| null/);

const negotiatedService = await readText("src/modules/negotiated-prices/negotiatedPrices.service.ts");
assert.match(negotiatedService, /const where:\s*Prisma\.NegotiatedPriceProfileWhereInput/);
assert.match(negotiatedService, /if \(context\.enginePriceGroupIntegrationId\)/);
assert.doesNotMatch(
  negotiatedService,
  /!context\.organizationIntegrationId \|\|\s*\n\s*!context\.priceEngineId \|\|\s*\n\s*!context\.enginePriceGroupIntegrationId/
);

const presseroTypes = await readText("src/modules/pressero-config/presseroConfig.types.ts");
assert.match(presseroTypes, /enginePriceGroupIntegrationId\?:\s*string/);

const presseroService = await readText("src/modules/pressero-config/presseroConfig.service.ts");
assert.match(presseroService, /input\.pricingMode === "negotiated"/);
assert.match(presseroService, /profile\.enginePriceGroupIntegrationId/);
assert.match(presseroService, /enginePriceGroupIntegrationId:\s*context\.enginePriceGroupIntegrationId/);
assert.match(presseroService, /Groupe de prix obligatoire/);
assert.doesNotMatch(
  presseroService,
  /profile\.enginePriceGroupIntegrationId !== input\.enginePriceGroupIntegrationId/
);

const html = await readText("src/public/admin/index.html");
assert.match(html, /class="pc-price-group-field"/);

const js = await readText("src/public/admin/admin.js");
assert.match(js, /updatePresseroPricingModeFields/);
assert.match(js, /els\.pcPriceGroupSelect\.disabled = negotiatedMode/);
assert.match(js, /params\.set\("enginePriceGroupIntegrationId"/);
assert.match(js, /findPresseroNegotiatedProfile/);
assert.match(js, /negotiatedProfile\?\.enginePriceGroupIntegrationId/);
assert.match(js, /negotiatedProfile\?\.priceGroupName/);

const css = await readText("src/public/admin/admin.css");
assert.match(css, /\.pressero-config-form \.is-disabled-field/);

const overview = await readText("docs/architecture/middleware-overview.md");
assert.match(overview, /Sprint 30 Pressero Negotiated Without Group/);

const sprintDoc = await readText("docs/sprints/sprint-30-pressero-negotiated-without-group.md");
assert.match(sprintDoc, /PJM standard/);
assert.match(sprintDoc, /Prix negocie/);
assert.match(sprintDoc, /groupe de prix/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 30 Pressero negotiated without group checks passed.");
