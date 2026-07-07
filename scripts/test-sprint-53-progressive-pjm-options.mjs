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
  packageJson.scripts?.["test:sprint53"] ===
    "node scripts/test-sprint-53-progressive-pjm-options.mjs",
  "package.json should expose the Sprint 53 test script"
);

const service = read("src/modules/pressero-pricing/presseroPricing.service.ts");
[
  "resolveProgressivePjmOptions",
  "acceptedValues",
  "findPjmOptionInList",
  "sanitizePjmValueAgainstOption",
  "progressiveRequestCount",
  "mode: \"progressive-options-then-optionsandprice\"",
  "buildPresseroOptionsFromPjmResponse",
  "progressive.options",
  "progressive.values"
].forEach((needle) => assertIncludes(service, needle, "presseroPricing.service.ts"));

const sprintDoc = read("docs/sprints/sprint-53-progressive-pjm-options.md");
[
  "Sprint 53",
  "saas-orchestrator",
  "progressif",
  "acceptedValues",
  "optionsandprice",
  "Pressero"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

const overview = read("docs/architecture/middleware-overview.md");
[
  "Sprint 53 Progressive PJM Options",
  "progressive",
  "accepted"
].forEach((needle) => assertIncludes(overview, needle, "architecture overview"));

console.log("Sprint 53 progressive PJM options checks passed.");
