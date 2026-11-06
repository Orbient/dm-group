import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import Img from '../components/Img'
import { gsap, reduceMotion } from '../lib/smooth'

/** The reference's "Through fire and finesse" spread: words part around a sculptural photo. */
export default function Statement() {
  const root = useRef<HTMLElement>(null)
  useGSAP(() => {
    if (reduceMotion) return
    const st = { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true }
    gsap.fromTo('[data-left]', { xPercent: 12 }, { xPercent: -10, ease: 'none', scrollTrigger: st })
    gsap.fromTo('[data-right]', { xPercent: -12 }, { xPercent: 10, ease: 'none', scrollTrigger: st })
    gsap.fromTo('[data-obj]', { yPercent: 18, rotate: -4, scale: 0.86 }, { yPercent: -14, rotate: 3, scale: 1.04, ease: 'none', scrollTrigger: st })
  }, { scope: root })

  return (
    <section ref={root} className="relative overflow-hidden py-32 md:py-52" aria-label="Наш подход">
      <div className="relative mx-auto grid max-w-[1400px] items-center px-5 md:grid-cols-[1fr_auto_1fr] md:px-10">
        <p data-left className="display relative z-10 text-[clamp(34px,5.4vw,84px)] leading-[1.05] md:text-right">Бетон держит.<br />Дерево греет.</p>
        <div data-obj className="relative z-0 mx-auto my-10 aspect-[4/5] w-[62vw] max-w-[360px] overflow-hidden md:-mx-10 md:my-0 md:w-[26vw]">
          <Img name="glass" widths={[600, 928]} sizes="(min-width: 768px) 26vw, 62vw" alt="Деталь крепления стекла к дубовой ступени" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
        </div>
        <p data-right className="display relative z-10 text-[clamp(34px,5.4vw,84px)] leading-[1.05] text-bone/90">Стекло<br />отдаёт свет&nbsp;дому.</p>
      </div>
    </section>
  )
}
