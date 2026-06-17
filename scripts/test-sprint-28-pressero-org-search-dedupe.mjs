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
  "docs/sprints/sprint-28-pressero-org-search-dedupe.md",
  "scripts/test-sprint-28-pressero-org-search-dedupe.mjs",
  "src/public/admin/admin.js",
  "src/public/admin/index.html",
  "docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(
  packageJson.scripts["test:sprint28"],
  "node scripts/test-sprint-28-pressero-org-search-dedupe.mjs"
);

const html = await readText("src/public/admin/index.html");
assert.match(html, /list="pcOrganizationChoices"/);
assert.match(html, /<datalist id="pcOrganizationChoices">/);
assert.match(html, /id="pcOrganizationId"[^>]*readonly/);
assert.match(html, /Rechercher une organisation/);

const js = await readText("src/public/admin/admin.js");
assert.match(js, /presseroNegotiatedProfilesRequestId/);
assert.match(js, /renderPresseroOrganizationChoices/);
assert.match(js, /syncPresseroOrganizationFromName/);
assert.match(js, /findPresseroOrganization/);
assert.match(js, /seenProfileIds/);
assert.match(js, /requestId !== state\.presseroNegotiatedProfilesRequestId/);
assert.match(js, /field === els\.pcOrganizationName/);
assert.doesNotMatch(js, /els\.pcOrganizationId,\s*\n\s*els\.pcPriceGroupSelect/);

const overview = await readText("docs/architecture/middleware-overview.md");
assert.match(overview, /Sprint 28 Pressero Organization Search/);
assert.match(overview, /duplicate profiles/);

const sprintDoc = await readText("docs/sprints/sprint-28-pressero-org-search-dedupe.md");
assert.match(sprintDoc, /liste recherchable/);
assert.match(sprintDoc, /dedupliquee/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 28 Pressero organization search and dedupe checks passed.");
