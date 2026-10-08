export const plantUmlRuntime = String.raw`
const plantUmlState = globalThis.__quartzPlantUml ??= {
  module: null,
  viz: null,
  queue: Promise.resolve(),
  listeners: false,
  generation: 0,
  disabled: false,
}

const assetUrl = (name) => {
  const base = document.body?.dataset.basepath ?? ""
  return (base + "/static/plantuml/" + name).replace(/\/+/g, "/")
}

const loadViz = () => {
  if (globalThis.Viz) return Promise.resolve()
  if (plantUmlState.viz) return plantUmlState.viz

  plantUmlState.viz = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-plantuml-viz]')
    if (existing) {
      existing.addEventListener("load", resolve, { once: true })
      existing.addEventListener("error", (error) => {
        plantUmlState.viz = null
        existing.remove()
        reject(error)
      }, { once: true })
      return
    }

    const script = document.createElement("script")
    script.src = assetUrl("viz-global.js")
    script.dataset.plantumlViz = "true"
    script.dataset.persist = "true"
    script.addEventListener("load", resolve, { once: true })
    script.addEventListener("error", () => {
      plantUmlState.viz = null
      script.remove()
      reject(new Error("viz-global.js не загрузился"))
    }, { once: true })
    document.head.append(script)
  })
  return plantUmlState.viz
}

const loadPlantUml = async () => {
  await loadViz()
  globalThis.PLANTUML_STDLIB_BASE = assetUrl("")
  plantUmlState.module ??= import(assetUrl("plantuml.js")).catch((error) => {
    plantUmlState.module = null
    throw error
  })
  return plantUmlState.module
}

const sanitizeSvg = (canvas) => {
  canvas.querySelectorAll("script, foreignObject, iframe, object, embed").forEach((node) =>
    node.remove(),
  )
  canvas.querySelectorAll("*").forEach((node) => {
    for (const attribute of [...node.attributes]) {
      const value = attribute.value.trim().toLowerCase()
      if (/^on/i.test(attribute.name) || value.startsWith("javascript:")) {
        node.removeAttribute(attribute.name)
      }
    }
  })
}

const getRendererHost = () => {
  let host = document.getElementById("plantuml-render-host")
  if (host) return host

  host = document.createElement("div")
  host.id = "plantuml-render-host"
  host.dataset.persist = "true"
  host.setAttribute("aria-hidden", "true")
  host.style.cssText = "position:fixed;left:-100000px;top:0;width:1px;height:1px;overflow:hidden"
  document.documentElement.append(host)
  return host
}

const waitForSvg = (render, source, dark) =>
  new Promise((resolve, reject) => {
    const target = document.createElement("div")
    target.id = "plantuml-stage-" + Date.now().toString(36) + "-" +
      Math.random().toString(36).slice(2)
    getRendererHost().append(target)
    let settled = false
    const finish = (callback) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeout)
      observer.disconnect()
      target.remove()
      callback()
    }
    const timeout = window.setTimeout(() => {
      plantUmlState.disabled = true
      finish(() => reject(new Error("тайм-аут рендера")))
    }, 20000)
    const observer = new MutationObserver(() => {
      const svg = target.querySelector("svg")
      if (!svg) return
      const result = svg.cloneNode(true)
      finish(() => resolve(result))
    })
    observer.observe(target, { childList: true, subtree: true })

    try {
      render(source.split(/\r\n|\r|\n/), target.id, { dark })
    } catch (error) {
      finish(() => reject(error))
    }
  })

const renderDiagram = async (diagram, generation) => {
  const canvas = diagram.querySelector(".plantuml-canvas")
  const source = diagram.querySelector(".plantuml-source")
  if (!canvas || !source) return

  canvas.classList.remove("plantuml-error")
  source.hidden = false

  try {
    const { render } = await loadPlantUml()
    if (
      plantUmlState.disabled ||
      generation !== plantUmlState.generation ||
      !diagram.isConnected
    ) return
    const dark = document.documentElement.getAttribute("saved-theme") === "dark"
    const svg = await waitForSvg(render, source.textContent ?? "", dark)
    if (generation !== plantUmlState.generation || !diagram.isConnected) return
    canvas.replaceChildren(svg)
    sanitizeSvg(canvas)
    source.hidden = true
  } catch (error) {
    if (generation !== plantUmlState.generation || !diagram.isConnected) return
    canvas.replaceChildren()
    canvas.classList.add("plantuml-error")
    canvas.textContent = "Не удалось отрисовать PlantUML: " +
      (error instanceof Error ? error.message : String(error))
  }
}

const renderAllPlantUml = () => {
  if (plantUmlState.disabled) return
  const generation = ++plantUmlState.generation
  const diagrams = [...document.querySelectorAll(".plantuml-diagram")]
  if (diagrams.length === 0) return
  plantUmlState.queue = plantUmlState.queue
    .catch(() => undefined)
    .then(async () => {
      for (const diagram of diagrams) {
        if (
          plantUmlState.disabled ||
          generation !== plantUmlState.generation ||
          !diagram.isConnected
        ) return
        await renderDiagram(diagram, generation)
      }
    })
}

if (!plantUmlState.listeners) {
  document.addEventListener("nav", renderAllPlantUml)
  document.addEventListener("themechange", renderAllPlantUml)
  plantUmlState.listeners = true
}
renderAllPlantUml()
`
