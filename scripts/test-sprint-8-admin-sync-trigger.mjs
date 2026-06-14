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
  "docs/sprints/sprint-8-admin-sync-trigger.md",
  "scripts/test-sprint-8-admin-sync-trigger.mjs",
  "src/modules/pjm-sync/pjmSync.controller.ts",
  "src/modules/pjm-sync/pjmSync.routes.ts",
  "src/public/admin/index.html",
  "src/public/admin/admin.css",
  "src/public/admin/admin.js"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(
  packageJson.scripts["test:sprint8"],
  "node scripts/test-sprint-8-admin-sync-trigger.mjs"
);

const routes = await readText("src/modules/pjm-sync/pjmSync.routes.ts");
assert.match(routes, /pjmSyncRouter\.post\(["']\/admin\/sync["']/);
assert.match(routes, /postPjmSyncAdminCatalogSync/);

const controller = await readText("src/modules/pjm-sync/pjmSync.controller.ts");
assert.match(controller, /createPjmClientFromEnv/);
assert.match(controller, /syncPjmCatalog/);
assert.match(controller, /postPjmSyncAdminCatalogSync/);
assert.match(controller, /res\.status\(500\)\.json/);
assert.doesNotMatch(controller, /getOptionsAndPrice|optionsandprice/);

const server = await readText("src/server.ts");
assert.doesNotMatch(server, /syncPjmCatalog|createPjmClientFromEnv|productEngines\/list/);

const html = await readText("src/public/admin/index.html");
assert.match(html, /id="syncButton"/);
assert.match(html, /id="syncStatus"/);
assert.match(html, /Synchroniser PJM/);

const css = await readText("src/public/admin/admin.css");
assert.match(css, /\.topbar-actions/);
assert.match(css, /\.action-button/);
assert.match(css, /\.sync-status/);
assert.doesNotMatch(css, /border-radius:\s*(1[2-9]|[2-9]\d)px/);

const js = await readText("src/public/admin/admin.js");
assert.match(js, /\/pjm-sync\/admin\/sync/);
assert.match(js, /method:\s*["']POST["']/);
assert.match(js, /setSyncStatus/);
assert.match(js, /setBusyButtons/);
assert.match(js, /loadDashboard/);
assert.doesNotMatch(js, /syncPjmCatalog|createPjmClientFromEnv|optionsandprice|getOptionsAndPrice/);

const adminDoc = await readText("docs/architecture/admin-api.md");
assert.match(adminDoc, /POST \/pjm-sync\/admin\/sync/);
assert.match(adminDoc, /explicit/);

const endpointsDoc = await readText("docs/architecture/pjm-endpoints.md");
assert.match(endpointsDoc, /productEngines\/list/);
assert.match(endpointsDoc, /Sprint 8 Admin Trigger/);

const sprintDoc = await readText("docs/sprints/sprint-8-admin-sync-trigger.md");
assert.match(sprintDoc, /POST \/pjm-sync\/admin\/sync/);
assert.match(sprintDoc, /productEngines\/list/);
assert.match(sprintDoc, /Aucun modele Prisma/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 8 admin sync trigger checks passed.");
