/* ==================================================================
   STAGE
   The centre of the cockpit. The reactor is mounted once and never
   unmounts — panels open in front of it and it recedes. That single
   decision is why navigation costs nothing: no canvas teardown, no
   re-initialisation, no dropped frames on a section change.
   ================================================================== */

import { useMemo } from 'react'
import { ReactorCore, type Blip } from '@/components/canvas/ReactorCore'
import { HomeOverlay } from '@/components/panels/HomeOverlay'
import { ProjectsPanel } from '@/components/panels/ProjectsPanel'
import { AboutPanel } from '@/components/panels/AboutPanel'
import { StackPanel } from '@/components/panels/StackPanel'
import { ContactPanel } from '@/components/panels/ContactPanel'
import { projects } from '@/data/profile'
import type { Route } from '@/lib/useRoute'

export function Stage({ route, pulseKey }: { route: Route; pulseKey: number }) {
  const { section, detail } = route

  const blips = useMemo<Blip[]>(
    () =>
      projects.map((project) => ({
        id: project.id,
        label: project.name,
        active: section === 'projects' && detail === project.id,
      })),
    [section, detail],
  )

  // The reactor stays fully present on the idle screen and drops back
  // behind an open panel.
  const presence = section === 'home' ? 1 : 0.34

  return (
    <main className="relative min-w-0 flex-1">
      <div className="absolute inset-0">
        <ReactorCore presence={presence} blips={blips} pulseKey={pulseKey} />
      </div>

      {section === 'home' && <HomeOverlay />}
      {section === 'projects' && <ProjectsPanel key={detail ?? 'index'} detail={detail} />}
      {section === 'about' && <AboutPanel />}
      {section === 'stack' && <StackPanel />}
      {section === 'contact' && <ContactPanel />}
    </main>
  )
}
