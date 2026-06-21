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
  "docs/sprints/sprint-27-generated-mis-product-id.md",
  "scripts/test-sprint-27-generated-mis-product-id.mjs",
  "src/modules/pressero-config/presseroConfig.controller.ts",
  "src/modules/pressero-config/presseroConfig.service.ts",
  "src/modules/pressero-config/presseroConfig.types.ts",
  "src/public/admin/admin.css",
  "src/public/admin/admin.js",
  "src/public/admin/index.html"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(
  packageJson.scripts["test:sprint27"],
  "node scripts/test-sprint-27-generated-mis-product-id.mjs"
);

const types = await readText("src/modules/pressero-config/presseroConfig.types.ts");
assert.match(types, /misProductId\?:\s*string/);
assert.match(types, /negotiatedPricingMisId:\s*string \| null/);

const service = await readText("src/modules/pressero-config/presseroConfig.service.ts");
assert.match(service, /randomBytes/);
assert.match(service, /generateMiddlewareProductMisId/);
assert.match(service, /MWP-/);
assert.doesNotMatch(service, /MIS Product ID obligatoire/);
assert.match(service, /normalized\.misProductId \|\| await generateMiddlewareProductMisId/);
assert.match(service, /misProductId:\s*normalized\.misProductId \|\| existing\.misProductId/);

const controller = await readText("src/modules/pressero-config/presseroConfig.controller.ts");
assert.match(controller, /getPresseroConfigStatus/);
assert.match(controller, /getPresseroProductConfigs/);

const html = await readText("src/public/admin/index.html");
assert.match(html, /MIS Product ID price 1/);
assert.match(html, /placeholder="Genere par le middleware"/);
assert.match(html, /readonly/);
assert.match(html, /Grille de prix negociee interne/);

const js = await readText("src/public/admin/admin.js");
assert.match(js, /Copier/);
assert.match(js, /copyPresseroMisProductId/);
assert.match(js, /navigator\.clipboard\.writeText/);
assert.match(js, /negotiatedPricingMisId/);
assert.match(js, /Aucune grille negociee/);

const css = await readText("src/public/admin/admin.css");
assert.match(css, /\.pressero-config-form input\[readonly\]/);

const overview = await readText("docs/architecture/middleware-overview.md");
assert.match(overview, /Sprint 27 Generated MIS Product ID/);
assert.match(overview, /MIS Product ID price 1/);

const sprintDoc = await readText("docs/sprints/sprint-27-generated-mis-product-id.md");
assert.match(sprintDoc, /Pricing Engine price 1/);
assert.match(sprintDoc, /MIS Product ID price 1/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 27 generated MIS Product ID checks passed.");
