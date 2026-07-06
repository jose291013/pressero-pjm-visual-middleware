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

function assertNotIncludes(content, needle, label) {
  assert(!content.includes(needle), `${label} should not include: ${needle}`);
}

const packageJson = JSON.parse(read("package.json"));
assert(
  packageJson.scripts?.["test:sprint50"] ===
    "node scripts/test-sprint-50-pjm-options-sanitize-flow.mjs",
  "package.json should expose the Sprint 50 test script"
);

const pricingService = read("src/modules/pressero-pricing/presseroPricing.service.ts");
[
  "function buildPjmEngineValues",
  "Key: option.Key",
  "Value: option.Value",
  "sanitizePjmEngineValuesAgainstOptions",
  "readPjmOptionsArray",
  "readPjmOptionChoices",
  "readPjmChoiceValue",
  "client.getEngineOptions",
  "client.getOptionsAndPrice",
  "pjm-live-flow"
].forEach((needle) => assertIncludes(pricingService, needle, "presseroPricing.service.ts"));

[
  "existingQuantity.Value = quantity",
  "Value: quantity",
  "readMinimumQuantityFromPjmError",
  "retryPrice"
].forEach((needle) => assertNotIncludes(pricingService, needle, "presseroPricing.service.ts"));

const sprintDoc = read("docs/sprints/sprint-50-pjm-options-sanitize-flow.md");
[
  "Sprint 50",
  "saas-orchestrator",
  "options",
  "optionsandprice",
  "sanitize",
  "Key",
  "Value"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

const overview = read("docs/architecture/middleware-overview.md");
[
  "Sprint 50 Pressero PJM Options Sanitize Flow",
  "options",
  "optionsandprice",
  "ne remplace plus"
].forEach((needle) => assertIncludes(overview, needle, "architecture overview"));

console.log("Sprint 50 PJM options sanitize flow checks passed.");
