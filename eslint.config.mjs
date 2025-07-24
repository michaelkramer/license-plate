import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import * as importPlugin from "eslint-plugin-import";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    files: [
      "apps/mobile/src/**/*.{ts,tsx}",
      "apps/server/src/**/*.{ts,tsx}",
      "scripts/**/*.{ts,tsx}",
    ],
    extends: [
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
    rules: {
      "import/order": ["error", { alphabetize: { order: "asc" } }],
      "import/ignore": ["react-native"],
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  eslintPluginPrettierRecommended,
  {
    ignores: ["**/*.config.{js,mjs,cjs}", "**/*.{js,mjs,cjs}"],
  },
);
