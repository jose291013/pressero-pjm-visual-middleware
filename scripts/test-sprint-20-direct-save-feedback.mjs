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
  "docs/sprints/sprint-20-direct-save-feedback.md",
  "scripts/test-sprint-20-direct-save-feedback.mjs",
  "src/public/admin/admin.css",
  "src/public/admin/admin.js",
  "src/public/admin/index.html"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(
  packageJson.scripts["test:sprint20"],
  "node scripts/test-sprint-20-direct-save-feedback.mjs"
);

const html = await readText("src/public/admin/index.html");
const resultIndex = html.indexOf('id="npMisIdResult"');
const footerIndex = html.indexOf('class="direct-price-footer"');
assert.ok(resultIndex > -1, "The direct save result container must exist.");
assert.ok(footerIndex > -1, "The direct save footer must exist.");
assert.ok(resultIndex < footerIndex, "The MISID result must be visible before the footer buttons.");

const css = await readText("src/public/admin/admin.css");
assert.match(css, /\.misid-result\s*\{/);
assert.match(css, /\.misid-result\.is-visible/);
assert.match(css, /\.misid-result\.is-error/);
assert.match(css, /background:\s*#f2fbf6/);
assert.match(css, /background:\s*#fff5f5/);

const js = await readText("src/public/admin/admin.js");
assert.match(js, /showDirectSaveMessage/);
assert.match(js, /clearDirectSaveMessage/);
assert.match(js, /scrollIntoView\(\{\s*block:\s*"nearest"\s*\}\)/);
assert.match(js, /Enregistrement effectue sans MISID retourne/);
assert.match(js, /showDirectSaveMessage\(`MISID: \$\{misId\}`\)/);
assert.match(js, /showDirectSaveMessage\(error\.message,\s*"error"\)/);
assert.match(js, /npDirectStatus\.textContent = "Enregistre"/);

const sprintDoc = await readText("docs/sprints/sprint-20-direct-save-feedback.md");
assert.match(sprintDoc, /MISID/);
assert.match(sprintDoc, /visible/);

const adminDoc = await readText("docs/architecture/admin-api.md");
assert.match(adminDoc, /Sprint 20 Direct Save Feedback/);

const negotiatedDoc = await readText("docs/architecture/negotiated-prices-excel-model.md");
assert.match(negotiatedDoc, /Sprint 20 Direct Save Feedback/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 20 direct save feedback checks passed.");
