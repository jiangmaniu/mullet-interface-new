import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReact from "eslint-plugin-react";
import pluginStorybook from "eslint-plugin-storybook";
import pluginMdx from "eslint-plugin-mdx";
import globals from "globals";
import { config as baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for use with Storybook.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const storybookConfig = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.browser,
        ...globals.node,
        React: true,
        JSX: true,
      },
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      // React scope no longer necessary with new JSX transform.
      "react/react-in-jsx-scope": "off",
    },
  },
  ...pluginStorybook.configs["flat/recommended"],
  {
    files: ["**/*.mdx"],
    ...pluginMdx.flat,
    processor: pluginMdx.createRecommendedConfig().processor,
  },
  {
    files: ["**/*.mdx/*.js"],
    ...pluginMdx.flatCodeBlocks,
    rules: {
      ...pluginMdx.flatCodeBlocks.rules,
    },
  },
  {
    ignores: ["node_modules/", "dist/", "storybook-static/"],
  },
];
