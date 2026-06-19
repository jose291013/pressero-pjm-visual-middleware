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
  packageJson.scripts?.["test:sprint34"] ===
    "node scripts/test-sprint-34-media-zip-import-ux.mjs",
  "package.json should expose the Sprint 34 test script"
);

const html = read("src/public/admin/index.html");
assertIncludes(html, 'id="mediaForm"', "admin index.html");
assertIncludes(html, 'id="mediaZipImportButton" type="button"', "admin index.html");

const gitignore = read(".gitignore");
assertIncludes(gitignore, "src/public/media/assets/*", ".gitignore");
assertIncludes(gitignore, "!src/public/media/assets/.gitkeep", ".gitignore");

const adminJs = read("src/public/admin/admin.js");
[
  "async function importMediaZip(event)",
  "event?.preventDefault();",
  "event?.stopPropagation();",
  'formData.append("archive", file)',
  "renderMediaImportResult(response.data);",
  "resetMediaForm();",
  "await loadMediaAssets();",
  'els.mediaStatus.textContent = "Importe";',
  'els.mediaForm.addEventListener("submit", saveMediaAsset)',
  'els.mediaZipImportButton.addEventListener("click", importMediaZip)'
].forEach((needle) => assertIncludes(adminJs, needle, "admin.js"));

const sprintDoc = read("docs/sprints/sprint-34-media-zip-import-ux.md");
[
  "Sprint 34",
  "Import ZIP",
  "URL image obligatoire",
  "Mappings"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

const reference = read("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
[
  "PRESSERO / PJM VISUAL CALCULATOR V22.1",
  'select.dispatchEvent(new Event("change", { bubbles: true }))'
].forEach((needle) => assertIncludes(reference, needle, "V22.1 reference"));

console.log("Sprint 34 media ZIP import UX checks passed.");
