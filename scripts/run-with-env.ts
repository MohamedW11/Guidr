import "./load-env.ts";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);

if (!args.length) {
  console.error("Usage: tsx scripts/run-with-env.ts <command...>");
  process.exit(1);
}

const formattedArgs = args.map((arg) => (arg.includes(" ") ? `"${arg.replace(/"/g, '\\"')}"` : arg)).join(" ");

const result = spawnSync(formattedArgs, {
  stdio: "inherit",
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);
