/* ==================================================================
   LEFT RAIL — live instrumentation
   Real device numbers, sampled twice a second. Where a browser refuses
   to expose something (heap outside Chromium, battery on desktop
   Safari) the panel says N/A rather than inventing a value.
   ================================================================== */

import { Frame, Meter, PanelHeader, Readout } from './primitives'
import { Sparkline } from '@/components/canvas/Sparkline'
import { Waveform } from '@/components/canvas/Waveform'
import { formatUptime, useTelemetry } from '@/lib/telemetry'
import { frameStats } from '@/lib/frameBus'
import { clamp } from '@/lib/math'
import { services } from '@/data/profile'

export function LeftRail() {
  const t = useTelemetry()

  const heapPct = t.heap && t.heapLimit ? (t.heap / t.heapLimit) * 100 : null

  return (
    <aside className="hidden w-[var(--rail-w)] shrink-0 flex-col gap-[var(--gutter)] xl:flex">
      {/* ---- render telemetry ---- */}
      <Frame sweep>
        <PanelHeader
          code="T-01"
          title="Render"
          right={<span className="t-datum text-[var(--color-online)]">{Math.round(t.fps)}fps</span>}
        />
        <div className="px-3 py-2.5">
          <div className="h-[44px]">
            <Sparkline sample={() => clamp(frameStats.fps / 70, 0, 1)} />
          </div>
          <div className="mt-2.5">
            <div className="mb-1 flex justify-between">
              <span className="t-label">paint load</span>
              <span className="t-datum">{t.load.toFixed(1)}%</span>
            </div>
            <Meter value={t.load} />
          </div>
          <div className="mt-2.5 border-t border-[var(--line-soft)] pt-1.5">
            <Readout label="surfaces" value={t.surfaces} />
            <Readout
              label="heap"
              value={t.heap === null ? 'N/A' : `${t.heap.toFixed(1)} MB`}
            />
            {heapPct !== null && (
              <div className="pt-1">
                <Meter value={heapPct} segments={18} />
              </div>
            )}
          </div>
        </div>
      </Frame>

      {/* ---- signal ---- */}
      <Frame>
        <PanelHeader code="T-02" title="Signal" />
        <div className="px-3 py-2.5">
          <div className="h-[52px]">
            <Waveform bars={46} />
          </div>
          <div className="mt-2 border-t border-[var(--line-soft)] pt-1.5">
            <Readout label="link" value={t.net.type} tone="online" />
            <Readout
              label="downlink"
              value={t.net.downlink === null ? 'N/A' : `${t.net.downlink.toFixed(1)} Mb/s`}
            />
            <Readout label="rtt" value={t.net.rtt === null ? 'N/A' : `${t.net.rtt} ms`} />
          </div>
        </div>
      </Frame>

      {/* ---- session ---- */}
      <Frame>
        <PanelHeader code="T-03" title="Session" />
        <div className="px-3 py-2.5">
          <Readout label="uptime" value={formatUptime(t.uptime)} />
          <Readout label="viewport" value={`${t.viewport.w}×${t.viewport.h}`} />
          <Readout label="pixel ratio" value={`${t.viewport.dpr}×`} />
          <Readout
            label="power"
            value={
              t.battery === null
                ? 'N/A'
                : `${Math.round(t.battery.level * 100)}%${t.battery.charging ? ' ⚡' : ''}`
            }
            tone={t.battery && t.battery.level < 0.2 ? 'alert' : 'base'}
          />
        </div>
      </Frame>

      {/* ---- capability list ---- */}
      <Frame className="min-h-0 flex-1">
        <PanelHeader code="T-04" title="Services" />
        <ul className="scroll-hud h-full overflow-y-auto px-3 py-2">
          {services.map((service) => (
            <li key={service.code} className="border-b border-[var(--line-soft)] py-2 last:border-0">
              <div className="flex items-baseline gap-2">
                <span className="t-datum text-[var(--color-cy-500)]">{service.code}</span>
                <span className="t-head text-[11px]">{service.name}</span>
              </div>
              <p className="t-label mt-1 !normal-case !tracking-normal leading-snug">
                {service.detail}
              </p>
            </li>
          ))}
        </ul>
      </Frame>
    </aside>
  )
}
