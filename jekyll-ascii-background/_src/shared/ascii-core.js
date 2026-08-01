/**
 * ASCII Background Core Module
 * Shared logic between Next.js and Jekyll implementations
 */

// Character sets
export const characterSets = {
  minimal: " .".split(""),
  dots: " .·•●".split(""),
  blocks: " ░▒▓█".split(""),
  // Ordered by visual weight so broad color fields read like a true ASCII gradient.
  gradient: [" ", " ", ".", ":", ";", "+", "=", "*", "#", "%", "@"],
  // Improved code set with more visually distinct characters and better gradation
  code: ["(", ")", ".", ";", "+", "=", "*", "#", "@", "$", "%", "&", "<", ">", "{", "}", "/", "~"],
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
  green: ["#22c55e", "#16a34a", "#059669", "#0d9488", "#0891b2", "#0e7490", "#0369a1", "#1d4ed8", "#2563eb", "#3b82f6"],
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
  colorPalette: "green",
  customColors: ["#6366F1", "#EC4899", "#F472B6"],
  noiseScale: 0.015,
  noiseSpeed: 0.5,
  characterSet: "code",
  customCharacters: "",
  gradientSize: 1.5,
  animationStyle: "continuous",
  transitionSmoothness: 1.2,
  showControls: true,
  showFps: false,
  fullscreen: true,
  // Add optical flow parameters
  flowAwareness: 0.7,
  flowSmoothing: 0.5,
  // Add entrance animation parameters
  entranceAnimation: true,
  entranceDirection: "bottom", // "top", "bottom", "left", "right", "center"
  entranceDuration: 1.5, // seconds
  // Add accessibility parameters
  respectReducedMotion: true, // Respect user's prefers-reduced-motion setting
  reducedMotionStyle: "static", // "static", "minimal", "slow"
  reducedMotionFadeIn: true, // Fade in the static background
  reducedMotionFadeDuration: 1.0, // seconds
  // Add wave-specific parameters
  waveFlowDirection: 45, // degrees (0 = right, 90 = down, 180 = left, 270 = up)
  waveIntensity: 1.0, // 0.1 to 2.0 - controls wave amplitude
  waveLayers: 3, // 1 to 5 - number of wave layers
  waveOrganicFactor: 0.1, // 0 to 0.5 - amount of organic noise
  // Complexity field settings. Disabled by default so existing uses remain unchanged.
  complexityField: false,
  clarityAnchorX: 0.3,
  clarityAnchorY: 0.28,
  clarityRadiusX: 0.42,
  clarityRadiusY: 0.34,
  clarityStrength: 0.88,
  clarityQuieting: 0.18,
  edgeTurbulence: 0.72,
  interactiveMode: false,
  interactiveEffect: "refraction",
  interactiveRadius: 0.18,
  interactiveIntensity: 0.75,
  pointer: null,
}

// Helper functions
export function getCharacters(characterSet, customCharacters) {
  // Handle custom characters
  if (characterSet === "custom" && customCharacters && typeof customCharacters === "string" && customCharacters.length > 0) {
    return customCharacters.split("")
  }
  
  // Handle undefined, null, empty string, or invalid character set
  if (!characterSet || typeof characterSet !== "string" || characterSet.trim() === "") {
    return characterSets.code // Default fallback
  }
  
  // Get the requested character set or fall back to code
  const charset = characterSets[characterSet.trim()]
  if (charset && Array.isArray(charset) && charset.length > 0) {
    return charset
  }
  
  // Final fallback to code character set
  return characterSets.code
}

export function getColors(colorPalette, customColors) {
  // Handle custom colors
  if (colorPalette === "custom" && customColors && Array.isArray(customColors) && customColors.length > 1) {
    return customColors
  }
  
  // Handle undefined, null, empty string, or invalid color palette
  if (!colorPalette || typeof colorPalette !== "string" || colorPalette.trim() === "") {
    return colorPalettes.ocean // Default fallback
  }
  
  // Get the requested palette or fall back to ocean
  const palette = colorPalettes[colorPalette.trim()]
  if (palette && Array.isArray(palette) && palette.length > 0) {
    return palette
  }
  
  // Final fallback to ocean if the requested palette doesn't exist
  return colorPalettes.ocean
}

// Generate a static gradient pattern for reduced motion
export function generateStaticPattern(x, y, gradientSize, noiseScale) {
  // Create a static gradient pattern based on position
  const scaledX = (x * noiseScale) / gradientSize
  const scaledY = (y * noiseScale) / gradientSize

  // Simple gradient pattern that doesn't change with time
  const pattern = Math.sin(scaledX * 2) * 0.5 + Math.cos(scaledY * 2) * 0.5 + Math.sin((scaledX + scaledY) * 1.5) * 0.3

  // Normalize to 0-1 range
  return (pattern + 1) / 2
}

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max)
}

