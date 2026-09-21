import { Brackets, Readout } from '@/components/hud/primitives'
import { PanelShell } from '@/components/stage/PanelShell'
import { education, identity, languages, method, stats, timeline } from '@/data/profile'

export function AboutPanel() {
  return (
    <PanelShell code="02" title="Operator record" subtitle={identity.name}>
      <div className="grid gap-6 p-5 lg:grid-cols-[1.35fr_1fr]">
        {/* ---- narrative ---- */}
        <div>
          <h2 className="t-head glow text-[clamp(18px,2.1vw,26px)]">{identity.name}</h2>
          <p className="t-label mt-1.5 !text-[10px] !tracking-[0.2em] !text-[var(--color-cy-400)]">
            {identity.title} · {identity.location}
          </p>

          <div className="hud-rule my-4" />

          {identity.intro.map((paragraph, i) => (
            <p key={i} className="t-body mb-5 max-w-[64ch]">
              {paragraph}
            </p>
          ))}

          {/* ---- trace ---- */}
          <div className="mt-7">
            <div className="t-label mb-3">Career trace</div>
            <ol className="relative border-l border-[var(--line)] pl-5">
              {timeline.map((entry) => (
                <li key={entry.year} className="relative pb-5 last:pb-0">
                  <span
                    className="absolute -left-[23px] top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-cy-300)]"
                    style={{ boxShadow: 'var(--glow-sm)' }}
                  />
                  <div className="t-datum text-[var(--color-cy-400)]">{entry.year}</div>
                  <div className="t-head mt-0.5 text-[13px]">{entry.title}</div>
                  <p className="t-body mt-0.5 text-[14px] text-[var(--color-ink-dim)]">
                    {entry.detail}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ---- vitals ---- */}
        <div className="space-y-3">
          <div className="hud-plate relative p-4">
            <Brackets inset={4} />
            <div className="t-label mb-2.5">Vitals</div>
            <Readout label="callsign" value={identity.callsign} />
            <Readout label="base" value={identity.location} />
            <Readout label="zone" value={identity.timezone} />
            <Readout label="status" value={identity.availability} tone="online" />
          </div>

          {stats.length > 0 && (
            <div className="hud-plate relative p-4">
              <Brackets inset={4} />
              <div className="t-label mb-3">Record</div>
              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="t-datum glow !text-[19px] text-[var(--color-cy-100)]">
                      {stat.prefix && (
                        <span className="text-[var(--color-cy-400)]">{stat.prefix}</span>
                      )}
                      {stat.value.toLocaleString()}
                      <span className="text-[var(--color-cy-400)]">{stat.suffix}</span>
                    </div>
                    <div className="t-label mt-1 leading-tight">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="hud-plate relative p-4">
            <Brackets inset={4} />
            <div className="t-label mb-2.5">Languages</div>
            <ul>
              {languages.map((lang) => (
                <li key={lang.name} className="flex items-baseline justify-between py-[3px]">
                  <span className="t-body text-[14px]">{lang.name}</span>
                  <span className="t-datum text-[var(--color-cy-400)]">{lang.level}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="hud-plate relative p-4">
            <Brackets inset={4} />
            <div className="t-label mb-2">Education</div>
            <div className="t-head text-[12.5px]">{education.degree}</div>
            <p className="t-body mt-1 text-[14px] text-[var(--color-ink-dim)]">
              {education.school}
            </p>
            <p className="t-datum mt-1.5 text-[var(--color-cy-500)]">{education.years}</p>
          </div>

          <div className="hud-plate relative p-4">
            <Brackets inset={4} />
            <div className="t-label mb-2">Working method</div>
            <p className="t-body text-[14px] text-[var(--color-ink-dim)]">{method}</p>
          </div>
        </div>
      </div>
    </PanelShell>
  )
}
