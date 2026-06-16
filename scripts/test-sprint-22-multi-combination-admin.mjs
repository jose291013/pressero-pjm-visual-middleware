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
  "docs/sprints/sprint-22-multi-combination-admin.md",
  "scripts/test-sprint-22-multi-combination-admin.mjs",
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
  packageJson.scripts["test:sprint22"],
  "node scripts/test-sprint-22-multi-combination-admin.mjs"
);

const types = await readText("src/modules/negotiated-prices/negotiatedPrices.types.ts");
assert.match(types, /NegotiatedPriceMultiCombinationInput/);
assert.match(types, /NegotiatedPriceMultiSaveInput/);
assert.match(types, /NegotiatedPriceMultiSaveResult/);
assert.match(types, /combinationsSaved:\s*number/);

const service = await readText("src/modules/negotiated-prices/negotiatedPrices.service.ts");
assert.match(service, /saveMultiNegotiatedPrices/);
assert.match(service, /profileMode:\s*"multi"/);
assert.match(service, /visibilityMode:\s*readVisibilityMode/);
assert.match(service, /negotiatedPriceCombination\.create/);
assert.match(service, /Une meme combinaison ne peut pas etre ajoutee deux fois/);
assert.match(service, /Toutes les combinaisons doivent partager le meme moteur PJM/);
assert.match(service, /Toutes les combinaisons doivent partager les memes paliers/);
assert.match(service, /Toutes les combinaisons doivent partager la meme base de calcul/);

const controller = await readText("src/modules/negotiated-prices/negotiatedPrices.controller.ts");
assert.match(controller, /postNegotiatedPricesMultiSave/);
assert.match(controller, /readMultiSaveInput/);

const routes = await readText("src/modules/negotiated-prices/negotiatedPrices.routes.ts");
assert.match(routes, /\/multi-save/);

const html = await readText("src/public/admin/index.html");
assert.match(html, /id="npProfileMode"/);
assert.match(html, /id="npVisibilityMode"/);
assert.match(html, /id="npAddCombinationButton"/);
assert.match(html, /id="npMultiSaveButton"/);
assert.match(html, /Combinaisons MIS ID/);

const js = await readText("src/public/admin/admin.js");
assert.match(js, /multiCombinations:\s*\[\]/);
assert.match(js, /addCurrentCombinationToMulti/);
assert.match(js, /saveMultiCombinations/);
assert.match(js, /\/negotiated-prices\/multi-save/);
assert.match(js, /buildMultiSavePayload/);
assert.match(js, /clearMultiCombinations/);

const css = await readText("src/public/admin/admin.css");
assert.match(css, /\.multi-combination-panel/);
assert.match(css, /\.multi-combination-item/);
assert.match(css, /\.multi-remove-button/);

const adminDoc = await readText("docs/architecture/admin-api.md");
assert.match(adminDoc, /Sprint 22 Multi-Combination Admin/);
assert.match(adminDoc, /POST \/negotiated-prices\/multi-save/);

const negotiatedDoc = await readText("docs/architecture/negotiated-prices-excel-model.md");
assert.match(negotiatedDoc, /Sprint 22 Multi-Combination Admin/);
assert.match(negotiatedDoc, /liste blanche/);

const sprintDoc = await readText("docs/sprints/sprint-22-multi-combination-admin.md");
assert.match(sprintDoc, /Creer multi-combinaison/);
assert.match(sprintDoc, /Options cote client/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 22 multi-combination admin checks passed.");
