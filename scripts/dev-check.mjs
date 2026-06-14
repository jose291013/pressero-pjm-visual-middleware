import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";

function run(command, args) {
  const result = spawnSync(command, args, {
    env: {
      ...process.env,
      DATABASE_URL:
        process.env.DATABASE_URL ??
        "postgresql://postgres:postgres@localhost:5432/pressero_pjm_visual_middleware?schema=public"
    },
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const sprintTests = readdirSync("scripts")
  .filter((fileName) => /^test-sprint-\d+-.+\.mjs$/.test(fileName))
  .sort((left, right) => {
    const leftNumber = Number(left.match(/^test-sprint-(\d+)-/)?.[1] ?? 0);
    const rightNumber = Number(right.match(/^test-sprint-(\d+)-/)?.[1] ?? 0);
    return leftNumber - rightNumber || left.localeCompare(right);
  });

for (const sprintTest of sprintTests) {
  run("node", [`scripts/${sprintTest}`]);
}

if (existsSync("node_modules")) {
  const npmExecutable = process.platform === "win32" ? "npm.cmd" : "npm";
  run(npmExecutable, ["run", "prisma:validate"]);
  run(npmExecutable, ["run", "prisma:generate"]);
  run(npmExecutable, ["run", "build"]);
} else {
  console.log("node_modules not found; skipped TypeScript build. Run npm install first.");
}
