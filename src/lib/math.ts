export const TAU = Math.PI * 2

export const clamp = (value: number, min: number, max: number) =>
  value < min ? min : value > max ? max : value

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Ease used for panel transitions in canvas space. */
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * Deterministic value noise. Canvas surfaces need variation that is
 * stable across resizes — Math.random() would make every ring jump
 * whenever the layout reflows.
 */
export function hash(n: number) {
  const s = Math.sin(n * 127.1) * 43758.5453
  return s - Math.floor(s)
}

export function noise(x: number) {
  const i = Math.floor(x)
  const f = x - i
  const smooth = f * f * (3 - 2 * f)
  return lerp(hash(i), hash(i + 1), smooth)
}

export const polar = (cx: number, cy: number, radius: number, angle: number) => ({
  x: cx + Math.cos(angle) * radius,
  y: cy + Math.sin(angle) * radius,
})

/** "0042" — fixed-width numerics keep readouts from reflowing. */
export const pad = (value: number, width = 2) => String(Math.floor(value)).padStart(width, '0')
