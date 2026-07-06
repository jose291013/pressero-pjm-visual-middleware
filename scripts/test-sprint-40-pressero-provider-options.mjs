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
  packageJson.scripts?.["test:sprint40"] ===
    "node scripts/test-sprint-40-pressero-provider-options.mjs",
  "package.json should expose the Sprint 40 test script"
);

const types = read("src/modules/pressero-pricing/presseroPricing.types.ts");
[
  "PresseroPricingParameter",
  "PresseroPricingParameterOption",
  "ID: string",
  "Label: string",
  "Options: PresseroPricingParameterOption[]",
  "productID?: string"
].forEach((needle) => assertIncludes(types, needle, "presseroPricing.types.ts"));

const service = read("src/modules/pressero-pricing/presseroPricing.service.ts");
[
  "readPresseroProductId",
  "readPresseroProviderMode",
  "buildPresseroOptionsForProduct",
  "misProductId: productId",
  "Key: choice.name",
  "Value: choice.value || choice.pjmId"
].forEach((needle) => assertIncludes(service, needle, "presseroPricing.service.ts"));

const controller = read("src/modules/pressero-pricing/presseroPricing.controller.ts");
[
  "getPresseroOptionsForProduct",
  "json_provider",
  "sprint: 40",
  "Pressero doit envoyer productID"
].forEach((needle) => assertIncludes(controller, needle, "presseroPricing.controller.ts"));

const routes = read("src/modules/pressero-pricing/presseroPricing.routes.ts");
[
  'get("/json"',
  'post("/json"',
  '"/json/GetOptionsForProduct"',
  '"/json/GetPriceForProduct"'
].forEach((needle) => assertIncludes(routes, needle, "presseroPricing.routes.ts"));

const sprintDoc = read("docs/sprints/sprint-40-pressero-provider-options.md");
[
  "Sprint 40",
  "GetOptionsForProduct",
  "GetPriceForProduct",
  "PricingParameter",
  "MIS Product ID"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

console.log("Sprint 40 Pressero provider options checks passed.");
