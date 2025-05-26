"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { formatConfigForCopy } from "./shared/ascii-core"

export function ControlPanel({ settings, onSettingsChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("appearance")
  const [copySuccess, setCopySuccess] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const portalRef = useRef(null)
  const [mounted, setMounted] = useState(false)

  // Detect prefers-reduced-motion preference
  useEffect(() => {
    // Check if the browser supports matchMedia
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

      // Set initial value
      setPrefersReducedMotion(mediaQuery.matches)
    }
  }, [])

  // Create portal container on mount
  useEffect(() => {
    const portalContainer = document.createElement("div")
    portalContainer.id = "ascii-control-portal"
    portalContainer.style.position = "fixed"
    portalContainer.style.bottom = "1rem"
    portalContainer.style.right = "1rem"
    portalContainer.style.zIndex = "999999"
    document.body.appendChild(portalContainer)
    portalRef.current = portalContainer
    setMounted(true)

    return () => {
      if (portalRef.current) {
        document.body.removeChild(portalRef.current)
        portalRef.current = null
        setMounted(false)
      }
    }
  }, [])

  const handleCustomColorsChange = (colorsString) => {
    const colors = colorsString.split(",").map((c) => c.trim())
    onSettingsChange({ customColors: colors })
  }

  // Function to copy the current config to clipboard
  const copyConfiguration = () => {
    // Use the shared formatting function
    const jsConfig = formatConfigForCopy(settings)

    // Copy to clipboard
    navigator.clipboard
      .writeText(jsConfig)
      .then(() => {
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)
        alert("Failed to copy configuration. Please check console for details.")
      })
  }

  // Function to reset animation state
  const resetAnimationState = () => {
    // Dispatch a custom event that the ASCII background can listen for
    const resetEvent = new CustomEvent('ascii-background-reset', {
      detail: { timestamp: Date.now() }
    })
    window.dispatchEvent(resetEvent)
  }

  // Toggle panel visibility
  const togglePanel = () => {
    setIsOpen(!isOpen)
  }

  // The control panel content
  const controlPanelContent = (
    <div
      className="ascii-control-panel"
      style={{
        position: "relative",
        pointerEvents: "auto",
        zIndex: 999999,
      }}
    >
      <button
        className="ascii-control-button"
        onClick={togglePanel}
        type="button"
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>

      {isOpen && (
        <div
          className="ascii-control-content"
          style={{
            position: "absolute",
            bottom: "100%",
            right: 0,
            marginBottom: "0.5rem",
            zIndex: 999999, // Ensure high z-index
            pointerEvents: "auto", // Ensure clicks are captured
          }}
        >
          <div className="ascii-tabs">
            <button
              className={activeTab === "appearance" ? "active" : ""}
              onClick={() => setActiveTab("appearance")}
              type="button"
            >
              Appearance
            </button>
            <button
              className={activeTab === "animation" ? "active" : ""}
              onClick={() => setActiveTab("animation")}
              type="button"
            >
              Animation
            </button>
            <button
              className={activeTab === "accessibility" ? "active" : ""}
              onClick={() => setActiveTab("accessibility")}
              type="button"
            >
              Accessibility
            </button>
          </div>

          {activeTab === "appearance" && (
            <div className="ascii-tab-content">
              <div className="ascii-control-group">
                <label>Color Palette</label>
                <select
                  value={settings.colorPalette}
                  onChange={(e) => onSettingsChange({ colorPalette: e.target.value })}
                  style={{ zIndex: 1000000, pointerEvents: "auto" }}
                >
                  <option value="green">Green</option>
                  <option value="ocean">Ocean</option>
                  <option value="sunset">Sunset</option>
                  <option value="purple">Purple</option>
                  <option value="cyberpunk">Cyberpunk</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {settings.colorPalette === "custom" && (
                <div className="ascii-control-group">
                  <label>Custom Colors (comma-separated hex)</label>
                  <input
                    type="text"
                    value={settings.customColors?.join(", ")}
                    onChange={(e) => handleCustomColorsChange(e.target.value)}
                    placeholder="#6366F1, #EC4899, #F472B6"
                  />
                </div>
              )}

              <div className="ascii-control-group">
                <label>Character Set</label>
                <select
                  value={settings.characterSet}
                  onChange={(e) => onSettingsChange({ characterSet: e.target.value })}
                  style={{ zIndex: 1000000, pointerEvents: "auto" }}
                >
                  <option value="minimal">Minimal</option>
                  <option value="dots">Dots</option>
                  <option value="blocks">Blocks</option>
                  <option value="code">Code</option>
                  <option value="matrix">Matrix</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {settings.characterSet === "custom" && (
                <div className="ascii-control-group">
                  <label>Custom Characters</label>
                  <input
                    type="text"
                    value={settings.customCharacters}
                    onChange={(e) => onSettingsChange({ customCharacters: e.target.value })}
                    placeholder=" .:-=+*#%@"
                  />
                </div>
              )}

              <div className="ascii-control-group">
                <label>Density: {settings.density}</label>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={settings.density}
                  onChange={(e) => onSettingsChange({ density: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="ascii-control-group">
                <label>Opacity: {settings.opacity}</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={settings.opacity}
                  onChange={(e) => onSettingsChange({ opacity: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="ascii-control-group">
                <label>Fullscreen Mode</label>
                <select
                  value={settings.fullscreen ? "true" : "false"}
                  onChange={(e) => onSettingsChange({ fullscreen: e.target.value === "true" })}
                  style={{ zIndex: 1000000, pointerEvents: "auto" }}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "animation" && (
            <div className="ascii-tab-content">
              {/* Reset Animation State Button */}
              <div className="ascii-control-group" style={{ marginBottom: "20px" }}>
                <button
                  className="ascii-reset-button"
                  onClick={resetAnimationState}
                  type="button"
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#3B82F6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  🔄 Reset Animation State
                </button>
                <small style={{ color: "#888", fontSize: "12px", display: "block", marginTop: "5px" }}>
                  Resets the animation to see changes clearly (keeps your settings)
                </small>
              </div>

              <div className="ascii-control-group">
                <label>Animation Style</label>
                <select
                  value={settings.animationStyle}
                  onChange={(e) => onSettingsChange({ animationStyle: e.target.value })}
                  style={{ zIndex: 1000000, pointerEvents: "auto" }}
                >
                  <option value="continuous">Continuous</option>
                  <option value="wave">Wave</option>
                  <option value="flow">Flow</option>
                  <option value="pulse">Pulse</option>
                </select>
              </div>

              <div className="ascii-control-group">
                <label>Animation Speed: {settings.speed}</label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={settings.speed}
                  onChange={(e) => onSettingsChange({ speed: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="ascii-control-group">
                <label>Gradient Size: {settings.gradientSize}</label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={settings.gradientSize}
                  onChange={(e) => onSettingsChange({ gradientSize: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="ascii-control-group">
                <label>Transition Smoothness: {settings.transitionSmoothness || 1.2}</label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.transitionSmoothness || 1.2}
                  onChange={(e) => onSettingsChange({ transitionSmoothness: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="ascii-control-group">
                <label>Flow Awareness: {settings.flowAwareness || 0.7}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.flowAwareness || 0.7}
                  onChange={(e) => onSettingsChange({ flowAwareness: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="ascii-control-group">
                <label>Flow Smoothing: {settings.flowSmoothing || 0.5}</label>
                <input
                  type="range"
                  min="0"
                  max="0.9"
                  step="0.1"
                  value={settings.flowSmoothing || 0.5}
                  onChange={(e) => onSettingsChange({ flowSmoothing: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="ascii-control-group">
                <label>Pattern Detail: {settings.noiseScale}</label>
                <input
                  type="range"
                  min="0.005"
                  max="0.05"
                  step="0.005"
                  value={settings.noiseScale}
                  onChange={(e) => onSettingsChange({ noiseScale: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="ascii-control-group">
                <label>Flow Speed: {settings.noiseSpeed}</label>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={settings.noiseSpeed}
                  onChange={(e) => onSettingsChange({ noiseSpeed: Number.parseFloat(e.target.value) })}
                />
              </div>

              {/* Wave-specific controls - only show when wave animation is selected */}
              {settings.animationStyle === "wave" && (
                <div
                  className="ascii-control-group"
                  style={{ borderTop: "1px solid #333", paddingTop: "15px", marginTop: "15px" }}
                >
                  <label style={{ fontWeight: "bold" }}>Wave Settings</label>

                  <div className="ascii-control-group">
                    <label>Flow Direction: {settings.waveFlowDirection || 45}°</label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="15"
                      value={settings.waveFlowDirection || 45}
                      onChange={(e) => onSettingsChange({ waveFlowDirection: Number.parseInt(e.target.value) })}
                    />
                    <small style={{ color: "#888", fontSize: "12px" }}>
                      0° = Right, 90° = Down, 180° = Left, 270° = Up
                    </small>
                  </div>

                  <div className="ascii-control-group">
                    <label>Wave Intensity: {settings.waveIntensity || 1.0}</label>
                    <input
                      type="range"
                      min="0.1"
                      max="2.0"
                      step="0.1"
                      value={settings.waveIntensity || 1.0}
                      onChange={(e) => onSettingsChange({ waveIntensity: Number.parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="ascii-control-group">
                    <label>Wave Layers: {settings.waveLayers || 3}</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={settings.waveLayers || 3}
                      onChange={(e) => onSettingsChange({ waveLayers: Number.parseInt(e.target.value) })}
                    />
                    <small style={{ color: "#888", fontSize: "12px" }}>
                      More layers = more complex patterns
                    </small>
                  </div>

                  <div className="ascii-control-group">
                    <label>Organic Factor: {settings.waveOrganicFactor || 0.1}</label>
                    <input
                      type="range"
                      min="0"
                      max="0.5"
                      step="0.05"
                      value={settings.waveOrganicFactor || 0.1}
                      onChange={(e) => onSettingsChange({ waveOrganicFactor: Number.parseFloat(e.target.value) })}
                    />
                    <small style={{ color: "#888", fontSize: "12px" }}>
                      Higher values = more organic, less geometric feel
                    </small>
                  </div>
                </div>
              )}

              <div
                className="ascii-control-group"
                style={{ borderTop: "1px solid #333", paddingTop: "15px", marginTop: "15px" }}
              >
                <label style={{ fontWeight: "bold" }}>Entrance Animation</label>

                <div className="ascii-control-group">
                  <label>Enable Entrance</label>
                  <select
                    value={settings.entranceAnimation !== false ? "true" : "false"}
                    onChange={(e) => onSettingsChange({ entranceAnimation: e.target.value === "true" })}
                    style={{ zIndex: 1000000, pointerEvents: "auto" }}
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>

                {settings.entranceAnimation !== false && (
                  <>
                    <div className="ascii-control-group">
                      <label>Entrance Direction</label>
                      <select
                        value={settings.entranceDirection || "bottom"}
                        onChange={(e) => onSettingsChange({ entranceDirection: e.target.value })}
                        style={{ zIndex: 1000000, pointerEvents: "auto" }}
                      >
                        <option value="bottom">Bottom</option>
                        <option value="top">Top</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                        <option value="center">Center</option>
                      </select>
                    </div>

                    <div className="ascii-control-group">
                      <label>Entrance Duration: {settings.entranceDuration || 1.5}s</label>
                      <input
                        type="range"
                        min="0.5"
                        max="3.0"
                        step="0.1"
                        value={settings.entranceDuration || 1.5}
                        onChange={(e) => onSettingsChange({ entranceDuration: Number.parseFloat(e.target.value) })}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* New Accessibility Tab */}
          {activeTab === "accessibility" && (
            <div className="ascii-tab-content">
              <div className="ascii-control-group">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <label style={{ fontWeight: "bold" }}>Reduced Motion</label>
                  {prefersReducedMotion && (
                    <span
                      style={{
                        fontSize: "12px",
                        backgroundColor: "#3B82F6",
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: "9999px",
                      }}
                    >
                      Detected
                    </span>
                  )}
                </div>

                <div className="ascii-control-group">
                  <label>Respect System Preference</label>
                  <select
                    value={settings.respectReducedMotion !== false ? "true" : "false"}
                    onChange={(e) => onSettingsChange({ respectReducedMotion: e.target.value === "true" })}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div className="ascii-control-group">
                  <label>Reduced Motion Style</label>
                  <select
                    value={settings.reducedMotionStyle || "static"}
                    onChange={(e) => onSettingsChange({ reducedMotionStyle: e.target.value })}
                  >
                    <option value="static">Static (No Animation)</option>
                    <option value="minimal">Minimal Motion</option>
                    <option value="slow">Slow Motion</option>
                  </select>
                </div>

                <div className="ascii-control-group">
                  <label>Fade In Static Background</label>
                  <select
                    value={settings.reducedMotionFadeIn !== false ? "true" : "false"}
                    onChange={(e) => onSettingsChange({ reducedMotionFadeIn: e.target.value === "true" })}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                {settings.reducedMotionFadeIn && (
                  <div className="ascii-control-group">
                    <label>Fade Duration: {settings.reducedMotionFadeDuration || 1.0}s</label>
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      value={settings.reducedMotionFadeDuration || 1.0}
                      onChange={(e) =>
                        onSettingsChange({ reducedMotionFadeDuration: Number.parseFloat(e.target.value) })
                      }
                    />
                  </div>
                )}
              </div>

              <div
                className="ascii-control-group"
                style={{ borderTop: "1px solid #333", paddingTop: "15px", marginTop: "15px" }}
              >
                <div style={{ fontSize: "14px", color: "#9ca3af" }}>
                  <p style={{ marginBottom: "8px" }}>
                    <strong>Current Status:</strong>{" "}
                    {prefersReducedMotion
                      ? "Reduced motion preference detected"
                      : "No reduced motion preference detected"}
                  </p>
                  <p>
                    When reduced motion is active, animations will be simplified or disabled based on your settings
                    above.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Copy Configuration Button */}
          <div className="ascii-control-group copy-section">
            <button
              className={`ascii-copy-button ${copySuccess ? "success" : ""}`}
              onClick={copyConfiguration}
              type="button"
            >
              {copySuccess ? "Copied!" : "Copy Configuration"}
            </button>
            <p className="copy-hint">Copies JavaScript config for pasting in your Jekyll layouts</p>
          </div>
        </div>
      )}
    </div>
  )

  // Only render portal when mounted
  if (!mounted || !portalRef.current) return null

  return createPortal(controlPanelContent, portalRef.current)
}
