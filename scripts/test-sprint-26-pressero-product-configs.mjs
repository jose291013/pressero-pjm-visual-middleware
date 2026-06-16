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
  "docs/sprints/sprint-26-pressero-product-configs.md",
  "scripts/test-sprint-26-pressero-product-configs.mjs",
  "src/modules/pressero-config/presseroConfig.controller.ts",
  "src/modules/pressero-config/presseroConfig.routes.ts",
  "src/modules/pressero-config/presseroConfig.service.ts",
  "src/modules/pressero-config/presseroConfig.types.ts",
  "src/public/admin/admin.css",
  "src/public/admin/admin.js",
  "src/public/admin/index.html",
  "prisma/schema.prisma"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(
  packageJson.scripts["test:sprint26"],
  "node scripts/test-sprint-26-pressero-product-configs.mjs"
);

const schema = await readText("prisma/schema.prisma");
assert.match(schema, /enum PresseroPricingMode/);
assert.match(schema, /pjmLive/);
assert.match(schema, /negotiated/);
assert.match(schema, /model PresseroProductConfig/);
assert.match(schema, /misProductId\s+String\s+@unique/);
assert.match(schema, /negotiatedProfileId\s+String\?/);

const app = await readText("src/app.ts");
assert.match(app, /presseroConfigRouter/);
assert.match(app, /\/pressero-config/);

const types = await readText("src/modules/pressero-config/presseroConfig.types.ts");
assert.match(types, /PresseroPricingMode/);
assert.match(types, /PresseroProductConfigInput/);
assert.match(types, /PresseroProductConfigSummary/);

const service = await readText("src/modules/pressero-config/presseroConfig.service.ts");
assert.match(service, /listPresseroProductConfigs/);
assert.match(service, /createPresseroProductConfig/);
assert.match(service, /updatePresseroProductConfig/);
assert.match(service, /deletePresseroProductConfig/);
assert.match(service, /Le groupe de prix ne correspond pas au moteur PJM choisi/);
assert.match(service, /Le MISID negocie ne correspond pas au contexte Pressero/);

const controller = await readText("src/modules/pressero-config/presseroConfig.controller.ts");
assert.match(controller, /getPresseroConfigStatus/);
assert.match(controller, /postPresseroProductConfig/);
assert.match(controller, /putPresseroProductConfig/);
assert.match(controller, /deletePresseroProductConfigById/);

const routes = await readText("src/modules/pressero-config/presseroConfig.routes.ts");
assert.match(routes, /\/admin\/product-configs/);
assert.match(routes, /:configId/);

const html = await readText("src/public/admin/index.html");
assert.match(html, /Produits Pressero/);
assert.match(html, /MIS Product ID Pressero/);
assert.match(html, /id="pcPricingMode"/);
assert.match(html, /id="pcNegotiatedProfileSelect"/);

const js = await readText("src/public/admin/admin.js");
assert.match(js, /presseroConfigs:\s*\[\]/);
assert.match(js, /renderPresseroConfigs/);
assert.match(js, /loadPresseroNegotiatedProfiles/);
assert.match(js, /savePresseroConfig/);
assert.match(js, /\/pressero-config\/admin\/product-configs/);
assert.match(js, /\/negotiated-prices\/profiles/);

const css = await readText("src/public/admin/admin.css");
assert.match(css, /\.pressero-config-layout/);
assert.match(css, /\.pressero-config-item/);

const overview = await readText("docs/architecture/middleware-overview.md");
assert.match(overview, /Sprint 26 Pressero Product Configs/);
assert.match(overview, /MIS Product ID/);

const sprintDoc = await readText("docs/sprints/sprint-26-pressero-product-configs.md");
assert.match(sprintDoc, /PJM standard/);
assert.match(sprintDoc, /Prix negocie/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 26 Pressero product config checks passed.");