function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

const bayer4x4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

function getComplexityFieldAmount(x, y, waveSettings) {
  if (!waveSettings.complexityField) {
    return { clarity: 0, complexity: 1, normalizedX: 0, normalizedY: 0 }
  }

  const fieldWidth = Math.max(waveSettings.fieldWidth || 1, 1)
  const fieldHeight = Math.max(waveSettings.fieldHeight || 1, 1)
  const normalizedX = x / Math.max(fieldWidth - 1, 1)
  const normalizedY = y / Math.max(fieldHeight - 1, 1)
  const isPortrait = fieldWidth / fieldHeight < 0.85
  const anchorX = isPortrait ? 0.5 : waveSettings.clarityAnchorX
  const radiusX = isPortrait
    ? Math.max(waveSettings.clarityRadiusX, 0.62)
    : waveSettings.clarityRadiusX
  const radiusY = isPortrait
    ? Math.max(waveSettings.clarityRadiusY, 0.38)
    : waveSettings.clarityRadiusY
  const offsetX = (normalizedX - anchorX) / Math.max(radiusX, 0.01)
  const offsetY = (normalizedY - waveSettings.clarityAnchorY) / Math.max(radiusY, 0.01)
  const ellipticalDistance = Math.sqrt(offsetX * offsetX + offsetY * offsetY)
  const clarity = (1 - smoothstep(0.12, 1, ellipticalDistance)) * waveSettings.clarityStrength

  return {
    clarity,
    complexity: 1 - clarity,
    normalizedX,
    normalizedY,
  }
}

