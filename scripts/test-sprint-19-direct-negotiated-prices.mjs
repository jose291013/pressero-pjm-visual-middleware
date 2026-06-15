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
  "docs/sprints/sprint-19-direct-negotiated-prices.md",
  "scripts/test-sprint-19-direct-negotiated-prices.mjs",
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
  packageJson.scripts["test:sprint19"],
  "node scripts/test-sprint-19-direct-negotiated-prices.mjs"
);

const types = await readText("src/modules/negotiated-prices/negotiatedPrices.types.ts");
assert.match(types, /NegotiatedPriceDirectTierPreview/);
assert.match(types, /NegotiatedPriceDirectSaveInput/);
assert.match(types, /NegotiatedPriceDirectSaveResult/);
assert.match(types, /misId:\s*string/);

const service = await readText("src/modules/negotiated-prices/negotiatedPrices.service.ts");
assert.match(service, /previewDirectNegotiatedPrices/);
assert.match(service, /saveDirectNegotiatedPrices/);
assert.match(service, /generateMisId/);
assert.match(service, /getOptionsAndPrice/);
assert.match(service, /negotiatedPriceProfile\.create/);
assert.match(service, /negotiatedPriceCombinationSet\.create/);
assert.match(service, /La saisie directe requiert une seule combinaison/);

const controller = await readText("src/modules/negotiated-prices/negotiatedPrices.controller.ts");
assert.match(controller, /postNegotiatedPricesDirectPreview/);
assert.match(controller, /postNegotiatedPricesDirectSave/);

const routes = await readText("src/modules/negotiated-prices/negotiatedPrices.routes.ts");
assert.match(routes, /\/direct-preview/);
assert.match(routes, /\/direct-save/);

const html = await readText("src/public/admin/index.html");
assert.match(html, /Prix directs/);
assert.match(html, /id="npDirectPreviewButton"/);
assert.match(html, /id="npDirectSaveButton"/);
assert.match(html, /id="npMisIdResult"/);

const js = await readText("src/public/admin/admin.js");
assert.match(js, /previewDirectPrices/);
assert.match(js, /saveDirectPrices/);
assert.match(js, /\/negotiated-prices\/direct-preview/);
assert.match(js, /\/negotiated-prices\/direct-save/);
assert.match(js, /MISID:/);
assert.match(js, /data-direct-negotiated-price/);

const css = await readText("src/public/admin/admin.css");
assert.match(css, /\.direct-price-panel/);
assert.match(css, /\.direct-price-row/);
assert.match(css, /\.misid-result/);

const adminDoc = await readText("docs/architecture/admin-api.md");
assert.match(adminDoc, /Sprint 19 Direct Negotiated Prices/);
assert.match(adminDoc, /POST \/negotiated-prices\/direct-save/);

const excelDoc = await readText("docs/architecture/negotiated-prices-excel-model.md");
assert.match(excelDoc, /Sprint 19 Direct Negotiated Prices/);
assert.match(excelDoc, /MISID/);

const sprintDoc = await readText("docs/sprints/sprint-19-direct-negotiated-prices.md");
assert.match(sprintDoc, /Calculer PJM/);
assert.match(sprintDoc, /Enregistrer/);
assert.match(sprintDoc, /MISID/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 19 direct negotiated prices checks passed.");
