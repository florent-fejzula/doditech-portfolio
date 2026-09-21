/* ==================================================================
   HOME OVERLAY
   The idle state. Deliberately sparse — the reactor is the hero here,
   so the copy sits at the edges and leaves the core visible.
   ================================================================== */

import { useEffect, useState, type CSSProperties } from 'react'
import { DecodeText } from '@/components/hud/primitives'
import { identity, stats } from '@/data/profile'
import { navigate } from '@/lib/useRoute'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

/** Counts a figure up on mount. Eases out so it lands rather than stops. */
function useCountUp(target: number, duration = 1100) {
  const reduced = usePrefersReducedMotion()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (reduced) return
    let raf = 0
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, reduced])

  // Derived, not stored: nothing to synchronise when motion is off.
  return reduced ? target : value
}

function Stat({
  label,
  value,
  prefix,
  suffix,
}: {
  label: string
  value: number
  prefix?: string
  suffix: string
}) {
  const shown = useCountUp(value)
  return (
    <div className="hud-plate px-3 py-2">
      <div className="t-datum glow !text-[22px] leading-none text-[var(--color-cy-100)]">
        {prefix && <span className="text-[var(--color-cy-400)]">{prefix}</span>}
        {shown.toLocaleString()}
        <span className="text-[var(--color-cy-400)]">{suffix}</span>
      </div>
      <div className="t-label mt-1.5 leading-tight">{label}</div>
    </div>
  )
}

export function HomeOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
      {/* ---- identity ---- */}
      <div className="anim-rise max-w-[min(430px,92%)] sm:max-w-[min(430px,52%)]">
        <div className="mb-3 flex items-center gap-2">
          <span className="hud-dot" />
          <span className="t-label">{identity.availability}</span>
        </div>

        <DecodeText
          as="h1"
          text={identity.name}
          speed={30}
          className="t-mark glow-hot block text-[clamp(20px,3.1vw,38px)] leading-[1.1] text-[var(--color-cy-100)]"
        />

        <p className="t-label mt-2.5 !text-[10.5px] !tracking-[0.24em] !text-[var(--color-cy-400)]">
          {identity.title}
        </p>

        <div className="hud-rule my-3.5 max-w-[240px]" />

        <p className="t-body max-w-[380px] text-[var(--color-ink-dim)]">{identity.tagline}</p>

        <div className="pointer-events-auto mt-5 flex flex-wrap gap-2.5">
          <button type="button" className="hud-btn" onClick={() => navigate('projects')}>
            ▸ View work
          </button>
          <button type="button" className="hud-btn" onClick={() => navigate('contact')}>
            ◈ Open channel
          </button>
        </div>
      </div>

      {/* ---- figures ---- */}
      {stats.length > 0 && (
        <div
          // Two up on phones; on wider screens the column count follows
          // however many figures there are, so three fill the row as
          // cleanly as four.
          className="anim-rise stat-grid"
          style={
            {
              animationDelay: '260ms',
              '--stat-cols': stats.length,
            } as CSSProperties
          }
        >
          {stats.map((stat) => (
            <Stat key={stat.label} {...stat} />
          ))}
        </div>
      )}
    </div>
  )
}
