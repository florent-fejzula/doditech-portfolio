import { useRef } from 'react'
import { useCanvas } from '@/lib/useCanvas'
import { useLatest } from '@/lib/useLatest'
import { clamp } from '@/lib/math'

interface Props {
  /** Called on every sampled frame. Return 0–1. */
  sample: () => number
  /** History length in samples. */
  points?: number
  tone?: 'cy' | 'amber'
}

/**
 * Rolling history graph fed by a live value — frame rate, paint load,
 * heap. A real trace of a real number, which is what makes the rail
 * feel like instrumentation rather than decoration.
 */
export function Sparkline({ sample, points = 72, tone = 'cy' }: Props) {
  const buffer = useRef<number[]>([])
  const sampleRef = useLatest(sample)

  const ref = useCanvas(
    ({ ctx, width, height }) => {
      const history = buffer.current
      history.push(clamp(sampleRef.current(), 0, 1))
      if (history.length > points) history.shift()

      ctx.clearRect(0, 0, width, height)

      const stroke = tone === 'amber' ? '255,176,32' : '95,231,255'
      const step = width / (points - 1)
      const yOf = (v: number) => height - 2 - v * (height - 4)

      // Baseline grid.
      ctx.strokeStyle = `rgba(${stroke},0.1)`
      ctx.lineWidth = 1
      for (let i = 1; i < 3; i++) {
        const y = (height / 3) * i
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      if (history.length < 2) return

      const offset = width - (history.length - 1) * step

      const trace = () => {
        ctx.beginPath()
        history.forEach((value, index) => {
          const x = offset + index * step
          const y = yOf(value)
          if (index === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
      }

      // Fill under the curve.
      trace()
      ctx.lineTo(width, height)
      ctx.lineTo(offset, height)
      ctx.closePath()
      const fill = ctx.createLinearGradient(0, 0, 0, height)
      fill.addColorStop(0, `rgba(${stroke},0.28)`)
      fill.addColorStop(1, `rgba(${stroke},0)`)
      ctx.fillStyle = fill
      ctx.fill()

      trace()
      ctx.strokeStyle = `rgba(${stroke},0.85)`
      ctx.lineWidth = 1.2
      ctx.stroke()

      // Leading marker.
      const last = history[history.length - 1]
      ctx.fillStyle = `rgba(${stroke},1)`
      ctx.beginPath()
      ctx.arc(width - 1, yOf(last), 1.8, 0, Math.PI * 2)
      ctx.fill()
    },
    { fps: 12 },
  )

  return <canvas ref={ref} className="h-full w-full" aria-hidden="true" />
}
