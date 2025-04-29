/**
 * ASCII Background Core Module
 * Shared logic between Next.js and Jekyll implementations
 */

// Character sets
export const characterSets = {
  minimal: " .".split(""),
  dots: " .·•●".split(""),
  blocks: " ░▒▓█".split(""),
  // Improved code set with more visually distinct characters and better gradation
  code: [" ", ".", ":", "+", "=", "*", "#", "@", "$", "%", "&", "8", "B", "W", "M"],
  matrix: [
    " ",
    ".",
    "ｦ",
    "ｱ",
    "ﾊ",
    "ﾐ",
    "ﾋ",
    "ｰ",
    "ｳ",
    "ｼ",
    "ﾅ",
    "ﾓ",
    "ﾆ",
    "ｻ",
    "ﾜ",
    "ﾂ",
    "ｵ",
    "ﾘ",
    "ｱ",
    "ﾎ",
    "ﾃ",
    "ﾏ",
    "ｹ",
    "ﾒ",
    "ｴ",
    "ｶ",
    "ｷ",
    "ﾑ",
    "ﾕ",
    "ﾗ",
    "ｾ",
    "ﾈ",
  ],
  custom: [" ", ".", ":", "+", "=", "*", "#", "@", "$"], // Default custom characters
}

// Color palettes
export const colorPalettes = {
  stripe: ["#6366F1", "#EC4899", "#F472B6", "#8B5CF6", "#A855F7", "#3B82F6", "#06B6D4"],
  ocean: ["#0A2463", "#3E92CC", "#2CA6A4", "#44CF6C", "#A6EBC9"],
  sunset: ["#FF0080", "#FF8C00", "#FFD700", "#FF4500", "#FF1493", "#FF00FF", "#FF6347"],
  purple: ["#240046", "#3C096C", "#5A189A", "#7B2CBF", "#9D4EDD", "#C77DFF", "#E0AAFF"],
  cyberpunk: ["#00FFFF", "#FF00FF", "#00FF00", "#FE53BB", "#08F7FE", "#09FBD3", "#F5D300"],
}

// Default settings
export const defaultSettings = {
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
  fullscreen: true,
  // Add optical flow parameters
  flowAwareness: 0.7,
  flowSmoothing: 0.5,
  // Add entrance animation parameters
  entranceAnimation: true,
  entranceDirection: "bottom", // "top", "bottom", "left", "right", "center"
  entranceDuration: 1.5, // seconds
}

// Helper functions
export function getCharacters(characterSet, customCharacters) {
  if (characterSet === "custom" && customCharacters) {
    return customCharacters.split("")
  }
  return characterSets[characterSet] || characterSets.code
}

export function getColors(colorPalette, customColors) {
  if (colorPalette === "custom" && customColors && customColors.length > 1) {
    return customColors
  }
  return colorPalettes[colorPalette] || colorPalettes.stripe
}

