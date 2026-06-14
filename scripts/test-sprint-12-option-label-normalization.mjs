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
  "docs/sprints/sprint-12-option-label-normalization.md",
  "scripts/test-sprint-12-option-label-normalization.mjs",
  "src/modules/pjm-sync/pjmContracts.types.ts",
  "src/modules/pjm-sync/pjmSyncCatalog.service.ts",
  "src/public/admin/admin.js"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(
  packageJson.scripts["test:sprint12"],
  "node scripts/test-sprint-12-option-label-normalization.mjs"
);

const contracts = await readText("src/modules/pjm-sync/pjmContracts.types.ts");
assert.match(contracts, /Key\?:\s*string/);
assert.match(contracts, /key\?:\s*string/);
assert.match(contracts, /DisplayName\?:\s*string/);
assert.match(contracts, /engineOptions\?:\s*PjmEngineOptionResponse\[\]/);

const catalogService = await readText("src/modules/pjm-sync/pjmSyncCatalog.service.ts");
assert.match(catalogService, /function firstStringValue/);
assert.match(catalogService, /choice\.Key/);
assert.match(catalogService, /choice\.key/);
assert.match(catalogService, /choice\.DisplayName/);
assert.match(catalogService, /choice\.Value/);
assert.match(catalogService, /choice\.value/);
assert.match(catalogService, /normalizedName:\s*normalizeText\(choiceName\)/);
assert.match(catalogService, /value:\s*stringifyValue/);
assert.doesNotMatch(catalogService, /choice\.Name\s*\?\?\s*choice\.Label\s*\?\?\s*choice\.Text\s*\?\?\s*stringifyValue\(choice\.Value\)/);

const adminJs = await readText("src/public/admin/admin.js");
assert.match(adminJs, /choiceName:\s*choice\.choiceName\s*\|\|\s*choice\.name/);
assert.match(adminJs, /\$\{html\(choice\.choiceName\)\}/);
assert.match(adminJs, /data-choice-name="\$\{html\(choice\.choiceName\)\}"/);
assert.doesNotMatch(adminJs, /data-choice-name="\$\{html\(choice\.value\)\}"/);

const endpointsDoc = await readText("docs/architecture/pjm-endpoints.md");
assert.match(endpointsDoc, /PJM Choice Labels/);
assert.match(endpointsDoc, /`Key`/);

const adminDoc = await readText("docs/architecture/admin-api.md");
assert.match(adminDoc, /Sprint 12 Option Labels/);
assert.match(adminDoc, /Pressero site dropdown/);

const sprintDoc = await readText("docs/sprints/sprint-12-option-label-normalization.md");
assert.match(sprintDoc, /choix lisibles/);
assert.match(sprintDoc, /relancer `Synchroniser PJM`/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 12 option label normalization checks passed.");