// Update the generateNoise function to make ripples more visible
export function generateNoise(x, y, z, noiseScale, gradientSize, animationStyle, ripples = [], reducedMotion = false, waveSettings = {}) {
  // Non-wave styles keep their existing static reduced-motion composition.
  if (reducedMotion && animationStyle !== "wave") {
    return generateStaticPattern(x, y, gradientSize, noiseScale)
  }

  // Scale down coordinates for larger gradient areas
  const scaledX = (x * noiseScale) / gradientSize
  const scaledY = (y * noiseScale) / gradientSize

  // Calculate base noise value based on animation style
  let baseNoise = 0

  if (animationStyle === "wave") {
    // Extract wave settings with defaults
    const {
      waveFlowDirection = 45,
      waveIntensity = 1.0,
      waveLayers = 3,
      waveOrganicFactor = 0.1,
      edgeTurbulence = 0.72,
      interactiveMode = false,
      interactiveEffect = "refraction",
      interactiveRadius = 0.18,
      interactiveIntensity = 0.75,
      pointer = null,
    } = waveSettings

    const waveTime = reducedMotion ? 0.42 : z
    const { complexity, normalizedX, normalizedY } = getComplexityFieldAmount(x, y, waveSettings)

    // Convert flow direction to radians
    const flowAngle = (waveFlowDirection * Math.PI) / 180
    const flowX = Math.cos(flowAngle)
    const flowY = Math.sin(flowAngle)

    // The outer field carries more phase interference while the hero region resolves
    // into one broad, legible gradient wave.
    const phaseTurbulence = waveSettings.complexityField
      ? (
          Math.sin(scaledX * 4.8 + scaledY * 1.6 - waveTime * 0.35) * 0.58 +
          Math.cos(scaledY * 5.2 - scaledX * 1.1 + waveTime * 0.24) * 0.42
        ) * edgeTurbulence * complexity
      : 0

    let refraction = 0
    if (
      !reducedMotion &&
      interactiveMode &&
      interactiveEffect === "refraction" &&
      pointer &&
      pointer.activity > 0.001
    ) {
      const pointerX = normalizedX - pointer.x
      const pointerY = normalizedY - pointer.y
      const pointerDistance = Math.sqrt(pointerX * pointerX + pointerY * pointerY)
      const lens = Math.exp(-Math.pow(pointerDistance / Math.max(interactiveRadius, 0.01), 2) * 1.8)
      const crossFlow = pointerX * flowY - pointerY * flowX
      refraction = crossFlow * lens * interactiveIntensity * pointer.activity * 8
    }

    // Primary wave direction based on user setting.
    const primaryFlow = scaledX * flowX + scaledY * flowY + waveTime * 1.5 + phaseTurbulence + refraction
    
    // Main wave with adjustable intensity
    let waveSum = Math.sin(primaryFlow) * 0.56 * waveIntensity
    
    // Add additional wave layers if requested
    if (waveLayers >= 2) {
      // Secondary wave (perpendicular to main flow)
      const perpX = -flowY
      const perpY = flowX
      const secondaryAmplitude = waveSettings.complexityField ? 0.07 + complexity * 0.18 : 0.25
      const secondaryWave = Math.sin(scaledX * perpX * 1.5 + scaledY * perpY * 1.5 + waveTime * 0.8) * secondaryAmplitude * waveIntensity
      waveSum += secondaryWave
    }
    
    if (waveLayers >= 3) {
      // Tertiary wave for subtle texture
      const tertiaryAmplitude = waveSettings.complexityField ? 0.03 + complexity * 0.12 : 0.15
      const tertiaryWave = Math.sin(scaledX * 1.2 + scaledY * 0.8 + waveTime * 1.2) * tertiaryAmplitude * waveIntensity
      waveSum += tertiaryWave
    }
    
    if (waveLayers >= 4) {
      // Quaternary wave for more complexity
      const quaternaryWave = Math.sin(scaledX * 0.7 + scaledY * 1.3 + waveTime * 0.9) * 0.1 * complexity * waveIntensity
      waveSum += quaternaryWave
    }
    
    if (waveLayers >= 5) {
      // Fifth wave for maximum detail
      const fifthWave = Math.sin(scaledX * 1.8 + scaledY * 0.4 + waveTime * 1.6) * 0.08 * complexity * waveIntensity
      waveSum += fifthWave
    }
    
    // Add organic noise based on user setting
    const organicAmount = waveSettings.complexityField ? 0.18 + complexity * 0.82 : 1
    const organicNoise = Math.sin(scaledX * 2.3 + waveTime * 0.6) * Math.cos(scaledY * 1.8 + waveTime * 0.9) * waveOrganicFactor * organicAmount * waveIntensity
    
    baseNoise = waveSum + organicNoise
  } else if (animationStyle === "flow") {
    // Flowing pattern with multiple frequencies
    baseNoise =
      Math.sin(scaledX + z) * Math.cos(scaledY + z * 0.8) * 0.5 + Math.sin((scaledX + scaledY) * 0.7 + z * 1.3) * 0.5
  } else if (animationStyle === "pulse") {
    // Pulsing pattern with radial component
    const dist = Math.sqrt(scaledX * scaledX + scaledY * scaledY)
    baseNoise = Math.sin(dist * 3 - z * 2) * 0.5 + Math.cos(z) * 0.5
  } else {
    // Continuous movement with multiple overlapping patterns
    // Add a constant rotation component to ensure continuous movement
    const rotX = scaledX * Math.cos(z * 0.1) - scaledY * Math.sin(z * 0.1)
    const rotY = scaledX * Math.sin(z * 0.1) + scaledY * Math.cos(z * 0.1)

    // Create multiple overlapping waves with different frequencies
    baseNoise =
      Math.sin(rotX * 1.5 + z) * 0.3 +
      Math.cos(rotY * 1.5 + z * 0.7) * 0.3 +
      Math.sin(rotX * 0.8 + rotY * 0.8 + z * 1.1) * 0.2 +
      Math.sin(Math.sqrt(rotX * rotX + rotY * rotY) * 2 + z * 1.5) * 0.2

    // Add a time-based oscillation to ensure movement even in "dead zones"
    const timeOscillation = Math.sin(z * 2) * 0.1
    baseNoise += timeOscillation
  }

  // Apply ripple effects if any exist
  let rippleEffect = 0
  if (ripples && ripples.length > 0) {
    for (const ripple of ripples) {
      // Calculate distance from ripple center
      const dx = x - ripple.x
      const dy = y - ripple.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Calculate ripple effect based on distance and time
      const rippleProgress = (z - ripple.startTime) * 2 // Speed up time for ripple
      const rippleRadius = ripple.radius * rippleProgress
      const rippleWidth = ripple.radius * 0.5

      // Only apply ripple if within the expanding ring
      if (distance > rippleRadius - rippleWidth && distance < rippleRadius + rippleWidth) {
        // Calculate intensity based on ripple age
        const age = (z - ripple.startTime) / ripple.duration
        if (age < 1.0) {
          const intensity = (1.0 - age) * ripple.intensity * 2.0 // Increased intensity for visibility

          // Different ripple effects
          if (ripple.effect === "explosion") {
            // Explosion effect - characters scatter outward
            rippleEffect += (Math.sin(distance * 0.5 - rippleProgress * 5) * 0.5 + 0.5) * intensity * 1.5
          } else if (ripple.effect === "color") {
            // Color effect - handled separately in the rendering code
            // Just mark this cell as affected
            rippleEffect += 0.05 * intensity // Increased for visibility
          } else if (ripple.effect === "density") {
            // Density effect - increase character density
            rippleEffect += Math.sin(distance * 2 - rippleProgress * 3) * intensity * 0.6
          } else {
            // Default ripple effect
            rippleEffect += Math.sin(distance - rippleProgress * 3) * intensity * 1.0
          }
        }
      }
    }
  }

  // Combine base noise with ripple effect - make ripples more prominent
  return baseNoise + rippleEffect * 1.5 // Increased multiplier for visibility
}

