import { useEffect, useRef, useState } from 'react'
import ScrollVelocity from '../components/rb/ScrollVelocity/ScrollVelocity'

/** The marquee runs a per-frame loop, so it only exists while it is on screen. */
export default function Marquee() {
  const box = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: '200px 0px' })
    io.observe(box.current!)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={box} className="h-[calc(1.9*clamp(32px,5vw,72px)+66px)] overflow-hidden border-y border-white/[0.07] py-8 md:h-[calc(1.9*clamp(32px,5vw,72px)+98px)] md:py-12" aria-hidden>
      {on && (
        <ScrollVelocity
          texts={['Монолит · Массив дуба · Стекло · Металл · Свет ·', 'Проект · Производство · Монтаж · Гарантия ·']}
          velocity={38}
          className="display px-6 text-[clamp(32px,5vw,72px)] text-bone/80"
          numCopies={4}
          damping={50}
          stiffness={400}
          skewWithVelocity={4}
        />
      )}
    </div>
  )
}
