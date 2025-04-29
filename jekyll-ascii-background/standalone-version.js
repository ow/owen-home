// This is a standalone version that doesn't rely on React's module system
// Copy this file to your Jekyll assets/js directory

;(() => {
  // Character sets
  const characterSets = {
    minimal: " .".split(""),
    dots: " .·•●".split(""),
    blocks: " ░▒▓█".split(""),
    code: " .:-+*=%$#@{}[]()<>/\\|;:,\"'`~!?_&^%$#@<>~←→⇒⇐≠≈∞λΔπ".split(""),
  }

  // Color palettes
  const colorPalettes = {
    stripe: ["#6366F1", "#EC4899", "#F472B6", "#8B5CF6", "#A855F7", "#3B82F6", "#06B6D4"],
    ocean: ["#0A2463", "#3E92CC", "#2CA6A4", "#44CF6C", "#A6EBC9"],
    sunset: ["#FF0080", "#FF8C00", "#FFD700", "#FF4500", "#FF1493", "#FF00FF", "#FF6347"],
    purple: ["#240046", "#3C096C", "#5A189A", "#7B2CBF", "#9D4EDD", "#C77DFF", "#E0AAFF"],
    cyberpunk: ["#00FFFF", "#FF00FF", "#00FF00", "#FE53BB", "#08F7FE", "#09FBD3", "#F5D300"],
  }

  // Default settings
  const defaultSettings = {
    density: 30,
    speed: 30,
    opacity: 0.9,
    colorPalette: "stripe",
    customColors: ["#6366F1", "#EC4899", "#F472B6"],
    noiseScale: 0.015,
    noiseSpeed: 0.5,
    characterSet: "code",
    customCharacters: "",
    gradientSize: 1.5,
    animationStyle: "continuous",
    transitionSmoothness: 1.2,
    showControls: true,
  }

  // Helper functions
  function getCharacters(characterSet, customCharacters) {
    if (characterSet === "custom" && customCharacters) {
      return customCharacters.split("")
    }
    return characterSets[characterSet] || characterSets.code
  }

  function getColors(colorPalette, customColors) {
    if (colorPalette === "custom" && customColors && customColors.length > 1) {
      return customColors
    }
    return colorPalettes[colorPalette] || colorPalettes.stripe
  }

  // Noise function for gradient patterns
  function generateNoise(x, y, z, noiseScale, gradientSize, animationStyle) {
    // Scale down coordinates for larger gradient areas
    const scaledX = (x * noiseScale) / gradientSize
    const scaledY = (y * noiseScale) / gradientSize

    // Different animation styles
    if (animationStyle === "wave") {
      // Wave-like pattern with continuous movement
      return Math.sin(scaledX * 2 + z) * 0.5 + Math.cos(scaledY * 2 + z * 1.3) * 0.5
    } else if (animationStyle === "flow") {
      // Flowing pattern with multiple frequencies
      return (
        Math.sin(scaledX + z) * Math.cos(scaledY + z * 0.8) * 0.5 + Math.sin((scaledX + scaledY) * 0.7 + z * 1.3) * 0.5
      )
    } else if (animationStyle === "pulse") {
      // Pulsing pattern with radial component
      const dist = Math.sqrt(scaledX * scaledX + scaledY * scaledY)
      return Math.sin(dist * 3 - z * 2) * 0.5 + Math.cos(z) * 0.5
    } else {
      // Continuous movement with multiple overlapping patterns
      const rotX = scaledX * Math.cos(z * 0.1) - scaledY * Math.sin(z * 0.1)
      const rotY = scaledX * Math.sin(z * 0.1) + scaledY * Math.cos(z * 0.1)

      // Create multiple overlapping waves with different frequencies
      const value =
        Math.sin(rotX * 1.5 + z) * 0.3 +
        Math.cos(rotY * 1.5 + z * 0.7) * 0.3 +
        Math.sin(rotX * 0.8 + rotY * 0.8 + z * 1.1) * 0.2 +
        Math.sin(Math.sqrt(rotX * rotX + rotY * rotY) * 2 + z * 1.5) * 0.2

      // Add a time-based oscillation to ensure movement even in "dead zones"
      const timeOscillation = Math.sin(z * 2) * 0.1

      return value + timeOscillation
    }
  }

  // Color interpolation
  function interpolateColors(color1, color2, t) {
    // Validate inputs - use fallback colors if any are invalid
    if (!color1 || typeof color1 !== "string" || !color1.startsWith("#") || color1.length < 7) {
      color1 = "#6366F1" // Default fallback color
    }

    if (!color2 || typeof color2 !== "string" || !color2.startsWith("#") || color2.length < 7) {
      color2 = "#EC4899" // Default fallback color
    }

    try {
      // Parse colors
      const r1 = Number.parseInt(color1.slice(1, 3), 16)
      const g1 = Number.parseInt(color1.slice(3, 5), 16)
      const b1 = Number.parseInt(color1.slice(5, 7), 16)

      const r2 = Number.parseInt(color2.slice(1, 3), 16)
      const g2 = Number.parseInt(color2.slice(3, 5), 16)
      const b2 = Number.parseInt(color2.slice(5, 7), 16)

      // Interpolate
      const r = Math.round(r1 + (r2 - r1) * t)
      const g = Math.round(g1 + (g2 - g1) * t)
      const b = Math.round(b1 + (b2 - b1) * t)

      // Convert back to hex
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
    } catch (e) {
      // If anything goes wrong, return a safe default color
      return "#6366F1"
    }
  }

  // Render function for canvas
  function renderAsciiBackground(ctx, dimensions, time, settings) {
    const {
      density,
      characterSet,
      customCharacters,
      colorPalette,
      customColors,
      noiseScale,
      noiseSpeed,
      gradientSize,
      animationStyle,
      transitionSmoothness,
    } = settings

    if (!ctx || dimensions.width === 0 || dimensions.height === 0) return

    // Set canvas dimensions
    const charWidth = Math.max(8, density / 3)
    ctx.canvas.width = dimensions.width * charWidth
    ctx.canvas.height = dimensions.height * charWidth

    // Clear canvas
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    const characters = getCharacters(characterSet, customCharacters)
    const colors = getColors(colorPalette, customColors)

    // Ensure we have valid colors and characters
    if (characters.length === 0 || colors.length === 0) return

    // Draw ASCII gradient
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.font = `${charWidth}px monospace`

    // Pre-calculate some values for optimization
    const timeOffset = time * noiseSpeed
    const colorCount = colors.length

    for (let y = 0; y < dimensions.height; y++) {
      for (let x = 0; x < dimensions.width; x++) {
        // Get noise value for this position and time
        const noiseValue = (generateNoise(x, y, timeOffset, noiseScale, gradientSize, animationStyle) + 1) / 2 // Normalize to 0-1

        // Apply a more gradual mapping for smoother transitions
        // Higher values create smoother transitions
        const enhancedValue = Math.pow(noiseValue, transitionSmoothness)

        // Select character based on noise - use more variation
        const charIndex = Math.min(Math.floor(enhancedValue * characters.length * 0.8), characters.length - 1)
        const char = characters[charIndex] || "#"

        // Select color based on noise - with bounds checking
        // Map noise value to color index, ensuring smooth transitions between colors
        const colorPosition = enhancedValue * (colorCount - 1)
        const colorIndex = Math.floor(colorPosition)
        const nextColorIndex = Math.min(colorIndex + 1, colorCount - 1)

        // Calculate interpolation factor between the two colors
        const colorMix = colorPosition - colorIndex

        // Get the two colors to interpolate between
        const color1 = colors[colorIndex] || colors[0]
        const color2 = colors[nextColorIndex] || colors[colors.length - 1]

        // Interpolate between colors for smoother transitions
        const color = interpolateColors(color1, color2, colorMix)

        // Draw character
        ctx.fillStyle = color
        ctx.fillText(char, (x + 0.5) * charWidth, (y + 0.5) * charWidth)
      }
    }
  }

  // Format configuration for copying
  function formatConfigForCopy(settings) {
    return `<script>
window.asciiConfig = {
  density: ${settings.density},
  speed: ${settings.speed},
  opacity: ${settings.opacity},
  colorPalette: "${settings.colorPalette}",
  noiseScale: ${settings.noiseScale},
  noiseSpeed: ${settings.noiseSpeed},
  characterSet: "${settings.characterSet}",
  gradientSize: ${settings.gradientSize},
  animationStyle: "${settings.animationStyle}",
  transitionSmoothness: ${settings.transitionSmoothness || 1.2},
  showControls: ${settings.showControls}
};
</script>`
  }

  // Main class for the ASCII background
  class AsciiBackground {
    constructor(rootElement, config = {}) {
      this.rootElement = rootElement
      this.settings = { ...defaultSettings, ...config }
      this.dimensions = { width: 0, height: 0 }
      this.time = 0
      this.canvas = document.createElement("canvas")
      this.ctx = this.canvas.getContext("2d")
      this.animationId = null

      // Create container
      this.container = document.createElement("div")
      this.container.style.position = "fixed"
      this.container.style.inset = "0"
      this.container.style.overflow = "hidden"
      this.container.style.pointerEvents = "none"
      this.container.style.zIndex = "-1"
      this.container.style.opacity = this.settings.opacity
      this.container.setAttribute("aria-hidden", "true")

      // Style canvas
      this.canvas.style.width = "100%"
      this.canvas.style.height = "100%"
      this.canvas.style.backgroundColor = "#000"

      // Append elements
      this.container.appendChild(this.canvas)
      this.rootElement.appendChild(this.container)

      // Initialize
      this.updateDimensions()
      window.addEventListener("resize", this.updateDimensions.bind(this))

      // Start animation
      this.animate()

      // Add control panel if enabled
      if (this.settings.showControls) {
        this.addControlPanel()
      }
    }

    updateDimensions() {
      const charWidth = Math.max(8, this.settings.density / 3)
      const width = Math.floor(window.innerWidth / charWidth)
      const height = Math.floor(window.innerHeight / charWidth)
      this.dimensions = { width, height }
    }

    animate() {
      this.time += this.settings.speed * 0.0001
      renderAsciiBackground(this.ctx, this.dimensions, this.time, this.settings)
      this.animationId = requestAnimationFrame(this.animate.bind(this))
    }

    addControlPanel() {
      // Create control panel elements
      const panel = document.createElement("div")
      panel.className = "ascii-control-panel"

      // Create toggle button
      const toggleBtn = document.createElement("button")
      toggleBtn.className = "ascii-control-button"
      toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`

      let isOpen = false
      let controlContent = null

      toggleBtn.addEventListener("click", () => {
        isOpen = !isOpen

        if (isOpen) {
          if (!controlContent) {
            // Create control content if it doesn't exist
            controlContent = this.createControlContent()
            panel.appendChild(controlContent)
          } else {
            controlContent.style.display = "block"
          }
        } else if (controlContent) {
          controlContent.style.display = "none"
        }
      })

      panel.appendChild(toggleBtn)
      document.body.appendChild(panel)
    }

    createControlContent() {
      const content = document.createElement("div")
      content.className = "ascii-control-content"

      // Create tabs
      const tabs = document.createElement("div")
      tabs.className = "ascii-tabs"

      const appearanceTab = document.createElement("button")
      appearanceTab.textContent = "Appearance"
      appearanceTab.className = "active"

      const animationTab = document.createElement("button")
      animationTab.textContent = "Animation"

      tabs.appendChild(appearanceTab)
      tabs.appendChild(animationTab)

      // Create tab content containers
      const appearanceContent = document.createElement("div")
      appearanceContent.className = "ascii-tab-content"

      const animationContent = document.createElement("div")
      animationContent.className = "ascii-tab-content"
      animationContent.style.display = "none"

      // Tab switching logic
      appearanceTab.addEventListener("click", () => {
        appearanceTab.className = "active"
        animationTab.className = ""
        appearanceContent.style.display = "block"
        animationContent.style.display = "none"
      })

      animationTab.addEventListener("click", () => {
        animationTab.className = "active"
        appearanceTab.className = ""
        appearanceContent.style.display = "none"
        animationContent.style.display = "block"
      })

      // Add appearance controls
      this.addAppearanceControls(appearanceContent)

      // Add animation controls
      this.addAnimationControls(animationContent)

      // Add copy button section
      const copySection = document.createElement("div")
      copySection.className = "ascii-control-group copy-section"

      const copyButton = document.createElement("button")
      copyButton.className = "ascii-copy-button"
      copyButton.textContent = "Copy Configuration"

      const copyHint = document.createElement("p")
      copyHint.className = "copy-hint"
      copyHint.textContent = "Copies JavaScript config for pasting in your Jekyll layouts"

      copyButton.addEventListener("click", () => {
        const jsConfig = formatConfigForCopy(this.settings)
        navigator.clipboard
          .writeText(jsConfig)
          .then(() => {
            copyButton.textContent = "Copied!"
            copyButton.className = "ascii-copy-button success"
            setTimeout(() => {
              copyButton.textContent = "Copy Configuration"
              copyButton.className = "ascii-copy-button"
            }, 2000)
          })
          .catch((err) => {
            console.error("Failed to copy: ", err)
            alert("Failed to copy configuration. Please check console for details.")
          })
      })

      copySection.appendChild(copyButton)
      copySection.appendChild(copyHint)

      // Assemble the control content
      content.appendChild(tabs)
      content.appendChild(appearanceContent)
      content.appendChild(animationContent)
      content.appendChild(copySection)

      return content
    }

    addAppearanceControls(container) {
      // Color palette selector
      const colorGroup = document.createElement("div")
      colorGroup.className = "ascii-control-group"

      const colorLabel = document.createElement("label")
      colorLabel.textContent = "Color Palette"

      const colorSelect = document.createElement("select")
      const palettes = ["stripe", "ocean", "sunset", "purple", "cyberpunk", "custom"]

      palettes.forEach((palette) => {
        const option = document.createElement("option")
        option.value = palette
        option.textContent = palette.charAt(0).toUpperCase() + palette.slice(1)
        if (palette === this.settings.colorPalette) {
          option.selected = true
        }
        colorSelect.appendChild(option)
      })

      colorSelect.addEventListener("change", (e) => {
        this.settings.colorPalette = e.target.value
      })

      colorGroup.appendChild(colorLabel)
      colorGroup.appendChild(colorSelect)
      container.appendChild(colorGroup)

      // Character set selector
      const charGroup = document.createElement("div")
      charGroup.className = "ascii-control-group"

      const charLabel = document.createElement("label")
      charLabel.textContent = "Character Set"

      const charSelect = document.createElement("select")
      const charSets = ["minimal", "dots", "blocks", "code", "custom"]

      charSets.forEach((set) => {
        const option = document.createElement("option")
        option.value = set
        option.textContent = set.charAt(0).toUpperCase() + set.slice(1)
        if (set === this.settings.characterSet) {
          option.selected = true
        }
        charSelect.appendChild(option)
      })

      charSelect.addEventListener("change", (e) => {
        this.settings.characterSet = e.target.value
      })

      charGroup.appendChild(charLabel)
      charGroup.appendChild(charSelect)
      container.appendChild(charGroup)

      // Density slider
      const densityGroup = document.createElement("div")
      densityGroup.className = "ascii-control-group"

      const densityLabel = document.createElement("label")
      densityLabel.textContent = `Density: ${this.settings.density}`

      const densitySlider = document.createElement("input")
      densitySlider.type = "range"
      densitySlider.min = "10"
      densitySlider.max = "60"
      densitySlider.step = "5"
      densitySlider.value = this.settings.density

      densitySlider.addEventListener("input", (e) => {
        this.settings.density = Number.parseInt(e.target.value)
        densityLabel.textContent = `Density: ${this.settings.density}`
        this.updateDimensions()
      })

      densityGroup.appendChild(densityLabel)
      densityGroup.appendChild(densitySlider)
      container.appendChild(densityGroup)

      // Opacity slider
      const opacityGroup = document.createElement("div")
      opacityGroup.className = "ascii-control-group"

      const opacityLabel = document.createElement("label")
      opacityLabel.textContent = `Opacity: ${this.settings.opacity}`

      const opacitySlider = document.createElement("input")
      opacitySlider.type = "range"
      opacitySlider.min = "0.1"
      opacitySlider.max = "1.0"
      opacitySlider.step = "0.1"
      opacitySlider.value = this.settings.opacity

      opacitySlider.addEventListener("input", (e) => {
        this.settings.opacity = Number.parseFloat(e.target.value)
        opacityLabel.textContent = `Opacity: ${this.settings.opacity}`
        this.container.style.opacity = this.settings.opacity
      })

      opacityGroup.appendChild(opacityLabel)
      opacityGroup.appendChild(opacitySlider)
      container.appendChild(opacityGroup)
    }

    addAnimationControls(container) {
      // Animation style selector
      const styleGroup = document.createElement("div")
      styleGroup.className = "ascii-control-group"

      const styleLabel = document.createElement("label")
      styleLabel.textContent = "Animation Style"

      const styleSelect = document.createElement("select")
      const styles = ["continuous", "wave", "flow", "pulse"]

      styles.forEach((style) => {
        const option = document.createElement("option")
        option.value = style
        option.textContent = style.charAt(0).toUpperCase() + style.slice(1)
        if (style === this.settings.animationStyle) {
          option.selected = true
        }
        styleSelect.appendChild(option)
      })

      styleSelect.addEventListener("change", (e) => {
        this.settings.animationStyle = e.target.value
      })

      styleGroup.appendChild(styleLabel)
      styleGroup.appendChild(styleSelect)
      container.appendChild(styleGroup)

      // Speed slider
      const speedGroup = document.createElement("div")
      speedGroup.className = "ascii-control-group"

      const speedLabel = document.createElement("label")
      speedLabel.textContent = `Animation Speed: ${this.settings.speed}`

      const speedSlider = document.createElement("input")
      speedSlider.type = "range"
      speedSlider.min = "5"
      speedSlider.max = "100"
      speedSlider.step = "5"
      speedSlider.value = this.settings.speed

      speedSlider.addEventListener("input", (e) => {
        this.settings.speed = Number.parseInt(e.target.value)
        speedLabel.textContent = `Animation Speed: ${this.settings.speed}`
      })

      speedGroup.appendChild(speedLabel)
      speedGroup.appendChild(speedSlider)
      container.appendChild(speedGroup)

      // Gradient size slider
      const gradientGroup = document.createElement("div")
      gradientGroup.className = "ascii-control-group"

      const gradientLabel = document.createElement("label")
      gradientLabel.textContent = `Gradient Size: ${this.settings.gradientSize}`

      const gradientSlider = document.createElement("input")
      gradientSlider.type = "range"
      gradientSlider.min = "0.5"
      gradientSlider.max = "5"
      gradientSlider.step = "0.5"
      gradientSlider.value = this.settings.gradientSize

      gradientSlider.addEventListener("input", (e) => {
        this.settings.gradientSize = Number.parseFloat(e.target.value)
        gradientLabel.textContent = `Gradient Size: ${this.settings.gradientSize}`
      })

      gradientGroup.appendChild(gradientLabel)
      gradientGroup.appendChild(gradientSlider)
      container.appendChild(gradientGroup)

      // Pattern detail slider
      const noiseScaleGroup = document.createElement("div")
      noiseScaleGroup.className = "ascii-control-group"

      const noiseScaleLabel = document.createElement("label")
      noiseScaleLabel.textContent = `Pattern Detail: ${this.settings.noiseScale}`

      const noiseScaleSlider = document.createElement("input")
      noiseScaleSlider.type = "range"
      noiseScaleSlider.min = "0.005"
      noiseScaleSlider.max = "0.05"
      noiseScaleSlider.step = "0.005"
      noiseScaleSlider.value = this.settings.noiseScale

      noiseScaleSlider.addEventListener("input", (e) => {
        this.settings.noiseScale = Number.parseFloat(e.target.value)
        noiseScaleLabel.textContent = `Pattern Detail: ${this.settings.noiseScale}`
      })

      noiseScaleGroup.appendChild(noiseScaleLabel)
      noiseScaleGroup.appendChild(noiseScaleSlider)
      container.appendChild(noiseScaleGroup)
    }

    destroy() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
      }
      window.removeEventListener("resize", this.updateDimensions)
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container)
      }
    }
  }

  // Initialize when DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    const rootElement = document.getElementById("ascii-background-root")
    if (rootElement) {
      // Use page config if available, otherwise use defaults
      const config = window.asciiConfig || {}
      new AsciiBackground(rootElement, config)
    }
  })
})()
