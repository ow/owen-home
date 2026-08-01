/**
 * ASCII Background Core Module
 * Shared logic between Next.js and Jekyll implementations
 */

import { characterSets, colorPalettes } from "./ascii-config"

export {
  asciiPresets,
  characterSets,
  colorPalettes,
  defaultSettings,
  formatConfigForCopy,
  resolveAsciiSettings,
  settingControls,
} from "./ascii-config"

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

const oklabCache = new Map()

function toLinear(channel) {
  const value = channel / 255
  return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)
}

function toSrgb(channel) {
  const value = channel <= 0.0031308
    ? channel * 12.92
    : 1.055 * Math.pow(Math.max(channel, 0), 1 / 2.4) - 0.055
  return Math.round(clamp(value) * 255)
}

function hexToOklab(color) {
  const safeColor = typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color)
    ? color.toLowerCase()
    : "#6366f1"
  if (oklabCache.has(safeColor)) return oklabCache.get(safeColor)

  const red = toLinear(Number.parseInt(safeColor.slice(1, 3), 16))
  const green = toLinear(Number.parseInt(safeColor.slice(3, 5), 16))
  const blue = toLinear(Number.parseInt(safeColor.slice(5, 7), 16))
  const l = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue)
  const m = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue)
  const s = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue)
  const result = {
    lightness: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  }
  oklabCache.set(safeColor, result)
  return result
}

function mixOklab(first, second, amount) {
  const t = clamp(amount)
  return {
    lightness: first.lightness + (second.lightness - first.lightness) * t,
    a: first.a + (second.a - first.a) * t,
    b: first.b + (second.b - first.b) * t,
  }
}

function samplePaletteOklab(palette, position) {
  const scaled = clamp(position) * Math.max(palette.length - 1, 0)
  const index = Math.floor(scaled)
  return mixOklab(palette[index], palette[Math.min(index + 1, palette.length - 1)], scaled - index)
}

function oklabToHex(color) {
  const l = Math.pow(color.lightness + 0.3963377774 * color.a + 0.2158037573 * color.b, 3)
  const m = Math.pow(color.lightness - 0.1055613458 * color.a - 0.0638541728 * color.b, 3)
  const s = Math.pow(color.lightness - 0.0894841775 * color.a - 1.291485548 * color.b, 3)
  const red = toSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)
  const green = toSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s)
  const blue = toSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)
  return `#${red.toString(16).padStart(2, "0")}${green.toString(16).padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`
}

