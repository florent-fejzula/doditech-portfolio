import type { ReactNode } from 'react'
import { Brackets, DecodeText } from '@/components/hud/primitives'
import { navigate } from '@/lib/useRoute'

/**
 * The container every section panel opens inside. Sits in front of the
 * reactor with a translucent fill so the core still glows through —
 * no backdrop-filter, which is the expensive way to get the same look.
 */
export function PanelShell({
  code,
  title,
  subtitle,
  children,
  aside,
}: {
  code: string
  title: string
  subtitle?: string
  children: ReactNode
  aside?: ReactNode
}) {
  return (
    <section className="anim-rise absolute inset-0 flex flex-col">
      <div className="hud-frame h-full" data-tone="hot">
        <div
          className="hud-frame__in relative flex h-full flex-col"
          style={{
            // Just translucent enough that the reactor's glow reads
            // through the panel without costing any legibility.
            background:
              'linear-gradient(180deg, rgba(8,17,31,0.93) 0%, rgba(3,6,13,0.86) 100%)',
          }}
        >
          <Brackets inset={5} />

          {/* header */}
          <div className="flex shrink-0 items-center gap-3 border-b border-[var(--line)] px-5 py-3">
            <span className="t-datum text-[var(--color-cy-500)]">{code}</span>
            <DecodeText
              as="h1"
              text={title}
              className="t-head glow text-[17px] sm:text-[19px]"
            />
            {subtitle && (
              <span className="t-label hidden truncate sm:inline">— {subtitle}</span>
            )}
            <span className="hud-ticks h-2 flex-1 opacity-50" />
            {aside}
            <button
              type="button"
              className="hud-btn !px-3 !py-1.5"
              onClick={() => navigate('home')}
              aria-label="Close panel and return to overview"
            >
              ✕ Close
            </button>
          </div>

          {/* body */}
          <div className="scroll-hud min-h-0 flex-1 overflow-y-auto">{children}</div>

          {/* footer — stops long panels ending in dead space */}
          <div className="flex shrink-0 items-center gap-3 border-t border-[var(--line-soft)] px-5 py-2">
            <span className="t-label !text-[8.5px]">end of record</span>
            <span className="hud-ticks h-[7px] flex-1 opacity-40" />
            <span className="t-datum !text-[9px] text-[var(--color-cy-600)]">
              DTX·{code}·{new Date().getFullYear()}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
