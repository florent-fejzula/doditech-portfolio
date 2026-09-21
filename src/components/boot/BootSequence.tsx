/* ==================================================================
   BOOT SEQUENCE
   Two and a half seconds of system check, then it gets out of the way.
   Runs in full only once per session — a visitor coming back from a
   project link gets a 400ms fade instead, because theatre that repeats
   stops being theatre and becomes a loading screen.
   ================================================================== */

import { useEffect, useState } from 'react'
import { Brackets } from '@/components/hud/primitives'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import { identity } from '@/data/profile'

const CHECKS: [string, string][] = [
  ['CORE', 'reactor spin-up nominal'],
  ['GFX', 'render surfaces attached'],
  ['MEM', 'heap allocated'],
  ['NET', 'uplink established'],
  ['IDX', 'project archive mounted'],
  ['SEC', 'channel encrypted'],
  ['UI', 'cockpit online'],
]

const SESSION_KEY = 'doditech.booted'

export function BootSequence({ onDone }: { onDone: () => void }) {
  const reduced = usePrefersReducedMotion()
  // Lazy initialiser: read once, on the first render, and stay put.
  const [skip] = useState(
    () =>
      reduced ||
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1'),
  )

  const [step, setStep] = useState(skip ? CHECKS.length : 0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      /* private mode — the boot simply plays again */
    }

    if (skip) {
      const id = setTimeout(() => setLeaving(true), 120)
      return () => clearTimeout(id)
    }

    const timers: ReturnType<typeof setTimeout>[] = []
    CHECKS.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i + 1), 180 + i * 230))
    })
    timers.push(setTimeout(() => setLeaving(true), 180 + CHECKS.length * 230 + 420))
    return () => timers.forEach(clearTimeout)
  }, [skip])

  useEffect(() => {
    if (!leaving) return
    const id = setTimeout(onDone, skip ? 260 : 620)
    return () => clearTimeout(id)
  }, [leaving, onDone, skip])

  const progress = (step / CHECKS.length) * 100

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-abyss)] transition-opacity duration-500"
      style={{ opacity: leaving ? 0 : 1, pointerEvents: leaving ? 'none' : 'auto' }}
      role="status"
      aria-live="polite"
    >
      <div className="relative w-[min(560px,86vw)] px-2">
        <Brackets inset={-14} />

        {/* spin-up ring */}
        <div className="mb-7 flex justify-center">
          <svg width="86" height="86" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(34,211,238,0.16)" strokeWidth="1" />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="var(--color-cy-300)"
              strokeWidth="1.5"
              strokeDasharray="72 217"
              strokeLinecap="round"
              style={{ transformOrigin: 'center', animation: 'boot-spin 1.1s linear infinite' }}
            />
            <circle
              cx="50"
              cy="50"
              r="33"
              fill="none"
              stroke="rgba(95,231,255,0.35)"
              strokeWidth="1"
              strokeDasharray="4 9"
              style={{ transformOrigin: 'center', animation: 'boot-spin 2.6s linear infinite reverse' }}
            />
            <circle cx="50" cy="50" r="11" fill="var(--color-cy-300)" opacity="0.9">
              <animate attributeName="r" values="9;13;9" dur="1.6s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        <div className="mb-1 text-center">
          <span className="t-mark glow-hot text-[15px] text-[var(--color-cy-100)]">
            {identity.callsign}
          </span>
        </div>
        <div className="mb-6 text-center">
          <span className="t-label">interface bootstrap</span>
        </div>

        <ul className="mb-6 min-h-[168px] space-y-[5px]">
          {CHECKS.map(([tag, detail], i) => {
            const done = i < step
            return (
              <li
                key={tag}
                className="flex items-baseline gap-3 transition-opacity duration-200"
                style={{ opacity: done ? 1 : 0.14 }}
              >
                <span className="t-datum w-9 text-[var(--color-cy-400)]">{tag}</span>
                <span className="t-label flex-1 truncate">{detail}</span>
                <span
                  className="t-datum"
                  style={{ color: done ? 'var(--color-online)' : 'var(--color-ink-faint)' }}
                >
                  {done ? 'OK' : '··'}
                </span>
              </li>
            )
          })}
        </ul>

        <div className="hud-bar">
          <div className="hud-bar__fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2 flex justify-between">
          <span className="t-label">
            {step >= CHECKS.length ? 'all systems nominal' : 'running diagnostics'}
          </span>
          <span className="t-datum">{String(Math.round(progress)).padStart(3, '0')}%</span>
        </div>
      </div>
    </div>
  )
}
