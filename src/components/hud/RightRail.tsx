/* ==================================================================
   RIGHT RAIL — navigation and the project archive
   The primary way around the cockpit. Real buttons and links, so
   keyboard and screen-reader users get the same interface everyone
   else does.
   ================================================================== */

import { Frame, PanelHeader, StatusMatrix } from './primitives'
import { SECTIONS, SECTION_META, navigate, type Section } from '@/lib/useRoute'
import { projects, type Status } from '@/data/profile'

const STATUS_COLOR: Record<Status, string> = {
  live: 'var(--color-online)',
  shipped: 'var(--color-cy-300)',
  'in-flight': 'var(--color-amber)',
  archived: 'var(--color-ink-faint)',
}

export function RightRail({ section, detail }: { section: Section; detail: string | null }) {
  return (
    <aside className="hidden w-[var(--rail-w)] shrink-0 flex-col gap-[var(--gutter)] lg:flex">
      {/* ---- index ---- */}
      <Frame tone="hot">
        <PanelHeader code="NAV" title="Index" />
        <nav>
          {SECTIONS.map((key) => {
            const meta = SECTION_META[key]
            const active = section === key
            return (
              <button
                key={key}
                type="button"
                className="hud-nav-item"
                data-active={active}
                onClick={() => navigate(key)}
                aria-current={active ? 'page' : undefined}
              >
                <span className="t-datum text-[var(--color-cy-600)]">{meta.code}</span>
                <span className="t-head flex-1 text-[12px]">{meta.label}</span>
                <span className="t-label !text-[9px] opacity-70">{active ? '◆' : '›'}</span>
              </button>
            )
          })}
        </nav>
      </Frame>

      {/* ---- archive ---- */}
      <Frame className="min-h-0 flex-1">
        <PanelHeader
          code="ARC"
          title="Archive"
          right={<span className="t-datum text-[var(--color-cy-500)]">{projects.length}</span>}
        />
        <ul className="scroll-hud h-[calc(100%-33px)] overflow-y-auto">
          {projects.map((project, i) => {
            const active = section === 'projects' && detail === project.id
            return (
              <li key={project.id}>
                <button
                  type="button"
                  className="hud-nav-item !py-2"
                  data-active={active}
                  onClick={() => navigate('projects', project.id)}
                >
                  <span className="t-datum text-[var(--color-cy-600)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="t-head block truncate text-[11.5px]">{project.name}</span>
                    <span className="t-label block truncate !text-[8.5px]">{project.role}</span>
                  </span>
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{
                      background: STATUS_COLOR[project.status],
                      boxShadow: `0 0 6px ${STATUS_COLOR[project.status]}`,
                    }}
                    title={project.status}
                  />
                </button>
              </li>
            )
          })}
        </ul>
      </Frame>

      {/* ---- matrix ---- */}
      <Frame tone="ghost">
        <PanelHeader code="SYS" title="Nodes" />
        <div className="px-3 py-2.5">
          <StatusMatrix cols={14} rows={5} />
        </div>
      </Frame>
    </aside>
  )
}
