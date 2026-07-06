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
  packageJson.scripts?.["test:sprint47"] ===
    "node scripts/test-sprint-47-pressero-free-quantity-option.mjs",
  "package.json should expose the Sprint 47 test script"
);

const pricingService = read("src/modules/pressero-pricing/presseroPricing.service.ts");
[
  "isFreeInputOption",
  "readSelectedQuantityValue",
  "readEffectivePjmQuantity",
  "selectedOptionMatchesConfigOption",
  "selectedQuantity.Value",
  "selectedQuantity ?? readPresseroPricingQuantity(body)",
  "if (!choices.length && !isFreeInputOption(option)) return null",
  "Options: choices"
].forEach((needle) => assertIncludes(pricingService, needle, "presseroPricing.service.ts"));

const sprintDoc = read("docs/sprints/sprint-47-pressero-free-quantity-option.md");
[
  "Sprint 47",
  "GetOptionsForProduct",
  "parametres libres",
  "Quantite d'exemplaires",
  "Options: []"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

console.log("Sprint 47 Pressero free quantity option checks passed.");
