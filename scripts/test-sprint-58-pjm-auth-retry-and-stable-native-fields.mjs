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
  packageJson.scripts?.["test:sprint58"] ===
    "node scripts/test-sprint-58-pjm-auth-retry-and-stable-native-fields.mjs",
  "package.json should expose the Sprint 58 test script"
);

const pjmClient = read("src/modules/pjm-sync/pjmClient.ts");
[
  "postJsonWithAuth",
  "error instanceof PjmHttpError && error.status === 401",
  "await this.authenticate(true)",
  "return this.postJson<TResponse>("
].forEach((needle) => assertIncludes(pjmClient, needle, "pjmClient.ts"));

const visualScript = read("src/public/pressero/visual-configurator.js");
[
  "rememberedNativeSelectors",
  "pressero-pjm-visual-native-field-rules",
  "updateRememberedNativeStyle",
  "applyRememberedNativeHiding",
  "cssEscape",
  "isNativePricingField",
  "stabilizeNativePricingChange",
  "document.addEventListener(\"change\"",
  "document.addEventListener(\"focusin\"",
  "document.addEventListener(\"mousedown\"",
  "}, 160);"
].forEach((needle) => assertIncludes(visualScript, needle, "visual-configurator.js"));

const sprintDoc = read("docs/sprints/sprint-58-pjm-auth-retry-and-stable-native-fields.md");
[
  "Sprint 58",
  "401",
  "token",
  "clignotement",
  "scroll"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

const overview = read("docs/architecture/middleware-overview.md");
[
  "Sprint 58 PJM Auth Retry And Stable Native Fields",
  "401",
  "remembered native field selectors"
].forEach((needle) => assertIncludes(overview, needle, "architecture overview"));

console.log("Sprint 58 PJM auth retry and stable native fields checks passed.");
