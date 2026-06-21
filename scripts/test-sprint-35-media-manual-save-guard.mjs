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
  packageJson.scripts?.["test:sprint35"] ===
    "node scripts/test-sprint-35-media-manual-save-guard.mjs",
  "package.json should expose the Sprint 35 test script"
);

const html = read("src/public/admin/index.html");
assertIncludes(html, 'id="mediaSaveButton"', "admin index.html");
assertIncludes(html, "Enregistrer URL", "admin index.html");

const adminJs = read("src/public/admin/admin.js");
const saveMediaAssetBlock = adminJs.slice(
  adminJs.indexOf("async function saveMediaAsset"),
  adminJs.indexOf("function renderMediaImportResult")
);
[
  "if (!assetId && !els.mediaUrl.value.trim())",
  "Les images importees par ZIP sont deja enregistrees.",
  "await loadMediaAssets();",
  'els.mediaImportResult.classList.add("is-visible", "is-error");',
  "els.mediaImportResult.textContent = error.message;"
].forEach((needle) => assertIncludes(adminJs, needle, "admin.js"));

assert(
  !saveMediaAssetBlock.includes("mediaAssetList.innerHTML"),
  "manual save errors should not replace the media asset list"
);

const sprintDoc = read("docs/sprints/sprint-35-media-manual-save-guard.md");
[
  "Sprint 35",
  "Enregistrer URL",
  "import ZIP",
  "URL image obligatoire"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

const reference = read("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
[
  "PRESSERO / PJM VISUAL CALCULATOR V22.1",
  'select.dispatchEvent(new Event("change", { bubbles: true }))'
].forEach((needle) => assertIncludes(reference, needle, "V22.1 reference"));

console.log("Sprint 35 media manual save guard checks passed.");
