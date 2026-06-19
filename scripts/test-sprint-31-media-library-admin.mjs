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
  "docs/sprints/sprint-31-media-library-admin.md",
  "scripts/test-sprint-31-media-library-admin.mjs",
  "src/app.ts",
  "src/modules/media-library/mediaLibrary.controller.ts",
  "src/modules/media-library/mediaLibrary.routes.ts",
  "src/modules/media-library/mediaLibrary.service.ts",
  "src/modules/media-library/mediaLibrary.types.ts",
  "src/public/admin/index.html",
  "src/public/admin/admin.js",
  "src/public/admin/admin.css",
  "docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(
  packageJson.scripts["test:sprint31"],
  "node scripts/test-sprint-31-media-library-admin.mjs"
);

const app = await readText("src/app.ts");
assert.match(app, /mediaLibraryRouter/);
assert.match(app, /app\.use\("\/media-library", mediaLibraryRouter\)/);

const types = await readText("src/modules/media-library/mediaLibrary.types.ts");
assert.match(types, /MediaLibraryModuleStatus = "admin_library" \| "zip_import_library"/);
assert.match(types, /export type MediaAssetInput/);
assert.match(types, /export type MediaAssetSummary/);

const service = await readText("src/modules/media-library/mediaLibrary.service.ts");
assert.match(service, /normalizeMediaKey/);
assert.match(service, /inferMimeType/);
assert.match(service, /listMediaAssets/);
assert.match(service, /createMediaAsset/);
assert.match(service, /updateMediaAsset/);
assert.match(service, /deleteMediaAsset/);
assert.match(service, /visualOptionMapping\.count/);
assert.match(service, /Cette image est associee/);

const controller = await readText("src/modules/media-library/mediaLibrary.controller.ts");
assert.match(controller, /status: "zip_import_library"/);
assert.match(controller, /getAdminMediaAssets/);
assert.match(controller, /postAdminMediaAsset/);
assert.match(controller, /putAdminMediaAsset/);
assert.match(controller, /deleteAdminMediaAsset/);

const routes = await readText("src/modules/media-library/mediaLibrary.routes.ts");
assert.match(routes, /get\("\/admin\/assets"/);
assert.match(routes, /post\("\/admin\/assets"/);
assert.match(routes, /put\("\/admin\/assets\/:assetId"/);
assert.match(routes, /delete\("\/admin\/assets\/:assetId"/);

const html = await readText("src/public/admin/index.html");
assert.match(html, /data-view-link="images"/);
assert.match(html, /id="imagesView"/);
assert.match(html, /id="mediaForm"/);
assert.match(html, /id="mediaAssetList"/);
assert.match(html, /id="mediaSearch"/);

const js = await readText("src/public/admin/admin.js");
assert.match(js, /mediaAssets: \[\]/);
assert.match(js, /loadMediaAssets/);
assert.match(js, /renderMediaAssets/);
assert.match(js, /saveMediaAsset/);
assert.match(js, /deleteMediaAssetById/);
assert.match(js, /\/media-library\/admin\/assets/);
assert.match(js, /images: "Images"/);

const css = await readText("src/public/admin/admin.css");
assert.match(css, /\.media-library-layout/);
assert.match(css, /\.media-asset-item/);
assert.match(css, /\.media-thumb img/);

const overview = await readText("docs/architecture/middleware-overview.md");
assert.match(overview, /Sprint 31 Media Library Admin/);

const visualModel = await readText("docs/architecture/visual-options-model.md");
assert.match(visualModel, /MediaAsset\.id/);
assert.match(visualModel, /Deletion is blocked/);

const sprintDoc = await readText("docs/sprints/sprint-31-media-library-admin.md");
assert.match(sprintDoc, /bibliotheque/i);
assert.match(sprintDoc, /GET    \/media-library\/admin\/assets/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 31 media library admin checks passed.");
