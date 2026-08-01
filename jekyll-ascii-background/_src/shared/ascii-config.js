/**
 * Public configuration interface for every ASCII background consumer.
 *
 * Keep defaults, named presets, playground control metadata, and export behavior
 * together so adding a renderer capability does not require updating several
 * unrelated modules by hand.
 */

export const characterSets = {
  minimal: " .".split(""),
  dots: " .·•●".split(""),
  blocks: " ░▒▓█".split(""),
  gradient: [" ", " ", ".", ":", ";", "+", "=", "*", "#", "%", "@"],
  code: ["(", ")", ".", ";", "+", "=", "*", "#", "@", "$", "%", "&", "<", ">", "{", "}", "/", "~"],
  matrix: [
    " ", ".", "ｦ", "ｱ", "ﾊ", "ﾐ", "ﾋ", "ｰ", "ｳ", "ｼ", "ﾅ", "ﾓ", "ﾆ", "ｻ", "ﾜ", "ﾂ",
    "ｵ", "ﾘ", "ｱ", "ﾎ", "ﾃ", "ﾏ", "ｹ", "ﾒ", "ｴ", "ｶ", "ｷ", "ﾑ", "ﾕ", "ﾗ", "ｾ", "ﾈ",
  ],
  custom: [" ", ".", ":", "+", "=", "*", "#", "@", "$"],
}

export const colorPalettes = {
  green: ["#22c55e", "#16a34a", "#059669", "#0d9488", "#0891b2", "#0e7490", "#0369a1", "#1d4ed8", "#2563eb", "#3b82f6"],
  ocean: ["#0A2463", "#3E92CC", "#2CA6A4", "#44CF6C", "#A6EBC9"],
  tide: ["#071A33", "#103B63", "#176783", "#1D8B83", "#35B270", "#78D795", "#C2EDC8"],
  sunset: ["#FF0080", "#FF8C00", "#FFD700", "#FF4500", "#FF1493", "#FF00FF", "#FF6347"],
  purple: ["#240046", "#3C096C", "#5A189A", "#7B2CBF", "#9D4EDD", "#C77DFF", "#E0AAFF"],
  cyberpunk: ["#00FFFF", "#FF00FF", "#00FF00", "#FE53BB", "#08F7FE", "#09FBD3", "#F5D300"],
}

export const defaultSettings = {
  density: 30,
  speed: 30,
  opacity: 0.9,
  colorPalette: "green",
  colorField: "gradient",
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
  flowAwareness: 0.7,
  flowSmoothing: 0.5,
  entranceAnimation: true,
  entranceDirection: "bottom",
  entranceDuration: 1.5,
  respectReducedMotion: true,
  reducedMotionStyle: "static",
  reducedMotionFadeIn: true,
  reducedMotionFadeDuration: 1,
  waveFlowDirection: 45,
  waveIntensity: 1,
  waveLayers: 3,
  waveOrganicFactor: 0.1,
  waveFrequency: 0.92,
  waveBend: 0.38,
  complexityField: false,
  clarityAnchorX: 0.3,
  clarityAnchorY: 0.28,
  clarityRadiusX: 0.42,
  clarityRadiusY: 0.34,
  clarityStrength: 0.88,
  clarityQuieting: 0.18,
  edgeTurbulence: 0.72,
  meshNodeCount: 4,
  meshIntensity: 0.78,
  meshSpread: 0.36,
  meshDrift: 0.1,
  meshSpeed: 1,
  interactiveMode: false,
  interactiveEffect: "refraction",
  interactiveRadius: 0.18,
  interactiveIntensity: 0.75,
  pointer: null,
}

