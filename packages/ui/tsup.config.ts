import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    button: "src/components/button.tsx",
    card: "src/card.tsx",
    gradient: "src/gradient.tsx",
    "turborepo-logo": "src/turborepo-logo.tsx",
  },
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: false, // 不清空 dist，避免删除样式文件
  external: ["react", "react-dom"],
  treeshake: true,
  splitting: false,
});

