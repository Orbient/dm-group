import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import Img from '../components/Img'
import Magnet from '../components/rb/Magnet/Magnet'
import { company } from '../data'
import { gsap, reduceMotion, scrollToId } from '../lib/smooth'
import { getTier, onTierChange } from '../lib/perf'

const LightRays = lazy(() => import('../components/rb/LightRays/LightRays'))
const TITLE = 'DM GROUP'

export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)
  const media = useRef<HTMLDivElement>(null)
  const title = useRef<HTMLHeadingElement>(null)
  // light rays only on capable desktops; switched off live if the fps guard lowers the tier
  const [richFx, setRichFx] = useState(() => getTier() === 'high' && window.innerWidth >= 768)
  useEffect(() => onTierChange((t) => setRichFx(t === 'high')), [])

  // Entrance after the preloader: photo un-zooms out of a slit, letters rise out of a mask
  useGSAP(() => {
    if (!ready) return
    const q = gsap.utils.selector(root)
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    tl.fromTo(media.current, { clipPath: 'inset(42% 0% 42% 0%)', scale: 1.25 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 2.1, ease: 'expo.inOut', clearProps: 'clipPath,scale,transform' })
      .fromTo(q('[data-char]'), { yPercent: 105, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.6, stagger: 0.055 }, '-=1.1')
      .fromTo(q('[data-fade]'), { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 1.4, stagger: 0.08 }, '-=1.2')
      .fromTo(q('[data-line]'), { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'expo.inOut' }, '<')
  }, { dependencies: [ready], scope: root })

  // Scroll: photo drifts slower than the page, title lifts away
  useGSAP(() => {
    if (reduceMotion) return
    const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true }
    gsap.to('[data-parallax-img]', { yPercent: 18, scale: 1.08, ease: 'none', scrollTrigger: st })
    gsap.to(title.current, { yPercent: -45, opacity: 0.15, ease: 'none', scrollTrigger: st })
    gsap.to('[data-hero-ui]', { y: -80, opacity: 0, ease: 'none', scrollTrigger: { ...st, end: '60% top' } })
  }, { scope: root })

  // Pointer parallax for depth on desktop
  useEffect(() => {
    if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return
    const img = root.current?.querySelector('[data-pointer-img]')
    if (!img || !title.current) return
    const ix = gsap.quickTo(img, 'x', { duration: 1.4, ease: 'power3.out' })
    const iy = gsap.quickTo(img, 'y', { duration: 1.4, ease: 'power3.out' })
    const tx = gsap.quickTo(title.current, 'x', { duration: 1.8, ease: 'power3.out' })
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      ix(nx * -22); iy(ny * -14); tx(nx * 14)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <section ref={root} id="top" className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ink">
      <div ref={media} className="absolute inset-0" style={{ clipPath: 'inset(42% 0% 42% 0%)' }}>
        <div data-parallax-img className="absolute inset-0 will-change-transform">
          <div data-pointer-img className="absolute -inset-8">
            <Img name="hero" widths={[960, 1600, 2400]} alt="Парящая лестница из дуба со стеклянным ограждением в тёмном интерьере" eager sizes="(max-width: 767px) 530px, 100vw" className="h-full w-full object-cover object-[60%_50%] md:object-center" />
          </div>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_40%,transparent_30%,rgb(6_6_6/0.75)_80%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
      </div>

      {richFx ? (
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <Suspense fallback={null}><LightRays raysOrigin="top-center" raysColor="#ffe2bd" raysSpeed={0.6} lightSpread={0.55} rayLength={1.6} intensity={0.55} haze={0.35} glow={0.5} followMouse mouseInfluence={0.06} cursorShadow={false} clickPulse={false} noiseAmount={0.08} maxDevicePixelRatio={0.75} /></Suspense>
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_0%,rgb(255_226_189/0.16),transparent_70%)]" />
      )}

      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col px-5 pt-24 md:px-10 md:pt-28">
        <div data-hero-ui><p data-fade className="eyebrow opacity-0">{company.city} · проект · производство · монтаж</p></div>

        <h1 ref={title} className="display metal mt-3 select-none whitespace-nowrap text-[min(calc((100vw-40px)/5.7),272px)] md:text-[min(calc((100vw-80px)/5.7),272px)] leading-[0.82] tracking-[0.06em] md:mt-1">
          <span className="sr-only">DM Group — лестницы и лестничные ограждения в Екатеринбурге</span>
          <span aria-hidden className="inline-flex overflow-hidden pb-[0.04em]">
            {TITLE.split('').map((c, i) => (
              <span key={i} data-char className="metal inline-block" style={{ transform: 'translateY(105%)' }}>{c === ' ' ? ' ' : c}</span>
            ))}
          </span>
        </h1>

        <div data-hero-ui className="mt-4 flex flex-col gap-6 md:mt-2 md:flex-row md:items-start md:justify-between">
          <p data-fade className="display text-[13px] tracking-[0.34em] text-bone/85 opacity-0 md:text-[15px]">Лестницы, которые держат дом</p>
          <p data-fade className="max-w-[300px] text-[13px] leading-relaxed text-bone/65 opacity-0 md:text-right">
            Монолит, массив дуба и стекло. Проектируем, отливаем и облицовываем под ключ — от замера до последней ступени.
          </p>
        </div>

        <div data-hero-ui className="mt-auto pb-8 md:pb-10">
          <div data-line className="mb-6 h-px w-full origin-left bg-white/10" />
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div data-fade className="flex items-center gap-2 opacity-0">
              <Magnet padding={60} magnetStrength={4}>
                <button onClick={() => scrollToId('contact')} className="pill pill-solid">Рассчитать лестницу</button>
              </Magnet>
              <button onClick={() => scrollToId('works')} className="arrow-dot hover:rotate-45 hover:bg-white/5" aria-label="Смотреть работы">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M1 13 13 1M4 1h9v9" /></svg>
              </button>
            </div>
            <div data-fade className="flex items-center gap-4 text-[11px] uppercase tracking-[0.28em] text-mute opacity-0">
              <span className="hidden sm:inline">56°50′ с. ш. · 60°36′ в. д.</span>
              <span className="relative block h-10 w-px overflow-hidden bg-white/10">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollhint_2.2s_cubic-bezier(.76,0,.24,1)_infinite] bg-bone" />
              </span>
              <span>Листайте</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
