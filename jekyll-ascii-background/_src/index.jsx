"use client"

import { useState } from "react"
import ReactDOM from "react-dom/client"
import { AsciiBackground } from "./ascii-background"
import { ControlPanel } from "./control-panel"
import "./control-panel.css"
import { defaultSettings } from "./shared/ascii-core"

function AsciiBackgroundApp({ initialConfig = {} }) {
  // If page has provided config, use it
  const initialSettings = { ...defaultSettings, ...initialConfig }

  const [settings, setSettings] = useState(initialSettings)

  const handleSettingsChange = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  return (
    <>
      <AsciiBackground {...settings} />
      {/* Only render the control panel if showControls is true */}
      {settings.showControls && <ControlPanel settings={settings} onSettingsChange={handleSettingsChange} />}
    </>
  )
}

document.addEventListener("DOMContentLoaded", () => {
  // Look for elements with data-ascii-background attribute
  const asciiElements = document.querySelectorAll("[data-ascii-background]")

  // Look for legacy mount point
  const legacyMountPoint = document.getElementById("ascii-background-root")

  // If we have data-ascii-background elements, use those
  if (asciiElements.length > 0) {
    asciiElements.forEach((element) => {
      // Skip if this is the legacy mount point (prevent double mounting)
      if (element.id === "ascii-background-root") return

      let config = {}
      try {
        const configAttr = element.getAttribute("data-ascii-background")
        if (configAttr && configAttr !== "") {
          config = JSON.parse(configAttr)
        }
      } catch (e) {
        console.error("Error parsing ASCII background config:", e)
      }

      // Use global config as fallback
      if (window.asciiConfig) {
        config = { ...window.asciiConfig, ...config }
      }

      // Make sure parent has position if not already set
      if (config.fullscreen === false) {
        const parentPosition = window.getComputedStyle(element).position
        if (parentPosition === "static") {
          element.style.position = "relative"
        }
      }

      const root = ReactDOM.createRoot(element)
      root.render(<AsciiBackgroundApp initialConfig={config} />)
    })
  }
  // If no data-ascii-background elements found, fall back to legacy mount point
  else if (legacyMountPoint && !legacyMountPoint.hasAttribute("data-ascii-background")) {
    const root = ReactDOM.createRoot(legacyMountPoint)
    root.render(<AsciiBackgroundApp initialConfig={window.asciiConfig || {}} />)
  }
})
