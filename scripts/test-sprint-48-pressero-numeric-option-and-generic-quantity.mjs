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
  packageJson.scripts?.["test:sprint48"] ===
    "node scripts/test-sprint-48-pressero-numeric-option-and-generic-quantity.mjs",
  "package.json should expose the Sprint 48 test script"
);

const pricingService = read("src/modules/pressero-pricing/presseroPricing.service.ts");
[
  "\"number\"",
  "\"boolean\"",
  "Value: String(value)"
].forEach((needle) => assertIncludes(pricingService, needle, "presseroPricing.service.ts"));

const visualScript = read("src/public/pressero/visual-configurator.js");
[
  "ppv-generic-quantity-hidden",
  "hideGenericQuantityField",
  "hasPjmQuantityField",
  "label === \"quantity\"",
  "label !== \"quantity\""
].forEach((needle) => assertIncludes(visualScript, needle, "visual-configurator.js"));

const sprintDoc = read("docs/sprints/sprint-48-pressero-numeric-option-and-generic-quantity.md");
[
  "Sprint 48",
  "valeur numerique",
  "Quantity generique",
  "Quantite d'exemplaires"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

console.log("Sprint 48 Pressero numeric option and generic quantity checks passed.");
