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
  "docs/sprints/sprint-32-media-zip-import.md",
  "scripts/test-sprint-32-media-zip-import.mjs",
  "src/public/media/assets/.gitkeep",
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
  packageJson.scripts["test:sprint32"],
  "node scripts/test-sprint-32-media-zip-import.mjs"
);
assert.ok(packageJson.dependencies["adm-zip"], "adm-zip dependency is required.");
assert.ok(packageJson.dependencies.multer, "multer dependency is required.");
assert.ok(packageJson.devDependencies["@types/adm-zip"], "@types/adm-zip is required.");
assert.ok(packageJson.devDependencies["@types/multer"], "@types/multer is required.");

const envExample = await readText(".env.example");
assert.match(envExample, /MEDIA_ASSETS_DIR/);

const env = await readText("src/config/env.ts");
assert.match(env, /assetsDir/);
assert.match(env, /MEDIA_ASSETS_DIR/);
assert.match(env, /src", "public", "media", "assets"/);

const app = await readText("src/app.ts");
assert.match(app, /\/public\/media\/assets/);
assert.match(app, /express\.static\(env\.media\.assetsDir\)/);

const types = await readText("src/modules/media-library/mediaLibrary.types.ts");
assert.match(types, /MediaAssetZipImportItem/);
assert.match(types, /MediaAssetZipImportResult/);
assert.match(types, /"created" \| "updated" \| "skipped"/);

const service = await readText("src/modules/media-library/mediaLibrary.service.ts");
assert.match(service, /AdmZip/);
assert.match(service, /allowedImageExtensions/);
assert.match(service, /importMediaAssetsZip/);
assert.match(service, /readBaseNameWithoutExtension/);
assert.match(service, /publicMediaAssetsPath = "\/public\/media\/assets"/);
assert.match(service, /prisma\.mediaAsset\.upsert/);
assert.match(service, /writeFile\(targetPath, data\)/);
assert.match(service, /Doublon dans le ZIP/);

const controller = await readText("src/modules/media-library/mediaLibrary.controller.ts");
assert.match(controller, /status: "zip_import_library"/);
assert.match(controller, /postAdminMediaAssetsZip/);
assert.match(controller, /req\.file\?\.buffer/);

const routes = await readText("src/modules/media-library/mediaLibrary.routes.ts");
assert.match(routes, /multer/);
assert.match(routes, /memoryStorage/);
assert.match(routes, /fileSize: 25 \* 1024 \* 1024/);
assert.match(routes, /post\(\s*"\/admin\/assets\/import-zip"/);
assert.match(routes, /upload\.single\("archive"\)/);

const html = await readText("src/public/admin/index.html");
assert.match(html, /id="mediaZipFile"/);
assert.match(html, /id="mediaZipImportButton"/);
assert.match(html, /id="mediaImportResult"/);

const js = await readText("src/public/admin/admin.js");
assert.match(js, /importMediaZip/);
assert.match(js, /new FormData/);
assert.match(js, /formData\.append\("archive", file\)/);
assert.match(js, /\/media-library\/admin\/assets\/import-zip/);
assert.match(js, /renderMediaImportResult/);

const css = await readText("src/public/admin/admin.css");
assert.match(css, /\.media-import-box/);
assert.match(css, /\.media-import-result/);
assert.match(css, /\.media-import-item/);

const overview = await readText("docs/architecture/middleware-overview.md");
assert.match(overview, /Sprint 32 Media ZIP Import/);
assert.match(overview, /MEDIA_ASSETS_DIR/);

const visualModel = await readText("docs/architecture/visual-options-model.md");
assert.match(visualModel, /Sprint 32 ZIP Import And Matching Keys/);
assert.match(visualModel, /MediaAsset\.key/);

const sprintDoc = await readText("docs/sprints/sprint-32-media-zip-import.md");
assert.match(sprintDoc, /Render/);
assert.match(sprintDoc, /POST \/media-library\/admin\/assets\/import-zip/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 32 media ZIP import checks passed.");
