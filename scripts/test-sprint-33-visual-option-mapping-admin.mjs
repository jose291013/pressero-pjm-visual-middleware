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
  packageJson.scripts?.["test:sprint33"] ===
    "node scripts/test-sprint-33-visual-option-mapping-admin.mjs",
  "package.json should expose the Sprint 33 test script"
);

const app = read("src/app.ts");
assertIncludes(app, "visualOptionsRouter", "app.ts");
assertIncludes(app, 'app.use("/visual-options", visualOptionsRouter);', "app.ts");

const types = read("src/modules/visual-options/visualOptions.types.ts");
[
  'VisualOptionsModuleStatus = "mapping_admin"',
  "VisualOptionChoiceMappingRow",
  "VisualOptionEngineMappingSummary",
  "VisualOptionMappingImportResult",
  "VisualOptionMappingWorkbookExport"
].forEach((needle) => assertIncludes(types, needle, "visualOptions.types.ts"));

const service = read("src/modules/visual-options/visualOptions.service.ts");
[
  'import ExcelJS from "exceljs"',
  "buildVisualOptionMappingSummary",
  "buildVisualOptionMappingWorkbookExport",
  "importVisualOptionMappingWorkbook",
  "autoMatchVisualOptionMappings",
  "normalizeMediaKey",
  "prisma.visualOptionMapping.upsert",
  "Cle image a associer"
].forEach((needle) => assertIncludes(service, needle, "visualOptions.service.ts"));

const controller = read("src/modules/visual-options/visualOptions.controller.ts");
[
  'status: "mapping_admin"',
  "sprint: 33",
  "getAdminEngineVisualOptions",
  "postAdminEngineVisualAutoMatch",
  "getAdminEngineVisualMappingExport",
  "postAdminEngineVisualMappingImport"
].forEach((needle) => assertIncludes(controller, needle, "visualOptions.controller.ts"));

const routes = read("src/modules/visual-options/visualOptions.routes.ts");
[
  'from "multer"',
  '"/admin/engines/:engineId/options"',
  '"/admin/engines/:engineId/auto-match"',
  '"/admin/engines/:engineId/export"',
  '"/admin/engines/:engineId/import"',
  'upload.single("workbook")'
].forEach((needle) => assertIncludes(routes, needle, "visualOptions.routes.ts"));

const html = read("src/public/admin/index.html");
[
  'data-view-link="mappings"',
  'id="mappingsView"',
  'id="vmEngineSelect"',
  'id="vmAutoMatchButton"',
  'id="vmExportButton"',
  'id="vmImportFile"',
  'id="vmMappingList"'
].forEach((needle) => assertIncludes(html, needle, "admin index.html"));

const adminJs = read("src/public/admin/admin.js");
[
  "visualMappingSummary",
  "renderVisualMappingEngineSelect",
  "loadVisualMappings",
  "autoMatchVisualMappings",
  "exportVisualMappings",
  "importVisualMappings",
  "/visual-options/admin/engines/"
].forEach((needle) => assertIncludes(adminJs, needle, "admin.js"));

const css = read("src/public/admin/admin.css");
[
  ".visual-mapping-layout",
  ".visual-mapping-item",
  ".visual-mapping-thumb",
  ".mapping-status"
].forEach((needle) => assertIncludes(css, needle, "admin.css"));

const sprintDoc = read("docs/sprints/sprint-33-visual-option-mapping-admin.md");
[
  "Sprint 33",
  "GET /visual-options/admin/engines/:engineId/options",
  "POST /visual-options/admin/engines/:engineId/import",
  "VisualOptionMapping"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

const visualModel = read("docs/architecture/visual-options-model.md");
assertIncludes(visualModel, "Sprint 33 Visual Mapping Admin", "visual options model doc");

const overview = read("docs/architecture/middleware-overview.md");
assertIncludes(overview, "Sprint 33 Visual Option Mapping", "middleware overview doc");

const reference = read("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
[
  "PRESSERO / PJM VISUAL CALCULATOR V22.1",
  "vrais champs Pressero/PJM",
  'select.dispatchEvent(new Event("change", { bubbles: true }))'
].forEach((needle) => assertIncludes(reference, needle, "V22.1 reference"));

console.log("Sprint 33 visual option mapping admin checks passed.");
