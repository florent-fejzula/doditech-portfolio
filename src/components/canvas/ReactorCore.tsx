/* ==================================================================
   REACTOR CORE
   The permanent centrepiece. It never unmounts — panels open in front
   of it and it recedes, which is what makes the whole thing read as
   one machine rather than a set of pages.

   Drawn entirely with strokes on a 2D context. Glow is faked by
   stroking twice (wide + faint, then thin + bright) instead of using
   shadowBlur, which is an order of magnitude cheaper and the reason
   this holds 60fps on an integrated GPU.
   ================================================================== */

import { useRef } from 'react'
import { useCanvas } from '@/lib/useCanvas'
import { useLatest } from '@/lib/useLatest'
import { TAU, clamp, lerp, noise, pad, polar } from '@/lib/math'

const CY = (a: number) => `rgba(95,231,255,${a})`
const CY_DEEP = (a: number) => `rgba(34,211,238,${a})`
const CY_PALE = (a: number) => `rgba(200,247,255,${a})`
const AMBER = (a: number) => `rgba(255,176,32,${a})`

export interface Blip {
  id: string
  label: string
  active: boolean
}

interface Props {
  /** 0 = receded behind an open panel, 1 = full idle presence. Tweened. */
  presence: number
  /** Project markers on the radar disc. */
  blips: Blip[]
  /** Any change triggers a spin-up pulse. Increment it on navigation. */
  pulseKey: number
}

/** Stroke a path twice: a wide faint pass for bloom, a tight bright one. */
function glowStroke(
  ctx: CanvasRenderingContext2D,
  path: () => void,
  color: (a: number) => string,
  alpha: number,
  width = 1,
) {
  ctx.lineWidth = width * 3.5
  ctx.strokeStyle = color(alpha * 0.12)
  path()
  ctx.stroke()

  ctx.lineWidth = width
  ctx.strokeStyle = color(alpha)
  path()
  ctx.stroke()
}

