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
  "docs/sprints/sprint-29-pjm-organizations.md",
  "scripts/test-sprint-29-pjm-organizations.mjs",
  "prisma/schema.prisma",
  "src/modules/pjm-sync/pjmClient.ts",
  "src/modules/pjm-sync/pjmContracts.types.ts",
  "src/modules/pjm-sync/pjmSyncCatalog.service.ts",
  "src/modules/pjm-sync/pjmSyncAdmin.service.ts",
  "src/public/admin/admin.js",
  "src/public/admin/index.html",
  "docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(
  packageJson.scripts["test:sprint29"],
  "node scripts/test-sprint-29-pjm-organizations.mjs"
);

const schema = await readText("prisma/schema.prisma");
assert.match(schema, /model PjmOrganization/);
assert.match(schema, /pjmId\s+String\s+@unique/);
assert.match(schema, /@@index\(\[name\]\)/);

const contracts = await readText("src/modules/pjm-sync/pjmContracts.types.ts");
assert.match(contracts, /PjmOrganizationListItemResponse/);
assert.match(contracts, /OrganizationIntegrationId/);
assert.match(contracts, /PjmOrganizationListResponse/);

const client = await readText("src/modules/pjm-sync/pjmClient.ts");
assert.match(client, /listOrganizations/);
assert.match(client, /\/public\/Organizations\/list/);

const catalog = await readText("src/modules/pjm-sync/pjmSyncCatalog.service.ts");
assert.match(catalog, /normalizePjmOrganizationsResponse/);
assert.match(catalog, /listOrganizations/);
assert.match(catalog, /pjmOrganization\.upsert/);
assert.match(catalog, /organizationsProcessed/);

const adminService = await readText("src/modules/pjm-sync/pjmSyncAdmin.service.ts");
assert.match(adminService, /pjmOrganization\.findMany/);
assert.match(adminService, /clientId:\s*organization\.pjmId/);

const html = await readText("src/public/admin/index.html");
assert.match(html, /list="npOrganizationChoices"/);
assert.match(html, /<datalist id="npOrganizationChoices">/);
assert.match(html, /id="npClientId"[^>]*readonly/);
assert.match(html, /list="pcOrganizationChoices"/);
assert.match(html, /id="pcOrganizationId"[^>]*readonly/);

const js = await readText("src/public/admin/admin.js");
assert.match(js, /renderNegotiatedOrganizationChoices/);
assert.match(js, /renderOrganizationChoices/);
assert.match(js, /syncNegotiatedOrganizationFromName/);
assert.match(js, /syncOrganizationFields/);
assert.match(js, /summarizeNegotiatedProfileOption/);
assert.match(js, /optionSummary/);
assert.match(js, /field === els\.npOrganizationName/);
assert.match(js, /seenProfileIds/);

const pjmDoc = await readText("docs/architecture/pjm-sync-model.md");
assert.match(pjmDoc, /Sprint 29 PJM Organizations/);
assert.match(pjmDoc, /Organizations\/list/);

const sprintDoc = await readText("docs/sprints/sprint-29-pjm-organizations.md");
assert.match(sprintDoc, /organisations PJM/);
assert.match(sprintDoc, /Prix negocies/);
assert.match(sprintDoc, /Produits Pressero/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 29 PJM organizations checks passed.");
