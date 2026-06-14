import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("node", ["scripts/test-sprint-1-foundation.mjs"]);

if (existsSync("node_modules")) {
  run("npm", ["run", "build"]);
} else {
  console.log("node_modules not found; skipped TypeScript build. Run npm install first.");
}
