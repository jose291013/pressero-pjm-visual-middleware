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
  packageJson.scripts?.["test:sprint55"] ===
    "node scripts/test-sprint-55-hide-neutral-only-and-parallel-probes.mjs",
  "package.json should expose the Sprint 55 test script"
);

const service = read("src/modules/pressero-pricing/presseroPricing.service.ts");
[
  "if (!acceptedValues.length)",
  "Promise.all(choices.map(async (choice) =>",
  "probedChoices.filter",
  "PJM rejected this candidate"
].forEach((needle) => assertIncludes(service, needle, "presseroPricing.service.ts"));

const visualScript = read("src/public/pressero/visual-configurator.js");
[
  "isNeutralChoice",
  "shouldHideVisualOption",
  "\"aucun\"",
  "\"--select--\"",
  "markNativeField(field);",
  "return null;"
].forEach((needle) => assertIncludes(visualScript, needle, "visual-configurator.js"));

const sprintDoc = read("docs/sprints/sprint-55-hide-neutral-only-and-parallel-probes.md");
[
  "Sprint 55",
  "Aucun",
  "Pelliculage",
  "Promise.all",
  "temps"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

const overview = read("docs/architecture/middleware-overview.md");
[
  "Sprint 55 Neutral-Only Visual Groups And Faster Probes",
  "neutral",
  "parallel"
].forEach((needle) => assertIncludes(overview, needle, "architecture overview"));

console.log("Sprint 55 neutral-only visual groups and parallel probes checks passed.");
