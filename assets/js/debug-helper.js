/**
 * ASCII Background Debug Helper
 * Add this script to your page to help debug control panel issues
 */

// Wait for the page to fully load
document.addEventListener("DOMContentLoaded", () => {
  console.log("Debug helper loaded")

  // Wait a bit for components to initialize
  setTimeout(() => {
    // Check if the control panel exists
    const controlPanel = document.querySelector(".ascii-control-panel")
    if (controlPanel) {
      console.log("Control panel found:", controlPanel)

      // Check if the button exists
      const button = controlPanel.querySelector(".ascii-control-button")
      if (button) {
        console.log("Control button found:", button)

        // Add a manual click handler to the button
        button.addEventListener("click", (e) => {
          console.log("Button clicked via debug helper")

          // Force the control content to show
          const content = controlPanel.querySelector(".ascii-control-content")
          if (content) {
            console.log("Control content found:", content)

            // Toggle visibility
            if (content.style.display === "block") {
              content.style.display = "none"
              console.log("Hiding control panel content")
            } else {
              content.style.display = "block"
              console.log("Showing control panel content")

              // Force z-index and positioning
              content.style.zIndex = "99999"
              content.style.position = "absolute"
              content.style.bottom = "50px"
              content.style.right = "0"
            }
          } else {
            console.error("Control content not found!")

            // Create a temporary panel if none exists
            const tempContent = document.createElement("div")
            tempContent.className = "ascii-control-content"
            tempContent.style.display = "block"
            tempContent.style.zIndex = "99999"
            tempContent.style.position = "absolute"
            tempContent.style.bottom = "50px"
            tempContent.style.right = "0"
            tempContent.style.width = "300px"
            tempContent.style.backgroundColor = "#1a1a1a"
            tempContent.style.border = "1px solid #333"
            tempContent.style.borderRadius = "8px"
            tempContent.style.padding = "15px"
            tempContent.style.color = "#fff"
            tempContent.innerHTML = "<p>Debug panel created. The original control panel content is missing.</p>"
            controlPanel.appendChild(tempContent)
            console.log("Created temporary debug panel")
          }
        })

        console.log("Added debug click handler to button")
      } else {
        console.error("Control button not found!")
      }
    } else {
      console.error("Control panel not found!")

      // Check if the ASCII background root exists
      const root = document.getElementById("ascii-background-root")
      if (root) {
        console.log("ASCII background root found:", root)
        console.log("But control panel is missing. Check if showControls is set to true.")
      } else {
        console.error("ASCII background root not found!")
      }
    }

    // Check for JavaScript errors
    if (window.asciiConfig) {
      console.log("ASCII config found:", window.asciiConfig)
      console.log("showControls setting:", window.asciiConfig.showControls)
    } else {
      console.warn("No window.asciiConfig found!")
    }

    // Check for CSS issues
    const styles = document.querySelectorAll('link[rel="stylesheet"]')
    let asciiCssFound = false
    styles.forEach((style) => {
      if (style.href.includes("ascii-control-panel.css")) {
        console.log("ASCII CSS found:", style.href)
        asciiCssFound = true
      }
    })

    if (!asciiCssFound) {
      console.error("ASCII control panel CSS not found!")
    }
  }, 1000)
})

// Add a global helper function
window.debugAsciiPanel = () => {
  const panel = document.querySelector(".ascii-control-panel")
  if (panel) {
    const content = panel.querySelector(".ascii-control-content")
    if (content) {
      content.style.display = "block"
      content.style.zIndex = "99999"
      return "Panel should now be visible"
    } else {
      return "Control content not found"
    }
  } else {
    return "Control panel not found"
  }
}
