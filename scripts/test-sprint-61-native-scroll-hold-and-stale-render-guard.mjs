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
  packageJson.scripts?.["test:sprint61"] ===
    "node scripts/test-sprint-61-native-scroll-hold-and-stale-render-guard.mjs",
  "package.json should expose the Sprint 61 test script"
);

const visualScript = read("src/public/pressero/visual-configurator.js");
[
  "scrollHoldUntil",
  "hasActiveScrollHold",
  "startScrollHold(2600)",
  "preserveNativeFieldScroll",
  "if (!hasActiveScrollHold())",
  "window.addEventListener(\"scroll\"",
  "window.requestAnimationFrame(restoreLastScroll)",
  "previousHadVisualSections",
  "nextRoot = document.createElement(\"div\")",
  "root.replaceChildren.apply"
].forEach((needle) => assertIncludes(visualScript, needle, "visual-configurator.js"));

const sprintDoc = read("docs/sprints/sprint-61-native-scroll-hold-and-stale-render-guard.md");
[
  "Sprint 61",
  "scroll",
  "mauvaise position",
  "rerender",
  "ancienne interface visuelle"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

const overview = read("docs/architecture/middleware-overview.md");
[
  "Sprint 61 Native Scroll Hold And Stale Render Guard",
  "does not overwrite the saved scroll position",
  "keeps the previous visual UI"
].forEach((needle) => assertIncludes(overview, needle, "architecture overview"));

console.log("Sprint 61 native scroll hold and stale render guard checks passed.");
