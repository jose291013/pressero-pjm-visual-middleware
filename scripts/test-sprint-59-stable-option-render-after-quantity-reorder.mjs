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
  packageJson.scripts?.["test:sprint59"] ===
    "node scripts/test-sprint-59-stable-option-render-after-quantity-reorder.mjs",
  "package.json should expose the Sprint 59 test script"
);

const service = read("src/modules/pressero-pricing/presseroPricing.service.ts");
[
  "parameters.sort",
  "left.Options.length === 0",
  "right.Options.length === 0",
  "return leftIsFreeInput ? 1 : -1"
].forEach((needle) => assertIncludes(service, needle, "presseroPricing.service.ts"));

const visualScript = read("src/public/pressero/visual-configurator.js");
[
  "noBindingRenderCount",
  "state.noBindingRenderCount += 1",
  "state.noBindingRenderCount < 25",
  "root.hidden = true",
  "scheduleRender();",
  "state.noBindingRenderCount = 0"
].forEach((needle) => assertIncludes(visualScript, needle, "visual-configurator.js"));

const sprintDoc = read("docs/sprints/sprint-59-stable-option-render-after-quantity-reorder.md");
[
  "Sprint 59",
  "quantite",
  "Options: []",
  "warning",
  "rawOptionCount"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

const overview = read("docs/architecture/middleware-overview.md");
[
  "Sprint 59 Stable Option Render After Quantity Reorder",
  "choice-bearing parameters before free-input parameters",
  "delays the no-match warning"
].forEach((needle) => assertIncludes(overview, needle, "architecture overview"));

console.log("Sprint 59 stable option render after quantity reorder checks passed.");
