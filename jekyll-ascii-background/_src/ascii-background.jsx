"use client"

import { useEffect, useState, useRef } from "react"
import { hexToOklab, renderAsciiBackground, resetAnimationState } from "./shared/ascii-core"
import { resolveAsciiSettings } from "./shared/ascii-config"

const maxActiveEmissions = 4

export function AsciiBackground(props) {
  // Merge provided props with default settings
  const settings = resolveAsciiSettings(props)
  const settingsRef = useRef(settings)
  settingsRef.current = settings
  const settingsSignature = JSON.stringify({ ...settings, pointer: null })

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const animationRef = useRef(null)
  const renderFrameRef = useRef(null)
  const timeRef = useRef(0)
  const pointerRef = useRef({
    x: 0.72,
    y: 0.34,
    activity: 0,
    engagement: 0,
    momentum: 0,
    emissions: [],
  })
  const pointerTargetRef = useRef({
    x: 0.72,
    y: 0.34,
    activity: 0,
    engagement: 0,
    momentum: 0,
  })
  const pointerOnReactiveSurfaceRef = useRef(false)
  const activeEmitterRef = useRef(null)

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
          
          timeRef.current = 0
          renderFrameRef.current?.(performance.now(), false)
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
    const reactiveSurfaces = interactionSurface.querySelectorAll("[data-ascii-reactive]")
    const scrollPositions = new WeakMap()
    let scrollIdleTimer = null

    const getEmitterColor = (emitter) => {
      const color = emitter?.getAttribute("data-ascii-emission")
      return color ? hexToOklab(color) : null
    }

    const startEmission = (emitter, hostRect, momentum = 0) => {
      if (!emitter || emitter === activeEmitterRef.current) return

      const color = getEmitterColor(emitter)
      const emitterRect = emitter.getBoundingClientRect()
      if (!color) return

      const width = Math.max(hostRect.width, 1)
      const height = Math.max(hostRect.height, 1)
      const emission = {
        x: Math.min(Math.max((emitterRect.left + emitterRect.width * 0.5 - hostRect.left) / width, 0), 1),
        y: Math.min(Math.max((emitterRect.top - hostRect.top) / height - 0.005, 0), 1),
        strength: 0.08,
        phase: 0,
        momentum,
        lightness: color.lightness,
        a: color.a,
        b: color.b,
      }

      pointerRef.current.emissions = [
        ...pointerRef.current.emissions,
        emission,
      ].slice(-maxActiveEmissions)
      activeEmitterRef.current = emitter
    }

    const handlePointerMove = (event) => {
      if (event.pointerType === "touch") return
      const rect = host.getBoundingClientRect()
      const emitter = event.target?.closest?.("[data-ascii-emission]")
      const reactiveSurface = event.target?.closest?.("[data-ascii-reactive]")
      const currentTarget = pointerTargetRef.current
      const overReactiveSurface = Boolean(reactiveSurface)
      const pointerX = Math.min(Math.max((event.clientX - rect.left) / Math.max(rect.width, 1), 0), 1)
      const pointerY = Math.min(Math.max((event.clientY - rect.top) / Math.max(rect.height, 1), 0), 1)

      if (emitter) startEmission(emitter, rect, currentTarget.momentum)
      else activeEmitterRef.current = null

      pointerOnReactiveSurfaceRef.current = overReactiveSurface
      pointerTargetRef.current = {
        ...currentTarget,
        x: pointerX,
        y: pointerY,
        activity: 1,
        engagement: overReactiveSurface ? 1 : 0,
      }
    }

    const handlePointerLeave = () => {
      pointerOnReactiveSurfaceRef.current = false
      activeEmitterRef.current = null
      pointerTargetRef.current = {
        ...pointerTargetRef.current,
        activity: 0,
        engagement: 0,
        momentum: 0,
      }
    }

    const handleReactiveScroll = (event) => {
      const reactiveSurface = event.currentTarget
      const previousScrollLeft = scrollPositions.get(reactiveSurface) ?? reactiveSurface.scrollLeft
      const scrollDelta = reactiveSurface.scrollLeft - previousScrollLeft
      scrollPositions.set(reactiveSurface, reactiveSurface.scrollLeft)
      if (Math.abs(scrollDelta) < 0.25) return

      const hostRect = host.getBoundingClientRect()
      const surfaceRect = reactiveSurface.getBoundingClientRect()
      const currentTarget = pointerTargetRef.current
      const hasPointerAnchor = pointerOnReactiveSurfaceRef.current
      const centeredElement = document.elementFromPoint(
        surfaceRect.left + surfaceRect.width * 0.5,
        surfaceRect.top + Math.min(surfaceRect.height * 0.22, 56),
      )
      const pointerElement = hasPointerAnchor
        ? document.elementFromPoint(
            hostRect.left + currentTarget.x * hostRect.width,
            hostRect.top + currentTarget.y * hostRect.height,
          )
        : null
      const activeEmitter = pointerElement?.closest?.("[data-ascii-emission]") ||
        centeredElement?.closest?.("[data-ascii-emission]")
      const momentum = Math.min(0.3 + Math.abs(scrollDelta) / 18, 1)

      if (activeEmitter) startEmission(activeEmitter, hostRect, momentum)
      else if (!hasPointerAnchor) activeEmitterRef.current = null

      pointerTargetRef.current = {
        ...currentTarget,
        x: hasPointerAnchor
          ? currentTarget.x
          : Math.min(Math.max((surfaceRect.left + surfaceRect.width * 0.5 - hostRect.left) / Math.max(hostRect.width, 1), 0), 1),
        y: hasPointerAnchor
          ? currentTarget.y
          : Math.min(Math.max((surfaceRect.top + surfaceRect.height * 0.22 - hostRect.top) / Math.max(hostRect.height, 1), 0), 1),
        activity: 1,
        engagement: 1,
        momentum,
      }

      window.clearTimeout(scrollIdleTimer)
      scrollIdleTimer = window.setTimeout(() => {
        pointerTargetRef.current = {
          ...pointerTargetRef.current,
          activity: pointerOnReactiveSurfaceRef.current ? 1 : 0,
          engagement: pointerOnReactiveSurfaceRef.current ? 1 : 0,
          momentum: 0,
        }
      }, 120)
    }

    interactionSurface.addEventListener("pointermove", handlePointerMove, { passive: true })
    interactionSurface.addEventListener("pointerleave", handlePointerLeave, { passive: true })
    reactiveSurfaces.forEach((surface) => {
      scrollPositions.set(surface, surface.scrollLeft)
      surface.addEventListener("scroll", handleReactiveScroll, { passive: true })
    })

    return () => {
      window.clearTimeout(scrollIdleTimer)
      interactionSurface.removeEventListener("pointermove", handlePointerMove)
      interactionSurface.removeEventListener("pointerleave", handlePointerLeave)
      reactiveSurfaces.forEach((surface) => surface.removeEventListener("scroll", handleReactiveScroll))
    }
  }, [settings.interactiveMode, settings.interactiveEffect])

  // Draw directly inside requestAnimationFrame. React only hears about the
  // once-per-second FPS label, keeping its reconciliation work off the hot path.
  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    if (dimensions.width === 0 || dimensions.height === 0 || !isVisible) return

    const useReducedMotion = settings.respectReducedMotion && prefersReducedMotion
    const staticComposition = useReducedMotion && settings.reducedMotionStyle === "static"
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx) return
    const backgroundColor = "rgb(15, 23, 42)"
    let lastTimestamp = performance.now()

    const drawFrame = (timestamp, scheduleNext = true) => {
      const currentSettings = settingsRef.current
      const pointer = pointerRef.current
      const target = pointerTargetRef.current
      pointer.x += (target.x - pointer.x) * 0.075
      pointer.y += (target.y - pointer.y) * 0.075
      pointer.activity += (target.activity - pointer.activity) * 0.065
      pointer.engagement += (target.engagement - pointer.engagement) * 0.11
      pointer.momentum += (target.momentum - pointer.momentum) * 0.18

      const speedFactor = useReducedMotion
        ? currentSettings.reducedMotionStyle === "minimal"
          ? 0.06
          : currentSettings.reducedMotionStyle === "slow"
            ? 0.2
            : 1
        : 1
      const frameScale = Math.min(Math.max((timestamp - lastTimestamp) / (1000 / 60), 0), 2)
      lastTimestamp = timestamp
      if (useReducedMotion) {
        pointer.emissions = []
      } else if (pointer.emissions.length > 0) {
        pointer.emissions = pointer.emissions
          .map((emission) => {
            const phase = Math.min(
              emission.phase + frameScale * (0.021 + emission.momentum * 0.009),
              Math.PI * 2,
            )
            const strength = phase < Math.PI * 2
              ? emission.strength + (1 - emission.strength) * Math.min(frameScale * 0.1, 1)
              : emission.strength * Math.pow(0.965, frameScale)

            return { ...emission, phase, strength }
          })
          .filter((emission) => emission.strength > 0.01)
      }
      if (!staticComposition) {
        timeRef.current += currentSettings.speed * 0.0001 * speedFactor * frameScale
      }

      renderAsciiBackground(
        ctx,
        dimensions,
        staticComposition ? 0.42 : timeRef.current,
        {
          ...currentSettings,
          pointer,
          reducedMotionFadeIn: staticComposition ? false : currentSettings.reducedMotionFadeIn,
        },
        [],
        useReducedMotion,
        backgroundColor,
      )

      if (isLocalDevelopment && currentSettings.showFps && !staticComposition) {
        fpsCounterRef.current.frameCount++
        if (timestamp - fpsCounterRef.current.lastTime >= 1000) {
          setFps(Math.round(fpsCounterRef.current.frameCount * 1000 / (timestamp - fpsCounterRef.current.lastTime)))
          fpsCounterRef.current.frameCount = 0
          fpsCounterRef.current.lastTime = timestamp
        }
      }

      if (!staticComposition && scheduleNext) animationRef.current = requestAnimationFrame(drawFrame)
    }

    renderFrameRef.current = drawFrame
    drawFrame(lastTimestamp)

    return () => {
      renderFrameRef.current = null
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [
    dimensions.width,
    dimensions.height,
    settingsSignature,
    prefersReducedMotion,
    isVisible,
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
