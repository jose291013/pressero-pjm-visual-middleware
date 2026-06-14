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
  "docs/sprints/sprint-11-negotiated-prices-admin-preview.md",
  "scripts/test-sprint-11-negotiated-prices-admin-preview.mjs",
  "src/public/admin/index.html",
  "src/public/admin/admin.css",
  "src/public/admin/admin.js"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(
  packageJson.scripts["test:sprint11"],
  "node scripts/test-sprint-11-negotiated-prices-admin-preview.mjs"
);

const html = await readText("src/public/admin/index.html");
assert.match(html, /data-view-link="catalog"/);
assert.match(html, /data-view-link="negotiated-prices"/);
assert.match(html, /id="catalogView"/);
assert.match(html, /id="negotiatedPricesView"/);
assert.match(html, /id="npClientId"/);
assert.match(html, /id="npOrganizationName"/);
assert.match(html, /id="npEngineSelect"/);
assert.match(html, /id="npPriceGroupSelect"/);
assert.match(html, /id="npQuantityTiers"/);
assert.match(html, /id="npOptionPicker"/);
assert.match(html, /id="npPreviewButton"/);
assert.match(html, /id="npCombinationCount"/);
assert.match(html, /id="npPreviewColumns"/);
assert.doesNotMatch(html, /download|xlsx|ExcelJS/);

const css = await readText("src/public/admin/admin.css");
assert.match(css, /\.admin-view/);
assert.match(css, /\.negotiated-layout/);
assert.match(css, /\.negotiated-form-panel/);
assert.match(css, /\.negotiated-options-panel/);
assert.match(css, /\.negotiated-preview-panel/);
assert.match(css, /\.choice-check/);
assert.match(css, /\.column-chip/);
assert.doesNotMatch(css, /border-radius:\s*(1[2-9]|[2-9]\d)px/);

const js = await readText("src/public/admin/admin.js");
assert.match(js, /setView/);
assert.match(js, /renderNegotiatedEngineSelect/);
assert.match(js, /loadNegotiatedEngine/);
assert.match(js, /renderNegotiatedPriceGroups/);
assert.match(js, /renderNegotiatedOptions/);
assert.match(js, /readNegotiatedSelections/);
assert.match(js, /buildPreviewPayload/);
assert.match(js, /previewNegotiatedPrices/);
assert.match(js, /\/negotiated-prices\/preview/);
assert.match(js, /method:\s*"POST"/);
assert.match(js, /\/pjm-sync\/admin\/price-engines\/\$\{encodeURIComponent\(engineId\)\}/);
assert.match(js, /data-option-pjm-key/);
assert.match(js, /Prix/);
assert.doesNotMatch(js, /ExcelJS|xlsx|download/);

const adminDoc = await readText("docs/architecture/admin-api.md");
assert.match(adminDoc, /Sprint 11 Negotiated Prices Preview/);
assert.match(adminDoc, /POST \/negotiated-prices\/preview/);

const sprintDoc = await readText("docs/sprints/sprint-11-negotiated-prices-admin-preview.md");
assert.match(sprintDoc, /Prix negocies/);
assert.match(sprintDoc, /Aucun modele Prisma/);
assert.match(sprintDoc, /absence de generation Excel prematuree/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 11 negotiated prices admin preview checks passed.");
