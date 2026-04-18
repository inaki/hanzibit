import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const nextDir = join(root, ".next");
const devDir = join(nextDir, "dev");

const manifests = [
  "required-server-files.json",
  "required-server-files.js",
];

if (!existsSync(nextDir)) {
  process.exit(0);
}

mkdirSync(devDir, { recursive: true });

for (const manifest of manifests) {
  const source = join(nextDir, manifest);
  const target = join(devDir, manifest);

  if (existsSync(source) && !existsSync(target)) {
    copyFileSync(source, target);
  }
}
