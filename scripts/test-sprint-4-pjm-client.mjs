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
  "docs/sprints/sprint-4-pjm-client.md",
  "scripts/test-sprint-4-pjm-client.mjs",
  "src/modules/pjm-sync/pjmClient.ts"
];

for (const requiredPath of requiredPaths) {
  assertFile(requiredPath);
}

const packageJson = JSON.parse(await readText("package.json"));
assert.equal(packageJson.scripts["test:sprint4"], "node scripts/test-sprint-4-pjm-client.mjs");

const env = await readText("src/config/env.ts");
assert.match(env, /pjm:\s*\{/);
assert.match(env, /publicBaseUrl:\s*process\.env\.PJM_PUBLIC_BASE_URL/);
assert.match(env, /username:\s*process\.env\.PJM_USERNAME/);
assert.match(env, /password:\s*process\.env\.PJM_PASSWORD/);

const client = await readText("src/modules/pjm-sync/pjmClient.ts");
assert.match(client, /export type PjmFetch/);
assert.match(client, /fetchImpl\?:\s*PjmFetch/);
assert.match(client, /export class PjmClient/);
assert.match(client, /export class PjmHttpError extends Error/);
assert.match(client, /buildPjmEngineOptionsRequest/);
assert.match(client, /Operation:\s*"options"/);
assert.match(client, /buildPjmOptionsAndPriceRequest/);
assert.match(client, /Operation:\s*"optionsandprice"/);
assert.match(client, /extractPjmToken/);
assert.match(client, /readPjmClientConfigFromEnv/);
assert.match(client, /createPjmClientFromEnv/);
assert.match(client, /\/public\/Authenticate/);
assert.match(client, /\/public\/productEngines\/list/);
assert.match(client, /\/public\/engine/);
assert.match(client, /method:\s*"POST"/);
assert.match(client, /headers\.Authorization\s*=\s*`Bearer \$\{bearerToken\}`/);
assert.match(client, /JSON\.stringify\(payload\)/);
assert.match(client, /this\.fetchImpl\(url/);
assert.match(client, /clearTokenCache\(\)/);

const constructorMatch = client.match(/constructor\(config: PjmClientConfig\)\s*\{([\s\S]*?)\n  \}/);
assert.ok(constructorMatch, "Missing PjmClient constructor");
assert.match(constructorMatch[1], /this\.fetchImpl\s*=\s*config\.fetchImpl\s*\?\?\s*fetch/);
assert.doesNotMatch(constructorMatch[1], /postJson|authenticate|listProductEngines|callEngine/);

const endpointsDoc = await readText("docs/architecture/pjm-endpoints.md");
assert.match(endpointsDoc, /Sprint 4 Client Boundary/);
assert.match(endpointsDoc, /injectable `fetchImpl`/);
assert.match(endpointsDoc, /no automatic PJM call at server startup/);

const sprintDoc = await readText("docs/sprints/sprint-4-pjm-client.md");
assert.match(sprintDoc, /Aucun endpoint interne n'est ajoute/);
assert.match(sprintDoc, /Aucun modele Prisma/);
assert.match(sprintDoc, /fetchImpl/);

const v221 = await readText("docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt");
assert.match(v221, /__PE_VISUAL_CALCULATOR_V221_LOADED__/);
assert.match(v221, /Options_1_Value/);
assert.match(v221, /dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);

console.log("Sprint 4 PJM client checks passed.");
