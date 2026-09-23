/* ==================================================================
   PROJECTS
   Index on the left, dossier on the right. Selecting a project writes
   the hash, so every project has a shareable URL.
   ================================================================== */

import { useState } from 'react'
import { Bar, Brackets, DecodeText, Readout } from '@/components/hud/primitives'
import { PanelShell } from '@/components/stage/PanelShell'
import { projects, type Project, type Status } from '@/data/profile'
import { navigate } from '@/lib/useRoute'

const STATUS_META: Record<Status, { label: string; color: string }> = {
  live: { label: 'LIVE', color: 'var(--color-online)' },
  shipped: { label: 'SHIPPED', color: 'var(--color-cy-300)' },
  'in-flight': { label: 'IN FLIGHT', color: 'var(--color-amber)' },
  archived: { label: 'ARCHIVED', color: 'var(--color-ink-faint)' },
}

function StatusTag({ status }: { status: Status }) {
  const meta = STATUS_META[status]
  return (
    <span
      className="t-datum shrink-0 border px-1.5 py-0.5 !text-[9px] !tracking-[0.14em]"
      style={{ color: meta.color, borderColor: meta.color, opacity: 0.9 }}
    >
      {meta.label}
    </span>
  )
}

/** A project's screenshots as one list, whether it has one or several. */
function framesOf(project: Project) {
  if (project.gallery?.length) return project.gallery
  return project.image ? [{ src: project.image, label: '', caption: '' }] : []
}

/**
 * Client screenshots are usually light-on-white. The dark plate and
 * scanlines make them read as something the cockpit is displaying
 * rather than pasted in.
 */
function Shot({ project, full }: { project: Project; full: boolean }) {
  const frames = framesOf(project)
  const [active, setActive] = useState(0)
  if (frames.length === 0) return null

  const frame = frames[Math.min(active, frames.length - 1)]

  return (
    <figure className="hud-frame" data-tone="ghost">
      <div className="hud-frame__in">
        <div className="flex items-center gap-2 border-b border-[var(--line-soft)] px-2.5 py-1.5">
          <span className="t-label !text-[8.5px]">visual record</span>
          <span className="hud-ticks h-[7px] flex-1 opacity-40" />
          {frames.length > 1 ? (
            // Channel switcher rather than stacked images: one frame keeps
            // the panel short, and flipping between two views of the same
            // data makes the comparison itself the point.
            <div className="flex gap-1" role="group" aria-label="Screenshot view">
              {frames.map((f, i) => (
                <button
                  key={f.src}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={i === active}
                  className="t-datum border px-2 py-0.5 !text-[9px] !tracking-[0.14em] uppercase transition-colors"
                  style={{
                    borderColor: i === active ? 'var(--line-hot)' : 'var(--line-soft)',
                    color: i === active ? 'var(--color-cy-100)' : 'var(--color-ink-dim)',
                    background:
                      i === active
                        ? 'color-mix(in oklab, var(--color-cy-400) 14%, transparent)'
                        : 'transparent',
                  }}
                >
                  {String(i + 1).padStart(2, '0')} · {f.label}
                </button>
              ))}
            </div>
          ) : (
            <span className="t-datum !text-[9px] text-[var(--color-cy-600)]">
              {project.id.toUpperCase()}
            </span>
          )}
        </div>
        <div className="fx-scanlines relative bg-[var(--color-void)] p-2">
          <img
            key={frame.src}
            src={frame.src}
            alt={frame.caption || `${project.name} interface`}
            loading="lazy"
            decoding="async"
            className={`anim-rise mx-auto block max-w-full object-contain ${
              full ? 'w-full' : 'max-h-[520px] w-auto'
            }`}
          />
        </div>
        {frame.caption && (
          <figcaption className="t-label border-t border-[var(--line-soft)] px-2.5 py-1.5 !normal-case !tracking-normal !text-[11px]">
            {frame.caption}
          </figcaption>
        )}
      </div>
    </figure>
  )
}

