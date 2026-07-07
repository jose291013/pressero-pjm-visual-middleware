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
  packageJson.scripts?.["test:sprint56"] ===
    "node scripts/test-sprint-56-fast-live-pricing.mjs",
  "package.json should expose the Sprint 56 test script"
);

const pjmClient = read("src/modules/pjm-sync/pjmClient.ts");
[
  "envPjmClientCache",
  "cacheKey",
  "return envPjmClientCache.client"
].forEach((needle) => assertIncludes(pjmClient, needle, "pjmClient.ts"));

const service = read("src/modules/pressero-pricing/presseroPricing.service.ts");
[
  "pjmOptionsCacheTtlMs",
  "pjmPriceCacheTtlMs",
  "readThroughTimedCache",
  "getCachedPjmOptions",
  "getCachedPjmOptionsAndPrice",
  "resolveFastPjmOptions",
  "pjm-fast-options",
  "pjm-live-fast-price",
  "fallback-progressive-options-then-optionsandprice"
].forEach((needle) => assertIncludes(service, needle, "presseroPricing.service.ts"));

const fastPriceIndex = service.indexOf("pjm-live-fast-price");
const fallbackIndex = service.indexOf("fallback-progressive-options-then-optionsandprice");
assert(
  fastPriceIndex >= 0 && fallbackIndex > fastPriceIndex,
  "fast price path should be attempted before the progressive fallback"
);

const sprintDoc = read("docs/sprints/sprint-56-fast-live-pricing.md");
[
  "Sprint 56",
  "moins de 2 secondes",
  "singleton",
  "cache",
  "fallback"
].forEach((needle) => assertIncludes(sprintDoc, needle, "sprint doc"));

const overview = read("docs/architecture/middleware-overview.md");
[
  "Sprint 56 Fast Live Pricing",
  "one `optionsandprice`",
  "short TTL cache"
].forEach((needle) => assertIncludes(overview, needle, "architecture overview"));

console.log("Sprint 56 fast live pricing checks passed.");
