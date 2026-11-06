/**
 * Device quality tier, decided once at startup and lowered at runtime if frames drop.
 *  high — desktop with mouse and a decent CPU: every effect, sharper WebGL
 *  mid  — phones/tablets and modest laptops: no light rays, no shadows, 1x WebGL
 *  low  — weak phones, Save-Data, reduced motion: static where possible
 */
export type Tier = 'high' | 'mid' | 'low'

type Nav = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }

function detect(): Tier {
  if (typeof window === 'undefined') return 'mid'
  const nav = navigator as Nav
  const touch = window.matchMedia('(pointer: coarse)').matches
  const mem = nav.deviceMemory ?? 8
  const cores = nav.hardwareConcurrency ?? 8
  const saveData = !!nav.connection?.saveData
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce || saveData) return 'low'
  if (touch) return mem <= 3 || cores <= 4 ? 'low' : 'mid'
  if (mem <= 4 || cores <= 4) return 'mid'
  return 'high'
}

let tier: Tier = detect()
const listeners = new Set<(t: Tier) => void>()

export const getTier = () => tier
export const onTierChange = (fn: (t: Tier) => void) => { listeners.add(fn); return () => { listeners.delete(fn) } }

function lower() {
  const next: Tier = tier === 'high' ? 'mid' : 'low'
  if (next === tier) return
  tier = next
  document.documentElement.dataset.tier = tier
  listeners.forEach((fn) => fn(tier))
}

/**
 * Watches real frame times while the user scrolls. If the median frame over a
 * scroll burst is slower than ~42 fps twice in a row, drop one tier.
 */
export function startFpsGuard() {
  if (typeof window === 'undefined') return
  document.documentElement.dataset.tier = tier
  let frames: number[] = []
  let last = 0
  let scrolling = 0
  let strikes = 0
  let raf = 0
  const loop = (t: number) => {
    raf = 0
    if (last) frames.push(t - last)
    last = t
    if (frames.length >= 90) {
      const s = frames.sort((a, b) => a - b)
      const median = s[45]
      frames = []
      if (median > 24) { strikes++; if (strikes >= 2) { strikes = 0; lower() } } else strikes = Math.max(0, strikes - 1)
    }
    if (performance.now() - scrolling < 200 && tier !== 'low') raf = requestAnimationFrame(loop)
    else { last = 0; frames = [] }
  }
  window.addEventListener('scroll', () => {
    scrolling = performance.now()
    if (!raf) raf = requestAnimationFrame(loop)
  }, { passive: true })
}
