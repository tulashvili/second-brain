import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts", "src/components.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["@quartz-community/types", "@quartz-community/utils", "preact"],
})
