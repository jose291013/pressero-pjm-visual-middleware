import { existsSync, readFileSync } from "node:fs";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(path) {
  assert(existsSync(path), `Missing file: ${path}`);
  return readFileSync(path, "utf8");
}

function assertIncludes(content, needle, label) {
  assert(content.includes(needle), `${label} should include: ${needle}`);
}

const packageJson = JSON.parse(read("package.json"));
assert(
  packageJson.scripts?.["test:sprint37"] ===
    "node scripts/test-sprint-37-media-url-import.mjs",
  "package.json should expose the Sprint 37 test script"
);

const types = read("src/modules/media-library/mediaLibrary.types.ts");
[
  "MediaAssetUrlImportInput",
  "MediaAssetUrlImportResult",
  "baseUrl?: string",
  "files?: string[] | string"
].forEach((needle) => assertIncludes(types, needle, "mediaLibrary.types.ts"));

const service = read("src/modules/media-library/mediaLibrary.service.ts");
[
  "importMediaAssetsFromUrls",
  "normalizeBaseUrl",
  "buildExternalAssetUrl",
  "normalizeExternalFileName",
  "URL de base obligatoire.",
  "Liste de fichiers obligatoire.",
  "upsert"
].forEach((needle) => assertIncludes(service, needle, "mediaLibrary.service.ts"));

const controller = read("src/modules/media-library/mediaLibrary.controller.ts");
[
  'status: "zip_import_library"',
  "postAdminMediaAssetsUrlImport",
  "importMediaAssetsFromUrls"
].forEach((needle) => assertIncludes(controller, needle, "mediaLibrary.controller.ts"));

const routes = read("src/modules/media-library/mediaLibrary.routes.ts");
[
  '"/admin/assets/import-urls"',
  "postAdminMediaAssetsUrlImport"
].forEach((needle) => assertIncludes(routes, needle, "mediaLibrary.routes.ts"));

const adminHtml = read("src/public/admin/index.html");
[
  "Import Render Static",
  "mediaUrlBase",
  "mediaUrlFiles",
  "mediaUrlImportButton"
].forEach((needle) => assertIncludes(adminHtml, needle, "admin index"));

const adminJs = read("src/public/admin/admin.js");
[
  "mediaUrlBase",
  "mediaUrlFiles",
  "mediaUrlImportButton",
  "importMediaUrls",
  "/media-library/admin/assets/import-urls"
].forEach((needle) => assertIncludes(adminJs, needle, "admin js"));

const sprintDoc = read("docs/sprints/sprint-37-media-url-import.md");
[
  "Sprint 37",
  "Render Static",
  "POST /media-library/admin/assets/import-urls",
  "https://"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

const overview = read("docs/architecture/visual-options-model.md");
assertIncludes(overview, "Sprint 37 Media URL Import", "visual options model");

console.log("Sprint 37 media URL import checks passed.");
