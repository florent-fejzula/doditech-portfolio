/* ==================================================================
   TELEMETRY
   The numbers in the side rails are real wherever a browser will tell
   us the truth — frame rate, heap, network quality, battery, viewport,
   session uptime. Nothing here is a random number generator dressed up
   as a readout; if a value is unavailable the panel says so.
   ================================================================== */

import { useSyncExternalStore } from 'react'
import { frameStats } from './frameBus'

interface NetworkInformation {
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
  addEventListener?: (type: 'change', listener: () => void) => void
  removeEventListener?: (type: 'change', listener: () => void) => void
}

interface BatteryManager extends EventTarget {
  level: number
  charging: boolean
}

export interface Telemetry {
  /** Wall clock, 24h, in the visitor's own zone. */
  clock: string
  date: string
  /** Seconds since the interface booted. */
  uptime: number
  fps: number
  /** Share of a 16.7ms budget spent painting — a real load figure. */
  load: number
  /** JS heap in MB, or null where the browser will not say. */
  heap: number | null
  heapLimit: number | null
  net: { type: string; downlink: number | null; rtt: number | null }
  battery: { level: number; charging: boolean } | null
  viewport: { w: number; h: number; dpr: number }
  surfaces: number
}

const bootStamp = Date.now()

let battery: BatteryManager | null = null
let snapshot: Telemetry = read()
const listeners = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | null = null

function connection(): NetworkInformation | undefined {
  return (navigator as Navigator & { connection?: NetworkInformation }).connection
}

function heapInfo() {
  const perf = performance as Performance & {
    memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number }
  }
  if (!perf.memory) return { used: null, limit: null }
  return {
    used: perf.memory.usedJSHeapSize / 1048576,
    limit: perf.memory.jsHeapSizeLimit / 1048576,
  }
}

function read(): Telemetry {
  const now = new Date()
  const conn = connection()
  const heap = heapInfo()

  return {
    clock: now.toLocaleTimeString('en-GB', { hour12: false }),
    date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    uptime: (Date.now() - bootStamp) / 1000,
    fps: frameStats.fps,
    load: Math.min(100, (frameStats.cost / 16.7) * 100),
    heap: heap.used,
    heapLimit: heap.limit,
    net: {
      type: conn?.effectiveType?.toUpperCase() ?? 'LINK',
      downlink: conn?.downlink ?? null,
      rtt: conn?.rtt ?? null,
    },
    battery: battery ? { level: battery.level, charging: battery.charging } : null,
    viewport: {
      w: window.innerWidth,
      h: window.innerHeight,
      dpr: Math.round((window.devicePixelRatio || 1) * 100) / 100,
    },
    surfaces: frameStats.surfaces,
  }
}

function publish() {
  snapshot = read()
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (timer === null) {
    timer = setInterval(publish, 500)
    void initBattery()
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }
}

async function initBattery() {
  const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManager> }
  if (!nav.getBattery) return
  try {
    battery = await nav.getBattery()
    battery.addEventListener('levelchange', publish)
    battery.addEventListener('chargingchange', publish)
  } catch {
    battery = null
  }
}

export function useTelemetry(): Telemetry {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot)
}

/** hh:mm:ss from a second count — used for the session uptime readout. */
export function formatUptime(seconds: number) {
  const s = Math.floor(seconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec].map((n) => String(n).padStart(2, '0')).join(':')
}
