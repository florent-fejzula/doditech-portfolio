/* ==================================================================
   FRAME BUS
   Every animated surface in the cockpit shares one requestAnimationFrame
   loop. Ten canvases on their own rAF chains is how a page like this
   starts dropping frames; one loop with a fixed subscriber list does
   not. The loop also parks itself when the tab is hidden and reports
   a smoothed frame rate for the telemetry rail.
   ================================================================== */

export type FrameHandler = (time: number, delta: number) => void

const handlers = new Set<FrameHandler>()

let rafId = 0
let lastTime = 0
let smoothedFps = 60
let lastFrameStamp = 0

/** Frame cost in ms, smoothed — used as a load proxy in the telemetry. */
let smoothedCost = 4

function tick(now: number) {
  rafId = requestAnimationFrame(tick)

  const delta = lastTime === 0 ? 16.7 : Math.min(now - lastTime, 50)
  lastTime = now

  // Smoothed fps so the readout does not jitter on every frame.
  const instant = 1000 / Math.max(delta, 1)
  smoothedFps += (instant - smoothedFps) * 0.08

  const start = performance.now()
  for (const handler of handlers) {
    try {
      handler(now, delta)
    } catch (error) {
      // A single broken surface must never take the whole loop down.
      if (import.meta.env.DEV) console.error('[frameBus]', error)
      handlers.delete(handler)
    }
  }
  const cost = performance.now() - start
  smoothedCost += (cost - smoothedCost) * 0.06
  lastFrameStamp = now
}

function start() {
  if (rafId !== 0 || handlers.size === 0) return
  lastTime = 0
  rafId = requestAnimationFrame(tick)
}

function stop() {
  if (rafId === 0) return
  cancelAnimationFrame(rafId)
  rafId = 0
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop()
    else start()
  })
}

export function subscribe(handler: FrameHandler): () => void {
  handlers.add(handler)
  start()
  return () => {
    handlers.delete(handler)
    if (handlers.size === 0) stop()
  }
}

export const frameStats = {
  get fps() {
    return smoothedFps
  },
  get cost() {
    return smoothedCost
  },
  get stamp() {
    return lastFrameStamp
  },
  get surfaces() {
    return handlers.size
  },
}
