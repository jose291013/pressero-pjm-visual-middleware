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
  packageJson.scripts?.["test:sprint45"] ===
    "node scripts/test-sprint-45-pressero-quantity-and-visual-cors.mjs",
  "package.json should expose the Sprint 45 test script"
);

const app = read("src/app.ts");
[
  "Access-Control-Allow-Origin",
  "/pressero-config/public/",
  "/public/pressero/",
  "Access-Control-Allow-Methods",
  "OPTIONS"
].forEach((needle) => assertIncludes(app, needle, "app.ts"));

const configTypes = read("src/modules/pressero-config/presseroConfig.types.ts");
assertIncludes(configTypes, "valueAliases: string[]", "presseroConfig.types.ts");

const configService = read("src/modules/pressero-config/presseroConfig.service.ts");
[
  "valueAliases: uniqueValues",
  "choice.pjmId",
  "choice.normalizedName"
].forEach((needle) => assertIncludes(configService, needle, "presseroConfig.service.ts"));

const pricingService = read("src/modules/pressero-pricing/presseroPricing.service.ts");
[
  "buildPjmEngineValues",
  "Key: option.Key",
  "Value: option.Value",
  "sanitizePjmEngineValuesAgainstOptions",
  "getEngineOptions"
].forEach((needle) => assertIncludes(pricingService, needle, "presseroPricing.service.ts"));

const visualScript = read("src/public/pressero/visual-configurator.js");
[
  "choiceValues(choice)",
  "choice.valueAliases",
  "nativeOptionTokens",
  "resolveNativeValue",
  "data-native-value"
].forEach((needle) => assertIncludes(visualScript, needle, "visual-configurator.js"));

const sprintDoc = read("docs/sprints/sprint-45-pressero-quantity-and-visual-cors.md");
[
  "Sprint 45",
  "CORS",
  "Quantite PJM",
  "Sprint 50",
  "valueAliases",
  "data-native-value"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

console.log("Sprint 45 Pressero quantity and visual CORS checks passed.");