export const asciiPresets = {
  classic: {
    label: "Classic field",
    description: "The original layered ASCII animation.",
    settings: {},
  },
  homepage: {
    label: "Homepage wave",
    description: "The curved ASCII ribbon with a deforming, triangulated color field.",
    settings: {
      density: 30,
      speed: 60,
      opacity: 0.7,
      colorPalette: "tide",
      colorField: "mesh",
      noiseScale: 0.02,
      noiseSpeed: 0.22,
      characterSet: "gradient",
      gradientSize: 1.5,
      animationStyle: "wave",
      transitionSmoothness: 1.02,
      showControls: false,
      showFps: false,
      fullscreen: false,
      flowAwareness: 0.62,
      flowSmoothing: 0.42,
      waveFlowDirection: 22,
      waveIntensity: 1.08,
      waveLayers: 3,
      waveOrganicFactor: 0.065,
      waveFrequency: 0.92,
      waveBend: 0.42,
      complexityField: true,
      clarityAnchorX: 0.3,
      clarityAnchorY: 0.28,
      clarityRadiusX: 0.44,
      clarityRadiusY: 0.36,
      clarityStrength: 0.9,
      clarityQuieting: 0.2,
      edgeTurbulence: 0.48,
      meshNodeCount: 5,
      meshIntensity: 0.82,
      meshSpread: 0.38,
      meshDrift: 0.11,
      meshSpeed: 1.08,
      entranceAnimation: false,
      interactiveMode: true,
      interactiveEffect: "refraction",
      interactiveIntensity: 0.68,
      interactiveRadius: 0.22,
      respectReducedMotion: true,
      reducedMotionStyle: "static",
      reducedMotionFadeIn: true,
      reducedMotionFadeDuration: 1,
    },
  },
  playground: {
    label: "Playground default",
    description: "The original high-energy playground configuration.",
    settings: {
      density: 30,
      speed: 30,
      opacity: 1,
      colorPalette: "sunset",
      noiseScale: 0.02,
      noiseSpeed: 0.5,
      characterSet: "code",
      gradientSize: 1.5,
      animationStyle: "wave",
      transitionSmoothness: 1.1,
      showControls: true,
      fullscreen: true,
      flowAwareness: 0.5,
      flowSmoothing: 0.4,
      entranceAnimation: false,
      respectReducedMotion: true,
      reducedMotionStyle: "static",
      reducedMotionFadeIn: true,
      reducedMotionFadeDuration: 1,
      waveFlowDirection: 45,
      waveIntensity: 1,
      waveLayers: 3,
      waveOrganicFactor: 0.1,
    },
  },
}

const waveVisible = [{ key: "animationStyle", equals: "wave" }]
const complexityVisible = [...waveVisible, { key: "complexityField", equals: true }]
const interactionVisible = [...complexityVisible, { key: "interactiveMode", equals: true }]
const meshVisible = [...complexityVisible, { key: "colorField", equals: "mesh" }]

