import { defineConfig } from "tsup"
export default defineConfig({
  entry: ["src/index.ts", "src/components.tsx"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  loader: { ".scss": "text" },
  external: ["@quartz-community/types", "preact"],
})
