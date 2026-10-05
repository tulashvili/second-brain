import fs from "node:fs/promises"
import path from "node:path"
import type { FilePath, QuartzEmitterPlugin } from "@quartz-community/types"
import {
  buildKnowledgeStructureManifest,
  renderArticleRss,
  type ArticleRssFile,
} from "./articleRss"

export * from "./articleRss"

type Options = { limit: number }

export const ArticleRss: QuartzEmitterPlugin<Partial<Options>> = (opts) => {
  const options: Options = { limit: 100, ...opts }
  return {
    name: "ArticleRss",
    async emit(ctx, content) {
      const files = content.map(([, file]) => file.data as ArticleRssFile)
      const rssPath = path.join(ctx.argv.output, "index.xml")
      const manifestPath = path.join(ctx.argv.output, "static", "knowledgeStructure.json")
      await fs.mkdir(path.dirname(manifestPath), { recursive: true })
      await Promise.all([
        fs.writeFile(
          rssPath,
          renderArticleRss(files, {
            baseUrl: ctx.cfg.configuration.baseUrl ?? "",
            pageTitle: ctx.cfg.configuration.pageTitle ?? "",
            limit: options.limit,
          }),
        ),
        fs.writeFile(manifestPath, JSON.stringify(buildKnowledgeStructureManifest(files))),
      ])
      return [rssPath as FilePath, manifestPath as FilePath]
    },
  }
}
