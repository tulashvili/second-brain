import { defineConfig } from "tsup"
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  loader: { ".scss": "text" },
  external: ["@quartz-community/types", "@quartz-community/utils", "preact"],
})
