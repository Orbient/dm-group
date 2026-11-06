import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import type { StairScene } from '../three/stairScene'
import { gsap, ScrollTrigger, reduceMotion } from '../lib/smooth'
import { getTier, onTierChange } from '../lib/perf'

const steps = [
  { title: 'Замер и 3D-проект', text: 'Приезжаем, снимаем размеры, рисуем лестницу в 3D. Вы видите её до первого мешка бетона.' },
  { title: 'Монолитный каркас', text: 'Опалубка, арматура, заливка. Бетон набирает прочность — и держит дом десятилетиями.' },
  { title: 'Облицовка массивом', text: 'Дубовые ступени и подступенки на скрытом крепеже. Подгоняем каждую по месту.' },
  { title: 'Стеклянное ограждение', text: 'Закалённое стекло на точечных креплениях и поручень. Свет проходит насквозь.' },
  { title: 'Подсветка и сдача', text: 'Встраиваем свет в ступени, убираем за собой, сдаём лестницу с гарантией.' },
]
const bounds = [0, 0.16, 0.42, 0.66, 0.86, 1.01]

/** Pinned chapter: a WebGL staircase assembles itself while the five work stages scroll by. */
export default function Build() {
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const scene = useRef<StairScene | null>(null)
  const progress = useRef(reduceMotion ? 1 : 0)
  const [active, setActive] = useState(0)
  const bar = useRef<HTMLDivElement>(null)

  // Load three.js only when the chapter is about to enter the viewport
  useEffect(() => {
    const el = root.current!
    let disposed = false
    // build the scene well before it is visible, in idle time, so scrolling into it is smooth
    const idle = (fn: () => void) => ('requestIdleCallback' in window ? window.requestIdleCallback(fn, { timeout: 1200 }) : setTimeout(fn, 60))
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || scene.current) return
      io.disconnect()
      import('../three/stairScene').then(({ createStairScene }) => idle(() => {
        if (disposed || !canvas.current || scene.current) return
        scene.current = createStairScene(canvas.current, { tier: getTier() })
        scene.current.setProgress(progress.current)
        canvas.current.style.opacity = '1'
      }))
    }, { rootMargin: '1600px 0px' })
    const offTier = onTierChange((t) => scene.current?.setQuality(t))
    io.observe(el)
    const onResize = () => scene.current?.resize()
    const onMove = (e: PointerEvent) => scene.current?.setPointer(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5)
    window.addEventListener('resize', onResize)
    const fine = window.matchMedia('(pointer: fine)').matches
    if (fine) window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      disposed = true; io.disconnect(); offTier()
      window.removeEventListener('resize', onResize); window.removeEventListener('pointermove', onMove)
      scene.current?.dispose(); scene.current = null
    }
  }, [])

  useGSAP(() => {
    if (reduceMotion) { setActive(4); return }
    let lastActive = 0
    ScrollTrigger.create({
      trigger: root.current,
      start: 'top top',
      end: () => `+=${window.innerHeight * 3.2}`,
      pin: true,
      scrub: true,
      anticipatePin: 1,
      onUpdate: (st) => {
        progress.current = st.progress
        scene.current?.setProgress(st.progress)
        if (bar.current) bar.current.style.transform = `scaleY(${st.progress})`
        const i = bounds.findIndex((b, k) => st.progress >= b && st.progress < bounds[k + 1])
        if (i !== -1 && i !== lastActive) { lastActive = i; setActive(i) }
      },
    })
  }, { scope: root })

  // Swap the caption with a soft mask rise when the stage changes
  useEffect(() => {
    if (reduceMotion) return
    gsap.fromTo('[data-build-caption]', { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: 'expo.out' })
  }, [active])

  return (
    <section ref={root} id="build" className="relative h-svh overflow-hidden bg-[radial-gradient(90%_70%_at_65%_55%,#17130f_0%,#060606_70%)]">
      <canvas ref={canvas} className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-1000" aria-label="3D-модель лестницы, которая собирается по этапам работ" role="img" />

      <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-between px-5 pb-10 pt-24 md:px-10 md:pt-28">
        <div>
          <p className="eyebrow mb-5 flex items-center gap-3"><span className="text-bone/80">04</span><span className="h-px w-8 bg-white/20" />Как мы строим</p>
          <h2 className="display max-w-[10ch] text-[clamp(34px,5.2vw,80px)]">Пять шагов до&nbsp;готовой лестницы</h2>
        </div>

        <div className="flex gap-6 md:gap-10">
          <div className="relative hidden w-px bg-white/10 md:block">
            <div ref={bar} className="absolute inset-0 origin-top bg-oak" style={{ transform: 'scaleY(0)' }} />
          </div>
          <div className="max-w-[420px]">
            <ol className="mb-6 flex gap-2 md:mb-8 md:flex-col md:gap-3">
              {steps.map((s, i) => (
                <li key={s.title} className={`flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] transition-colors duration-500 ${i === active ? 'text-bone' : 'text-bone/30'}`}>
                  <span className={`grid h-7 w-7 place-items-center rounded-full border text-[10px] transition-colors duration-500 ${i === active ? 'border-oak text-oak' : 'border-white/15'}`}>{i + 1}</span>
                  <span className="hidden md:inline">{s.title}</span>
                </li>
              ))}
            </ol>
            <div className="overflow-hidden">
              <div data-build-caption key={active}>
                <p className="display text-2xl tracking-[0.12em] md:hidden">{steps[active].title}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-bone/70 md:mt-0 md:text-[15px]">{steps[active].text}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
