import { Ticker } from './primitives'
import { identity, ticker } from '@/data/profile'
import { useTelemetry } from '@/lib/telemetry'

/** Scale ruler, running strip and a coordinate block. */
export function BottomBar() {
  const t = useTelemetry()

  return (
    <footer className="flex h-[var(--bar-h)] shrink-0 items-center gap-4 border-t border-[var(--line-soft)] px-4">
      <div className="hidden w-[140px] shrink-0 items-end gap-[3px] sm:flex" aria-hidden="true">
        {Array.from({ length: 22 }, (_, i) => (
          <span
            key={i}
            className="w-px bg-[var(--color-cy-500)]"
            style={{ height: i % 5 === 0 ? 11 : 5, opacity: i % 5 === 0 ? 0.8 : 0.35 }}
          />
        ))}
      </div>

      <Ticker items={ticker} />

      <div className="hidden shrink-0 items-center gap-3 md:flex">
        <span className="t-label">lat {identity.coords.lat.toFixed(4)}</span>
        <span className="t-label">lon {identity.coords.lon.toFixed(4)}</span>
        <span className="h-3 w-px bg-[var(--line)]" />
        <span className="t-datum text-[var(--color-cy-400)]">{t.date}</span>
      </div>
    </footer>
  )
}