function quantizeOklab(color, cache) {
  const lightness = Math.round(clamp(color.lightness) * 47)
  const a = Math.round(clamp((color.a + 0.4) / 0.8) * 31)
  const b = Math.round(clamp((color.b + 0.4) / 0.8) * 31)
  const key = (lightness << 10) | (a << 5) | b
  if (!cache.has(key)) {
    cache.set(key, oklabToHex({
      lightness: lightness / 47,
      a: (a / 31) * 0.8 - 0.4,
      b: (b / 31) * 0.8 - 0.4,
    }))
  }
  return { color: cache.get(key), colorKey: key }
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

function getRibbonGeometry(normalizedX, waveTime, waveSettings) {
  const flowAngle = ((waveSettings.waveFlowDirection || 45) * Math.PI) / 180
  const ribbonPhase = normalizedX * Math.PI * 2 * (waveSettings.waveFrequency || 0.92) - waveTime * 0.72
  const directionalSlope = -Math.tan(flowAngle) * 0.22
  const crestBend = (
    Math.sin(ribbonPhase) * 0.72 +
    Math.sin(ribbonPhase * 2.04 + 1.1) * 0.18 +
    Math.sin(ribbonPhase * 0.48 - 0.7) * 0.1
  ) * (waveSettings.waveBend || 0)

  return {
    ribbonPhase,
    waveCenter: 0.42 + (normalizedX - 0.5) * directionalSlope + crestBend * 0.34,
  }
}

function createRibbonMesh(waveTime, animationTime, palette, waveSettings, reducedMotion) {
  const columns = Math.round(clamp(waveSettings.meshNodeCount || 4, 3, 6))
  const rows = 4
  const meshTime = reducedMotion ? 0.42 : animationTime * (waveSettings.meshSpeed || 1)
  const paletteStops = [0.08, 0.58, 0.96, 0.74, 0.28, 0.86, 0.46, 0.68]
  const drift = waveSettings.meshDrift || 0
  const spread = Math.max(waveSettings.meshSpread || 0.36, 0.08)
  const pointer = waveSettings.pointer
  const pointerActive = !reducedMotion && pointer?.activity > 0.001
  const vertices = []
  const triangleIndices = []

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const index = row * columns + column
      const baseX = column / (columns - 1)
      const phase = meshTime * 0.46 + column * 1.37 + row * 1.91
      const edgeWeight = row === 0 || row === rows - 1 ? 0.18 : 1
      const columnWeight = column === 0 || column === columns - 1 ? 0 : 1
      let x = baseX + Math.sin(phase * 0.73 + row * 0.52) * drift * 0.5 * edgeWeight * columnWeight
      const ribbon = getRibbonGeometry(clamp(x), waveTime, waveSettings)
      let y

      if (row === 0) {
        y = -0.14 + Math.cos(phase * 0.61) * drift * 0.08
      } else if (row === rows - 1) {
        y = 1.14 + Math.sin(phase * 0.57) * drift * 0.08
      } else {
        const ribbonSide = row === 1 ? -1 : 1
        const breathing = 1 + Math.sin(meshTime * 0.17 + column * 1.11 + row) * 0.08
        y = ribbon.waveCenter + ribbonSide * spread * 0.58 * breathing
        y += Math.cos(phase * 0.91 + column * 0.33) * drift * 0.42
      }

      if (pointerActive) {
        const dx = x - pointer.x
        const dy = y - pointer.y
        const influence = Math.exp(-(dx * dx + dy * dy) / 0.05) * pointer.activity
        const push = influence * (waveSettings.interactiveIntensity || 0.75) * 0.045
        x += dx * push * columnWeight
        y += dy * push
      }

      const paletteBase = paletteStops[(column + row * 2) % paletteStops.length]
      const colorDrift = reducedMotion ? 0 : Math.sin(meshTime * 0.12 + index * 0.83) * 0.035
      vertices.push({
        x,
        y,
        color: samplePaletteOklab(palette, clamp(paletteBase + colorDrift)),
      })
    }
  }

  for (let row = 0; row < rows - 1; row++) {
    for (let column = 0; column < columns - 1; column++) {
      const topLeft = row * columns + column
      const topRight = topLeft + 1
      const bottomLeft = topLeft + columns
      const bottomRight = bottomLeft + 1

      if ((row + column) % 2 === 0) {
        triangleIndices.push([topLeft, bottomLeft, bottomRight], [topLeft, bottomRight, topRight])
      } else {
        triangleIndices.push([topLeft, bottomLeft, topRight], [topRight, bottomLeft, bottomRight])
      }
    }
  }

  const triangles = triangleIndices.map(([firstIndex, secondIndex, thirdIndex]) => {
    const first = vertices[firstIndex]
    const second = vertices[secondIndex]
    const third = vertices[thirdIndex]
    const denominator = (second.y - third.y) * (first.x - third.x) +
      (third.x - second.x) * (first.y - third.y)
    return {
      first,
      second,
      third,
      inverseDenominator: Math.abs(denominator) < 0.000001 ? 0 : 1 / denominator,
      minX: Math.min(first.x, second.x, third.x),
      maxX: Math.max(first.x, second.x, third.x),
      minY: Math.min(first.y, second.y, third.y),
      maxY: Math.max(first.y, second.y, third.y),
    }
  })

  return { vertices, triangles }
}