export const settingControls = [
  { key: "colorPalette", tab: "appearance", label: "Color palette", type: "select", optionsFrom: "colorPalettes" },
  { key: "colorField", tab: "appearance", label: "Color field", type: "select", options: [
    { value: "gradient", label: "Gradient ramp" }, { value: "mesh", label: "Ribbon mesh" },
  ], visibleWhen: complexityVisible },
  { key: "customColors", tab: "appearance", label: "Custom colors", type: "colorList", visibleWhen: [{ key: "colorPalette", equals: "custom" }] },
  { key: "characterSet", tab: "appearance", label: "Character set", type: "select", optionsFrom: "characterSets" },
  { key: "customCharacters", tab: "appearance", label: "Custom characters", type: "text", visibleWhen: [{ key: "characterSet", equals: "custom" }] },
  { key: "density", tab: "appearance", label: "Density", type: "range", min: 10, max: 60, step: 5, integer: true },
  { key: "opacity", tab: "appearance", label: "Opacity", type: "range", min: 0.1, max: 1, step: 0.1 },
  { key: "fullscreen", tab: "appearance", label: "Fullscreen mode", type: "boolean" },

  { key: "animationStyle", tab: "animation", label: "Animation style", type: "select", options: [
    { value: "continuous", label: "Continuous" }, { value: "wave", label: "Wave" },
    { value: "flow", label: "Flow" }, { value: "pulse", label: "Pulse" },
  ] },
  { key: "speed", tab: "animation", label: "Animation speed", type: "range", min: 5, max: 100, step: 5, integer: true },
  { key: "gradientSize", tab: "animation", label: "Gradient size", type: "range", min: 0.5, max: 5, step: 0.5 },
  { key: "transitionSmoothness", tab: "animation", label: "Transition smoothness", type: "range", min: 0.5, max: 2, step: 0.01 },
  { key: "flowAwareness", tab: "animation", label: "Flow awareness", type: "range", min: 0, max: 1, step: 0.01 },
  { key: "flowSmoothing", tab: "animation", label: "Flow smoothing", type: "range", min: 0, max: 0.9, step: 0.01 },
  { key: "noiseScale", tab: "animation", label: "Pattern detail", type: "range", min: 0.005, max: 0.05, step: 0.005 },
  { key: "noiseSpeed", tab: "animation", label: "Flow speed", type: "range", min: 0.1, max: 2, step: 0.01 },

  { key: "waveFlowDirection", tab: "animation", section: "Wave", label: "Flow direction", suffix: "°", type: "range", min: 0, max: 360, step: 1, integer: true, visibleWhen: waveVisible },
  { key: "waveIntensity", tab: "animation", section: "Wave", label: "Wave intensity", type: "range", min: 0.1, max: 2, step: 0.01, visibleWhen: waveVisible },
  { key: "waveLayers", tab: "animation", section: "Wave", label: "Wave layers", type: "range", min: 1, max: 5, step: 1, integer: true, visibleWhen: waveVisible },
  { key: "waveOrganicFactor", tab: "animation", section: "Wave", label: "Organic factor", type: "range", min: 0, max: 0.5, step: 0.005, visibleWhen: waveVisible },
  { key: "complexityField", tab: "animation", section: "Wave", label: "Curved ribbon field", type: "boolean", visibleWhen: waveVisible },
  { key: "waveFrequency", tab: "animation", section: "Ribbon", label: "Crest frequency", type: "range", min: 0.35, max: 1.8, step: 0.01, visibleWhen: complexityVisible },
  { key: "waveBend", tab: "animation", section: "Ribbon", label: "Crest bend", type: "range", min: 0, max: 0.8, step: 0.01, visibleWhen: complexityVisible },
  { key: "edgeTurbulence", tab: "animation", section: "Ribbon", label: "Edge turbulence", type: "range", min: 0, max: 1, step: 0.01, visibleWhen: complexityVisible },
  { key: "meshNodeCount", tab: "animation", section: "Mesh", label: "Mesh columns", type: "range", min: 3, max: 6, step: 1, integer: true, visibleWhen: meshVisible },
  { key: "meshIntensity", tab: "animation", section: "Mesh", label: "Mesh intensity", type: "range", min: 0, max: 1, step: 0.01, visibleWhen: meshVisible },
  { key: "meshSpread", tab: "animation", section: "Mesh", label: "Ribbon depth", type: "range", min: 0.12, max: 0.7, step: 0.01, visibleWhen: meshVisible },
  { key: "meshDrift", tab: "animation", section: "Mesh", label: "Topology drift", type: "range", min: 0, max: 0.28, step: 0.01, visibleWhen: meshVisible },
  { key: "meshSpeed", tab: "animation", section: "Mesh", label: "Mesh speed", type: "range", min: 0, max: 3, step: 0.01, visibleWhen: meshVisible },
  { key: "clarityAnchorX", tab: "animation", section: "Clarity", label: "Anchor X", type: "range", min: 0, max: 1, step: 0.01, visibleWhen: complexityVisible },
  { key: "clarityAnchorY", tab: "animation", section: "Clarity", label: "Anchor Y", type: "range", min: 0, max: 1, step: 0.01, visibleWhen: complexityVisible },
  { key: "clarityRadiusX", tab: "animation", section: "Clarity", label: "Radius X", type: "range", min: 0.1, max: 1, step: 0.01, visibleWhen: complexityVisible },
  { key: "clarityRadiusY", tab: "animation", section: "Clarity", label: "Radius Y", type: "range", min: 0.1, max: 1, step: 0.01, visibleWhen: complexityVisible },
  { key: "clarityStrength", tab: "animation", section: "Clarity", label: "Clarity strength", type: "range", min: 0, max: 1, step: 0.01, visibleWhen: complexityVisible },
  { key: "clarityQuieting", tab: "animation", section: "Clarity", label: "Hero quieting", type: "range", min: 0, max: 0.5, step: 0.01, visibleWhen: complexityVisible },
  { key: "interactiveMode", tab: "animation", section: "Interaction", label: "Pointer refraction", type: "boolean", visibleWhen: complexityVisible },
  { key: "interactiveRadius", tab: "animation", section: "Interaction", label: "Refraction radius", type: "range", min: 0.05, max: 0.5, step: 0.01, visibleWhen: interactionVisible },
  { key: "interactiveIntensity", tab: "animation", section: "Interaction", label: "Refraction intensity", type: "range", min: 0, max: 1.5, step: 0.01, visibleWhen: interactionVisible },

  { key: "entranceAnimation", tab: "animation", section: "Entrance", label: "Enable entrance", type: "boolean" },
  { key: "entranceDirection", tab: "animation", section: "Entrance", label: "Entrance direction", type: "select", visibleWhen: [{ key: "entranceAnimation", equals: true }], options: [
    { value: "bottom", label: "Bottom" }, { value: "top", label: "Top" },
    { value: "left", label: "Left" }, { value: "right", label: "Right" },
    { value: "center", label: "Center" },
  ] },
  { key: "entranceDuration", tab: "animation", section: "Entrance", label: "Entrance duration", suffix: "s", type: "range", min: 0.5, max: 3, step: 0.1, visibleWhen: [{ key: "entranceAnimation", equals: true }] },

  { key: "respectReducedMotion", tab: "accessibility", label: "Respect system preference", type: "boolean" },
  { key: "reducedMotionStyle", tab: "accessibility", label: "Reduced-motion style", type: "select", options: [
    { value: "static", label: "Static (no animation)" }, { value: "minimal", label: "Minimal motion" },
    { value: "slow", label: "Slow motion" },
  ] },
  { key: "reducedMotionFadeIn", tab: "accessibility", label: "Fade in static background", type: "boolean" },
  { key: "reducedMotionFadeDuration", tab: "accessibility", label: "Fade duration", suffix: "s", type: "range", min: 0.5, max: 3, step: 0.1, visibleWhen: [{ key: "reducedMotionFadeIn", equals: true }] },
  { key: "showFps", tab: "accessibility", section: "Diagnostics", label: "Show local FPS", type: "boolean" },
]

