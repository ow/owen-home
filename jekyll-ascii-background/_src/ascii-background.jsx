"use client"

import { useEffect, useState, useRef } from "react"
import { renderAsciiBackground, resetAnimationState } from "./shared/ascii-core"
import { resolveAsciiSettings } from "./shared/ascii-config"

export function AsciiBackground(props) {
  // Merge provided props with default settings
  const settings = resolveAsciiSettings(props)

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [time, setTime] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const animationRef = useRef(null)
  const pointerRef = useRef({ x: 0.72, y: 0.34, activity: 0 })
  const pointerTargetRef = useRef({ x: 0.72, y: 0.34, activity: 0 })

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
      // Local development detection logic without console logging
    }
  }, [])

  // Add event listener for reset functionality
  useEffect(() => {
    const handleReset = (event) => {
      // Get the canvas context
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          // Reset the animation state
          resetAnimationState(ctx)
          
          // Reset time to trigger a fresh start
          setTime(0)
        }
      }
    }

    // Listen for the custom reset event
    window.addEventListener('ascii-background-reset', handleReset)

    return () => {
      window.removeEventListener('ascii-background-reset', handleReset)
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
      const host = containerRef.current?.parentElement
      const hostRect = host?.getBoundingClientRect()
      const displayWidth = settings.fullscreen ? window.innerWidth : hostRect?.width || window.innerWidth
      const displayHeight = settings.fullscreen ? window.innerHeight : hostRect?.height || window.innerHeight
      const width = Math.max(1, Math.floor(displayWidth / charWidth))
      const height = Math.max(1, Math.floor(displayHeight / charWidth))

      setDimensions({ width, height })
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    const host = containerRef.current?.parentElement
    const resizeObserver = host && typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(updateDimensions)
      : null
    resizeObserver?.observe(host)

    return () => {
      window.removeEventListener("resize", updateDimensions)
      resizeObserver?.disconnect()
    }
  }, [settings.density, settings.fullscreen])

  // Pause canvases that are outside the viewport. The page uses this component
  // in both the hero and footer, so this prevents invisible ambient work.
  useEffect(() => {
    const host = containerRef.current?.parentElement
    if (!host || typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "120px 0px" },
    )
    observer.observe(host)

    return () => observer.disconnect()
  }, [])

  // Refraction follows pointer movement without forcing React renders.
  useEffect(() => {
    if (!settings.interactiveMode || settings.interactiveEffect !== "refraction") return

    const host = containerRef.current?.parentElement
    const interactionSurface = host?.parentElement || host
    if (!host || !interactionSurface) return

    const handlePointerMove = (event) => {
      if (event.pointerType === "touch") return
      const rect = host.getBoundingClientRect()
      pointerTargetRef.current = {
        x: Math.min(Math.max((event.clientX - rect.left) / Math.max(rect.width, 1), 0), 1),
        y: Math.min(Math.max((event.clientY - rect.top) / Math.max(rect.height, 1), 0), 1),
        activity: 1,
      }
    }

    const handlePointerLeave = () => {
      pointerTargetRef.current = { ...pointerTargetRef.current, activity: 0 }
    }

    interactionSurface.addEventListener("pointermove", handlePointerMove, { passive: true })
    interactionSurface.addEventListener("pointerleave", handlePointerLeave, { passive: true })

    return () => {
      interactionSurface.removeEventListener("pointermove", handlePointerMove)
      interactionSurface.removeEventListener("pointerleave", handlePointerLeave)
    }
  }, [settings.interactiveMode, settings.interactiveEffect])

  // Animation using requestAnimationFrame
  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    if (dimensions.width === 0 || dimensions.height === 0 || !isVisible) return

    // Determine if we should use reduced motion
    const useReducedMotion = settings.respectReducedMotion && prefersReducedMotion

    if (useReducedMotion && settings.reducedMotionStyle === "static") {
      setTime((previousTime) => previousTime === 0 ? 0.1 : previousTime)
      return
    }

    const animate = () => {
      const pointer = pointerRef.current
      const target = pointerTargetRef.current
      pointer.x += (target.x - pointer.x) * 0.075
      pointer.y += (target.y - pointer.y) * 0.075
      pointer.activity += (target.activity - pointer.activity) * 0.065

      const speedFactor = useReducedMotion
        ? settings.reducedMotionStyle === "minimal"
          ? 0.06
          : settings.reducedMotionStyle === "slow"
            ? 0.2
            : 1
        : 1
      setTime((prevTime) => prevTime + settings.speed * 0.0001 * speedFactor)

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
    settings.reducedMotionFadeIn,
    isVisible,
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
    renderAsciiBackground(
      ctx,
      dimensions,
      time,
      {
        ...settings,
        pointer: pointerRef.current,
        // A static reduced-motion composition should render fully on its first frame.
        reducedMotionFadeIn: useReducedMotion && settings.reducedMotionStyle === "static"
          ? false
          : settings.reducedMotionFadeIn,
      },
      [],
      useReducedMotion,
      backgroundColor,
    )

    // Performance monitoring (local development only)
    if (isLocalDevelopment && settings.showFps) {
      const now = performance.now()
      fpsCounterRef.current.frameCount++
      
      if (now - fpsCounterRef.current.lastTime >= 1000) {
        const calculatedFps = fpsCounterRef.current.frameCount
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
    settings.complexityField,
    settings.clarityAnchorX,
    settings.clarityAnchorY,
    settings.clarityRadiusX,
    settings.clarityRadiusY,
    settings.clarityStrength,
    settings.clarityQuieting,
    settings.edgeTurbulence,
    settings.waveFrequency,
    settings.waveBend,
    settings.interactiveMode,
    settings.interactiveEffect,
    settings.interactiveRadius,
    settings.interactiveIntensity,
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
        <canvas 
          ref={canvasRef} 
          style={{
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated' // Ensures crisp character rendering
          }}
        />
      </div>
      
      {/* FPS Counter - Local Development Only - Rendered outside container */}
      {isLocalDevelopment && settings.showFps && (
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
