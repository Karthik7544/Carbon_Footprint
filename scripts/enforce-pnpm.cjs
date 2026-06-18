const fs = require("node:fs");
const path = require("node:path");

for (const filename of ["package-lock.json", "yarn.lock"]) {
  fs.rmSync(path.resolve(__dirname, "..", filename), { force: true });
}

const userAgent = process.env.npm_config_user_agent ?? "";

if (!userAgent.startsWith("pnpm/")) {
  console.error("Use pnpm instead");
  process.exit(1);
}
