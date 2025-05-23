"use client"

import { useEffect, useState, useRef } from "react"
import { defaultSettings, renderAsciiBackground } from "./shared/ascii-core"

export function AsciiBackground(props) {
  // Merge provided props with default settings
  const settings = { ...defaultSettings, ...props }

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [time, setTime] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const animationRef = useRef(null)

  // Performance monitoring (local development only)
  const [fps, setFps] = useState(0)
  const fpsCounterRef = useRef({ frameCount: 0, lastTime: performance.now() })
  const isLocalDevelopment = typeof window !== "undefined" && 
    (window.location.hostname === "localhost" || 
     window.location.hostname === "127.0.0.1" || 
     window.location.hostname === "0.0.0.0" ||
     window.location.port === "4000" || // Jekyll default
     window.location.hostname.includes("local"))

  // Debug logging for local development detection
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("Hostname:", window.location.hostname)
      console.log("Port:", window.location.port)
      console.log("Is Local Development:", isLocalDevelopment)
    }
  }, [])

  // Detect prefers-reduced-motion preference
  useEffect(() => {
    // Check if the browser supports matchMedia
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

      // Set initial value
      setPrefersReducedMotion(mediaQuery.matches)

      // Add listener for changes
      const handleChange = (e) => {
        setPrefersReducedMotion(e.matches)
      }

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleChange)
        return () => mediaQuery.removeEventListener("change", handleChange)
      }
      // Older browsers
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange)
        return () => mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  // Calculate grid dimensions and initialize
  useEffect(() => {
    const updateDimensions = () => {
      const charWidth = Math.max(8, settings.density / 3)
      const width = Math.floor(window.innerWidth / charWidth)
      const height = Math.floor(window.innerHeight / charWidth)

      setDimensions({ width, height })
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => window.removeEventListener("resize", updateDimensions)
  }, [settings.density])

  // Animation using requestAnimationFrame
  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    if (dimensions.width === 0 || dimensions.height === 0) return

    // Determine if we should use reduced motion
    const useReducedMotion = settings.respectReducedMotion && prefersReducedMotion

    // For reduced motion, we might want to slow down or stop the animation
    const animate = () => {
      // If using reduced motion with static style, don't update time
      if (useReducedMotion && settings.reducedMotionStyle === "static") {
        // Only update time once for the initial render
        if (time === 0) {
          setTime(0.1) // Just enough to initialize
        }
      } else {
        // For normal motion or minimal/slow reduced motion, update time
        // Possibly at a slower rate for reduced motion
        const speedFactor = useReducedMotion && settings.reducedMotionStyle === "slow" ? 0.2 : 1.0
        setTime((prevTime) => prevTime + settings.speed * 0.0001 * speedFactor)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [
    dimensions,
    settings.speed,
    settings.respectReducedMotion,
    settings.reducedMotionStyle,
    prefersReducedMotion,
    time,
    settings.reducedMotionFadeIn,
  ])

  // Render to canvas
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0 || dimensions.height === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Determine if we should use reduced motion
    const useReducedMotion = settings.respectReducedMotion && prefersReducedMotion

    // Use slate-900 background color to match the page background
    const backgroundColor = "rgb(15, 23, 42)" // Tailwind slate-900

    // Pass empty array for ripples since we're removing that functionality
    renderAsciiBackground(ctx, dimensions, time, settings, [], useReducedMotion, backgroundColor)

    // Performance monitoring (local development only)
    if (isLocalDevelopment) {
      const now = performance.now()
      fpsCounterRef.current.frameCount++
      
      if (now - fpsCounterRef.current.lastTime >= 1000) {
        const calculatedFps = fpsCounterRef.current.frameCount
        console.log("FPS Update:", calculatedFps)
        setFps(calculatedFps)
        fpsCounterRef.current.frameCount = 0
        fpsCounterRef.current.lastTime = now
      }
    }
  }, [
    dimensions,
    time,
    settings.density,
    settings.speed,
    settings.opacity,
    settings.colorPalette,
    settings.customColors,
    settings.noiseScale,
    settings.noiseSpeed,
    settings.characterSet,
    settings.customCharacters,
    settings.gradientSize,
    settings.animationStyle,
    settings.transitionSmoothness,
    settings.flowAwareness,
    settings.flowSmoothing,
    settings.entranceAnimation,
    settings.entranceDirection,
    settings.entranceDuration,
    settings.respectReducedMotion,
    settings.reducedMotionStyle,
    settings.reducedMotionFadeIn,
    prefersReducedMotion,
    isLocalDevelopment,
  ])

  return (
    <>
      <div
        ref={containerRef}
        className={
          settings.fullscreen
            ? "fixed inset-0 overflow-hidden pointer-events-none z-[-1]"
            : "absolute inset-0 overflow-hidden pointer-events-none z-0"
        }
        aria-hidden="true"
        style={{ opacity: settings.opacity }}
      >
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      
      {/* FPS Counter - Local Development Only - Rendered outside container */}
      {isLocalDevelopment && (
        <div 
          className="fixed top-4 left-4 bg-red-500 text-white px-3 py-1 rounded text-sm font-mono pointer-events-none"
          style={{ 
            fontSize: '14px', 
            fontWeight: 'bold',
            zIndex: 99999,
            position: 'fixed'
          }}
        >
          FPS: {fps || 'Loading...'}
        </div>
      )}
    </>
  )
}
