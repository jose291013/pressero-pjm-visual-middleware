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
  packageJson.scripts?.["test:sprint36"] ===
    "node scripts/test-sprint-36-public-visual-config.mjs",
  "package.json should expose the Sprint 36 test script"
);

const types = read("src/modules/pressero-config/presseroConfig.types.ts");
[
  "PresseroVisualProductChoice",
  "PresseroVisualProductOption",
  "PresseroVisualProductConfig",
  "pricingMode: PresseroPricingMode",
  "image:"
].forEach((needle) => assertIncludes(types, needle, "presseroConfig.types.ts"));

const service = read("src/modules/pressero-config/presseroConfig.service.ts");
[
  "publicVisualConfigInclude",
  "getPublicPresseroVisualProductConfig",
  "buildPublicUrl",
  "serializeVisualOptions",
  "visualMapping",
  "mediaAsset",
  "pricingMode: config.pricingMode",
  "counts:"
].forEach((needle) => assertIncludes(service, needle, "presseroConfig.service.ts"));

const controller = read("src/modules/pressero-config/presseroConfig.controller.ts");
[
  'status: "public_visual_product_config"',
  "sprint: 36",
  "readPublicBaseUrl",
  "x-forwarded-proto",
  "getPublicPresseroVisualConfig"
].forEach((needle) => assertIncludes(controller, needle, "presseroConfig.controller.ts"));

const routes = read("src/modules/pressero-config/presseroConfig.routes.ts");
[
  '"/public/products/:misProductId/visual-config"',
  "getPublicPresseroVisualConfig"
].forEach((needle) => assertIncludes(routes, needle, "presseroConfig.routes.ts"));

const overview = read("docs/architecture/middleware-overview.md");
assertIncludes(overview, "Sprint 36 Public Visual Product Config", "middleware overview");

const visualModel = read("docs/architecture/visual-options-model.md");
assertIncludes(visualModel, "Sprint 36 Public Visual Config", "visual options model");

const sprintDoc = read("docs/sprints/sprint-36-public-visual-config.md");
[
  "Sprint 36",
  "GET /pressero-config/public/products/:misProductId/visual-config",
  "MIS Product ID",
  "PJM standard"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

const reference = read("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
[
  "PRESSERO / PJM VISUAL CALCULATOR V22.1",
  'select.dispatchEvent(new Event("change", { bubbles: true }))'
].forEach((needle) => assertIncludes(reference, needle, "V22.1 reference"));

console.log("Sprint 36 public visual config checks passed.");
