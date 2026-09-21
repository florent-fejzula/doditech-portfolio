/* ==================================================================
   ROUTING
   Hash routing, deliberately. The cockpit never unmounts, so there is
   nothing for a history router to buy us — but deep links still have
   to work when a client pastes one into an email.
       #/            idle reactor
       #/projects    project index
       #/projects/id project selected
   ================================================================== */

import { useSyncExternalStore } from 'react'

export const SECTIONS = ['home', 'projects', 'about', 'stack', 'contact'] as const
export type Section = (typeof SECTIONS)[number]

export interface Route {
  section: Section
  detail: string | null
}

function parse(): Route {
  const raw = window.location.hash.replace(/^#\/?/, '')
  const [head, detail] = raw.split('/')
  const section = (SECTIONS as readonly string[]).includes(head) ? (head as Section) : 'home'
  return { section, detail: detail || null }
}

let snapshot: Route = typeof window === 'undefined' ? { section: 'home', detail: null } : parse()

function subscribe(callback: () => void) {
  const handler = () => {
    const next = parse()
    if (next.section !== snapshot.section || next.detail !== snapshot.detail) {
      snapshot = next
      callback()
    }
  }
  window.addEventListener('hashchange', handler)
  return () => window.removeEventListener('hashchange', handler)
}

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot)
}

export function navigate(section: Section, detail?: string | null) {
  const next = section === 'home' ? '#/' : `#/${section}${detail ? `/${detail}` : ''}`
  if (window.location.hash !== next) window.location.hash = next
}

export const SECTION_META: Record<Section, { code: string; label: string; blurb: string }> = {
  home: { code: '00', label: 'Overview', blurb: 'System idle' },
  projects: { code: '01', label: 'Projects', blurb: 'Shipped work' },
  about: { code: '02', label: 'Profile', blurb: 'Operator record' },
  stack: { code: '03', label: 'Capability', blurb: 'Technical loadout' },
  contact: { code: '04', label: 'Comms', blurb: 'Open a channel' },
}