// Noise function for gradient patterns
export function generateNoise(x, y, z, noiseScale, gradientSize, animationStyle) {
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
    // Add a constant rotation component to ensure continuous movement
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

// Add the calculateGradient function for optical flow
function calculateGradient(x, y, z, noiseScale, gradientSize, animationStyle) {
  const epsilon = 0.01 // Small value for numerical differentiation

  // Calculate noise at current position
  const center = generateNoise(x, y, z, noiseScale, gradientSize, animationStyle)

  // Calculate noise at slightly offset positions
  const right = generateNoise(x + epsilon, y, z, noiseScale, gradientSize, animationStyle)
  const up = generateNoise(x, y + epsilon, z, noiseScale, gradientSize, animationStyle)

  // Calculate the gradient (direction of steepest change)
  const dx = (right - center) / epsilon
  const dy = (up - center) / epsilon

  // Return the gradient vector and its magnitude
  const magnitude = Math.sqrt(dx * dx + dy * dy)
  return { dx, dy, magnitude }
}

// Color interpolation
export function interpolateColors(color1, color2, t) {
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

// Update the renderAsciiBackground function to use optical flow
export function renderAsciiBackground(ctx, dimensions, time, settings) {
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
    flowAwareness = 0.7,
    flowSmoothing = 0.5,
    entranceAnimation = true,
    entranceDirection = "bottom",
    entranceDuration = 1.5,
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

  // Initialize previous state if it doesn't exist
  if (!ctx.previousState) {
    ctx.previousState = Array(dimensions.height)
      .fill()
      .map(() =>
        Array(dimensions.width)
          .fill()
          .map(() => ({
            charIndex: 0,
            colorIndex: 0,
            noiseValue: 0,
            flowX: 0,
            flowY: 0,
          })),
      )

    // Initialize entrance animation state
    ctx.entranceStartTime = time
    ctx.isEntranceComplete = false
  }

  // Resize previous state if dimensions changed
  if (
    ctx.previousState.length !== dimensions.height ||
    (ctx.previousState[0] && ctx.previousState[0].length !== dimensions.width)
  ) {
    ctx.previousState = Array(dimensions.height)
      .fill()
      .map(() =>
        Array(dimensions.width)
          .fill()
          .map(() => ({
            charIndex: 0,
            colorIndex: 0,
            noiseValue: 0,
            flowX: 0,
            flowY: 0,
          })),
      )

    // Reset entrance animation on resize
    ctx.entranceStartTime = time
    ctx.isEntranceComplete = false
  }

  // Draw ASCII gradient
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.font = `${charWidth}px monospace`

  // Pre-calculate some values for optimization
  const timeOffset = time * noiseSpeed
  const colorCount = colors.length

  // Calculate entrance animation progress
  let entranceProgress = 1.0 // Default to fully visible
  if (entranceAnimation && !ctx.isEntranceComplete) {
    const elapsedTime = (time - ctx.entranceStartTime) * 10 // Scale time for faster animation
    entranceProgress = Math.min(elapsedTime / entranceDuration, 1.0)

    // Mark entrance as complete when done
    if (entranceProgress >= 1.0) {
      ctx.isEntranceComplete = true
    }
  }

  // First pass: calculate flow vectors for each position
  const flowVectors = Array(dimensions.height)
    .fill()
    .map(() =>
      Array(dimensions.width)
        .fill()
        .map(() => ({ dx: 0, dy: 0, magnitude: 0 })),
    )

  for (let y = 0; y < dimensions.height; y++) {
    for (let x = 0; x < dimensions.width; x++) {
      // Calculate the gradient (direction of change) at this position
      flowVectors[y][x] = calculateGradient(x, y, timeOffset, noiseScale, gradientSize, animationStyle)
    }
  }

  // Second pass: render with flow awareness and entrance animation
  for (let y = 0; y < dimensions.height; y++) {
    for (let x = 0; x < dimensions.width; x++) {
      // Apply entrance animation - determine if this cell should be visible yet
      let isVisible = true

      if (entranceAnimation && !ctx.isEntranceComplete) {
        // Calculate position-based visibility based on entrance direction
        let positionFactor = 0

        switch (entranceDirection) {
          case "top":
            positionFactor = y / dimensions.height
            break
          case "bottom":
            positionFactor = 1 - y / dimensions.height
            break
          case "left":
            positionFactor = x / dimensions.width
            break
          case "right":
            positionFactor = 1 - x / dimensions.width
            break
          case "center":
            const centerX = dimensions.width / 2
            const centerY = dimensions.height / 2
            const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
            const maxDistance = Math.sqrt(Math.pow(dimensions.width / 2, 2) + Math.pow(dimensions.height / 2, 2))
            positionFactor = 1 - distanceFromCenter / maxDistance
            break
          default:
            positionFactor = 1 // Fully visible
        }

        // Add some randomness to make it look more natural
        const randomOffset = Math.random() * 0.2

        // Cell is visible if entrance progress exceeds position factor
        isVisible = entranceProgress > positionFactor - randomOffset
      }

      if (!isVisible) {
        continue // Skip rendering this cell
      }

      // Get noise value for this position and time
      const noiseValue = (generateNoise(x, y, timeOffset, noiseScale, gradientSize, animationStyle) + 1) / 2 // Normalize to 0-1

      // Apply a more gradual mapping for smoother transitions
      const enhancedValue = Math.pow(noiseValue, transitionSmoothness)

      // Get the previous state for this position
      const prevState = ctx.previousState[y][x]

      // Get the flow vector for this position
      const flow = flowVectors[y][x]

      // Apply optical flow awareness
      let currentNoiseValue = enhancedValue

      if (flowAwareness > 0 && prevState) {
        // Calculate flow-aware value based on previous state and current flow
        const flowFactor = Math.min(flow.magnitude * flowAwareness, 1)

        // Blend between previous value and current value based on flow
        // Higher flow magnitude = more change allowed
        currentNoiseValue = prevState.noiseValue * (1 - flowFactor) + enhancedValue * flowFactor

        // Apply additional temporal smoothing
        if (flowSmoothing > 0) {
          currentNoiseValue = prevState.noiseValue * flowSmoothing + currentNoiseValue * (1 - flowSmoothing)
        }
      }

      // Select character based on noise
      const charIndex = Math.min(Math.floor(currentNoiseValue * characters.length * 0.8), characters.length - 1)
      const char = characters[charIndex] || "#"

      // Select color based on noise
      const colorPosition = currentNoiseValue * (colorCount - 1)
      const colorIndex = Math.floor(colorPosition)
      const nextColorIndex = Math.min(colorIndex + 1, colorCount - 1)

      // Calculate interpolation factor between the two colors
      const colorMix = colorPosition - colorIndex

      // Get the two colors to interpolate between
      const color1 = colors[colorIndex] || colors[0]
      const color2 = colors[nextColorIndex] || colors[colors.length - 1]

      // Interpolate between colors for smoother transitions
      const color = interpolateColors(color1, color2, colorMix)

      // Update the previous state
      ctx.previousState[y][x] = {
        charIndex,
        colorIndex,
        noiseValue: currentNoiseValue,
        flowX: flow.dx,
        flowY: flow.dy,
      }

      // Draw character
      ctx.fillStyle = color
      ctx.fillText(char, (x + 0.5) * charWidth, (y + 0.5) * charWidth)
    }
  }
}

// Update the formatConfigForCopy function to include the new parameters
export function formatConfigForCopy(settings) {
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
  showControls: ${settings.showControls},
  fullscreen: ${settings.fullscreen},
  flowAwareness: ${settings.flowAwareness || 0.7},
  flowSmoothing: ${settings.flowSmoothing || 0.5},
  entranceAnimation: ${settings.entranceAnimation !== undefined ? settings.entranceAnimation : true},
  entranceDirection: "${settings.entranceDirection || "bottom"}",
  entranceDuration: ${settings.entranceDuration || 1.5}
};
</script>`
}
