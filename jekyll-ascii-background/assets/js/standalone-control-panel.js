/**
 * Standalone Control Panel for ASCII Background
 * This version doesn't rely on React and can be used independently
 */
;(() => {
  // Wait for DOM to be fully loaded
  document.addEventListener("DOMContentLoaded", () => {
    console.log("Standalone control panel initializing...")

    // Create control panel elements
    const createControlPanel = () => {
      // Create the main container
      const panel = document.createElement("div")
      panel.className = "ascii-control-panel"
      panel.style.zIndex = "9999"

      // Create toggle button
      const toggleBtn = document.createElement("button")
      toggleBtn.className = "ascii-control-button"
      toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`

      // Create content container (initially hidden)
      const content = document.createElement("div")
      content.className = "ascii-control-content"
      content.style.display = "none"
      content.style.zIndex = "9999"

      // Add tabs
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

      // Add appearance controls
      addAppearanceControls(appearanceContent)

      // Add animation controls
      addAnimationControls(animationContent)

      // Add copy button section
      const copySection = document.createElement("div")
      copySection.className = "ascii-control-group copy-section"

      const copyButton = document.createElement("button")
      copyButton.className = "ascii-copy-button"
      copyButton.textContent = "Copy Configuration"

      const copyHint = document.createElement("p")
      copyHint.className = "copy-hint"
      copyHint.textContent = "Copies JavaScript config for pasting in your Jekyll layouts"

      // Toggle panel visibility
      toggleBtn.addEventListener("click", () => {
        console.log("Toggle button clicked")
        if (content.style.display === "none") {
          content.style.display = "block"
        } else {
          content.style.display = "none"
        }
      })

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

      // Copy configuration
      copyButton.addEventListener("click", () => {
        const config = formatConfigForCopy()
        navigator.clipboard
          .writeText(config)
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

      // Assemble the panel
      copySection.appendChild(copyButton)
      copySection.appendChild(copyHint)

      content.appendChild(tabs)
      content.appendChild(appearanceContent)
      content.appendChild(animationContent)
      content.appendChild(copySection)

      panel.appendChild(toggleBtn)
      panel.appendChild(content)

      // Append to body
      document.body.appendChild(panel)

      console.log("Control panel created and appended to body")
    }

    // Helper function to add appearance controls
    function addAppearanceControls(container) {
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
        if (window.asciiConfig && palette === window.asciiConfig.colorPalette) {
          option.selected = true
        }
        colorSelect.appendChild(option)
      })

      colorSelect.addEventListener("change", (e) => {
        if (window.asciiConfig) {
          window.asciiConfig.colorPalette = e.target.value
          updateAsciiBackground()
        }
      })

      colorGroup.appendChild(colorLabel)
      colorGroup.appendChild(colorSelect)
      container.appendChild(colorGroup)

      // Add more controls as needed...
      // This is a simplified version for demonstration
    }

    // Helper function to add animation controls
    function addAnimationControls(container) {
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
        if (window.asciiConfig && style === window.asciiConfig.animationStyle) {
          option.selected = true
        }
        styleSelect.appendChild(option)
      })

      styleSelect.addEventListener("change", (e) => {
        if (window.asciiConfig) {
          window.asciiConfig.animationStyle = e.target.value
          updateAsciiBackground()
        }
      })

      styleGroup.appendChild(styleLabel)
      styleGroup.appendChild(styleSelect)
      container.appendChild(styleGroup)

      // Add more controls as needed...
      // This is a simplified version for demonstration
    }

    // Helper function to format config for copying
    function formatConfigForCopy() {
      const config = window.asciiConfig || {}
      return `<script>
window.asciiConfig = {
  density: ${config.density || 30},
  speed: ${config.speed || 30},
  opacity: ${config.opacity || 0.9},
  colorPalette: "${config.colorPalette || "stripe"}",
  noiseScale: ${config.noiseScale || 0.015},
  noiseSpeed: ${config.noiseSpeed || 0.5},
  characterSet: "${config.characterSet || "code"}",
  gradientSize: ${config.gradientSize || 1.5},
  animationStyle: "${config.animationStyle || "continuous"}",
  transitionSmoothness: ${config.transitionSmoothness || 1.2},
  showControls: ${config.showControls !== false}
};
</script>`
    }

    // Helper function to update the ASCII background
    function updateAsciiBackground() {
      // This function would ideally trigger a re-render of the ASCII background
      // For now, we'll  {
      // This function would ideally trigger a re-render of the ASCII background
      // For now, we'll just log that an update was requested
      console.log("ASCII background update requested with config:", window.asciiConfig)

      // If the page has a refresh function exposed, call it
      if (window.refreshAsciiBackground && typeof window.refreshAsciiBackground === "function") {
        window.refreshAsciiBackground()
      } else {
        // As a fallback, we could reload the page, but that's disruptive
        // Instead, notify the user that they need to refresh
        const notification = document.createElement("div")
        notification.style.position = "fixed"
        notification.style.top = "10px"
        notification.style.left = "50%"
        notification.style.transform = "translateX(-50%)"
        notification.style.backgroundColor = "#333"
        notification.style.color = "#fff"
        notification.style.padding = "10px 20px"
        notification.style.borderRadius = "4px"
        notification.style.zIndex = "10000"
        notification.textContent = "Changes applied! Refresh page to see updates."

        document.body.appendChild(notification)

        setTimeout(() => {
          notification.style.opacity = "0"
          notification.style.transition = "opacity 0.5s"
          setTimeout(() => {
            document.body.removeChild(notification)
          }, 500)
        }, 3000)
      }
    }

    // Initialize the control panel
    createControlPanel()
  })
})()
