import { useEffect, useRef } from 'react'
import { subscribe } from './frameBus'
import { useLatest } from './useLatest'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export interface DrawContext {
  ctx: CanvasRenderingContext2D
  /** CSS pixels, not device pixels — the context is already scaled. */
  width: number
  height: number
  /** Milliseconds since the page loaded. */
  time: number
  /** Milliseconds since the previous frame, clamped. */
  delta: number
  reduced: boolean
}

export type DrawFn = (frame: DrawContext) => void

interface Options {
  /** Cap device pixel ratio. 2 is plenty; 3 burns fill rate for nothing. */
  maxDpr?: number
  /** Skip frames to hit a lower target rate on heavy surfaces. */
  fps?: number
}

/**
 * Wires a canvas to the shared frame loop with DPR-correct sizing and
 * a ResizeObserver, so `draw` only ever deals in CSS pixels.
 *
 * When the user prefers reduced motion the surface is painted once per
 * resize instead of continuously — the composition survives, the motion
 * does not.
 */
export function useCanvas(draw: DrawFn, options: Options = {}) {
  const { maxDpr = 2, fps } = options
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawRef = useLatest(draw)

  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let width = 0
    let height = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (reduced) {
        drawRef.current({ ctx, width, height, time: 0, delta: 16.7, reduced })
      }
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    if (reduced) return () => observer.disconnect()

    const interval = fps ? 1000 / fps : 0
    let accumulator = 0

    const unsubscribe = subscribe((time, delta) => {
      if (width === 0 || height === 0) return
      if (interval > 0) {
        accumulator += delta
        if (accumulator < interval) return
        accumulator = 0
      }
      drawRef.current({ ctx, width, height, time, delta, reduced })
    })

    return () => {
      unsubscribe()
      observer.disconnect()
    }
    // drawRef is a stable ref object; listing it only satisfies the rule.
  }, [maxDpr, fps, reduced, drawRef])

  return canvasRef
}
