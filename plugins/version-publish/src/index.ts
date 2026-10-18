import type { QuartzFilterPlugin } from "@quartz-community/types"

/** A note reaches the public site only after its author assigns version 0.1 or newer. */
export const isPublishableVersion = (value: unknown): boolean => {
  if (typeof value !== "string" && typeof value !== "number") return false
  const version = String(value).trim()
  if (!/^\d+(?:\.\d+)*$/.test(version)) return false
  const parts = version.split(".").map(Number)
  if (parts.length <= 2) return Number(version) >= 0.1
  return parts[0] > 0 || (parts[0] === 0 && (parts[1] ?? 0) >= 1)
}

export const VersionPublish: QuartzFilterPlugin = () => ({
  name: "VersionPublish",
  shouldPublish(_ctx, [, file]) {
    const frontmatter = file.data?.frontmatter
    if (frontmatter?.generated === true && typeof frontmatter.flatTag === "string") return true
    return isPublishableVersion(frontmatter?.version)
  },
})
