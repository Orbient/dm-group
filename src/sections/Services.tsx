import { useEffect, useRef, useState } from 'react'
import Heading from '../components/Heading'
import Img from '../components/Img'
import { services } from '../data'
import { gsap, reduceMotion } from '../lib/smooth'

/** Reference's "Achievement" rows: hairline list, a photo floats after the cursor on hover. */
export default function Services() {
  const list = useRef<HTMLDivElement>(null)
  const float = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    if (reduceMotion || !window.matchMedia('(pointer: fine)').matches || !float.current) return
    const x = gsap.quickTo(float.current, 'x', { duration: 0.9, ease: 'power3.out' })
    const y = gsap.quickTo(float.current, 'y', { duration: 0.9, ease: 'power3.out' })
    const r = gsap.quickTo(float.current, 'rotate', { duration: 1.2, ease: 'power3.out' })
    let lastX = 0
    const onMove = (e: PointerEvent) => {
      const box = list.current!.getBoundingClientRect()
      x(e.clientX - box.left); y(e.clientY - box.top)
      r(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.4)); lastX = e.clientX
    }
    const el = list.current!
    el.addEventListener('pointermove', onMove)
    return () => el.removeEventListener('pointermove', onMove)
  }, [])

  useEffect(() => {
    if (!float.current) return
    gsap.to(float.current, { scale: active === null ? 0.6 : 1, opacity: active === null ? 0 : 1, duration: 0.7, ease: 'expo.out' })
  }, [active])

  return (
    <section id="services" className="relative py-28 md:py-44">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="mb-14 flex flex-col justify-between gap-8 md:mb-20 md:flex-row md:items-end">
          <Heading index="03" eyebrow="Что мы делаем" title="Работы под ключ" />
          <p className="max-w-[360px] text-sm leading-relaxed text-bone/60">Берём объект на любом этапе: от голой коробки до чистовой отделки. Считаем смету за день после замера.</p>
        </div>

        <div ref={list} className="relative" onPointerLeave={() => setActive(null)}>
          <div ref={float} className="pointer-events-none absolute left-0 top-0 z-20 hidden h-[300px] w-[240px] overflow-hidden opacity-0 md:block" style={{ marginLeft: -120, marginTop: -150 }}>
            {services.map((s, i) => (
              <div key={s.n} className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out-expo ${active === i ? 'scale-100 opacity-100' : 'scale-110 opacity-0'}`}>
                <Img name={s.img.name} widths={s.img.widths} sizes="240px" alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>

          {services.map((s, i) => (
            <article
              key={s.n}
              onPointerEnter={() => setActive(i)}
              className={`group relative grid grid-cols-[48px_1fr] gap-x-4 border-t border-white/10 py-8 transition-colors duration-500 last:border-b md:grid-cols-[80px_1.2fr_1fr_160px] md:items-center md:py-10 ${active !== null && active !== i ? 'text-bone/35' : ''}`}
            >
              <span className="text-[11px] tracking-[0.3em] text-mute">{s.n}</span>
              <h3 className="display text-[clamp(22px,2.6vw,40px)] tracking-[0.1em] transition-transform duration-700 ease-out-expo md:group-hover:translate-x-4">{s.title}</h3>
              <p className="col-start-2 mt-3 max-w-[440px] text-[13px] leading-relaxed text-bone/60 md:col-start-auto md:mt-0">{s.text}</p>
              <p className="col-start-2 mt-3 text-[11px] uppercase tracking-[0.24em] text-oak md:col-start-auto md:mt-0 md:text-right">{s.term}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
