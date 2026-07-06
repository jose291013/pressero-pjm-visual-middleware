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
  packageJson.scripts?.["test:sprint39"] ===
    "node scripts/test-sprint-39-pressero-json-pricing.mjs",
  "package.json should expose the Sprint 39 test script"
);

const types = read("src/modules/pressero-pricing/presseroPricing.types.ts");
[
  "PresseroPricingRequestBody",
  "pricingParameters",
  "Q1?: string | number | null",
  "PresseroPricingJsonResponse",
  "TotalPrice"
].forEach((needle) => assertIncludes(types, needle, "presseroPricing.types.ts"));

const service = read("src/modules/pressero-pricing/presseroPricing.service.ts");
[
  "getPresseroPricingModuleName",
  "readPresseroPricingQuantity",
  "buildDiagnosticPresseroPricingResponse",
  "buildDiagnosticPresseroPricingPayload",
  "diagnosticUnitPrice = 12.34"
].forEach((needle) => assertIncludes(service, needle, "presseroPricing.service.ts"));

const controller = read("src/modules/pressero-pricing/presseroPricing.controller.ts");
[
  "getPresseroPricingStatus",
  "postPresseroPricingJson",
  "debug",
  "json_diagnostic_pricing",
  "sprint: 39"
].forEach((needle) => assertIncludes(controller, needle, "presseroPricing.controller.ts"));

const routes = read("src/modules/pressero-pricing/presseroPricing.routes.ts");
[
  'post("/json"',
  "postPresseroPricingJson"
].forEach((needle) => assertIncludes(routes, needle, "presseroPricing.routes.ts"));

const app = read("src/app.ts");
[
  "presseroPricingRouter",
  'app.use("/pressero-pricing", presseroPricingRouter)'
].forEach((needle) => assertIncludes(app, needle, "app.ts"));

const sprintDoc = read("docs/sprints/sprint-39-pressero-json-pricing.md");
[
  "Sprint 39",
  "POST /pressero-pricing/json",
  "Q1",
  "12.34",
  "diagnostic"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

const overview = read("docs/architecture/middleware-overview.md");
assertIncludes(overview, "Sprint 39 Pressero JSON Pricing Diagnostic", "middleware overview");

console.log("Sprint 39 Pressero JSON pricing checks passed.");
