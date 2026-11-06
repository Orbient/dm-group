import { useEffect, useRef, useState } from 'react'
import { gsap, reduceMotion } from '../lib/smooth'

/** Counter 000→100 while the hero photo and fonts load, then the curtain lifts. */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const num = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (reduceMotion) { setGone(true); onDone(); return }
    document.documentElement.style.overflow = 'hidden'
    const hero = new Promise<void>((res) => {
      const img = new Image()
      img.onload = img.onerror = () => res()
      img.src = `${import.meta.env.BASE_URL}img/hero-${window.innerWidth > 1100 ? 1600 : 960}.avif`
    })
    const ready = Promise.all([hero, document.fonts.ready])
    const state = { v: 0 }
    const tl = gsap.timeline()
    tl.to(state, {
      v: 82, duration: 0.6, ease: 'power2.out',
      onUpdate: () => {
        if (num.current) num.current.textContent = String(Math.round(state.v)).padStart(3, '0')
        if (bar.current) bar.current.style.transform = `scaleX(${state.v / 100})`
      },
    })
    let killed = false
    ready.then(() => tl.then(() => {
      if (killed) return
      gsap.timeline({ onComplete: () => { document.documentElement.style.overflow = ''; setGone(true) } })
        .to(state, {
          v: 100, duration: 0.35, ease: 'power1.inOut',
          onUpdate: () => {
            if (num.current) num.current.textContent = String(Math.round(state.v)).padStart(3, '0')
            if (bar.current) bar.current.style.transform = `scaleX(${state.v / 100})`
          },
        })
        .to('[data-pre-fade]', { opacity: 0, y: -12, duration: 0.45, ease: 'power2.in', stagger: 0.04 })
        .add(() => onDone(), '-=0.1')
        .to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=0.15')
    }))
    return () => { killed = true; tl.kill(); document.documentElement.style.overflow = '' }
  }, [onDone])

  if (gone) return null
  return (
    <div ref={root} className="fixed inset-0 z-[100] grid place-items-center bg-ink" style={{ clipPath: 'inset(0 0 0% 0)' }} aria-hidden>
      <div className="w-[min(420px,80vw)]">
        <div data-pre-fade className="display mb-6 text-center text-[13px] tracking-[0.6em] text-bone/80">DM GROUP</div>
        <div data-pre-fade className="h-px w-full bg-white/10">
          <div ref={bar} className="h-px origin-left bg-bone" style={{ transform: 'scaleX(0)' }} />
        </div>
        <div data-pre-fade className="mt-4 flex justify-between text-[11px] tracking-[0.3em] text-mute">
          <span>ЛЕСТНИЦЫ · ОГРАЖДЕНИЯ</span>
          <span ref={num} className="tabular-nums text-bone">000</span>
        </div>
      </div>
    </div>
  )
}
