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
  packageJson.scripts?.["test:sprint42"] ===
    "node scripts/test-sprint-42-pressero-json-operation-product.mjs",
  "package.json should expose the Sprint 42 test script"
);

const types = read("src/modules/pressero-pricing/presseroPricing.types.ts");
[
  "operation?: unknown",
  "product?: unknown",
  "Product?: unknown"
].forEach((needle) => assertIncludes(types, needle, "presseroPricing.types.ts"));

const service = read("src/modules/pressero-pricing/presseroPricing.service.ts");
[
  "readOperationValue",
  "readPresseroOperation",
  "body.product",
  "body.Product",
  "operation: readPresseroOperation",
  "productKeys: Object.keys(product)",
  "rawOptionCount: rawOptionsArray.length"
].forEach((needle) => assertIncludes(service, needle, "presseroPricing.service.ts"));

const sprintDoc = read("docs/sprints/sprint-42-pressero-json-operation-product.md");
[
  "Sprint 42",
  "operation",
  "product",
  "options",
  "MIS Product ID"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

console.log("Sprint 42 Pressero JSON operation/product checks passed.");
