"use client"

import { useEffect, useState, useRef } from "react"
import { hexToOklab, renderAsciiBackground, resetAnimationState } from "./shared/ascii-core"
import { resolveAsciiSettings } from "./shared/ascii-config"

const defaultEmissionColor = hexToOklab("#ff4fa3")

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
    emission: 0,
    emissionPhase: 0,
    emissionX: 0.72,
    emissionY: 0.46,
    emissionLightness: defaultEmissionColor.lightness,
    emissionA: defaultEmissionColor.a,
    emissionB: defaultEmissionColor.b,
  })
  const pointerTargetRef = useRef({ ...pointerRef.current })
  const pointerOnReactiveSurfaceRef = useRef(false)

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

    const handlePointerMove = (event) => {
      if (event.pointerType === "touch") return
      const rect = host.getBoundingClientRect()
      const emitter = event.target?.closest?.("[data-ascii-emission]")
      const reactiveSurface = event.target?.closest?.("[data-ascii-reactive]")
      const emitterColor = getEmitterColor(emitter)
      const currentTarget = pointerTargetRef.current
      const keepDraggedEmission = Boolean(
        reactiveSurface?.classList.contains("dragging") && currentTarget.emission > 0.001,
      )
      const overReactiveSurface = Boolean(reactiveSurface)
      const emitterRect = emitter?.getBoundingClientRect()
      const pointerX = Math.min(Math.max((event.clientX - rect.left) / Math.max(rect.width, 1), 0), 1)
      const pointerY = Math.min(Math.max((event.clientY - rect.top) / Math.max(rect.height, 1), 0), 1)
      pointerOnReactiveSurfaceRef.current = overReactiveSurface
      pointerTargetRef.current = {
        ...currentTarget,
        x: pointerX,
        y: pointerY,
        activity: 1,
        engagement: overReactiveSurface ? 1 : 0,
        emission: emitterColor || keepDraggedEmission ? 1 : 0,
        emissionX: emitterColor ? pointerX : currentTarget.emissionX,
        emissionY: emitterRect
          ? Math.min(Math.max((emitterRect.top - rect.top) / Math.max(rect.height, 1) - 0.075, 0), 1)
          : currentTarget.emissionY,
        emissionLightness: emitterColor?.lightness ?? currentTarget.emissionLightness,
        emissionA: emitterColor?.a ?? currentTarget.emissionA,
        emissionB: emitterColor?.b ?? currentTarget.emissionB,
      }
    }

    const handlePointerLeave = () => {
      pointerOnReactiveSurfaceRef.current = false
      pointerTargetRef.current = {
        ...pointerTargetRef.current,
        activity: 0,
        engagement: 0,
        momentum: 0,
        emission: 0,
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
      const centeredEmitter = centeredElement?.closest?.("[data-ascii-emission]")
      const centeredEmitterColor = getEmitterColor(centeredEmitter)
      const centeredEmitterRect = centeredEmitter?.getBoundingClientRect()
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
        momentum: Math.min(0.3 + Math.abs(scrollDelta) / 18, 1),
        emission: currentTarget.emission > 0.001 || centeredEmitterColor ? 1 : 0,
        emissionX: hasPointerAnchor
          ? currentTarget.emissionX
          : Math.min(Math.max(((centeredEmitterRect?.left || surfaceRect.left) + (centeredEmitterRect?.width || surfaceRect.width) * 0.5 - hostRect.left) / Math.max(hostRect.width, 1), 0), 1),
        emissionY: hasPointerAnchor
          ? currentTarget.emissionY
          : Math.min(Math.max(((centeredEmitterRect?.top || surfaceRect.top) - hostRect.top) / Math.max(hostRect.height, 1) - 0.075, 0), 1),
        emissionLightness: centeredEmitterColor?.lightness ?? currentTarget.emissionLightness,
        emissionA: centeredEmitterColor?.a ?? currentTarget.emissionA,
        emissionB: centeredEmitterColor?.b ?? currentTarget.emissionB,
      }

      window.clearTimeout(scrollIdleTimer)
      scrollIdleTimer = window.setTimeout(() => {
        pointerTargetRef.current = {
          ...pointerTargetRef.current,
          activity: pointerOnReactiveSurfaceRef.current ? 1 : 0,
          engagement: pointerOnReactiveSurfaceRef.current ? 1 : 0,
          momentum: 0,
          emission: pointerOnReactiveSurfaceRef.current ? pointerTargetRef.current.emission : 0,
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
      pointer.emission += (target.emission - pointer.emission) * 0.1
      pointer.emissionX += (target.emissionX - pointer.emissionX) * 0.09
      pointer.emissionY += (target.emissionY - pointer.emissionY) * 0.09
      pointer.emissionLightness += (target.emissionLightness - pointer.emissionLightness) * 0.075
      pointer.emissionA += (target.emissionA - pointer.emissionA) * 0.075
      pointer.emissionB += (target.emissionB - pointer.emissionB) * 0.075

      const speedFactor = useReducedMotion
        ? currentSettings.reducedMotionStyle === "minimal"
          ? 0.06
          : currentSettings.reducedMotionStyle === "slow"
            ? 0.2
            : 1
        : 1
      const frameScale = Math.min(Math.max((timestamp - lastTimestamp) / (1000 / 60), 0), 2)
      lastTimestamp = timestamp
      if (!useReducedMotion && pointer.emission > 0.001) {
        pointer.emissionPhase = (
          pointer.emissionPhase + frameScale * (0.028 + pointer.momentum * 0.014)
        ) % (Math.PI * 2)
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
