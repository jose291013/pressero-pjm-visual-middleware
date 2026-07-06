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
  packageJson.scripts?.["test:sprint51"] ===
    "node scripts/test-sprint-51-live-options-compatibility.mjs",
  "package.json should expose the Sprint 51 test script"
);

const service = read("src/modules/pressero-pricing/presseroPricing.service.ts");
[
  "buildPresseroOptionsForProduct(",
  "body: PresseroPricingRequestBody = {}",
  "client.getEngineOptions",
  "buildPresseroOptionsFromPjmResponse",
  "readPjmOptionChoices",
  "readPjmChoiceValue",
  "readPjmChoiceLabel"
].forEach((needle) => assertIncludes(service, needle, "presseroPricing.service.ts"));

const controller = read("src/modules/pressero-pricing/presseroPricing.controller.ts");
[
  "buildPresseroOptionsForProduct(productId, body)",
  "selectedOptionCount: requestSummary.selectedOptionCount"
].forEach((needle) => assertIncludes(controller, needle, "presseroPricing.controller.ts"));

const sprintDoc = read("docs/sprints/sprint-51-live-options-compatibility.md");
[
  "Sprint 51",
  "GetOptionsForProduct",
  "options",
  "incompatibilites",
  "Pressero"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

console.log("Sprint 51 live options compatibility checks passed.");
