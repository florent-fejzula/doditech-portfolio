/* ==================================================================
   HUD PRIMITIVES
   The shared vocabulary: framed panels, labelled readouts, meters and
   the decode effect. Every panel in the cockpit is assembled from
   these, which is what keeps the interface looking like one machine.
   ================================================================== */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { hash } from '@/lib/math'

/* --------------------------- FRAME ---------------------------- */

export function Frame({
  children,
  tone = 'base',
  className = '',
  sweep = false,
}: {
  children: ReactNode
  tone?: 'base' | 'hot' | 'ghost'
  className?: string
  sweep?: boolean
}) {
  return (
    <div className={`hud-frame ${className}`} data-tone={tone}>
      <div className="hud-frame__in relative overflow-hidden">
        {sweep && (
          <div className="fx-sweep">
            <i />
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export function Brackets({ inset = 0 }: { inset?: number }) {
  const style = { margin: inset }
  return (
    <>
      <span className="hud-bracket" data-c="tl" style={style} />
      <span className="hud-bracket" data-c="tr" style={style} />
      <span className="hud-bracket" data-c="bl" style={style} />
      <span className="hud-bracket" data-c="br" style={style} />
    </>
  )
}

/* ------------------------ PANEL HEADER ------------------------ */

export function PanelHeader({
  code,
  title,
  right,
}: {
  code?: string
  title: string
  right?: ReactNode
}) {
  return (
    <div className="flex items-center gap-2.5 border-b border-[var(--line-soft)] px-3 py-2">
      {code && <span className="t-datum text-[var(--color-cy-500)]">{code}</span>}
      <span className="t-label !text-[var(--color-cy-200)] !tracking-[0.2em]">{title}</span>
      <span className="hud-ticks h-[7px] flex-1 opacity-60" />
      {right}
    </div>
  )
}

/* -------------------------- READOUTS -------------------------- */

export function Readout({
  label,
  value,
  tone = 'base',
}: {
  label: string
  value: ReactNode
  tone?: 'base' | 'amber' | 'alert' | 'online'
}) {
  const color =
    tone === 'amber'
      ? 'text-[var(--color-amber)]'
      : tone === 'alert'
        ? 'text-[var(--color-alert)]'
        : tone === 'online'
          ? 'text-[var(--color-online)]'
          : 'text-[var(--color-cy-200)]'

  return (
    <div className="flex items-baseline justify-between gap-3 py-[3px]">
      <span className="t-label truncate">{label}</span>
      <span className={`t-datum whitespace-nowrap ${color}`}>{value}</span>
    </div>
  )
}

export function Bar({ value, tone = 'cy' }: { value: number; tone?: 'cy' | 'amber' }) {
  return (
    <div className="hud-bar" data-tone={tone === 'amber' ? 'amber' : undefined}>
      <div className="hud-bar__fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

/** Segmented meter — lights up proportionally, last fifth runs amber. */
export function Meter({ value, segments = 14 }: { value: number; segments?: number }) {
  const lit = Math.round((Math.max(0, Math.min(100, value)) / 100) * segments)
  return (
    <div className="hud-seg">
      {Array.from({ length: segments }, (_, i) => (
        <i
          key={i}
          data-on={i < lit ? '1' : '0'}
          data-hot={i >= segments * 0.8 ? '1' : '0'}
        />
      ))}
    </div>
  )
}

export function Rule({ className = '' }: { className?: string }) {
  return <div className={`hud-rule ${className}`} />
}

/* ------------------------ STATUS MATRIX ----------------------- */

/**
 * The block of blinking cells from every mission-control set ever
 * built. Driven by a cheap interval rather than the frame loop —
 * it changes four times a second, not sixty.
 */
export function StatusMatrix({ cols = 10, rows = 6 }: { cols?: number; rows?: number }) {
  const total = cols * rows
  const [seed, setSeed] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setSeed((s) => s + 1), 260)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="grid gap-[3px]"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      aria-hidden="true"
    >
      {Array.from({ length: total }, (_, i) => {
        const roll = hash(i * 2.7 + Math.floor(seed / (1 + (i % 5))) * 1.31)
        const state = roll > 0.82 ? 'hot' : roll > 0.55 ? 'on' : 'off'
        return (
          <span
            key={i}
            className="aspect-square"
            style={{
              background:
                state === 'hot'
                  ? 'color-mix(in oklab, var(--color-cy-300) 82%, transparent)'
                  : state === 'on'
                    ? 'color-mix(in oklab, var(--color-cy-400) 26%, transparent)'
                    : 'color-mix(in oklab, var(--color-cy-400) 8%, transparent)',
              boxShadow: state === 'hot' ? 'var(--glow-sm)' : undefined,
              transition: 'background 180ms linear',
            }}
          />
        )
      })}
    </div>
  )
}

/* ------------------------- DECODE TEXT ------------------------ */

const GLYPHS = '▚▞▜▛01ABCDEF/\\<>[]#*+='

/**
 * Resolves text character by character out of noise. Used on headings
 * when a panel opens — it is the single cheapest thing that sells the
 * "system is rendering this for you" illusion.
 */
export function DecodeText({
  text,
  className = '',
  speed = 26,
  as: Tag = 'span',
}: {
  text: string
  className?: string
  speed?: number
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'div'
}) {
  const [output, setOutput] = useState(text)
  const frame = useRef(0)

  useEffect(() => {
    const chars = [...text]
    // Each character gets its own settle time, so the reveal sweeps.
    const settle = chars.map((_, i) => i * 0.7 + hash(i) * 6)
    const total = Math.max(...settle) + 6
    frame.current = 0

    const id = setInterval(() => {
      frame.current += 1
      const f = frame.current
      setOutput(
        chars
          .map((char, i) => {
            if (char === ' ') return ' '
            if (f >= settle[i]) return char
            return GLYPHS[Math.floor(hash(i * 3.1 + f) * GLYPHS.length)]
          })
          .join(''),
      )
      if (f > total) clearInterval(id)
    }, speed)

    return () => clearInterval(id)
  }, [text, speed])

  return (
    <Tag className={className} aria-label={text}>
      <span aria-hidden="true">{output}</span>
    </Tag>
  )
}

/* --------------------------- TICKER --------------------------- */

export function Ticker({ items }: { items: string[] }) {
  // Duplicated so the marquee wraps without a visible seam.
  const strip = [...items, ...items]
  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="flex w-max animate-[ticker_38s_linear_infinite] gap-10 whitespace-nowrap">
        {strip.map((item, i) => (
          <span key={i} className="t-label flex items-center gap-10">
            {item}
            <span className="text-[var(--color-cy-600)]">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}
