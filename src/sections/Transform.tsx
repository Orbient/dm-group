import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import Img from '../components/Img'
import { gsap, ScrollTrigger, reduceMotion } from '../lib/smooth'

const stages = [
  { n: '01', title: 'Монолит', text: 'Армируем и отливаем бетонный марш по месту. Каркас, который не скрипит и не гуляет.' },
  { n: '02', title: 'Облицовка', text: 'Одеваем каждую ступень в массив дуба. Подгонка по месту, скрытый крепёж.' },
  { n: '03', title: 'Стекло и свет', text: 'Ставим стеклянное ограждение и подсветку ступеней. Лестница становится архитектурой.' },
]

/**
 * Pinned before/after: a diagonal wipe turns the raw concrete flight into the finished stair.
 * The wipe is a skewed, translated window with a counter-transformed photo inside, and the
 * glowing edge is a rotated hairline — every frame is transform-only, so it stays on the GPU.
 */
export default function Transform() {
  const root = useRef<HTMLElement>(null)
  const win = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const edge = useRef<HTMLDivElement>(null)
  const pct = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLDivElement>(null)

  // Decode both big photos off the main thread well before the section arrives,
  // so the first frames of the pinned wipe don't stall on image decoding
  useEffect(() => {
    const el = root.current!
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      el.querySelectorAll('img').forEach((img) => { img.loading = 'eager'; img.decode?.().catch(() => {}) })
    }, { rootMargin: '1800px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useGSAP(() => {
    const SLANT = 0.32 // bottom of the edge sits this share of the width to the right of its top
    const box = { w: 1, h: 1, tan: 0, deg: 0, len: 1 }
    const stagesEls = Array.from(root.current!.querySelectorAll<HTMLElement>('[data-stage]'))
    const proofEls = Array.from(root.current!.querySelectorAll<HTMLElement>('[data-proof]'))
    let lastActive = -1
    let lastPct = -1
    let p = 0

    const measure = () => {
      box.w = root.current!.clientWidth
      box.h = root.current!.clientHeight
      box.tan = (SLANT * box.w) / box.h
      box.deg = (Math.atan(box.tan) * 180) / Math.PI
      box.len = Math.hypot(SLANT * box.w, box.h)
      win.current!.style.width = `${box.w * (1 + SLANT) + 4}px`
      inner.current!.style.width = `${box.w}px`
      edge.current!.style.height = `${box.len}px`
      paint(p)
    }

    const paint = (v: number) => {
      p = v
      const x = box.w * (1 - v * (1 + SLANT)) // top of the edge, sweeping right → left
      win.current!.style.transform = `translate3d(${x}px,0,0) skewX(${box.deg}deg)`
      inner.current!.style.transform = `skewX(${-box.deg}deg) translate3d(${-x}px,0,0)`
      edge.current!.style.transform = `translate3d(${x}px,0,0) rotate(${-box.deg}deg)`
      edge.current!.style.opacity = v > 0.002 && v < 0.998 ? '1' : '0'
      const n = Math.round(v * 100)
      if (n !== lastPct) {
        lastPct = n
        pct.current!.textContent = String(n).padStart(3, '0')
        bar.current!.style.transform = `scaleX(${v})`
      }
      const active = v < 0.34 ? 0 : v < 0.7 ? 1 : 2
      if (active !== lastActive) {
        lastActive = active
        stagesEls.forEach((el, i) => { el.dataset.on = String(i === active) })
        proofEls.forEach((el, i) => { el.dataset.on = String(i === (active === 0 ? 0 : 1)) })
      }
    }

    measure()
    ScrollTrigger.addEventListener('refresh', measure)
    if (reduceMotion) { paint(1); return () => ScrollTrigger.removeEventListener('refresh', measure) }
    const state = { p: 0 }
    gsap.timeline({
      scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${window.innerHeight * 2.4}`, pin: true, scrub: 0.8, anticipatePin: 1 },
    })
      .to('[data-raw]', { scale: 1.06, ease: 'none', duration: 1, force3D: true }, 0)
      .to(state, { p: 1, ease: 'none', duration: 1, onUpdate: () => paint(state.p) }, 0)
    return () => ScrollTrigger.removeEventListener('refresh', measure)
  }, { scope: root })

  return (
    <section ref={root} id="transform" className="relative h-svh overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <div data-raw className="absolute inset-0 will-change-transform">
          <Img name="raw" widths={[960, 1600, 2400]} sizes="(max-width: 767px) 530px, 100vw" alt="Монолитная бетонная лестница до облицовки" className="h-full w-full object-cover object-[55%_50%]" />
        </div>
        <div ref={win} className="absolute left-0 top-0 h-full origin-top-left overflow-hidden will-change-transform" style={{ transform: 'translate3d(100vw,0,0)' }}>
          <div ref={inner} className="absolute left-0 top-0 h-full origin-top-left will-change-transform">
            <Img name="finished" widths={[960, 1600, 2400]} sizes="(max-width: 767px) 530px, 100vw" alt="Та же лестница после облицовки дубом, со стеклянным ограждением и подсветкой" className="h-full w-full object-cover object-[60%_50%]" />
          </div>
        </div>
        <div ref={edge} aria-hidden className="pointer-events-none absolute left-0 top-0 w-[2px] origin-top-left bg-[#ffd9a8] opacity-0 shadow-[0_0_12px_2px_rgba(255,184,107,0.55)] will-change-transform" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-between px-5 pb-10 pt-28 md:px-10">
        <div>
          <p className="eyebrow mb-5 flex items-center gap-3"><span className="text-bone/80">02</span><span className="h-px w-8 bg-white/20" />Процесс в одном кадре</p>
          <h2 className="display max-w-[11ch] text-[clamp(38px,6.4vw,92px)]">Из бетона — в&nbsp;архитектуру</h2>
        </div>

        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <ol className="grid max-w-[720px] gap-6 sm:grid-cols-3">
            {stages.map((s) => (
              <li key={s.n} data-stage data-on="false" className="group border-t border-white/15 pt-4 transition-[opacity,border-color] duration-700 data-[on=false]:opacity-35 data-[on=true]:border-oak">
                <p className="text-[11px] tracking-[0.3em] text-mute">{s.n}</p>
                <p className="display mt-2 text-xl tracking-[0.14em]">{s.title}</p>
                <p className="mt-2 hidden text-[13px] leading-relaxed text-bone/65 sm:block">{s.text}</p>
              </li>
            ))}
          </ol>

          <div className="flex items-end gap-6">
            <div className="relative hidden h-[120px] w-[96px] overflow-hidden lg:block">
              {['real-monolith', 'real-clad'].map((n, i) => (
                <div key={n} data-proof data-on={i === 0 ? 'true' : 'false'} className="absolute inset-0 transition-opacity duration-700 data-[on=false]:opacity-0">
                  <Img name={n} widths={[600, 960]} sizes="96px" alt={i === 0 ? 'Монолитная лестница DM Group на объекте' : 'Облицованная лестница DM Group со стеклом'} className="h-full w-full object-cover grayscale-[.3]" />
                </div>
              ))}
            </div>
            <div className="min-w-[180px]">
              <p className="eyebrow !text-[10px]">Реальный объект · готовность</p>
              <p className="display mt-2 text-5xl tabular-nums"><span ref={pct}>000</span><span className="text-xl text-mute">%</span></p>
              <div className="mt-3 h-px w-full bg-white/15"><div ref={bar} className="h-px origin-left bg-oak" style={{ transform: 'scaleX(0)' }} /></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
