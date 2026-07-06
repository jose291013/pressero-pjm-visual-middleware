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
  packageJson.scripts?.["test:sprint43"] ===
    "node scripts/test-sprint-43-pressero-product-string.mjs",
  "package.json should expose the Sprint 43 test script"
);

const service = read("src/modules/pressero-pricing/presseroPricing.service.ts");
[
  "readProductIdFromValue",
  "typeof value === \"string\"",
  "readProductIdFromValue(body.product)",
  "readProductIdFromValue(body.Product)",
  "productType",
  "productPreview"
].forEach((needle) => assertIncludes(service, needle, "presseroPricing.service.ts"));

const sprintDoc = read("docs/sprints/sprint-43-pressero-product-string.md");
[
  "Sprint 43",
  "product",
  "string",
  "MIS Product ID",
  "productPreview"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

console.log("Sprint 43 Pressero product string checks passed.");
