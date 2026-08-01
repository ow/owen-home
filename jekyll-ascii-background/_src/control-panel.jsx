"use client"

import { Fragment, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import {
  asciiPresets,
  defaultSettings,
  formatConfigForCopy,
  getSettingControlOptions,
  isSettingControlVisible,
  settingControls,
} from "./shared/ascii-config"

const tabs = [
  { id: "appearance", label: "Appearance" },
  { id: "animation", label: "Animation" },
  { id: "accessibility", label: "Accessibility" },
]

function SettingControl({ control, settings, onSettingsChange }) {
  const inputId = `ascii-setting-${control.key}`
  const value = settings[control.key] ?? defaultSettings[control.key]
  const updateValue = (event) => {
    let nextValue = event.target.value

    if (control.type === "boolean") nextValue = nextValue === "true"
    if (control.type === "range") {
      nextValue = control.integer ? Number.parseInt(nextValue) : Number.parseFloat(nextValue)
    }
    if (control.type === "colorList") {
      nextValue = nextValue.split(",").map((color) => color.trim()).filter(Boolean)
    }

    onSettingsChange({ [control.key]: nextValue })
  }

  return (
    <div className="ascii-control-group">
      <label htmlFor={inputId}>
        {control.label}
        {control.type === "range" ? `: ${value}${control.suffix || ""}` : ""}
      </label>

      {control.type === "range" && (
        <input
          id={inputId}
          type="range"
          min={control.min}
          max={control.max}
          step={control.step}
          value={value}
          onChange={updateValue}
        />
      )}

      {control.type === "select" && (
        <select id={inputId} value={value} onChange={updateValue}>
          {getSettingControlOptions(control).map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      )}

      {control.type === "boolean" && (
        <select id={inputId} value={value ? "true" : "false"} onChange={updateValue}>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      )}

      {(control.type === "text" || control.type === "colorList") && (
        <input
          id={inputId}
          type="text"
          value={Array.isArray(value) ? value.join(", ") : value}
          onChange={updateValue}
          placeholder={control.type === "colorList" ? "#071A33, #1D8B83, #C2EDC8" : " .:-=+*#%@"}
        />
      )}

      {control.description && <small>{control.description}</small>}
    </div>
  )
}

export function ControlPanel({ settings, activePreset = "custom", onPresetChange, onSettingsChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("appearance")
  const [copySuccess, setCopySuccess] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [mounted, setMounted] = useState(false)
  const portalRef = useRef(null)

  useEffect(() => {
    if (!window.matchMedia) return
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const handleChange = (event) => setPrefersReducedMotion(event.matches)
    setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener?.("change", handleChange)
    return () => mediaQuery.removeEventListener?.("change", handleChange)
  }, [])

  useEffect(() => {
    const panelIndex = document.querySelectorAll("[data-ascii-control-portal]").length
    const portalContainer = document.createElement("div")
    portalContainer.dataset.asciiControlPortal = "true"
    portalContainer.style.position = "fixed"
    portalContainer.style.bottom = `${1 + panelIndex * 3}rem`
    portalContainer.style.right = "1rem"
    portalContainer.style.zIndex = "999999"
    document.body.appendChild(portalContainer)
    portalRef.current = portalContainer
    setMounted(true)

    return () => {
      portalContainer.remove()
      portalRef.current = null
    }
  }, [])

  const copyConfiguration = async () => {
    try {
      await navigator.clipboard.writeText(formatConfigForCopy(settings))
      setCopySuccess(true)
      window.setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error("Failed to copy ASCII configuration", error)
    }
  }

  const resetAnimationState = () => {
    window.dispatchEvent(new CustomEvent("ascii-background-reset", { detail: { timestamp: Date.now() } }))
  }

  const visibleControls = settingControls.filter(
    (control) => control.tab === activeTab && isSettingControlVisible(control, settings),
  )

  let currentSection = null
  const panel = (
    <div className="ascii-control-panel" style={{ position: "relative", pointerEvents: "auto", zIndex: 999999 }}>
      <button
        className="ascii-control-button"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
        aria-expanded={isOpen}
        aria-label="ASCII background controls"
        style={{ position: "absolute", bottom: 0, right: 0 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      {isOpen && (
        <div className="ascii-control-content" style={{ position: "absolute", bottom: "calc(100% + 3rem)", right: 0, zIndex: 999999, pointerEvents: "auto" }}>
          <div className="ascii-control-group">
            <label htmlFor="ascii-preset">Preset</label>
            <select id="ascii-preset" value={activePreset} onChange={(event) => onPresetChange(event.target.value)}>
              {activePreset === "custom" && <option value="custom" disabled>Custom</option>}
              {Object.entries(asciiPresets).map(([value, preset]) => (
                <option key={value} value={value}>{preset.label}</option>
              ))}
            </select>
            <small className="copy-hint">
              {activePreset === "custom" ? "Modified from a preset" : asciiPresets[activePreset]?.description}
            </small>
          </div>

          <div className="ascii-tabs">
            {tabs.map((tab) => (
              <button key={tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)} type="button">
                {tab.label}
              </button>
            ))}
          </div>

          <div className="ascii-tab-content">
            {activeTab === "animation" && (
              <div className="ascii-control-group">
                <button className="ascii-copy-button" onClick={resetAnimationState} type="button">Reset animation</button>
              </div>
            )}

            {activeTab === "accessibility" && (
              <p className="copy-hint" role="status">
                System preference: {prefersReducedMotion ? "reduced motion" : "standard motion"}
              </p>
            )}

            {visibleControls.map((control) => {
              const startsSection = control.section && control.section !== currentSection
              if (control.section) currentSection = control.section

              return (
                <Fragment key={control.key}>
                  {startsSection && <h3 className="ascii-control-section-title">{control.section}</h3>}
                  <SettingControl control={control} settings={settings} onSettingsChange={onSettingsChange} />
                </Fragment>
              )
            })}
          </div>

          <div className="ascii-control-group copy-section">
            <button className={`ascii-copy-button ${copySuccess ? "success" : ""}`} onClick={copyConfiguration} type="button">
              {copySuccess ? "Copied!" : "Copy configuration"}
            </button>
            <p className="copy-hint">Copies the complete current configuration.</p>
          </div>
        </div>
      )}
    </div>
  )

  if (!mounted || !portalRef.current) return null
  return createPortal(panel, portalRef.current)
}