// Add the calculateGradient function for optical flow
function calculateGradient(x, y, z, noiseScale, gradientSize, animationStyle, ripples = [], reducedMotion = false, waveSettings = {}) {
  const epsilon = 0.01 // Small value for numerical differentiation

  // Calculate noise at current position
  const center = generateNoise(x, y, z, noiseScale, gradientSize, animationStyle, ripples, reducedMotion, waveSettings)

  // Calculate noise at slightly offset positions
  const right = generateNoise(x + epsilon, y, z, noiseScale, gradientSize, animationStyle, ripples, reducedMotion, waveSettings)
  const up = generateNoise(x, y + epsilon, z, noiseScale, gradientSize, animationStyle, ripples, reducedMotion, waveSettings)

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

// Add dirty region tracking utilities
function createDirtyRegionTracker(width, height) {
  return {
    regions: [],
    cellChanges: Array(height).fill().map(() => Array(width).fill(false)),
    
    markDirty(x, y) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        this.cellChanges[y][x] = true
      }
    },
    
    // Batch nearby dirty cells into rectangular regions for efficient clearing
    calculateDirtyRegions(charWidth) {
      this.regions = []
      const visited = Array(height).fill().map(() => Array(width).fill(false))
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (this.cellChanges[y][x] && !visited[y][x]) {
            // Find the bounds of this dirty region
            let minX = x, maxX = x, minY = y, maxY = y
            
            // Expand region to include nearby dirty cells (simple rectangular expansion)
            for (let dy = 0; dy < Math.min(8, height - y); dy++) {
              for (let dx = 0; dx < Math.min(8, width - x); dx++) {
                if (this.cellChanges[y + dy] && this.cellChanges[y + dy][x + dx]) {
                  maxX = Math.max(maxX, x + dx)
                  maxY = Math.max(maxY, y + dy)
                }
              }
            }
            
            // Mark all cells in this region as visited
            for (let ry = minY; ry <= maxY; ry++) {
              for (let rx = minX; rx <= maxX; rx++) {
                if (ry < height && rx < width) {
                  visited[ry][rx] = true
                }
              }
            }
            
            // Add the region (convert to canvas coordinates)
            this.regions.push({
              x: minX * charWidth,
              y: minY * charWidth,
              width: (maxX - minX + 1) * charWidth,
              height: (maxY - minY + 1) * charWidth,
              cellMinX: minX,
              cellMaxX: maxX,
              cellMinY: minY,
              cellMaxY: maxY
            })
          }
        }
      }
    },
    
    clear() {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          this.cellChanges[y][x] = false
        }
      }
      this.regions = []
    },
    
    isEmpty() {
      return this.regions.length === 0
    }
  }
}

// Helper function to detect if a cell has changed significantly
function hasCellChanged(newState, oldState, threshold = 0.1, isEarlyFrame = false) {
  if (!oldState) return true
  
  // Use a much lower threshold for early frames to ensure everything renders
  const effectiveThreshold = isEarlyFrame ? 0.01 : threshold
  
  // Check if character changed
  if (newState.charIndex !== oldState.charIndex) return true
  
  // Check if color changed significantly
  if (Math.abs(newState.colorIndex - oldState.colorIndex) > effectiveThreshold) return true
  
  // Check if noise value changed significantly
  if (Math.abs(newState.noiseValue - oldState.noiseValue) > effectiveThreshold) return true
  
  return false
}

