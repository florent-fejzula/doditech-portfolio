import { identity } from '@/data/profile'
import { useTelemetry } from '@/lib/telemetry'
import { SECTION_META, type Section } from '@/lib/useRoute'

const STATE_COPY: Record<string, { text: string; color: string }> = {
  open: { text: 'accepting work', color: 'var(--color-online)' },
  limited: { text: 'limited capacity', color: 'var(--color-amber)' },
  closed: { text: 'at capacity', color: 'var(--color-alert)' },
}

export function TopBar({ section }: { section: Section }) {
  const telemetry = useTelemetry()
  const meta = SECTION_META[section]
  const state = STATE_COPY[identity.availabilityState] ?? STATE_COPY.open

  return (
    <header className="flex h-[var(--bar-h)] shrink-0 items-center gap-4 border-b border-[var(--line-soft)] px-4">
      {/* identity */}
      <div className="flex items-baseline gap-3">
        <a href="#/" className="t-mark glow-hot text-[14px] text-[var(--color-cy-100)]">
          {identity.callsign}
        </a>
        <span className="hidden text-[var(--color-cy-700)] sm:inline">//</span>
        <span className="t-label hidden sm:inline">{identity.name}</span>
      </div>

      {/* breadcrumb */}
      <div className="hidden items-center gap-2 md:flex">
        <span className="h-3 w-px bg-[var(--line)]" />
        <span className="t-datum text-[var(--color-cy-500)]">{meta.code}</span>
        <span className="t-label !text-[var(--color-cy-200)]">{meta.label}</span>
      </div>

      <span className="hud-ticks h-2 flex-1 opacity-50" />

      {/* availability */}
      <div className="hidden items-center gap-2 lg:flex">
        <span className="hud-dot" style={{ background: state.color, boxShadow: `0 0 8px ${state.color}` }} />
        <span className="t-label">{state.text}</span>
      </div>

      <span className="hidden h-3 w-px bg-[var(--line)] lg:inline" />

      {/* clock */}
      <div className="flex items-baseline gap-3">
        <span className="t-label hidden sm:inline">{identity.location}</span>
        <span className="t-datum glow text-[var(--color-cy-100)]">{telemetry.clock}</span>
      </div>
    </header>
  )
}
