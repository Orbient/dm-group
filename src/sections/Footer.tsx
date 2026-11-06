import { company, nav, services } from '../data'
import { scrollToId } from '../lib/smooth'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.07] pt-20">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-5 text-[13px] sm:grid-cols-2 md:grid-cols-4 md:px-10">
        <div>
          <p className="eyebrow mb-5 !text-[10px] !text-bone">Разделы</p>
          <ul className="space-y-2.5 text-bone/60">{nav.map((n) => <li key={n.id}><button onClick={() => scrollToId(n.id)} className="hover:text-bone">{n.label}</button></li>)}</ul>
        </div>
        <div>
          <p className="eyebrow mb-5 !text-[10px] !text-bone">Услуги</p>
          <ul className="space-y-2.5 text-bone/60">{services.map((s) => <li key={s.n}>{s.title}</li>)}</ul>
        </div>
        <div>
          <p className="eyebrow mb-5 !text-[10px] !text-bone">Контакты</p>
          <ul className="space-y-2.5 text-bone/60">
            <li><a href={company.phoneHref} className="hover:text-bone">{company.phone}</a></li>
            <li>{company.address}</li>
            <li>{company.hours}</li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-5 !text-[10px] !text-bone">Написать</p>
          <div className="flex gap-2">
            <a href={company.telegram} target="_blank" rel="noreferrer" className="arrow-dot !h-10 !w-10 text-[11px] hover:bg-white/5" title="Telegram">TG</a>
            <a href={company.whatsapp} target="_blank" rel="noreferrer" className="arrow-dot !h-10 !w-10 text-[11px] hover:bg-white/5" title="WhatsApp">WA</a>
            <a href={company.phoneHref} className="arrow-dot !h-10 !w-10 text-[13px] hover:bg-white/5" aria-label="Позвонить">✆</a>
          </div>
        </div>
      </div>

      <p aria-hidden className="display metal mt-20 select-none whitespace-nowrap text-center text-[min(calc((100vw-40px)/5.7),272px)] leading-[0.8] opacity-60">DM GROUP</p>

      <div className="mx-auto flex max-w-[1600px] flex-col justify-between gap-3 border-t border-white/[0.07] px-5 py-6 text-[11px] tracking-[0.12em] text-mute sm:flex-row md:px-10">
        <span>© {new Date().getFullYear()} DM Group · Лестницы и ограждения · Екатеринбург</span>
        <span className="flex gap-6"><a href="/privacy" className="hover:text-bone">Политика конфиденциальности</a><a href="https://orbient.pro" target="_blank" rel="noreferrer" className="hover:text-bone">Сайт — Orbient</a></span>
      </div>
    </footer>
  )
}
