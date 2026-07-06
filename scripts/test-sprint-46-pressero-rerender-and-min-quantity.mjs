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
  packageJson.scripts?.["test:sprint46"] ===
    "node scripts/test-sprint-46-pressero-rerender-and-min-quantity.mjs",
  "package.json should expose the Sprint 46 test script"
);

const pricingService = read("src/modules/pressero-pricing/presseroPricing.service.ts");
[
  "readMinimumQuantityFromPjmError",
  "quantityOverride?: number",
  "requestedQuantity < minimumQuantity",
  "buildPjmEngineValues(config, body, minimumQuantity)",
  "retryPrice"
].forEach((needle) => assertIncludes(pricingService, needle, "presseroPricing.service.ts"));

const visualScript = read("src/public/pressero/visual-configurator.js");
[
  "renderTimer",
  "observer",
  "isRendering",
  "scheduleRender",
  "observePresseroRerenders",
  "MutationObserver",
  "state.observer.observe(document.body",
  "childList: true",
  "subtree: true"
].forEach((needle) => assertIncludes(visualScript, needle, "visual-configurator.js"));

const sprintDoc = read("docs/sprints/sprint-46-pressero-rerender-and-min-quantity.md");
[
  "Sprint 46",
  "re-render",
  "MutationObserver",
  "quantite minimale",
  "PJM"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

console.log("Sprint 46 Pressero rerender and minimum quantity checks passed.");
