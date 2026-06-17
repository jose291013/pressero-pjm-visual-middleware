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
  "docs/sprints/sprint-9-admin-catalog-organization.md",
  "scripts/test-sprint-9-admin-catalog-organization.mjs",
  "src/modules/pjm-sync/pjmSyncAdmin.service.ts",
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
  packageJson.scripts["test:sprint9"],
  "node scripts/test-sprint-9-admin-catalog-organization.mjs"
);

const syncTypes = await readText("src/modules/pjm-sync/pjmSync.types.ts");
assert.match(syncTypes, /productCategories:\s*number/);

const adminService = await readText("src/modules/pjm-sync/pjmSyncAdmin.service.ts");
assert.match(adminService, /prisma\.pjmProductCategory\.count\(\)/);
assert.match(adminService, /listPjmSyncAdminOrganizations/);
assert.match(adminService, /prisma\.pjmOrganization\.findMany/);
assert.match(adminService, /clientId:\s*organization\.pjmId/);

const controller = await readText("src/modules/pjm-sync/pjmSync.controller.ts");
assert.match(controller, /getPjmSyncAdminOrganizations/);
assert.match(controller, /listPjmSyncAdminOrganizationsFromStore/);

const routes = await readText("src/modules/pjm-sync/pjmSync.routes.ts");
assert.match(routes, /pjmSyncRouter\.get\(["']\/admin\/organizations["']/);

const html = await readText("src/public/admin/index.html");
assert.match(html, /id="metricEngines"/);
assert.match(html, /id="metricGroups"/);
assert.match(html, /id="metricCategories"/);
assert.doesNotMatch(html, /id="metricMappings"|id="metricChoices"/);
assert.match(html, /id="organizationFilter"/);
assert.match(html, /id="categoryFilter"/);
assert.match(html, /id="priceGroupFilter"/);
assert.match(html, /id="engineSearch"/);
assert.match(html, /id="engineCountLabel"/);

const css = await readText("src/public/admin/admin.css");
assert.match(css, /body\s*\{[^}]*height:\s*100vh/s);
assert.match(css, /body\s*\{[^}]*overflow:\s*hidden/s);
assert.match(css, /\.main-panel\s*\{[^}]*overflow:\s*hidden/s);
assert.match(css, /\.workspace\s*\{[^}]*min-height:\s*0/s);
assert.match(css, /\.table-wrap\s*\{[^}]*overflow:\s*auto/s);
assert.match(css, /\.detail-panel\s*\{[^}]*overflow-y:\s*auto/s);
assert.match(css, /\.filter-bar/);
assert.doesNotMatch(css, /border-radius:\s*(1[2-9]|[2-9]\d)px/);

const js = await readText("src/public/admin/admin.js");
assert.match(js, /\/pjm-sync\/admin\/organizations/);
assert.match(js, /metricCategories/);
assert.match(js, /renderFilters/);
assert.match(js, /organizationFilter/);
assert.match(js, /categoryFilter/);
assert.match(js, /priceGroupFilter/);
assert.match(js, /engineMatchesFilters/);
assert.match(js, /applyFilters/);
assert.doesNotMatch(js, /optionsandprice|getOptionsAndPrice/);

const adminDoc = await readText("docs/architecture/admin-api.md");
assert.match(adminDoc, /GET \/pjm-sync\/admin\/organizations/);
assert.match(adminDoc, /Sprint 9 Catalog Organization/);

const endpointsDoc = await readText("docs/architecture/pjm-endpoints.md");
assert.match(endpointsDoc, /Total/);
assert.match(endpointsDoc, /Data/);
assert.match(endpointsDoc, /no product category field/);

const sprintDoc = await readText("docs/sprints/sprint-9-admin-catalog-organization.md");
assert.match(sprintDoc, /Organisation/);
assert.match(sprintDoc, /Aucun modele Prisma/);
assert.match(sprintDoc, /productEngines\/list/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 9 admin catalog organization checks passed.");
