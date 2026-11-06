import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import Heading from '../components/Heading'
import Img from '../components/Img'
import ScrollReveal from '../components/rb/ScrollReveal/ScrollReveal'
import CountUp from '../components/rb/CountUp/CountUp'
import { gsap, reduceMotion } from '../lib/smooth'

const facts = [
  { to: 3, label: 'материала в одной лестнице', note: 'бетон · дерево · стекло' },
  { to: 1, label: 'команда на весь цикл', note: 'замер → проект → монтаж' },
  { to: 0, label: 'посредников', note: 'своё производство' },
]

export default function About() {
  const root = useRef<HTMLElement>(null)

  // Collage photos travel at different speeds: cheap depth without WebGL
  useGSAP(() => {
    if (reduceMotion) return
    gsap.utils.toArray<HTMLElement>('[data-speed]').forEach((el) => {
      const s = Number(el.dataset.speed)
      gsap.fromTo(el, { yPercent: s * 30 }, { yPercent: -s * 30, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
    })
    gsap.utils.toArray<HTMLElement>('[data-clip]').forEach((el) => {
      gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 85%' } })
    })
  }, { scope: root })

  return (
    <section ref={root} id="about" className="relative overflow-hidden py-28 md:py-44">
      <div className="mx-auto grid max-w-[1600px] gap-16 px-5 md:grid-cols-12 md:px-10">
        <div className="md:col-span-7">
          <Heading index="01" eyebrow="О компании" title="О DM Group" />
          <ScrollReveal
            containerClassName="mt-10 md:mt-14"
            textClassName="font-display !text-[clamp(22px,2.5vw,38px)] !font-light !leading-[1.3] text-bone"
            baseOpacity={0.14}
            enableBlur={false}
            baseRotation={0}
            rotationEnd="bottom 60%"
            wordAnimationEnd="bottom 60%"
          >
            Лестница — главная скульптура дома. Мы отливаем её из бетона, одеваем в массив дуба и обрамляем стеклом. Одна команда ведёт проект от первого замера до последней ступени — поэтому всё сходится до миллиметра.
          </ScrollReveal>

          <div className="mt-16 grid gap-8 border-t border-white/10 pt-10 sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label}>
                <div className="display text-[64px] leading-none text-bone"><CountUp to={f.to} from={f.to === 0 ? 9 : 0} duration={2.2} easing="expo" mode="roll" /></div>
                <p className="mt-3 text-sm text-bone/80">{f.label}</p>
                <p className="mt-1 text-xs tracking-wide text-mute">{f.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative h-[560px] md:col-span-5 md:h-auto md:min-h-[720px]">
          <div data-speed="0.25" className="absolute right-0 top-0 w-[68%]">
            <div data-clip className="aspect-[4/5] overflow-hidden">
              <Img name="glass" widths={[600, 928]} sizes="(min-width: 768px) 28vw, 68vw" alt="Стеклянное ограждение на точечном креплении в дубовой ступени" className="h-full w-full object-cover" />
            </div>
            <p className="eyebrow mt-3 !text-[10px]">Точечное крепление · триплекс 10 мм</p>
          </div>
          <div data-speed="-0.35" className="absolute bottom-6 left-0 w-[46%] md:bottom-10">
            <div data-clip className="aspect-[3/4] overflow-hidden">
              <Img name="steel" widths={[600, 896]} sizes="(min-width: 768px) 20vw, 46vw" alt="Лестница на металлическом косоуре с дубовыми ступенями" className="h-full w-full object-cover" />
            </div>
          </div>
          <div data-speed="0.6" className="absolute bottom-[18%] right-[6%] hidden w-[30%] md:block">
            <div data-clip className="aspect-square overflow-hidden">
              <Img name="spiral" widths={[600, 896]} sizes="14vw" alt="Винтовая лестница сверху" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
