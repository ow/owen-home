# ASCII Background for Jekyll

A beautiful, animated ASCII code background effect for Jekyll sites.

## Quick Installation (3 steps)

1. **Copy this entire folder** (`jekyll-ascii-background`) to the root of your Jekyll project
2. **Run these commands** in your Jekyll project root:
   \`\`\`bash
   npm install
   npm run build-ascii
   \`\`\`
3. **Add to your layout** (e.g., `_layouts/default.html`):
   ```html
   &lt;!-- Add this where you want the background -->
   <div id="ascii-background-root">
     &lt;!-- Your content here -->
   </div>

   &lt;!-- Add these before the closing body tag -->
   <link rel="stylesheet" href="{{ '/assets/css/ascii-control-panel.css' | relative_url }}">
   <script src="{{ '/assets/js/ascii-background.js' | relative_url }}"></script>
   
   &lt;!-- Optional: Configure the background -->
   <script>
   window.asciiConfig = {
     colorPalette: "cyberpunk",
     opacity: 0.7,
     showControls: true  // Set to false to hide controls
   };
   </script>
   \`\`\`

That's it! The ASCII background will now appear in your Jekyll site.

## Configuration Options

\`\`\`javascript
// All available options with default values
window.asciiConfig = {
  density: 30,            // Character density
  speed: 30,              // Animation speed
  opacity: 0.9,           // Background opacity
  colorPalette: "stripe", // Color palette (stripe, ocean, sunset, purple, cyberpunk, custom)
  noiseScale: 0.015,      // Pattern detail
  noiseSpeed: 0.5,        // Flow speed
  characterSet: "code",   // Character set (minimal, dots, blocks, code, custom)
  gradientSize: 1.5,      // Gradient size
  animationStyle: "continuous", // Animation style (continuous, wave, flow, pulse)
  transitionSmoothness: 1.2,    // Transition smoothness
  showControls: true      // Set to false to hide the control panel
};