export function ReactorCore({ presence, blips, pulseKey }: Props) {
  // Props are read inside the draw callback every frame; refs keep the
  // callback identity stable so the canvas is never re-wired.
  const state = useLatest({ presence, blips, pulseKey })

  // Tweened values live outside React — the reactor animates at 60fps
  // without ever asking the component tree to re-render.
  const anim = useRef({ presence, surge: 0, lastKey: pulseKey })

  const canvasRef = useCanvas(({ ctx, width, height, time, delta }) => {
    const { presence: target, blips: marks, pulseKey: key } = state.current

    // Frame-rate independent easing toward the target presence.
    const k = 1 - Math.pow(0.002, delta / 1000)
    anim.current.presence += (target - anim.current.presence) * k

    if (key !== anim.current.lastKey) {
      anim.current.lastKey = key
      anim.current.surge = 1
    }
    anim.current.surge *= Math.pow(0.15, delta / 1000)
    if (anim.current.surge < 0.002) anim.current.surge = 0

    const p = anim.current.presence
    const boost = anim.current.surge

    ctx.clearRect(0, 0, width, height)

    const t = time / 1000
    // Everything fades and contracts together as panels take the stage.
    const vis = clamp(p, 0, 1)
    const scale = lerp(0.82, 1, vis)
    const a = lerp(0.3, 1, vis)

    // 0.86 keeps the graduated ring clear of the overlay copy and the
    // stat tiles; at 1.0 it collides with both.
    const R = (Math.min(width, height) / 2) * 0.86
    if (R < 40) return

    // On wide screens the idle copy sits left of centre, so the core
    // drifts right to make room. It recentres as panels take over.
    const cx = width / 2 + (width > 1000 ? width * 0.055 * vis : 0)
    const cy = height / 2

    ctx.save()
    ctx.translate(cx, cy)
    ctx.scale(scale, scale)
    ctx.lineCap = 'butt'

    /* ---------- ambient bloom ---------- */
    const bloom = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.95)
    bloom.addColorStop(0, CY_DEEP(0.16 * a + boost * 0.1))
    bloom.addColorStop(0.42, CY_DEEP(0.05 * a))
    bloom.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = bloom
    ctx.beginPath()
    ctx.arc(0, 0, R * 0.95, 0, TAU)
    ctx.fill()

    /* ---------- outer graduated ring ---------- */
    const rTick = R * 0.93
    ctx.save()
    ctx.rotate(-t * 0.045)
    for (let i = 0; i < 180; i++) {
      const angle = (i / 180) * TAU
      const major = i % 15 === 0
      const mid = i % 5 === 0
      const len = major ? R * 0.055 : mid ? R * 0.03 : R * 0.016
      const alpha = (major ? 0.85 : mid ? 0.45 : 0.2) * a
      ctx.beginPath()
      ctx.strokeStyle = CY(alpha)
      ctx.lineWidth = major ? 1.4 : 1
      const p1 = polar(0, 0, rTick, angle)
      const p2 = polar(0, 0, rTick - len, angle)
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.stroke()
    }
    // Bearing labels, upright, every 30°.
    ctx.font = `600 ${Math.max(8, R * 0.036)}px "JetBrains Mono Variable", monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * TAU - Math.PI / 2
      const pos = polar(0, 0, rTick - R * 0.095, angle)
      ctx.save()
      ctx.translate(pos.x, pos.y)
      ctx.rotate(t * 0.045)
      ctx.fillStyle = CY(0.5 * a)
      ctx.fillText(pad(i * 30, 3), 0, 0)
      ctx.restore()
    }
    ctx.restore()

    /* ---------- segmented ring, counter-rotating ---------- */
    const rSeg = R * 0.79
    ctx.save()
    ctx.rotate(t * 0.12 + boost * 0.6)
    const segments = [
      [0, 62],
      [74, 118],
      [131, 186],
      [198, 242],
      [255, 318],
      [330, 352],
    ]
    segments.forEach(([from, to], index) => {
      const hot = index === 1 || index === 4
      glowStroke(
        ctx,
        () => {
          ctx.beginPath()
          ctx.arc(0, 0, rSeg, (from / 360) * TAU, (to / 360) * TAU)
        },
        CY,
        (hot ? 0.95 : 0.42) * a,
        hot ? 2.6 : 1.4,
      )
      // Cap each segment with a short radial tick.
      for (const edge of [from, to]) {
        const angle = (edge / 360) * TAU
        const p1 = polar(0, 0, rSeg - R * 0.022, angle)
        const p2 = polar(0, 0, rSeg + R * 0.022, angle)
        ctx.beginPath()
        ctx.strokeStyle = CY((hot ? 0.7 : 0.3) * a)
        ctx.lineWidth = 1
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
      }
    })
    ctx.restore()

    /* ---------- fine graduation band between the rings ---------- */
    ctx.save()
    ctx.rotate(t * 0.07)
    const rBand = R * 0.665
    for (let i = 0; i < 90; i++) {
      const angle = (i / 90) * TAU
      const long = i % 6 === 0
      const p1 = polar(0, 0, rBand, angle)
      const p2 = polar(0, 0, rBand + (long ? R * 0.022 : R * 0.011), angle)
      ctx.beginPath()
      ctx.strokeStyle = CY((long ? 0.4 : 0.16) * a)
      ctx.lineWidth = 1
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.stroke()
    }
    ctx.restore()

    /* ---------- dashed ring ---------- */
    ctx.save()
    ctx.rotate(-t * 0.22)
    ctx.setLineDash([R * 0.012, R * 0.028])
    ctx.lineWidth = 1
    ctx.strokeStyle = CY(0.35 * a)
    ctx.beginPath()
    ctx.arc(0, 0, R * 0.71, 0, TAU)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()

    /* ---------- radar disc ---------- */
    const rDisc = R * 0.63

    const disc = ctx.createRadialGradient(0, 0, rDisc * 0.1, 0, 0, rDisc)
    disc.addColorStop(0, CY_DEEP(0.1 * a))
    disc.addColorStop(1, CY_DEEP(0.03 * a))
    ctx.fillStyle = disc
    ctx.beginPath()
    ctx.arc(0, 0, rDisc, 0, TAU)
    ctx.fill()

    ctx.lineWidth = 1
    for (const ratio of [0.34, 0.62, 0.86, 1]) {
      ctx.beginPath()
      ctx.strokeStyle = CY(ratio === 1 ? 0.5 * a : 0.16 * a)
      ctx.arc(0, 0, rDisc * ratio, 0, TAU)
      ctx.stroke()
    }
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * TAU
      ctx.beginPath()
      ctx.strokeStyle = CY(0.12 * a)
      ctx.moveTo(0, 0)
      const end = polar(0, 0, rDisc, angle)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
    }

    // Range labels on the concentric rings — the detail that turns a
    // set of circles into an instrument.
    ctx.font = `500 ${Math.max(6.5, R * 0.024)}px "JetBrains Mono Variable", monospace`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = CY(0.32 * a)
    for (const [ratio, label] of [
      [0.34, '0.5K'],
      [0.62, '1.0K'],
      [0.86, '1.5K'],
    ] as const) {
      ctx.fillText(label, rDisc * ratio + 4, -R * 0.018)
    }

    // Crosshair with a clear centre.
    ctx.strokeStyle = CY(0.3 * a)
    ctx.lineWidth = 1
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      ctx.beginPath()
      ctx.moveTo(dx * rDisc * 0.16, dy * rDisc * 0.16)
      ctx.lineTo(dx * rDisc * 0.97, dy * rDisc * 0.97)
      ctx.stroke()
      // Graduations along each arm.
      for (let i = 1; i <= 6; i++) {
        const at = rDisc * (0.16 + (i / 6) * 0.78)
        const len = i % 3 === 0 ? R * 0.022 : R * 0.012
        ctx.beginPath()
        ctx.strokeStyle = CY(0.28 * a)
        ctx.moveTo(dx * at - dy * len, dy * at - dx * len)
        ctx.lineTo(dx * at + dy * len, dy * at + dx * len)
        ctx.stroke()
      }
    }

    /* ---------- sweep ---------- */
    const sweepAngle = (t * 0.55) % TAU
    ctx.save()
    ctx.beginPath()
    ctx.arc(0, 0, rDisc, 0, TAU)
    ctx.clip()
    ctx.rotate(sweepAngle)
    const wedge = ctx.createLinearGradient(0, 0, rDisc, 0)
    wedge.addColorStop(0, CY(0))
    wedge.addColorStop(0.7, CY_DEEP(0.06 * a))
    wedge.addColorStop(1, CY(0.17 * a))
    ctx.fillStyle = wedge
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, rDisc, -0.5, 0)
    ctx.closePath()
    ctx.fill()
    // Leading edge.
    ctx.strokeStyle = CY(0.55 * a)
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(rDisc, 0)
    ctx.stroke()
    ctx.restore()

    /* ---------- project blips ---------- */
    ctx.font = `500 ${Math.max(7.5, R * 0.032)}px "JetBrains Mono Variable", monospace`
    ctx.textAlign = 'left'
    marks.forEach((blip, index) => {
      const seed = index * 3.7 + 1.3
      const angle = (noise(seed) * TAU + index * 0.9) % TAU
      const radius = rDisc * (0.35 + noise(seed + 11) * 0.55)
      const pos = polar(0, 0, radius, angle)

      // Fade in behind the sweep line, decay over roughly a third of a turn.
      let behind = sweepAngle - angle
      while (behind < 0) behind += TAU
      const freshness = clamp(1 - behind / (TAU * 0.34), 0, 1)
      const tint = blip.active ? AMBER : CY_PALE
      const strength = (blip.active ? 0.55 + freshness * 0.45 : freshness * 0.9) * a

      if (strength <= 0.02) return

      ctx.fillStyle = tint(strength)
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, blip.active ? 3.2 : 2.2, 0, TAU)
      ctx.fill()

      ctx.strokeStyle = tint(strength * 0.5)
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, (blip.active ? 7 : 5) + (1 - freshness) * 10, 0, TAU)
      ctx.stroke()

      if (blip.active) {
        ctx.fillStyle = AMBER(0.85 * a)
        ctx.fillText(blip.label.toUpperCase(), pos.x + 11, pos.y + 1)
      }
    })

    /* ---------- inner reticle ---------- */
    ctx.save()
    ctx.rotate(-t * 0.42)
    for (const [from, to, width] of [
      [10, 80, 2],
      [100, 140, 1],
      [190, 262, 2],
      [280, 320, 1],
    ] as const) {
      glowStroke(
        ctx,
        () => {
          ctx.beginPath()
          ctx.arc(0, 0, R * 0.42, (from / 360) * TAU, (to / 360) * TAU)
        },
        CY_PALE,
        0.42 * a,
        width,
      )
    }
    ctx.restore()

    /* ---------- core vanes ---------- */
    ctx.save()
    ctx.rotate(t * 0.3)
    const rVane = R * 0.3
    for (let i = 0; i < 4; i++) {
      ctx.save()
      ctx.rotate((i / 4) * TAU)
      ctx.beginPath()
      ctx.moveTo(0, -rVane)
      ctx.lineTo(rVane * 0.12, -rVane * 0.24)
      ctx.lineTo(0, 0)
      ctx.lineTo(-rVane * 0.12, -rVane * 0.24)
      ctx.closePath()
      const vane = ctx.createLinearGradient(0, -rVane, 0, 0)
      vane.addColorStop(0, CY_PALE(0.5 * a))
      vane.addColorStop(1, CY_DEEP(0.05 * a))
      ctx.fillStyle = vane
      ctx.fill()
      ctx.strokeStyle = CY_PALE(0.4 * a)
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()
    }
    ctx.restore()

    /* ---------- pulsing core ---------- */
    const pulse = 0.5 + Math.sin(t * 1.6) * 0.5
    const rCore = R * (0.062 + pulse * 0.01 + boost * 0.04)
    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, rCore * 3)
    core.addColorStop(0, CY_PALE(0.82 * a))
    core.addColorStop(0.22, CY(0.34 * a))
    core.addColorStop(1, CY_DEEP(0))
    ctx.fillStyle = core
    ctx.beginPath()
    ctx.arc(0, 0, rCore * 3, 0, TAU)
    ctx.fill()

    ctx.fillStyle = CY_PALE(0.88 * a)
    ctx.beginPath()
    ctx.arc(0, 0, rCore * 0.46, 0, TAU)
    ctx.fill()

    /* ---------- callout leaders ---------- */
    ctx.font = `500 ${Math.max(7, R * 0.028)}px "JetBrains Mono Variable", monospace`
    // Angles sit halfway between bearing labels so nothing collides.
    const callouts: [number, string][] = [
      [-Math.PI / 4, 'PWR 100%'],
      [Math.PI / 4, 'SYNC OK'],
      [(Math.PI * 3) / 4, 'CORE STABLE'],
      [(Math.PI * 5) / 4, `FLUX ${(noise(t * 0.4) * 9 + 1).toFixed(2)}`],
    ]
    for (const [angle, text] of callouts) {
      const from = polar(0, 0, rDisc * 1.03, angle)
      const to = polar(0, 0, rDisc * 1.12, angle)
      const right = Math.cos(angle) >= 0
      const tail = right ? to.x + R * 0.08 : to.x - R * 0.08
      ctx.strokeStyle = CY(0.4 * a)
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.lineTo(tail, to.y)
      ctx.stroke()
      ctx.fillStyle = CY(0.6 * a)
      ctx.textAlign = right ? 'right' : 'left'
      ctx.fillText(text, tail, to.y - R * 0.022)
    }

    ctx.restore()
  })

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
}
