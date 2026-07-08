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
  packageJson.scripts?.["test:sprint60"] ===
    "node scripts/test-sprint-60-native-scroll-jump-guard.mjs",
  "package.json should expose the Sprint 60 test script"
);

const visualScript = read("src/public/pressero/visual-configurator.js");
[
  ".ppv-native-hidden{display:none!important",
  "overflow-anchor:none!important",
  "restoreDuringNativeSettle",
  "[0, 80, 180, 360, 700, 1100]",
  "stabilizeAfterVisualSelection",
  "rememberScroll();\n        stabilizeNativePricingChange();",
  "body.ppv-active #calcParmInputs li:has(",
  "body.ppv-active #calcParmInputs .form-group:has(",
  "visibility:hidden!important;pointer-events:none!important"
].forEach((needle) => assertIncludes(visualScript, needle, "visual-configurator.js"));

const sprintDoc = read("docs/sprints/sprint-60-native-scroll-jump-guard.md");
[
  "Sprint 60",
  "sursaut",
  "overflow-anchor",
  "scroll",
  "display:none"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

const overview = read("docs/architecture/middleware-overview.md");
[
  "Sprint 60 Native Scroll Jump Guard",
  "overflow-anchor",
  "restores the current scroll position"
].forEach((needle) => assertIncludes(overview, needle, "architecture overview"));

console.log("Sprint 60 native scroll jump guard checks passed.");
