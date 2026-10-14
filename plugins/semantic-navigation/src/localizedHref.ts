export const localizedHref = (slug: string, locale: string | undefined): string => {
  const prefix = locale === "en-US" ? "/en" : ""
  return slug === "index" ? `${prefix}/` : `${prefix}/${slug}`
}
