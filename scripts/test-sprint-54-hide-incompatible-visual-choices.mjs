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
  packageJson.scripts?.["test:sprint54"] ===
    "node scripts/test-sprint-54-hide-incompatible-visual-choices.mjs",
  "package.json should expose the Sprint 54 test script"
);

const service = read("src/modules/pressero-pricing/presseroPricing.service.ts");
[
  "filterPjmOptionChoicesByProbe",
  "clonePjmOptionWithChoices",
  "[...acceptedValues, candidate]",
  "stillAccepted",
  "PJM rejected this candidate"
].forEach((needle) => assertIncludes(service, needle, "presseroPricing.service.ts"));

const visualScript = read("src/public/pressero/visual-configurator.js");
[
  "hasNativeChoice",
  "visibleChoicesForNativeField",
  "visibleChoicesForNativeField(field, option.choices)",
  "if (!grid.children.length)",
  "markNativeField(field)"
].forEach((needle) => assertIncludes(visualScript, needle, "visual-configurator.js"));

const sprintDoc = read("docs/sprints/sprint-54-hide-incompatible-visual-choices.md");
[
  "Sprint 54",
  "visual-config",
  "champ natif",
  "PJM",
  "incompatible"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

const overview = read("docs/architecture/middleware-overview.md");
[
  "Sprint 54 Hide Incompatible Visual Choices",
  "native Pressero select",
  "candidate"
].forEach((needle) => assertIncludes(overview, needle, "architecture overview"));

console.log("Sprint 54 hide incompatible visual choices checks passed.");
