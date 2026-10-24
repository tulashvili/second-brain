import type { QuartzFilterPlugin } from "@quartz-community/types"

export const ExplicitDraftPublish: QuartzFilterPlugin = () => ({
  name: "ExplicitDraftPublish",
  shouldPublish(_ctx, [, file]) {
    const frontmatter = file.data.frontmatter as Record<string, unknown> | undefined
    return frontmatter?.draft === false
  },
})
