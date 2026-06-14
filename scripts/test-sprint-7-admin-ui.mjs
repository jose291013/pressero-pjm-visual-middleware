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
  "docs/sprints/sprint-7-admin-ui.md",
  "scripts/test-sprint-7-admin-ui.mjs",
  "src/public/admin/index.html",
  "src/public/admin/admin.css",
  "src/public/admin/admin.js"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(packageJson.scripts["test:sprint7"], "node scripts/test-sprint-7-admin-ui.mjs");

const app = await readText("src/app.ts");
assert.match(app, /app\.use\(["']\/public["'],\s*express\.static\(publicRoot\)\)/);
assert.match(app, /app\.get\(["']\/admin["']/);
assert.match(app, /res\.sendFile\(["']index\.html["']/);
assert.match(app, /root:\s*path\.join\(publicRoot,\s*["']admin["']\)/);

const html = await readText("src/public/admin/index.html");
assert.match(html, /<main class="main-panel">/);
assert.match(html, /id="refreshButton"/);
assert.match(html, /id="engineTableBody"/);
assert.match(html, /id="mappingList"/);
assert.match(html, /id="optionList"/);
assert.match(html, /\/public\/admin\/admin\.css/);
assert.match(html, /\/public\/admin\/admin\.js/);
assert.doesNotMatch(html, /landing|hero/i);

const css = await readText("src/public/admin/admin.css");
assert.match(css, /\.admin-shell/);
assert.match(css, /\.summary-grid/);
assert.match(css, /\.workspace/);
assert.match(css, /@media \(max-width: 680px\)/);
assert.doesNotMatch(css, /border-radius:\s*(1[2-9]|[2-9]\d)px/);
assert.doesNotMatch(css, /gradient|bokeh|orb/i);

const js = await readText("src/public/admin/admin.js");
const expectedApiCalls = [
  "/pjm-sync/admin/summary",
  "/pjm-sync/admin/price-engines",
  "/pjm-sync/admin/price-engines/${encodeURIComponent(engineId)}"
];

for (const expectedApiCall of expectedApiCalls) {
  assert.ok(js.includes(expectedApiCall), `Missing API call: ${expectedApiCall}`);
}

assert.match(js, /function html\(value/);
assert.match(js, /\.replace\(\//);
assert.match(js, /renderSummary/);
assert.match(js, /renderEngineRows/);
assert.match(js, /renderEngineDetail/);
assert.match(js, /loadDashboard/);
assert.doesNotMatch(js, /sync:pjm|syncPjmCatalog|createPjmClientFromEnv|optionsandprice|getOptionsAndPrice/);

const sprintDoc = await readText("docs/sprints/sprint-7-admin-ui.md");
assert.match(sprintDoc, /GET \/admin/);
assert.match(sprintDoc, /Aucun modele Prisma/);
assert.match(sprintDoc, /http:\/\/localhost:3000\/admin/);

const adminDoc = await readText("docs/architecture/admin-api.md");
assert.match(adminDoc, /Sprint 7 UI/);
assert.match(adminDoc, /GET \/admin/);
assert.match(adminDoc, /does not trigger synchronization/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /Options_1_Value/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 7 admin UI checks passed.");
