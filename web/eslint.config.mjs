import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // App fetch dữ liệu trong effect on-mount và sync localStorage sau hydration
      // một cách có chủ ý; quy tắc này cấm cả hai pattern nên tắt ở mức project.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
