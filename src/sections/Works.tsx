import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Heading from '../components/Heading'
import { getTier } from '../lib/perf'

const CircularGallery = lazy(() => import('../components/rb/CircularGallery/CircularGallery'))

const IMG = `${import.meta.env.BASE_URL}img/`

const items = [
  { image: IMG + 'finished-1600.webp', text: 'Монолит + дуб + стекло', description: 'Облицовка массивом, триплекс, подсветка ступеней' },
  { image: IMG + 'steel-896.webp', text: 'Косоур из стали', description: 'Консольные дубовые ступени на моносварном каркасе' },
  { image: IMG + 'spiral-896.webp', text: 'Винтовая', description: 'Центральная опора, гнутое стекло' },
  { image: IMG + 'exterior-928.webp', text: 'Крыльцо', description: 'Террасная доска, стекло, подсветка' },
  { image: IMG + 'hero-1600.webp', text: 'Парящий марш', description: 'Ступени из стены, ограждение без стоек' },
  { image: IMG + 'glass-928.webp', text: 'Детали', description: 'Точечное крепление стекла в массив' },
  { image: IMG + 'real-clad-960.webp', text: 'Объект в Екатеринбурге', description: 'Реальная работа DM Group: облицовка и стекло' },
]

/** WebGL curved gallery from React Bits, mounted only when the section is near. */
export default function Works() {
  const box = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShow(true); io.disconnect() } }, { rootMargin: '400px 0px' })
    io.observe(box.current!)
    return () => io.disconnect()
  }, [])

  return (
    <section id="works" className="relative py-28 md:py-40">
      <div className="mx-auto mb-10 flex max-w-[1600px] flex-col justify-between gap-6 px-5 md:mb-4 md:flex-row md:items-end md:px-10">
        <Heading index="05" eyebrow="Галерея" title="Работы" />
        <p className="max-w-[340px] text-sm leading-relaxed text-bone/60">Тяните галерею или листайте вбок. Нажмите на кадр, чтобы открыть его крупно.</p>
      </div>
      <div ref={box} className="h-[78vh] min-h-[520px] w-full">
        {show && (
          <Suspense fallback={null}>
            <CircularGallery
              items={items}
              bend={2.2}
              textColor="#ece7df"
              borderRadius={0.02}
              font="300 22px 'Jost Variable'"
              scrollSpeed={2}
              scrollEase={0.06}
              itemAspect={0.78}
              gap={0.22}
              shadow={0.5}
              fadeEdges={0.16}
              autoScroll={getTier() === 'low' ? 0 : 0.35}
              dpr={Math.min(window.devicePixelRatio, getTier() === 'high' ? 1.5 : 1)}
            />
          </Suspense>
        )}
      </div>
    </section>
  )
}