function sampleRibbonMesh(normalizedX, normalizedY, mesh) {
  for (const triangle of mesh.triangles) {
    if (
      normalizedX < triangle.minX - 0.0001 || normalizedX > triangle.maxX + 0.0001 ||
      normalizedY < triangle.minY - 0.0001 || normalizedY > triangle.maxY + 0.0001 ||
      triangle.inverseDenominator === 0
    ) continue
    const { first, second, third } = triangle

    const firstWeight = (
      (second.y - third.y) * (normalizedX - third.x) +
      (third.x - second.x) * (normalizedY - third.y)
    ) * triangle.inverseDenominator
    const secondWeight = (
      (third.y - first.y) * (normalizedX - third.x) +
      (first.x - third.x) * (normalizedY - third.y)
    ) * triangle.inverseDenominator
    const thirdWeight = 1 - firstWeight - secondWeight

    if (firstWeight >= -0.0001 && secondWeight >= -0.0001 && thirdWeight >= -0.0001) {
      return {
        lightness: first.color.lightness * firstWeight + second.color.lightness * secondWeight + third.color.lightness * thirdWeight,
        a: first.color.a * firstWeight + second.color.a * secondWeight + third.color.a * thirdWeight,
        b: first.color.b * firstWeight + second.color.b * secondWeight + third.color.b * thirdWeight,
      }
    }
  }

  let nearest = mesh.vertices[0]
  let nearestDistance = Infinity
  for (const vertex of mesh.vertices) {
    const dx = normalizedX - vertex.x
    const dy = normalizedY - vertex.y
    const distance = dx * dx + dy * dy
    if (distance < nearestDistance) {
      nearest = vertex
      nearestDistance = distance
    }
  }
  return nearest.color
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
      waveFrequency = 0.92,
      waveBend = 0.38,
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

    const structuredWave = waveSettings.complexityField
    const longitudinalFlow = normalizedX * flowX + normalizedY * flowY
    const transverseFlow = normalizedX * -flowY + normalizedY * flowX

    // The outer field carries a little interference while the hero region resolves
    // into one broad, bent crest. Normalized coordinates keep the silhouette stable
    // across desktop and portrait canvases.
    const phaseTurbulence = waveSettings.complexityField
      ? (
          Math.sin((normalizedX * 1.2 + normalizedY * 0.55) * Math.PI * 2 - waveTime * 0.28) * 0.62 +
          Math.cos((normalizedY * 1.35 - normalizedX * 0.32) * Math.PI * 2 + waveTime * 0.2) * 0.38
        ) * edgeTurbulence * complexity * 0.28
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

    const ribbon = getRibbonGeometry(normalizedX, waveTime, waveSettings)
    const ribbonPhase = ribbon.ribbonPhase

    // Primary wave direction based on user setting. The complexity-field variant
    // is a curved ribbon rather than a full-frame sine wash, giving it a visible
    // crest and a softer trailing gradient.
    const primaryFlow = scaledX * flowX + scaledY * flowY + waveTime * 1.5 + refraction
    const waveCenter = ribbon.waveCenter + phaseTurbulence * 0.035
    const distanceFromCrest = normalizedY - waveCenter + refraction * 0.035
    const crestWidth = 0.24 + Math.sin(ribbonPhase * 0.5 + 0.4) * 0.018
    const crest = Math.exp(-Math.pow(distanceFromCrest / crestWidth, 2) * 1.42)
    const wake = Math.exp(-Math.pow((distanceFromCrest - 0.2) / 0.38, 2) * 1.2)

    // Main wave with adjustable intensity
    let waveSum = structuredWave
      ? (
          crest * 1.25 +
          wake * 0.28 -
          0.72 +
          Math.sin(ribbonPhase * 1.32 + transverseFlow * Math.PI) * 0.045 * complexity
        ) * waveIntensity
      : Math.sin(primaryFlow) * 0.56 * waveIntensity
    
    // Add additional wave layers if requested
    if (!structuredWave && waveLayers >= 2) {
      // Secondary wave (perpendicular to main flow)
      const perpX = -flowY
      const perpY = flowX
      const secondaryAmplitude = waveSettings.complexityField ? 0.035 + complexity * 0.09 : 0.25
      const secondaryPhase = structuredWave
        ? primaryFlow * 0.52 + transverseFlow * Math.PI * 0.7 + waveTime * 0.24 + 1.6
        : scaledX * perpX * 1.5 + scaledY * perpY * 1.5 + waveTime * 0.8
      const secondaryWave = Math.sin(secondaryPhase) * secondaryAmplitude * waveIntensity
      waveSum += secondaryWave
    }
    
    if (!structuredWave && waveLayers >= 3) {
      // Tertiary wave for subtle texture
      const tertiaryAmplitude = waveSettings.complexityField ? 0.015 + complexity * 0.055 : 0.15
      const tertiaryPhase = structuredWave
        ? primaryFlow * 1.5 - transverseFlow * Math.PI * 0.45 + waveTime * 0.18
        : scaledX * 1.2 + scaledY * 0.8 + waveTime * 1.2
      const tertiaryWave = Math.sin(tertiaryPhase) * tertiaryAmplitude * waveIntensity
      waveSum += tertiaryWave
    }
    
    if (!structuredWave && waveLayers >= 4) {
      // Quaternary wave for more complexity
      const quaternaryWave = Math.sin(scaledX * 0.7 + scaledY * 1.3 + waveTime * 0.9) * 0.1 * complexity * waveIntensity
      waveSum += quaternaryWave
    }
    
    if (!structuredWave && waveLayers >= 5) {
      // Fifth wave for maximum detail
      const fifthWave = Math.sin(scaledX * 1.8 + scaledY * 0.4 + waveTime * 1.6) * 0.08 * complexity * waveIntensity
      waveSum += fifthWave
    }
    
    // Add organic noise based on user setting
    const organicAmount = waveSettings.complexityField ? 0.18 + complexity * 0.82 : 1
    const organicX = structuredWave ? normalizedX * Math.PI * 3.2 : scaledX * 2.3
    const organicY = structuredWave ? normalizedY * Math.PI * 2.7 : scaledY * 1.8
    const organicNoise = Math.sin(organicX + waveTime * 0.6) * Math.cos(organicY + waveTime * 0.9) * waveOrganicFactor * organicAmount * waveIntensity
    
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
  try {
    return oklabToHex(mixOklab(hexToOklab(color1), hexToOklab(color2), t))
  } catch (e) {
    // If anything goes wrong, return a safe default color
    return "#6366F1"
  }
}

