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
  packageJson.scripts?.["test:sprint49"] ===
    "node scripts/test-sprint-49-pressero-composite-option-keys.mjs",
  "package.json should expose the Sprint 49 test script"
);

const pricingService = read("src/modules/pressero-pricing/presseroPricing.service.ts");
[
  "normalizeComparableParts",
  ".split(\":\")",
  "comparableMatches",
  "normalizeComparableParts(value).includes(normalizedCandidate)",
  "comparableMatches(key, value)",
  "comparableMatches(selectedOption.Key, value)"
].forEach((needle) => assertIncludes(pricingService, needle, "presseroPricing.service.ts"));

const sprintDoc = read("docs/sprints/sprint-49-pressero-composite-option-keys.md");
[
  "Sprint 49",
  "cles composees",
  "prefix:optionId",
  "Quantite d'exemplaires",
  "PJM"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

console.log("Sprint 49 Pressero composite option key checks passed.");
