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
  packageJson.scripts?.["test:sprint41"] ===
    "node scripts/test-sprint-41-pressero-pricing-render-diagnostics.mjs",
  "package.json should expose the Sprint 41 test script"
);

const service = read("src/modules/pressero-pricing/presseroPricing.service.ts");
[
  "describePresseroPricingRequest",
  "bodyKeys: Object.keys(body)",
  "queryKeys: Object.keys(query)",
  "pricingParameterKeys: Object.keys(parameters)",
  "selectedOptionCount: selectedOptions.length"
].forEach((needle) => assertIncludes(service, needle, "presseroPricing.service.ts"));

const controller = read("src/modules/pressero-pricing/presseroPricing.controller.ts");
[
  "logPresseroPricingEvent",
  "[pressero-pricing]",
  "request",
  "options-response",
  "options-error",
  "price-response"
].forEach((needle) => assertIncludes(controller, needle, "presseroPricing.controller.ts"));

const sprintDoc = read("docs/sprints/sprint-41-pressero-pricing-render-diagnostics.md");
[
  "Sprint 41",
  "Render",
  "pressero-pricing",
  "mode",
  "productId"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

console.log("Sprint 41 Pressero pricing Render diagnostics checks passed.");