// Add dirty region tracking utilities
function createDirtyRegionTracker(width, height) {
  return {
    regions: [],
    dirtyCount: 0,
    cellChanges: Array(height).fill().map(() => Array(width).fill(false)),
    
    markDirty(x, y) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        if (!this.cellChanges[y][x]) {
          this.cellChanges[y][x] = true
          this.dirtyCount++
        }
      }
    },
    
    // Batch nearby dirty cells into rectangular regions for efficient clearing
    calculateDirtyRegions(charWidth) {
      this.regions = []
      this.dirtyCount = 0
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
  if (newState.colorKey !== oldState.colorKey) return true

  // Check if legacy gradient position changed significantly
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
    colorField = "gradient",
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
    waveFrequency = 0.92,
    waveBend = 0.38,
    complexityField = false,
    clarityAnchorX = 0.3,
    clarityAnchorY = 0.28,
    clarityRadiusX = 0.42,
    clarityRadiusY = 0.34,
    clarityStrength = 0.88,
    clarityQuieting = 0.18,
    edgeTurbulence = 0.72,
    meshNodeCount = 4,
    meshIntensity = 0.78,
    meshSpread = 0.36,
    meshDrift = 0.1,
    meshSpeed = 1,
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
    waveFrequency,
    waveBend,
    complexityField,
    clarityAnchorX,
    clarityAnchorY,
    clarityRadiusX,
    clarityRadiusY,
    clarityStrength,
    clarityQuieting,
    edgeTurbulence,
    meshNodeCount,
    meshIntensity,
    meshSpread,
    meshDrift,
    meshSpeed,
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
            colorKey: null,
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
            colorKey: null,
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
            colorKey: null,
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
            colorKey: null,
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
  const structuredWave = animationStyle === "wave" && complexityField
  const useMesh = structuredWave && colorField === "mesh"
  const paletteOklab = useMesh ? colors.map(hexToOklab) : null
  const mesh = useMesh ? createRibbonMesh(timeOffset, time, paletteOklab, waveSettings, reducedMotion) : null
  if (!ctx._quantizedColorCache) ctx._quantizedColorCache = new Map()

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

  // The structured ribbon has a known direction, so numerical optical-flow
  // sampling only repeats the same expensive noise function three extra times.
  // Legacy modes keep their original gradient pass.
  const flowVectors = structuredWave ? null : Array(dimensions.height).fill().map(() => Array(dimensions.width))

  if (flowVectors) {
    for (let y = 0; y < dimensions.height; y++) {
      for (let x = 0; x < dimensions.width; x++) {
        flowVectors[y][x] = calculateGradient(
          x,
          y,
          timeOffset,
          noiseScale,
          gradientSize,
          animationStyle,
          ripples,
          reducedMotion,
          waveSettings,
        )
      }
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
      const flow = flowVectors ? flowVectors[y][x] : { dx: 0, dy: 0, magnitude: 0 }

      // Apply optical flow awareness
      let currentNoiseValue = enhancedValue

      if (!reducedMotion && structuredWave && prevState) {
        currentNoiseValue = prevState.noiseValue * flowSmoothing + enhancedValue * (1 - flowSmoothing)
      } else if (!reducedMotion && flowAwareness > 0 && prevState) {
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
      const { clarity, complexity, normalizedX, normalizedY } = getComplexityFieldAmount(x, y, waveSettings)
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
      const gradientValue = animationStyle === "wave" && complexityField
        ? smoothstep(0.04, 0.96, currentNoiseValue)
        : clamp(currentNoiseValue)
      let colorPosition = gradientValue * (colorCount - 1)

      // Apply color boost if any
      if (colorBoost > 0) {
        // Shift color position toward the end of the palette for more vibrant colors
        colorPosition = Math.min(colorPosition + colorBoost * (colorCount - 1), colorCount - 1.01)
      }

      const colorIndex = Math.floor(colorPosition)
      const nextColorIndex = Math.min(colorIndex + 1, colorCount - 1)

      // Calculate interpolation factor between the two colors
      const colorMix = colorPosition - colorIndex

      let color
      let colorKey = null
      if (mesh && char !== " ") {
        const baseColor = samplePaletteOklab(paletteOklab, colorPosition / Math.max(colorCount - 1, 1))
        const meshColor = sampleRibbonMesh(normalizedX, normalizedY, mesh)
        const meshPresence = meshIntensity * (0.5 + smoothstep(0.08, 0.84, currentNoiseValue) * 0.5) * (1 - clarity * 0.18)
        const quantized = quantizeOklab(mixOklab(baseColor, meshColor, meshPresence), ctx._quantizedColorCache)
        color = quantized.color
        colorKey = quantized.colorKey
      } else if (mesh) {
        color = colors[0]
      } else {
        const color1 = colors[colorIndex] || colors[0]
        const color2 = colors[nextColorIndex] || colors[colors.length - 1]
        color = interpolateColors(color1, color2, colorMix)
      }

      // Create new state
      const newState = {
        charIndex,
        colorIndex,
        colorKey,
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
      const changeThreshold = complexityField ? 0.035 : 0.1
      if (ctx._forceFullRedraw || ctx._isPrePopulated || hasCellChanged(newState, prevState, changeThreshold, isEarlyFrame)) {
        ctx._dirtyTracker.markDirty(x, y)
      }
      
      // Debug: Log if we have cells that should be visible but aren't being marked dirty
      if (newState.isVisible && !ctx._forceFullRedraw && !ctx._isPrePopulated && !hasCellChanged(newState, prevState, changeThreshold, isEarlyFrame)) {
        // This cell is visible but not marked dirty - potential issue
        // Debug logging removed for production
      }
    }
  }

  // Clearing many tiny rectangles costs more than one coherent repaint once
  // the drifting mesh changes a large share of the grid.
  if (ctx._dirtyTracker.dirtyCount > dimensions.width * dimensions.height * 0.38) {
    ctx._forceFullRedraw = true
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
          colorKey: newStates[y][x].colorKey,
          noiseValue: newStates[y][x].noiseValue,
          flowX: newStates[y][x].flowX,
          flowY: newStates[y][x].flowY,
        }
      }
    }
  }
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
  ctx._quantizedColorCache = null
}
