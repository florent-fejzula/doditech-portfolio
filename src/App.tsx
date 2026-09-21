import { useEffect, useRef, useState } from 'react'
import { Backdrop } from '@/components/canvas/Backdrop'
import { BootSequence } from '@/components/boot/BootSequence'
import { TopBar } from '@/components/hud/TopBar'
import { BottomBar } from '@/components/hud/BottomBar'
import { LeftRail } from '@/components/hud/LeftRail'
import { RightRail } from '@/components/hud/RightRail'
import { MobileNav } from '@/components/hud/MobileNav'
import { Stage } from '@/components/stage/Stage'
import { SECTIONS, navigate, useRoute } from '@/lib/useRoute'

export default function App() {
  const route = useRoute()
  const [booting, setBooting] = useState(true)

  // Bumped on every navigation; the reactor reads it as a spin-up cue.
  const [pulseKey, setPulseKey] = useState(0)
  const lastRoute = useRef('')

  useEffect(() => {
    const signature = `${route.section}/${route.detail ?? ''}`
    if (lastRoute.current !== signature) {
      lastRoute.current = signature
      setPulseKey((k) => k + 1)
    }
  }, [route])

  // Keyboard access: 1–5 jump between sections, Escape returns to idle.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      if (event.key === 'Escape') {
        navigate('home')
        return
      }
      const index = Number(event.key) - 1
      if (Number.isInteger(index) && index >= 0 && index < SECTIONS.length) {
        navigate(SECTIONS[index])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="fx-vignette relative flex h-full flex-col overflow-hidden bg-[var(--color-abyss)]">
      <Backdrop />

      <TopBar section={route.section} />
      <MobileNav section={route.section} />

      <div className="flex min-h-0 flex-1 gap-[var(--gutter)] p-[var(--hud-inset)]">
        <LeftRail />
        <Stage route={route} pulseKey={pulseKey} />
        <RightRail section={route.section} detail={route.detail} />
      </div>

      <BottomBar />

      {/* CRT grain sits above everything but catches no clicks. */}
      <div className="fx-scanlines pointer-events-none fixed inset-0 z-40" aria-hidden="true" />

      {booting && <BootSequence onDone={() => setBooting(false)} />}
    </div>
  )
}