export function renderAsciiBackground(ctx, dimensions, time, settings, ripples = [], reducedMotion = false, backgroundColor = "#000") {
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
    reducedMotionFadeIn = true,
    reducedMotionFadeDuration = 1.0,
    // Extract wave-specific settings
    waveFlowDirection = 45,
    waveIntensity = 1.0,
    waveLayers = 3,
    waveOrganicFactor = 0.1,
    complexityField = false,
    clarityAnchorX = 0.3,
    clarityAnchorY = 0.28,
    clarityRadiusX = 0.42,
    clarityRadiusY = 0.34,
    clarityStrength = 0.88,
    clarityQuieting = 0.18,
    edgeTurbulence = 0.72,
    interactiveMode = false,
    interactiveEffect = "refraction",
    interactiveRadius = 0.18,
    interactiveIntensity = 0.75,
    pointer = null,
  } = settings

  if (!ctx || dimensions.width === 0 || dimensions.height === 0) return

  // Create wave settings object
  const waveSettings = {
    waveFlowDirection,
    waveIntensity,
    waveLayers,
    waveOrganicFactor,
    complexityField,
    clarityAnchorX,
    clarityAnchorY,
    clarityRadiusX,
    clarityRadiusY,
    clarityStrength,
    clarityQuieting,
    edgeTurbulence,
    interactiveMode,
    interactiveEffect,
    interactiveRadius,
    interactiveIntensity,
    pointer,
    fieldWidth: dimensions.width,
    fieldHeight: dimensions.height,
  }

  // Calculate canvas dimensions
  const charWidth = Math.max(8, density / 3)
  
  // Get the actual display size of the canvas
  const rect = ctx.canvas.getBoundingClientRect()
  const displayWidth = rect.width
  const displayHeight = rect.height
  
  // Set canvas internal dimensions to match display size for crisp rendering
  const canvasWidth = displayWidth
  const canvasHeight = displayHeight

  // Only resize canvas if dimensions have actually changed
  if (ctx.canvas.width !== canvasWidth || ctx.canvas.height !== canvasHeight) {
    ctx.canvas.width = canvasWidth
    ctx.canvas.height = canvasHeight
    
    // Cache canvas properties that need to be reset after resize
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.font = `${charWidth}px monospace`
    
    // Store the current canvas dimensions for future comparison
    ctx._cachedWidth = canvasWidth
    ctx._cachedHeight = canvasHeight
    ctx._cachedCharWidth = charWidth
    
    // Reset dirty region tracker on canvas resize
    ctx._dirtyTracker = null
  }

  // Only update font if character width changed (density changed)
  if (ctx._cachedCharWidth !== charWidth) {
    ctx.font = `${charWidth}px monospace`
    ctx._cachedCharWidth = charWidth
  }

  // Initialize dirty region tracker if it doesn't exist
  if (!ctx._dirtyTracker) {
    ctx._dirtyTracker = createDirtyRegionTracker(dimensions.width, dimensions.height)
    // Force full redraw on first frame or after resize
    ctx._forceFullRedraw = true
  }

  // Resize dirty tracker if dimensions changed
  if (ctx._dirtyTracker.cellChanges.length !== dimensions.height || 
      (ctx._dirtyTracker.cellChanges[0] && ctx._dirtyTracker.cellChanges[0].length !== dimensions.width)) {
    ctx._dirtyTracker = createDirtyRegionTracker(dimensions.width, dimensions.height)
    ctx._forceFullRedraw = true
  }

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

    // If entrance animation is disabled, pre-populate with a proper wave pattern
    if (!entranceAnimation || reducedMotion) {
      const preTimeOffset = time * noiseSpeed
      for (let y = 0; y < dimensions.height; y++) {
        for (let x = 0; x < dimensions.width; x++) {
          // Generate initial noise value for this position
          const initialNoiseValue = clamp((generateNoise(x, y, preTimeOffset, noiseScale, gradientSize, animationStyle, ripples, reducedMotion, waveSettings) + 1) / 2)
          const enhancedValue = Math.pow(initialNoiseValue, transitionSmoothness)
          
          // Set initial character and color indices
          const charIndex = Math.floor(enhancedValue * characters.length)
          const colorIndex = Math.floor(enhancedValue * colors.length)
          
          ctx.previousState[y][x] = {
            charIndex: Math.min(charIndex, characters.length - 1),
            colorIndex: Math.min(colorIndex, colors.length - 1),
            noiseValue: enhancedValue,
            flowX: 0,
            flowY: 0,
          }
        }
      }
      
      // Mark that we've pre-populated and need to force render on first frame
      ctx._isPrePopulated = true
      ctx._forceFullRedraw = true
    }

    // Initialize entrance animation state
    ctx.entranceStartTime = time
    ctx.isEntranceComplete = !entranceAnimation || reducedMotion // Mark as complete if disabled

    // Initialize reduced motion fade-in state
    ctx.reducedMotionFadeStartTime = time
    ctx.isReducedMotionFadeComplete = !reducedMotionFadeIn || !reducedMotion
    
    // Initialize frame counter for early frame detection
    ctx._frameCount = 0
    
    // Force full redraw when state is initialized
    ctx._forceFullRedraw = true
  }

  // Resize previous state if dimensions changed
  if (
    ctx.previousState.length !== dimensions.height ||
    (ctx.previousState[0] && ctx.previousState[0].length !== dimensions.width)
  ) {
    // Store the old state for potential preservation
    const oldState = ctx.previousState
    const oldHeight = oldState.length
    const oldWidth = oldState[0] ? oldState[0].length : 0
    
    // Create new state array with correct dimensions
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

    // Try to preserve existing state where possible and regenerate the rest
    const preTimeOffset = time * noiseSpeed
    for (let y = 0; y < dimensions.height; y++) {
      for (let x = 0; x < dimensions.width; x++) {
        // If this position existed in the old state, preserve it
        if (y < oldHeight && x < oldWidth && oldState[y] && oldState[y][x]) {
          ctx.previousState[y][x] = { ...oldState[y][x] }
        } else {
          // For new positions, generate appropriate initial values
          const initialNoiseValue = clamp((generateNoise(x, y, preTimeOffset, noiseScale, gradientSize, animationStyle, ripples, reducedMotion, waveSettings) + 1) / 2)
          const enhancedValue = Math.pow(initialNoiseValue, transitionSmoothness)
          
          const charIndex = Math.floor(enhancedValue * characters.length)
          const colorIndex = Math.floor(enhancedValue * colors.length)
          
          ctx.previousState[y][x] = {
            charIndex: Math.min(charIndex, characters.length - 1),
            colorIndex: Math.min(colorIndex, colors.length - 1),
            noiseValue: enhancedValue,
            flowX: 0,
            flowY: 0,
          }
        }
      }
    }

    // Don't reset entrance animation on resize - preserve current state
    // Only reset if we were still in entrance animation
    if (!ctx.isEntranceComplete) {
      ctx.entranceStartTime = time
    }

    // Don't reset reduced motion fade-in on resize - preserve current state
    if (!ctx.isReducedMotionFadeComplete) {
      ctx.reducedMotionFadeStartTime = time
    }
    
    // Force full redraw on resize
    ctx._forceFullRedraw = true
  }

  // Clear dirty regions from previous frame
  ctx._dirtyTracker.clear()

  // Increment frame counter
  ctx._frameCount = (ctx._frameCount || 0) + 1
  const isEarlyFrame = ctx._frameCount <= 5 // First 5 frames are considered "early"

  // Pre-calculate some values for optimization
  const timeOffset = time * noiseSpeed
  const colorCount = colors.length

  // Calculate entrance animation progress
  let entranceProgress = 1.0 // Default to fully visible

  // For reduced motion, use a simple fade-in instead of directional entrance
  if (reducedMotion && reducedMotionFadeIn && !ctx.isReducedMotionFadeComplete) {
    const elapsedTime = (time - ctx.reducedMotionFadeStartTime) // Remove time scaling for proper timing
    entranceProgress = Math.min(elapsedTime / reducedMotionFadeDuration, 1.0)

    // Mark fade-in as complete when done
    if (entranceProgress >= 1.0) {
      ctx.isReducedMotionFadeComplete = true
    }
  }
  // For normal motion, use the directional entrance animation
  else if (!reducedMotion && entranceAnimation && !ctx.isEntranceComplete) {
    const elapsedTime = (time - ctx.entranceStartTime) // Remove time scaling for proper timing
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
      flowVectors[y][x] = calculateGradient(
        x,
        y,
        timeOffset,
        noiseScale,
        gradientSize,
        animationStyle,
        ripples,
        reducedMotion,
        waveSettings
      )
    }
  }

  // Second pass: calculate new states and detect changes
  const newStates = Array(dimensions.height).fill().map(() => Array(dimensions.width).fill(null))
  
  for (let y = 0; y < dimensions.height; y++) {
    for (let x = 0; x < dimensions.width; x++) {
      // Apply entrance animation - determine if this cell should be visible yet
      let isVisible = true
      let cellOpacity = 1.0

      // Skip entrance animation calculations if both animations are complete
      if (!ctx.isEntranceComplete || !ctx.isReducedMotionFadeComplete) {
        if (reducedMotion && reducedMotionFadeIn && !ctx.isReducedMotionFadeComplete) {
          // For reduced motion, use a simple fade-in effect
          cellOpacity = entranceProgress
          isVisible = true
        } else if (!reducedMotion && entranceAnimation && !ctx.isEntranceComplete) {
          // For normal motion, use the directional entrance animation
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

          // Add some randomness to make it look more natural, but less for wave patterns
          let randomOffset = Math.random() * 0.2
          
          // Reduce randomness for wave and flow patterns to maintain coherence
          if (animationStyle === "wave" || animationStyle === "flow") {
            randomOffset *= 0.3 // Much less randomness for wave patterns
          }

          // Cell is visible if entrance progress exceeds position factor
          isVisible = entranceProgress > positionFactor - randomOffset
        }

        if (!isVisible) {
          // Store null state for invisible cells
          newStates[y][x] = null
          continue
        }
      }

      // Get noise value for this position and time
      const noiseValue = clamp(
        (generateNoise(x, y, timeOffset, noiseScale, gradientSize, animationStyle, ripples, reducedMotion, waveSettings) + 1) / 2,
      )

      // Apply a more gradual mapping for smoother transitions
      const enhancedValue = Math.pow(noiseValue, transitionSmoothness)

      // Get the previous state for this position
      const prevState = ctx.previousState[y][x]

      // Get the flow vector for this position
      const flow = flowVectors[y][x]

      // Apply optical flow awareness
      let currentNoiseValue = enhancedValue

      if (!reducedMotion && flowAwareness > 0 && prevState) {
        // Calculate flow-aware value based on previous state and current flow
        const flowFactor = Math.min(flow.magnitude * flowAwareness, 1)

        // Blend between previous value and current value based on flow
        // Higher flow magnitude = more change allowed
        currentNoiseValue = prevState.noiseValue * (1 - flowFactor) + enhancedValue * flowFactor

        // Apply additional temporal smoothing
        if (flowSmoothing > 0) {
          currentNoiseValue = prevState.noiseValue * flowSmoothing + currentNoiseValue * (1 - flowSmoothing)
        }
      } else if (reducedMotion) {
        // For reduced motion, we don't apply flow awareness
        // Just use the static pattern
        currentNoiseValue = enhancedValue
      }

      // Check if this cell is affected by any ripple with color effect
      let colorBoost = 0
      if (!reducedMotion && ripples && ripples.length > 0) {
        for (const ripple of ripples) {
          if (ripple.effect === "color") {
            // Calculate distance from ripple center
            const dx = x - ripple.x
            const dy = y - ripple.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            // Calculate ripple effect based on distance and time
            const rippleProgress = (time - ripple.startTime) * 2 // Speed up time for ripple
            const rippleRadius = ripple.radius * rippleProgress
            const rippleWidth = ripple.radius * 0.5

            // Only apply color boost if within the expanding ring
            if (distance > rippleRadius - rippleWidth && distance < rippleRadius + rippleWidth) {
              // Calculate intensity based on ripple age
              const age = (time - ripple.startTime) / ripple.duration
              if (age < 1.0) {
                const intensity = (1.0 - age) * ripple.intensity
                colorBoost = Math.max(colorBoost, intensity * 0.5)
              }
            }
          }
        }
      }

      // Select character based on noise
      const { clarity, complexity } = getComplexityFieldAmount(x, y, waveSettings)
      const orderedDither = bayer4x4[y % 4][x % 4] / 15 - 0.5
      const characterValue = clamp(
        currentNoiseValue -
          clarity * waveSettings.clarityQuieting +
          orderedDither * 0.055 * (0.35 + complexity * 0.65),
      )
      const charIndex = Math.min(
        Math.floor(characterValue * characters.length),
        characters.length - 1,
      )
      const char = characters[charIndex] || "#"

      // Select color based on noise
      let colorPosition = clamp(currentNoiseValue) * (colorCount - 1)

      // Apply color boost if any
      if (colorBoost > 0) {
        // Shift color position toward the end of the palette for more vibrant colors
        colorPosition = Math.min(colorPosition + colorBoost * (colorCount - 1), colorCount - 1.01)
      }

      const colorIndex = Math.floor(colorPosition)
      const nextColorIndex = Math.min(colorIndex + 1, colorCount - 1)

      // Calculate interpolation factor between the two colors
      const colorMix = colorPosition - colorIndex

      // Get the two colors to interpolate between
      const color1 = colors[colorIndex] || colors[0]
      const color2 = colors[nextColorIndex] || colors[colors.length - 1]

      // Interpolate between colors for smoother transitions
      const color = interpolateColors(color1, color2, colorMix)

      // Create new state
      const newState = {
        charIndex,
        colorIndex,
        noiseValue: currentNoiseValue,
        flowX: flow.dx,
        flowY: flow.dy,
        char,
        color,
        cellOpacity,
        isVisible: true
      }

      newStates[y][x] = newState

      // Check if this cell has changed and mark as dirty if so
      if (ctx._forceFullRedraw || ctx._isPrePopulated || hasCellChanged(newState, prevState, 0.1, isEarlyFrame)) {
        ctx._dirtyTracker.markDirty(x, y)
      }
      
      // Debug: Log if we have cells that should be visible but aren't being marked dirty
      if (newState.isVisible && !ctx._forceFullRedraw && !ctx._isPrePopulated && !hasCellChanged(newState, prevState, 0.1, isEarlyFrame)) {
        // This cell is visible but not marked dirty - potential issue
        // Debug logging removed for production
      }
    }
  }

  // Calculate dirty regions for efficient rendering
  ctx._dirtyTracker.calculateDirtyRegions(charWidth)

  // If we have dirty regions or force full redraw, render them
  if (ctx._forceFullRedraw || !ctx._dirtyTracker.isEmpty()) {
    if (ctx._forceFullRedraw) {
      // Full canvas clear and redraw
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      
      // Render all visible cells
      for (let y = 0; y < dimensions.height; y++) {
        for (let x = 0; x < dimensions.width; x++) {
          const newState = newStates[y][x]
          if (newState && newState.isVisible) {
            // Apply cell opacity for fade-in effect
            if (newState.cellOpacity < 1.0) {
              // Create a semi-transparent version of the color
              const r = Number.parseInt(newState.color.slice(1, 3), 16)
              const g = Number.parseInt(newState.color.slice(3, 5), 16)
              const b = Number.parseInt(newState.color.slice(5, 7), 16)
              ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${newState.cellOpacity})`
            } else {
              ctx.fillStyle = newState.color
            }

            // Draw character
            ctx.fillText(newState.char, (x + 0.5) * charWidth, (y + 0.5) * charWidth)
          }
        }
      }
      
      ctx._forceFullRedraw = false
      ctx._isPrePopulated = false // Clear pre-populated flag after first render
    } else {
      // Selective redraw of dirty regions only
      for (const region of ctx._dirtyTracker.regions) {
        // Clear this dirty region
        ctx.fillStyle = backgroundColor
        ctx.fillRect(region.x, region.y, region.width, region.height)
        
        // Redraw only the cells in this region
        for (let y = region.cellMinY; y <= region.cellMaxY; y++) {
          for (let x = region.cellMinX; x <= region.cellMaxX; x++) {
            if (y < dimensions.height && x < dimensions.width) {
              const newState = newStates[y][x]
              if (newState && newState.isVisible) {
                // Apply cell opacity for fade-in effect
                if (newState.cellOpacity < 1.0) {
                  // Create a semi-transparent version of the color
                  const r = Number.parseInt(newState.color.slice(1, 3), 16)
                  const g = Number.parseInt(newState.color.slice(3, 5), 16)
                  const b = Number.parseInt(newState.color.slice(5, 7), 16)
                  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${newState.cellOpacity})`
                } else {
                  ctx.fillStyle = newState.color
                }

                // Draw character
                ctx.fillText(newState.char, (x + 0.5) * charWidth, (y + 0.5) * charWidth)
              }
            }
          }
        }
      }
    }
  }

  // Update previous state with new states
  for (let y = 0; y < dimensions.height; y++) {
    for (let x = 0; x < dimensions.width; x++) {
      if (newStates[y][x]) {
        ctx.previousState[y][x] = {
          charIndex: newStates[y][x].charIndex,
          colorIndex: newStates[y][x].colorIndex,
          noiseValue: newStates[y][x].noiseValue,
          flowX: newStates[y][x].flowX,
          flowY: newStates[y][x].flowY,
        }
      }
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
  showFps: ${settings.showFps === true},
  fullscreen: ${settings.fullscreen},
  flowAwareness: ${settings.flowAwareness || 0.7},
  flowSmoothing: ${settings.flowSmoothing || 0.5},
  entranceAnimation: ${settings.entranceAnimation !== undefined ? settings.entranceAnimation : true},
  entranceDirection: "${settings.entranceDirection || "bottom"}",
  entranceDuration: ${settings.entranceDuration || 1.5},
  respectReducedMotion: ${settings.respectReducedMotion !== undefined ? settings.respectReducedMotion : true},
  reducedMotionStyle: "${settings.reducedMotionStyle || "static"}",
  reducedMotionFadeIn: ${settings.reducedMotionFadeIn !== undefined ? settings.reducedMotionFadeIn : true},
  reducedMotionFadeDuration: ${settings.reducedMotionFadeDuration || 1.0},
  waveFlowDirection: ${settings.waveFlowDirection || 45},
  waveIntensity: ${settings.waveIntensity || 1.0},
  waveLayers: ${settings.waveLayers || 3},
  waveOrganicFactor: ${settings.waveOrganicFactor || 0.1},
  complexityField: ${settings.complexityField === true},
  clarityAnchorX: ${settings.clarityAnchorX || 0.3},
  clarityAnchorY: ${settings.clarityAnchorY || 0.28},
  clarityRadiusX: ${settings.clarityRadiusX || 0.42},
  clarityRadiusY: ${settings.clarityRadiusY || 0.34},
  clarityStrength: ${settings.clarityStrength || 0.88},
  clarityQuieting: ${settings.clarityQuieting || 0.18},
  edgeTurbulence: ${settings.edgeTurbulence || 0.72},
  interactiveMode: ${settings.interactiveMode === true},
  interactiveEffect: "${settings.interactiveEffect || "refraction"}",
  interactiveRadius: ${settings.interactiveRadius || 0.18},
  interactiveIntensity: ${settings.interactiveIntensity || 0.75}
};
</script>`
}

// Helper function to reset animation state
export function resetAnimationState(ctx) {
  if (!ctx) return
  
  // Clear all cached states
  ctx.previousState = null
  ctx._dirtyTracker = null
  ctx._forceFullRedraw = true
  ctx._isPrePopulated = false
  ctx._frameCount = 0
  
  // Reset entrance animation state
  ctx.entranceStartTime = null
  ctx.isEntranceComplete = false
  
  // Reset reduced motion fade-in state
  ctx.reducedMotionFadeStartTime = null
  ctx.isReducedMotionFadeComplete = false
  
  // Clear canvas dimensions cache to force recalculation
  ctx._cachedWidth = null
  ctx._cachedHeight = null
  ctx._cachedCharWidth = null
}