function Dossier({ project }: { project: Project }) {
  const full = project.imageLayout === 'full' && framesOf(project).length > 0

  return (
    <article
      key={project.id}
      className="anim-wipe grid gap-6 p-5 xl:grid-cols-[1.45fr_minmax(260px,1fr)]"
    >
      {/* ---- header, across the full panel ---- */}
      <header className="xl:col-span-2">
        <div className="flex flex-wrap items-center gap-3">
          <StatusTag status={project.status} />
          <span className="t-datum text-[var(--color-cy-500)]">{project.year}</span>
          <span className="hud-ticks h-2 flex-1 opacity-40" />
        </div>

        <DecodeText
          as="h2"
          text={project.name}
          className="t-head glow mt-3 block text-[clamp(20px,2.4vw,30px)]"
        />
        <p className="t-label mt-1.5 !text-[10px] !tracking-[0.2em] !text-[var(--color-cy-400)]">
          {project.role}
        </p>

        <div className="hud-rule mt-4" />
      </header>

      {/* A dense landscape UI spans both columns — confined to the
          narrative column a data table is too small to read. */}
      {full && (
        <div className="xl:col-span-2">
          <Shot project={project} full />
        </div>
      )}

      {/* ---- narrative ---- */}
      <div>
        {/* A portrait phone capture sits beside the summary. */}
        <div className={full ? '' : 'flex flex-col gap-5 sm:flex-row sm:items-start'}>
          {!full && <Shot project={project} full={false} />}

          <div className="min-w-0 flex-1">
            <p className="t-body max-w-[68ch]">{project.summary}</p>

            {project.metrics && (
              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {project.metrics.map((metric) => (
                  <div key={metric.label} className="hud-plate relative px-3 py-2.5">
                    <Brackets />
                    <div className="t-datum glow !text-[17px] text-[var(--color-cy-100)]">
                      {metric.value}
                    </div>
                    {/* Wraps rather than truncates — these sit in a narrow
                        column once a portrait screenshot takes the left. */}
                    <div className="t-label mt-1 !text-[9px] leading-[1.3]">{metric.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {project.highlights && project.highlights.length > 0 && (
          <section className="mt-7">
            <div className="mb-3 flex items-center gap-2">
              <span className="t-label">Engineering notes</span>
              <span className="hud-ticks h-2 flex-1 opacity-40" />
              <span className="t-datum text-[var(--color-cy-600)]">
                {String(project.highlights.length).padStart(2, '0')}
              </span>
            </div>

            <ol className="space-y-3">
              {project.highlights.map((note, i) => (
                <li key={note.title} className="hud-plate relative p-4">
                  <Brackets inset={4} />
                  <div className="flex items-baseline gap-2.5">
                    <span className="t-datum text-[var(--color-cy-500)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="t-head text-[12.5px]">{note.title}</h3>
                  </div>
                  <p className="t-body mt-2 max-w-[68ch] text-[14px] text-[var(--color-ink-dim)]">
                    {note.detail}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {project.links && project.links.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2.5">
            {project.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hud-btn"
                target="_blank"
                rel="noreferrer noopener"
              >
                ↗ {link.label}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* ---- spec sidebar ---- */}
      <aside className="space-y-3">
        <div className="hud-plate relative p-4">
          <Brackets inset={4} />
          <div className="t-label mb-2.5">Build sheet</div>
          <Readout label="record" value={project.id.toUpperCase()} />
          <Readout label="year" value={project.year} />
          <Readout label="systems" value={project.stack.length} />
          <Readout label="state" value={STATUS_META[project.status].label} />

          <div className="mt-3.5">
            <div className="mb-1.5 flex justify-between">
              <span className="t-label">completion</span>
              <span className="t-datum">{project.progress}%</span>
            </div>
            <Bar value={project.progress} tone={project.progress < 100 ? 'amber' : 'cy'} />
          </div>
        </div>

        <div className="hud-plate relative p-4">
          <Brackets inset={4} />
          <div className="t-label mb-2.5">Stack</div>
          <ul className="flex flex-wrap gap-1.5">
            {project.stack.map((item) => (
              <li
                key={item}
                className="t-datum border border-[var(--line)] px-2 py-1 !text-[10px] text-[var(--color-cy-200)]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </article>
  )
}

function Index() {
  return (
    <div className="p-5">
      <p className="t-body mb-5 max-w-[60ch] text-[var(--color-ink-dim)]">
        Selected work. Pick a record to open its dossier — or use the archive rail on the right.
      </p>
      <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((project, i) => (
          <li key={project.id}>
            <button
              type="button"
              onClick={() => navigate('projects', project.id)}
              className="hud-frame h-full w-full text-left transition-[filter] duration-200 hover:brightness-[1.35]"
            >
              <div className="hud-frame__in relative flex h-full flex-col p-3.5">
                <Brackets inset={4} />
                <div className="flex items-center gap-2">
                  <span className="t-datum text-[var(--color-cy-600)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="hud-ticks h-2 flex-1 opacity-40" />
                  <StatusTag status={project.status} />
                </div>

                <h3 className="t-head mt-2.5 text-[14px]">{project.name}</h3>
                <p className="t-label mt-1 !normal-case !tracking-normal">{project.role}</p>

                <p className="t-body mt-2.5 line-clamp-3 flex-1 text-[13.5px] text-[var(--color-ink-dim)]">
                  {project.summary}
                </p>

                <ul className="mt-3 flex flex-wrap gap-1">
                  {project.stack.slice(0, 3).map((tech) => (
                    <li
                      key={tech}
                      className="t-datum border border-[var(--line-soft)] px-1.5 py-0.5 !text-[9px]"
                    >
                      {tech}
                    </li>
                  ))}
                  {project.stack.length > 3 && (
                    <li className="t-datum px-1 py-0.5 !text-[9px] text-[var(--color-cy-600)]">
                      +{project.stack.length - 3}
                    </li>
                  )}
                </ul>

                <div className="mt-3 flex items-center gap-2 border-t border-[var(--line-soft)] pt-2">
                  <span className="t-datum text-[var(--color-cy-500)]">{project.year}</span>
                  <span className="hud-ticks h-2 flex-1 opacity-30" />
                  <span className="t-label !text-[9px] text-[var(--color-cy-300)]">open ›</span>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ProjectsPanel({ detail }: { detail: string | null }) {
  const project = detail ? projects.find((p) => p.id === detail) : undefined

  return (
    <PanelShell
      code="01"
      title={project ? 'Project dossier' : 'Project index'}
      subtitle={project ? project.name : `${projects.length} records`}
      aside={
        project ? (
          <button type="button" className="hud-btn !px-3 !py-1.5" onClick={() => navigate('projects')}>
            ◂ Index
          </button>
        ) : undefined
      }
    >
      {project ? <Dossier project={project} /> : <Index />}
    </PanelShell>
  )
}
