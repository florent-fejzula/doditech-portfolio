import { useRef } from 'react'
import { useCanvas } from '@/lib/useCanvas'
import { TAU, hash } from '@/lib/math'

interface Mote {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  a: number
}

/**
 * Full-viewport atmosphere: a faint measurement grid and slow drifting
 * motes. Deliberately quiet — the background's job is depth, not
 * attention. Capped at 30fps because nothing here moves fast enough
 * for anyone to notice the difference.
 */
export function Backdrop() {
  const motes = useRef<Mote[] | null>(null)

  const ref = useCanvas(
    ({ ctx, width, height, delta }) => {
      if (!motes.current || motes.current.length === 0) {
        const count = Math.round(Math.min(70, (width * height) / 26000))
        motes.current = Array.from({ length: count }, (_, i) => ({
          x: hash(i * 1.7) * width,
          y: hash(i * 3.1 + 9) * height,
          vx: (hash(i * 5.3) - 0.5) * 0.012,
          vy: -(0.006 + hash(i * 7.7) * 0.016),
          r: 0.6 + hash(i * 11.3) * 1.5,
          a: 0.1 + hash(i * 13.9) * 0.42,
        }))
      }

      ctx.clearRect(0, 0, width, height)

      // Measurement grid.
      const cell = 64
      ctx.strokeStyle = 'rgba(34,211,238,0.035)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = cell; x < width; x += cell) {
        ctx.moveTo(x + 0.5, 0)
        ctx.lineTo(x + 0.5, height)
      }
      for (let y = cell; y < height; y += cell) {
        ctx.moveTo(0, y + 0.5)
        ctx.lineTo(width, y + 0.5)
      }
      ctx.stroke()

      // Brighter intersections every fourth cell.
      ctx.fillStyle = 'rgba(95,231,255,0.12)'
      for (let x = cell * 4; x < width; x += cell * 4) {
        for (let y = cell * 4; y < height; y += cell * 4) {
          ctx.fillRect(x - 1, y - 1, 2, 2)
        }
      }

      for (const mote of motes.current) {
        mote.x += mote.vx * delta
        mote.y += mote.vy * delta
        if (mote.y < -4) {
          mote.y = height + 4
          mote.x = hash(mote.x * 0.37 + height) * width
        }
        if (mote.x < -4) mote.x = width + 4
        else if (mote.x > width + 4) mote.x = -4

        ctx.fillStyle = `rgba(95,231,255,${mote.a})`
        ctx.beginPath()
        ctx.arc(mote.x, mote.y, mote.r, 0, TAU)
        ctx.fill()
      }
    },
    { fps: 30, maxDpr: 1.5 },
  )

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
}
