import { SECTIONS, SECTION_META, navigate, type Section } from '@/lib/useRoute'

/**
 * On narrow viewports the rails are gone, so navigation moves to a
 * strip under the header. Same routes, same hash, no second menu
 * system to keep in sync.
 */
export function MobileNav({ section }: { section: Section }) {
  return (
    <nav className="scroll-hud flex shrink-0 gap-1.5 overflow-x-auto border-b border-[var(--line-soft)] px-3 py-2 lg:hidden">
      {SECTIONS.map((key) => {
        const meta = SECTION_META[key]
        const active = section === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => navigate(key)}
            aria-current={active ? 'page' : undefined}
            className="t-datum shrink-0 border px-2.5 py-1.5 !text-[10px] !tracking-[0.14em] uppercase transition-colors"
            style={{
              borderColor: active ? 'var(--line-hot)' : 'var(--line-soft)',
              color: active ? 'var(--color-cy-100)' : 'var(--color-ink-dim)',
              background: active
                ? 'color-mix(in oklab, var(--color-cy-400) 12%, transparent)'
                : 'transparent',
              boxShadow: active ? 'var(--glow-sm)' : undefined,
            }}
          >
            {meta.label}
          </button>
        )
      })}
    </nav>
  )
}
