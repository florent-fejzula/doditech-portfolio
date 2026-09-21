import { useCanvas } from '@/lib/useCanvas'
import { noise } from '@/lib/math'

/**
 * Symmetrical signal trace. Layered value-noise rather than random
 * heights, so it reads as a waveform with structure instead of static.
 */
export function Waveform({ bars = 64, tone = 'cy' }: { bars?: number; tone?: 'cy' | 'amber' }) {
  const ref = useCanvas(
    ({ ctx, width, height, time }) => {
      ctx.clearRect(0, 0, width, height)
      const mid = height / 2
      const gap = 1.5
      const barWidth = Math.max(1, width / bars - gap)
      const t = time / 1000

      for (let i = 0; i < bars; i++) {
        const seed = i * 0.22
        const amplitude =
          noise(seed + t * 1.7) * 0.6 + noise(seed * 3.1 + t * 0.7) * 0.3 + noise(seed * 7 + t * 4) * 0.1
        // Taper the ends so the trace sits inside its panel.
        const envelope = Math.sin((i / bars) * Math.PI) ** 0.45
        const h = Math.max(1, amplitude * envelope * (height * 0.46))
        const x = i * (barWidth + gap)
        const alpha = 0.35 + amplitude * 0.55

        ctx.fillStyle =
          tone === 'amber' ? `rgba(255,176,32,${alpha})` : `rgba(95,231,255,${alpha})`
        ctx.fillRect(x, mid - h, barWidth, h * 2)
      }

      ctx.fillStyle = tone === 'amber' ? 'rgba(255,176,32,0.25)' : 'rgba(95,231,255,0.22)'
      ctx.fillRect(0, mid - 0.5, width, 1)
    },
    { fps: 30 },
  )

  return <canvas ref={ref} className="h-full w-full" aria-hidden="true" />
}
