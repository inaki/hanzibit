import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import uiAuditPlugin from "./eslint/ui-audit-plugin.mjs";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "ui-audit": uiAuditPlugin,
    },
  },
  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    ignores: ["**/*.stories.tsx", "src/components/ui/**/*", "src/components/patterns/**/*"],
    rules: {
      "ui-audit/no-hardcoded-colors": "warn",
      "ui-audit/no-raw-surface-shells": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);
