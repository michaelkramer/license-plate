import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import * as importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    files: [
      "apps/mobile/src/**/*.{ts,tsx,js,jsx}",
      "apps/server/src/**/*.{ts,tsx,js,jsx}",
      "scripts/**/*.{ts,js}",
    ],
    extends: [
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
    plugins: {
      react: reactPlugin,
    },
    rules: {
      "import/order": ["error", { alphabetize: { order: "asc" } }],
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
      ...reactPlugin.configs.recommended.rules,
      "import/namespace": "off", // Disable namespace import rule for React Native
    },
  },
  eslintPluginPrettierRecommended,
  {
    ignores: ["**/*.config.{js,mjs,cjs}", "**/*.{js,mjs,cjs}"],
  },
);
