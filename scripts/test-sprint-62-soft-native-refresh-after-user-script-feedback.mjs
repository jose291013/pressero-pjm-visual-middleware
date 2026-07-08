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
  packageJson.scripts?.["test:sprint62"] ===
    "node scripts/test-sprint-62-soft-native-refresh-after-user-script-feedback.mjs",
  "package.json should expose the Sprint 62 test script"
);

const visualScript = read("src/public/pressero/visual-configurator.js");
[
  "refreshNativeHidingDuringSettle",
  "position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;display:block!important",
  "var host = document.getElementById(\"calcParmInputs\")",
  "state.renderTimer = window.setTimeout(function ()",
  "}, 160);",
  "rememberScroll();",
  "stabilizeNativePricingChange();"
].forEach((needle) => assertIncludes(visualScript, needle, "visual-configurator.js"));

[
  "scrollHoldUntil",
  "startScrollHold",
  "window.addEventListener(\"scroll\""
].forEach((needle) =>
  assert(!visualScript.includes(needle), `visual-configurator.js should not include: ${needle}`)
);

const sprintDoc = read("docs/sprints/sprint-62-soft-native-refresh-after-user-script-feedback.md");
[
  "Sprint 62",
  "script utilisateur",
  "verrou de scroll",
  "hors ecran",
  "160 ms"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

const overview = read("docs/architecture/middleware-overview.md");
[
  "Sprint 62 Soft Native Refresh After User Script Feedback",
  "removes the aggressive scroll hold",
  "offscreen native select pattern"
].forEach((needle) => assertIncludes(overview, needle, "architecture overview"));

console.log("Sprint 62 soft native refresh after user script feedback checks passed.");
