import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function resolvePath(relativePath) {
  return path.join(repoRoot, relativePath);
}

async function readText(relativePath) {
  return readFile(resolvePath(relativePath), "utf8");
}

function assertFile(relativePath) {
  assert.ok(existsSync(resolvePath(relativePath)), `Missing required path: ${relativePath}`);
}

const requiredPaths = [
  "docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt",
  "docs/reference/passation-v22-1-middleware.md",
  "docs/sprints/sprint-1-foundation.md",
  "docs/architecture/middleware-overview.md",
  "docs/architecture/pjm-sync-model.md",
  "docs/architecture/visual-options-model.md",
  "docs/architecture/negotiated-prices-excel-model.md",
  "prisma/schema.prisma",
  "prisma/migrations/.gitkeep",
  "scripts/test-sprint-1-foundation.mjs",
  "scripts/dev-check.mjs",
  "src/app.ts",
  "src/server.ts",
  "src/config/env.ts",
  "src/config/prisma.ts",
  "src/modules/health/health.routes.ts",
  "src/modules/health/health.controller.ts",
  "src/modules/pjm-sync/pjmSync.routes.ts",
  "src/modules/pjm-sync/pjmSync.controller.ts",
  "src/modules/pjm-sync/pjmSync.service.ts",
  "src/modules/pjm-sync/pjmSync.types.ts",
  "src/modules/visual-options/visualOptions.routes.ts",
  "src/modules/visual-options/visualOptions.controller.ts",
  "src/modules/visual-options/visualOptions.service.ts",
  "src/modules/visual-options/visualOptions.types.ts",
  "src/modules/media-library/mediaLibrary.routes.ts",
  "src/modules/media-library/mediaLibrary.controller.ts",
  "src/modules/media-library/mediaLibrary.service.ts",
  "src/modules/media-library/mediaLibrary.types.ts",
  "src/modules/pressero-config/presseroConfig.routes.ts",
  "src/modules/pressero-config/presseroConfig.controller.ts",
  "src/modules/pressero-config/presseroConfig.service.ts",
  "src/modules/pressero-config/presseroConfig.types.ts",
  "src/modules/negotiated-prices/negotiatedPrices.routes.ts",
  "src/modules/negotiated-prices/negotiatedPrices.controller.ts",
  "src/modules/negotiated-prices/negotiatedPrices.service.ts",
  "src/modules/negotiated-prices/negotiatedPricesExcel.service.ts",
  "src/modules/negotiated-prices/combinationGenerator.service.ts",
  "src/modules/negotiated-prices/negotiatedPrices.types.ts",
  "src/shared/errors/.gitkeep",
  "src/shared/http/.gitkeep",
  "src/shared/utils/.gitkeep",
  "src/shared/validators/.gitkeep",
  "src/public/admin/.gitkeep",
  "src/public/pressero/visual-configurator.js",
  ".env.example",
  "package.json",
  "tsconfig.json",
  "README.md"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(packageJson.name, "pressero-pjm-visual-middleware");
assert.equal(packageJson.type, "module");
assert.equal(packageJson.scripts["test:sprint1"], "node scripts/test-sprint-1-foundation.mjs");
assert.ok(packageJson.dependencies.express, "Express dependency is required");
assert.ok(packageJson.dependencies["@prisma/client"], "@prisma/client dependency is required");
assert.ok(packageJson.devDependencies.typescript, "TypeScript dev dependency is required");
assert.ok(packageJson.devDependencies.prisma, "Prisma dev dependency is required");

const tsconfig = JSON.parse(await readText("tsconfig.json"));
assert.equal(tsconfig.compilerOptions.rootDir, "src");
assert.equal(tsconfig.compilerOptions.outDir, "dist");
assert.equal(tsconfig.compilerOptions.strict, true);

const app = await readText("src/app.ts");
assert.match(app, /app\.use\(["']\/health["'],\s*healthRouter\)/);

const healthRoutes = await readText("src/modules/health/health.routes.ts");
assert.match(healthRoutes, /healthRouter\.get\(["']\/["'],\s*getHealth\)/);

const prismaSchema = await readText("prisma/schema.prisma");
const requiredModels = [
  "PjmProductCategory",
  "PjmPriceGroup",
  "PjmPriceEngine",
  "PjmOption",
  "PjmOptionChoice",
  "MediaAsset",
  "VisualOptionMapping",
  "NegotiatedPriceProfile",
  "NegotiatedPriceCombinationSet",
  "NegotiatedPriceImportJob"
];

for (const model of requiredModels) {
  assert.match(prismaSchema, new RegExp(`model\\s+${model}\\s+\\{`), `Missing Prisma model: ${model}`);
}

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /Options_1_Value/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 1 foundation checks passed.");
