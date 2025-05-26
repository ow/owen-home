// Debug script for ASCII background issues
console.log("ASCII Debug Script Loaded");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded - Starting ASCII Debug");
  
  // Check for ASCII background elements
  const asciiElements = document.querySelectorAll("[data-ascii-background]");
  console.log(`Found ${asciiElements.length} ASCII background elements:`, asciiElements);
  
  asciiElements.forEach((element, index) => {
    console.log(`Element ${index}:`, {
      id: element.id,
      classes: element.className,
      config: element.getAttribute("data-ascii-background"),
      hasCanvas: !!element.querySelector("canvas"),
      boundingRect: element.getBoundingClientRect()
    });
  });
  
  // Check after a delay to see if canvases were added
  setTimeout(() => {
    console.log("Checking ASCII elements after 500ms delay:");
    asciiElements.forEach((element, index) => {
      const canvas = element.querySelector("canvas");
      console.log(`Element ${index} after delay:`, {
        id: element.id,
        hasCanvas: !!canvas,
        canvasSize: canvas ? `${canvas.width}x${canvas.height}` : "no canvas",
        isVisible: element.offsetWidth > 0 && element.offsetHeight > 0
      });
    });
  }, 500);
  
  // Monitor for animation frames
  let frameCount = 0;
  const startTime = performance.now();
  
  function checkAnimation() {
    frameCount++;
    if (frameCount % 60 === 0) { // Log every 60 frames (roughly 1 second)
      const elapsed = (performance.now() - startTime) / 1000;
      console.log(`Animation check: ${frameCount} frames in ${elapsed.toFixed(1)}s (${(frameCount/elapsed).toFixed(1)} FPS)`);
      
      // Check if canvases are being updated
      asciiElements.forEach((element, index) => {
        const canvas = element.querySelector("canvas");
        if (canvas) {
          const ctx = canvas.getContext("2d");
          const imageData = ctx.getImageData(0, 0, Math.min(10, canvas.width), Math.min(10, canvas.height));
          const hasContent = Array.from(imageData.data).some(value => value > 0);
          console.log(`Canvas ${index} has content:`, hasContent);
        }
      });
    }
    requestAnimationFrame(checkAnimation);
  }
  
  requestAnimationFrame(checkAnimation);
}); 