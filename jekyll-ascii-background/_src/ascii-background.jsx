"use client"

import { useEffect, useState, useRef } from "react"
import { defaultSettings, renderAsciiBackground } from "./shared/ascii-core"

export function AsciiBackground(props) {
  // Merge provided props with default settings
  const settings = { ...defaultSettings, ...props }

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [time, setTime] = useState(0)
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

  // Calculate grid dimensions and initialize
  useEffect(() => {
    const updateDimensions = () => {
      const charWidth = Math.max(8, settings.density / 3)

      if (settings.fullscreen) {
        // For fullscreen mode, use window dimensions
        const width = Math.floor(window.innerWidth / charWidth)
        const height = Math.floor(window.innerHeight / charWidth)
        setDimensions({ width, height })
      } else {
        // For container mode, use parent element dimensions
        const parent = canvasRef.current?.parentElement
        if (parent) {
          const rect = parent.getBoundingClientRect()
          const width = Math.floor(rect.width / charWidth)
          const height = Math.floor(rect.height / charWidth)
          setDimensions({ width, height })
        }
      }
    }

    updateDimensions()

    // Add resize observer for container mode
    let resizeObserver
    if (!settings.fullscreen && canvasRef.current?.parentElement) {
      resizeObserver = new ResizeObserver(updateDimensions)
      resizeObserver.observe(canvasRef.current.parentElement)
    }

    // Always listen to window resize for fullscreen mode
    window.addEventListener("resize", updateDimensions)

    return () => {
      window.removeEventListener("resize", updateDimensions)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [settings.density, settings.fullscreen])

  // Animation using requestAnimationFrame
  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    if (dimensions.width === 0 || dimensions.height === 0) return

    const animate = () => {
      setTime((prevTime) => prevTime + settings.speed * 0.0001)
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [dimensions, settings.speed, settings.noiseSpeed, settings.transitionSmoothness])

  // Render to canvas
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0 || dimensions.height === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    renderAsciiBackground(ctx, dimensions, time, settings)
  }, [
    dimensions,
    time,
    settings.density,
    settings.characterSet,
    settings.colorPalette,
    settings.customCharacters,
    settings.customColors,
    settings.noiseScale,
    settings.noiseSpeed,
    settings.gradientSize,
    settings.animationStyle,
    settings.transitionSmoothness,
  ])

  return (
    <div
      className={
        settings.fullscreen
          ? "fixed inset-0 overflow-hidden pointer-events-none z-[-1]"
          : "absolute inset-0 overflow-hidden pointer-events-none z-0"
      }
      aria-hidden="true"
      style={{ opacity: settings.opacity }}
    >
      <canvas ref={canvasRef} className="w-full h-full" style={{ backgroundColor: "#000" }} />
    </div>
  )
}
