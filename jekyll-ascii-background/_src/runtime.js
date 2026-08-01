import { defaultSettings, getCharacters, getColors } from "./shared/ascii-core"

const MOBILE_QUERY = "(max-width: 768px)"
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

function parseSettings(element) {
  let provided = {}

  try {
    const value = element.getAttribute("data-ascii-background")
    if (value) provided = JSON.parse(value)
  } catch (error) {
    console.warn("Unable to parse ASCII background settings", error)
  }

  return { ...defaultSettings, ...window.asciiConfig, ...provided }
}

function createAsciiBackground(element) {
  const settings = parseSettings(element)
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d", { alpha: true })
  const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY)
  const mobileQuery = window.matchMedia(MOBILE_QUERY)

  if (!context) return

  canvas.setAttribute("aria-hidden", "true")
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;image-rendering:pixelated"
  element.appendChild(canvas)

  const characters = getCharacters(settings.characterSet, settings.customCharacters)
  const colors = getColors(settings.colorPalette, settings.customColors)
  const flowAngle = ((settings.waveFlowDirection || 45) * Math.PI) / 180
  const flowX = Math.cos(flowAngle)
  const flowY = Math.sin(flowAngle)
  const charSize = Math.max(12, settings.density / 2.2)
  let width = 1
  let height = 1
  let columns = 1
  let rows = 1
  let animationFrame = null
  let lastFrameAt = 0
  let time = 0
  let isVisible = true
  let hasDrawnStaticFrame = false

  const usesReducedMotion = () => settings.respectReducedMotion && reducedMotionQuery.matches
  const frameInterval = () => 1000 / (mobileQuery.matches ? 8 : 12)

  const updateDimensions = () => {
    const bounds = element.getBoundingClientRect()
    const nextWidth = Math.max(1, Math.round(bounds.width))
    const nextHeight = Math.max(1, Math.round(bounds.height))

    if (nextWidth === width && nextHeight === height) return

    width = nextWidth
    height = nextHeight
    columns = Math.ceil(width / charSize)
    rows = Math.ceil(height / charSize)
    canvas.width = width
    canvas.height = height
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.font = `${charSize}px ui-monospace, SFMono-Regular, Menlo, monospace`
    hasDrawnStaticFrame = false
  }

  const draw = () => {
    const z = usesReducedMotion() ? 0.15 : time * settings.noiseSpeed
    const scale = settings.noiseScale / settings.gradientSize
    const intensity = settings.waveIntensity || 1

    context.clearRect(0, 0, width, height)
    context.globalAlpha = settings.opacity

    for (let y = 0; y < rows; y += 1) {
      const scaledY = y * scale
      for (let x = 0; x < columns; x += 1) {
        const scaledX = x * scale
        const primary = scaledX * flowX + scaledY * flowY + z * 1.5
        const secondary = scaledX * -flowY * 1.5 + scaledY * flowX * 1.5 + z * 0.8
        const value = Math.max(0, Math.min(0.999, 0.5 + Math.sin(primary) * 0.32 * intensity + Math.sin(secondary) * 0.18 * intensity))
        const character = characters[Math.floor(value * characters.length)] || "."
        const color = colors[Math.floor(value * colors.length)] || colors[0]

        if (context.fillStyle !== color) context.fillStyle = color
        context.fillText(character, (x + 0.5) * charSize, (y + 0.5) * charSize)
      }
    }

    context.globalAlpha = 1
  }

  const animate = (timestamp) => {
    animationFrame = requestAnimationFrame(animate)
    if (!isVisible || document.hidden) return

    if (usesReducedMotion()) {
      if (!hasDrawnStaticFrame) {
        draw()
        hasDrawnStaticFrame = true
      }
      return
    }

    if (timestamp - lastFrameAt < frameInterval()) return
    const elapsed = lastFrameAt ? timestamp - lastFrameAt : 16.667
    lastFrameAt = timestamp
    time += (elapsed / 16.667) * settings.speed * 0.0001
    draw()
  }

  updateDimensions()

  const resizeObserver = new ResizeObserver(updateDimensions)
  resizeObserver.observe(element)

  const visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      isVisible = entry.isIntersecting
      if (isVisible) lastFrameAt = 0
    },
    { rootMargin: "200px" },
  )
  visibilityObserver.observe(element)

  reducedMotionQuery.addEventListener("change", () => {
    hasDrawnStaticFrame = false
  })

  animationFrame = requestAnimationFrame(animate)
}

function initializeAsciiBackgrounds() {
  document.querySelectorAll("[data-ascii-background]").forEach((element) => {
    if (element.dataset.asciiInitialized === "true") return
    element.dataset.asciiInitialized = "true"
    createAsciiBackground(element)
  })
}

function scheduleInitialization() {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(initializeAsciiBackgrounds, { timeout: 900 })
  } else {
    setTimeout(initializeAsciiBackgrounds, 200)
  }
}

if (document.readyState === "complete") {
  scheduleInitialization()
} else {
  window.addEventListener("load", scheduleInitialization, { once: true })
}
