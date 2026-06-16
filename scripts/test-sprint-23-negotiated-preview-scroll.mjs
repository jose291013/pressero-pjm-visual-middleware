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
  "docs/sprints/sprint-23-negotiated-preview-scroll.md",
  "scripts/test-sprint-23-negotiated-preview-scroll.mjs",
  "src/public/admin/admin.css"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(
  packageJson.scripts["test:sprint23"],
  "node scripts/test-sprint-23-negotiated-preview-scroll.mjs"
);

const css = await readText("src/public/admin/admin.css");
assert.match(css, /\.negotiated-preview-panel\s*\{[^}]*overflow-y:\s*auto/s);
assert.match(css, /\.negotiated-preview-panel\s*\{[^}]*overflow-x:\s*hidden/s);
assert.match(css, /\.negotiated-preview-panel \.preview-columns\s*\{[^}]*overflow:\s*visible/s);
assert.match(css, /\.negotiated-preview-panel \.preview-columns\s*\{[^}]*flex:\s*0 0 auto/s);
assert.match(css, /\.multi-combination-panel/);
assert.match(css, /\.direct-price-panel/);

const sprintDoc = await readText("docs/sprints/sprint-23-negotiated-preview-scroll.md");
assert.match(sprintDoc, /colonne droite/);
assert.match(sprintDoc, /scroll/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 23 negotiated preview scroll checks passed.");
