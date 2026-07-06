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
  packageJson.scripts?.["test:sprint52"] ===
    "node scripts/test-sprint-52-filter-incompatible-options.mjs",
  "package.json should expose the Sprint 52 test script"
);

const contracts = read("src/modules/pjm-sync/pjmContracts.types.ts");
[
  "Suppress?: boolean",
  "Hidden?: boolean",
  "Disabled?: boolean",
  "Available?: boolean",
  "Visible?: boolean"
].forEach((needle) => assertIncludes(contracts, needle, "pjmContracts.types.ts"));

const service = read("src/modules/pressero-pricing/presseroPricing.service.ts");
[
  "readBooleanFlag",
  "pjmEntityIsUnavailable",
  "\"Suppress\"",
  "\"IsAvailable\"",
  "return choices.filter((choice) => !pjmEntityIsUnavailable(choice))",
  "return options.filter((option) => !pjmEntityIsUnavailable(option))"
].forEach((needle) => assertIncludes(service, needle, "presseroPricing.service.ts"));

const sprintDoc = read("docs/sprints/sprint-52-filter-incompatible-options.md");
[
  "Sprint 52",
  "Suppress",
  "Hidden",
  "Disabled",
  "Available",
  "Pressero",
  "incompatibles"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

const overview = read("docs/architecture/middleware-overview.md");
[
  "Sprint 52 Filter Incompatible Options",
  "Suppress",
  "Available=false"
].forEach((needle) => assertIncludes(overview, needle, "architecture overview"));

console.log("Sprint 52 filter incompatible options checks passed.");
