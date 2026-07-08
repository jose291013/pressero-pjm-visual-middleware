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
  packageJson.scripts?.["test:sprint57"] ===
    "node scripts/test-sprint-57-neutralize-pressero-native-loading.mjs",
  "package.json should expose the Sprint 57 test script"
);

const visualScript = read("src/public/pressero/visual-configurator.js");
[
  "ppv-active",
  "findPricingContainer",
  "visualInsertTarget",
  "placeRoot(root)",
  "hardShield",
  "startTemporaryShield",
  "restoreScroll",
  "pcGlobalNavOverlay",
  "myCustomLoaderLocal",
  ".k-loading-mask",
  ".k-loading-color",
  "window.scrollTo(left, top)",
  "field.dispatchEvent(new Event(\"change\", { bubbles: true }))"
].forEach((needle) => assertIncludes(visualScript, needle, "visual-configurator.js"));

const sprintDoc = read("docs/sprints/sprint-57-neutralize-pressero-native-loading.md");
[
  "Sprint 57",
  "overlay",
  "scroll",
  "vrais champs",
  "change"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

const overview = read("docs/architecture/middleware-overview.md");
[
  "Sprint 57 Pressero Native Loading Neutralization",
  "outside the native pricing loading container",
  "restores scroll"
].forEach((needle) => assertIncludes(overview, needle, "architecture overview"));

console.log("Sprint 57 Pressero native loading neutralization checks passed.");