export function resolveAsciiSettings(config = {}) {
  const { preset, ...overrides } = config || {}
  const presetSettings = asciiPresets[preset]?.settings || {}

  return {
    ...defaultSettings,
    ...presetSettings,
    ...overrides,
  }
}

export function applyAsciiPreset(preset, overrides = {}) {
  return resolveAsciiSettings({ preset, ...overrides })
}

export function isSettingControlVisible(control, settings) {
  return (control.visibleWhen || []).every(({ key, equals }) => settings[key] === equals)
}

function titleCase(value) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function getSettingControlOptions(control) {
  if (control.options) return control.options
  if (control.optionsFrom === "colorPalettes") {
    return [...Object.keys(colorPalettes), "custom"].map((value) => ({ value, label: titleCase(value) }))
  }
  if (control.optionsFrom === "characterSets") {
    return Object.keys(characterSets).map((value) => ({ value, label: titleCase(value) }))
  }
  return []
}

export function formatConfigForCopy(settings) {
  const exportableSettings = Object.fromEntries(
    Object.keys(defaultSettings)
      .filter((key) => key !== "pointer")
      .map((key) => [key, settings[key] ?? defaultSettings[key]]),
  )

  return `<script>\nwindow.asciiConfig = ${JSON.stringify(exportableSettings, null, 2)};\n</script>`
}
