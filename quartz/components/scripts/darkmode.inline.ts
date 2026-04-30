type ThemeMode = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
const resolveTheme = (): ResolvedTheme => (mediaQuery.matches ? "dark" : "light")

const emitThemeChangeEvent = (theme: ResolvedTheme) => {
  const event: CustomEventMap["themechange"] = new CustomEvent("themechange", {
    detail: { theme },
  })
  document.dispatchEvent(event)
}

const getInitialMode = (): ThemeMode => {
  const storedMode = localStorage.getItem("theme-mode")
  if (storedMode === "light" || storedMode === "dark" || storedMode === "system") {
    return storedMode
  }

  const legacyTheme = localStorage.getItem("theme")
  if (legacyTheme === "light" || legacyTheme === "dark") {
    return legacyTheme
  }

  return "system"
}

const applyThemeMode = (mode: ThemeMode, persist = true) => {
  const resolved: ResolvedTheme = mode === "system" ? resolveTheme() : mode
  document.documentElement.setAttribute("saved-theme", resolved)
  document.documentElement.setAttribute("data-theme-mode", mode)

  if (persist) {
    localStorage.setItem("theme-mode", mode)
    localStorage.removeItem("theme")
  }

  emitThemeChangeEvent(resolved)
}

applyThemeMode(getInitialMode(), false)

const switchTheme = () => {
  const currentMode = (document.documentElement.getAttribute("data-theme-mode") ??
    "system") as ThemeMode
  const order: ThemeMode[] = ["system", "light", "dark"]
  const nextMode = order[(order.indexOf(currentMode) + 1) % order.length]
  applyThemeMode(nextMode)
}

const onSystemThemeChange = () => {
  const currentMode = (document.documentElement.getAttribute("data-theme-mode") ??
    "system") as ThemeMode
  if (currentMode === "system") {
    applyThemeMode("system", false)
  }
}

const onDocumentClick = (event: Event) => {
  const target = event.target
  if (!(target instanceof Element)) return
  const button = target.closest(".darkmode")
  if (!button) return
  event.preventDefault()
  switchTheme()
}

if (!(window as any).__themeMediaBound) {
  mediaQuery.addEventListener("change", onSystemThemeChange)
  ;(window as any).__themeMediaBound = true
}

if (!(window as any).__themeClickBound) {
  document.addEventListener("click", onDocumentClick)
  ;(window as any).__themeClickBound = true
}
