import Heading from '../components/Heading'
import SpotlightCard from '../components/rb/SpotlightCard/SpotlightCard'
import { company, reviews } from '../data'

export default function Reviews() {
  return (
    <section id="reviews" className="relative py-28 md:py-40">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Heading index="06" eyebrow="Отзывы" title="Нам доверяют" />
          <a href={company.map} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-bone/70 hover:text-bone">
            Все отзывы на Яндекс Картах
            <span className="arrow-dot !h-9 !w-9 group-hover:rotate-45">↗</span>
          </a>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {reviews.map((r) => (
            <SpotlightCard key={r.name} spotlightColor="rgba(255, 200, 140, 0.16)" className="flex h-full flex-col justify-between !rounded-none border border-white/[0.08] !bg-white/[0.02] p-8 md:p-10">
              <div>
                <div className="mb-6 flex gap-1 text-oak" aria-label="Оценка 5 из 5">{'★★★★★'}</div>
                <p className="font-display text-[19px] font-light leading-[1.5] text-bone/90">«{r.text}»</p>
              </div>
              <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-5 text-[11px] uppercase tracking-[0.22em]">
                <span>{r.name}</span><span className="text-mute">{r.date}</span>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  )
}
