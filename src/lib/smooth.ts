import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
// Mobile URL-bar show/hide resizes the viewport; re-measuring every pin on that causes visible jumps
ScrollTrigger.config({ ignoreMobileResize: true })
gsap.ticker.fps(-1)

export const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
export let lenis: Lenis | null = null

/** One Lenis instance driven by GSAP's ticker so ScrollTrigger and smooth scroll never drift apart. */
export function startSmoothScroll() {
  // Touch screens already scroll natively with momentum; smoothing them only adds latency
  if (lenis || reduceMotion || window.matchMedia('(pointer: coarse)').matches) return lenis
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis?.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) })
  else el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })
}

export { gsap, ScrollTrigger }
