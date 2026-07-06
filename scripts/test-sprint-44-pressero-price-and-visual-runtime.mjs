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
  packageJson.scripts?.["test:sprint44"] ===
    "node scripts/test-sprint-44-pressero-price-and-visual-runtime.mjs",
  "package.json should expose the Sprint 44 test script"
);

const pricingTypes = read("src/modules/pressero-pricing/presseroPricing.types.ts");
[
  "source?: \"diagnostic\" | \"pjmLive\" | \"negotiated\"",
  "Error?: string | null"
].forEach((needle) => assertIncludes(pricingTypes, needle, "presseroPricing.types.ts"));

const pricingService = read("src/modules/pressero-pricing/presseroPricing.service.ts");
[
  "buildPresseroPricingResponse",
  "calculatePjmLivePrice",
  "calculateNegotiatedPrice",
  "interpolateTierPrice",
  "getOptionsAndPrice",
  "buildPjmEngineValues",
  "source: \"negotiated\"",
  "source: \"pjmLive\""
].forEach((needle) => assertIncludes(pricingService, needle, "presseroPricing.service.ts"));

const pricingController = read("src/modules/pressero-pricing/presseroPricing.controller.ts");
[
  "buildPresseroPricingResponse",
  "source: pricing.source",
  "error: pricing.Error"
].forEach((needle) => assertIncludes(pricingController, needle, "presseroPricing.controller.ts"));

const configTypes = read("src/modules/pressero-config/presseroConfig.types.ts");
assertIncludes(configTypes, "pricingMode: PresseroPricingMode", "presseroConfig.types.ts");

const configService = read("src/modules/pressero-config/presseroConfig.service.ts");
assertIncludes(configService, "pricingMode: config.pricingMode", "presseroConfig.service.ts");

const visualScript = read("src/public/pressero/visual-configurator.js");
[
  "PresseroPjmVisualConfig",
  "data-mis-product-id",
  "/pressero-config/public/products/",
  "findNativeField",
  "setNativeValue",
  "dispatchEvent(new Event(\"change\"",
  "ppv-choice",
  "image.url"
].forEach((needle) => assertIncludes(visualScript, needle, "visual-configurator.js"));

const sprintDoc = read("docs/sprints/sprint-44-pressero-price-and-visual-runtime.md");
[
  "Sprint 44",
  "pjmLive",
  "negotiated",
  "visual-configurator.js",
  "change"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

console.log("Sprint 44 Pressero price and visual runtime checks passed.");
