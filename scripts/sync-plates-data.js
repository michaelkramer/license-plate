const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");

const source = path.join(
  repoRoot,
  "apps/server/src/assets/us-license-plates-union.json",
);
const destDir = path.join(repoRoot, "apps/mobile/assets/data");
const dest = path.join(destDir, "us-license-plates-union.json");

if (!fs.existsSync(source)) {
  console.error("Source not found:", source);
  console.error("Run scripts/limit-json.js first to generate union JSON.");
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(source, dest);
console.log("Copied plates data to", dest);
