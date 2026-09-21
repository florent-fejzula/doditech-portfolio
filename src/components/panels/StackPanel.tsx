import { Brackets, Meter } from '@/components/hud/primitives'
import { PanelShell } from '@/components/stage/PanelShell'
import { projects, stackGroups } from '@/data/profile'

/** Every technology named across the project archive, deduplicated. */
function deployedTech() {
  const counts = new Map<string, number>()
  for (const project of projects) {
    for (const tech of project.stack) {
      counts.set(tech, (counts.get(tech) ?? 0) + 1)
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

export function StackPanel() {
  const deployed = deployedTech()

  return (
    <PanelShell code="03" title="Technical loadout" subtitle="capability matrix">
      <div className="p-5">
        <p className="t-body mb-6 max-w-[62ch] text-[var(--color-ink-dim)]">
          Levels reflect what I reach for unprompted and can carry to production without
          supervision — not everything I have touched once.
        </p>

        <div className="grid gap-3 lg:grid-cols-3">
          {stackGroups.map((group) => (
            <div key={group.label} className="hud-frame">
              <div className="hud-frame__in relative p-4">
                <Brackets inset={4} />
                <div className="mb-3 flex items-center gap-2">
                  <span className="t-head text-[12px]">{group.label}</span>
                  <span className="hud-ticks h-2 flex-1 opacity-40" />
                  <span className="t-datum text-[var(--color-cy-600)]">
                    {group.items.length.toString().padStart(2, '0')}
                  </span>
                </div>

                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li key={item.name}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-2">
                        <span className="t-body text-[13.5px]">{item.name}</span>
                        <span className="t-datum text-[var(--color-cy-400)]">{item.level}</span>
                      </div>
                      <Meter value={item.level} segments={16} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* ---- derived from the archive, so it can never drift ---- */}
        <div className="mt-7">
          <div className="mb-3 flex items-center gap-2">
            <span className="t-label">Deployed in shipped work</span>
            <span className="hud-ticks h-2 flex-1 opacity-40" />
            <span className="t-datum text-[var(--color-cy-600)]">{deployed.length}</span>
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {deployed.map(([tech, count]) => (
              <li
                key={tech}
                className="t-datum flex items-center gap-2 border border-[var(--line)] px-2 py-1 !text-[10px]"
                style={{ opacity: 0.55 + Math.min(count, 4) * 0.11 }}
              >
                <span className="text-[var(--color-cy-200)]">{tech}</span>
                <span className="text-[var(--color-cy-600)]">×{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PanelShell>
  )
}
