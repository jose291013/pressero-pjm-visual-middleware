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
  packageJson.scripts?.["test:sprint38"] ===
    "node scripts/test-sprint-38-media-github-import.mjs",
  "package.json should expose the Sprint 38 test script"
);

const types = read("src/modules/media-library/mediaLibrary.types.ts");
[
  "MediaAssetGithubImportInput",
  "MediaAssetGithubImportResult",
  "repository?: string",
  "scanned: number"
].forEach((needle) => assertIncludes(types, needle, "mediaLibrary.types.ts"));

const service = read("src/modules/media-library/mediaLibrary.service.ts");
[
  "importMediaAssetsFromGithub",
  "listGithubImageFiles",
  "buildGithubContentsUrl",
  "api.github.com/repos",
  "application/vnd.github+json",
  "Aucune image compatible trouvee"
].forEach((needle) => assertIncludes(service, needle, "mediaLibrary.service.ts"));

const controller = read("src/modules/media-library/mediaLibrary.controller.ts");
[
  "postAdminMediaAssetsGithubImport",
  "importMediaAssetsFromGithub"
].forEach((needle) => assertIncludes(controller, needle, "mediaLibrary.controller.ts"));

const routes = read("src/modules/media-library/mediaLibrary.routes.ts");
[
  '"/admin/assets/import-github"',
  "postAdminMediaAssetsGithubImport"
].forEach((needle) => assertIncludes(routes, needle, "mediaLibrary.routes.ts"));

const adminHtml = read("src/public/admin/index.html");
[
  "Depot GitHub",
  "mediaGithubRepository",
  "mediaGithubBranch",
  "mediaGithubDirectory",
  "mediaGithubImportButton",
  "Scanner GitHub et importer"
].forEach((needle) => assertIncludes(adminHtml, needle, "admin index"));

const adminJs = read("src/public/admin/admin.js");
[
  "mediaGithubRepository",
  "mediaGithubBranch",
  "mediaGithubDirectory",
  "mediaGithubImportButton",
  "importMediaGithub",
  "/media-library/admin/assets/import-github"
].forEach((needle) => assertIncludes(adminJs, needle, "admin js"));

const sprintDoc = read("docs/sprints/sprint-38-media-github-import.md");
[
  "Sprint 38",
  "GitHub",
  "POST /media-library/admin/assets/import-github",
  "Render Static"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

const visualModel = read("docs/architecture/visual-options-model.md");
assertIncludes(visualModel, "Sprint 38 Media GitHub Import", "visual options model");

console.log("Sprint 38 media GitHub import checks passed.");
