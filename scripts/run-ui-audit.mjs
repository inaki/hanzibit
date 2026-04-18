import { ESLint } from "eslint";

const eslint = new ESLint({
  overrideConfigFile: "eslint.ui-audit.config.mjs",
});

const results = await eslint.lintFiles(["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"]);

const auditMessages = results.flatMap((result) =>
  result.messages
    .filter((message) => typeof message.ruleId === "string" && message.ruleId.startsWith("ui-audit/"))
    .map((message) => ({
      filePath: result.filePath,
      ...message,
    }))
);

if (auditMessages.length === 0) {
  console.log("UI audit: no hardcoded color or raw surface-shell warnings found.");
  process.exit(0);
}

const grouped = new Map();

for (const message of auditMessages) {
  const existing = grouped.get(message.filePath) ?? [];
  existing.push(message);
  grouped.set(message.filePath, existing);
}

console.log(`UI audit: ${auditMessages.length} warning${auditMessages.length === 1 ? "" : "s"} found.\n`);

for (const [filePath, messages] of grouped.entries()) {
  console.log(filePath);
  for (const message of messages) {
    console.log(
      `  ${message.line}:${message.column}  ${message.ruleId}  ${message.message}`
    );
  }
  console.log("");
}

process.exit(0);
