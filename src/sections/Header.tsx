import { useEffect, useRef, useState } from 'react'
import { company, nav } from '../data'
import { gsap, lenis, scrollToId } from '../lib/smooth'

export default function Header({ ready }: { ready: boolean }) {
  const bar = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const menu = useRef<HTMLDivElement>(null)

  // Hide on scroll down, show on scroll up; get a glass backing once past the hero
  useEffect(() => {
    let last = window.scrollY
    let hidden = false
    let wasSolid = false
    const onScroll = () => {
      const y = window.scrollY
      const solidNow = y > window.innerHeight * 0.85
      if (solidNow !== wasSolid) { wasSolid = solidNow; setSolid(solidNow) }
      const down = y > last && y > 200
      if (down !== hidden) {
        hidden = down
        gsap.to(bar.current, { yPercent: down ? -110 : 0, duration: 0.7, ease: 'expo.out' })
      }
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!ready || !bar.current) return
    gsap.fromTo(bar.current.querySelectorAll('[data-in]'), { y: -18, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.06, delay: 0.5 })
  }, [ready])

  useEffect(() => {
    if (!menu.current) return
    if (open) {
      lenis?.stop()
      gsap.timeline()
        .set(menu.current, { display: 'flex' })
        .fromTo(menu.current, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'expo.inOut' })
        .fromTo(menu.current.querySelectorAll('[data-m]'), { yPercent: 120 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06 }, '-=0.35')
    } else {
      lenis?.start()
      gsap.to(menu.current, { clipPath: 'inset(0 0 100% 0)', duration: 0.7, ease: 'expo.inOut', onComplete: () => { if (menu.current) menu.current.style.display = 'none' } })
    }
  }, [open])

  const go = (id: string) => { setOpen(false); setTimeout(() => scrollToId(id), open ? 450 : 0) }

  return (
    <>
      <header ref={bar} className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-700 ${solid ? 'border-b border-white/[0.06] bg-ink/90' : 'border-b border-transparent'}`}>
        <div className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between px-5 md:px-10">
          <button data-in onClick={() => go('top')} className="display text-[13px] tracking-[0.5em] opacity-0" aria-label="DM Group — наверх">DM&nbsp;GROUP</button>
          <nav className="hidden items-center gap-9 lg:flex" aria-label="Основное меню">
            {nav.map((n) => (
              <button data-in key={n.id} onClick={() => go(n.id)} className="group relative text-[11px] uppercase tracking-[0.24em] text-bone/70 opacity-0 transition-colors hover:text-bone">
                {n.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-full origin-right scale-x-0 bg-oak transition-transform duration-500 ease-out-expo group-hover:origin-left group-hover:scale-x-100" />
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a data-in href={company.phoneHref} className="hidden text-[13px] tracking-[0.08em] text-bone/80 opacity-0 transition-colors hover:text-oak md:block">{company.phone}</a>
            <button data-in onClick={() => go('contact')} className="pill hidden h-10 opacity-0 sm:inline-flex">Рассчитать</button>
            <button data-in onClick={() => setOpen((v) => !v)} className="relative grid h-10 w-10 place-items-center opacity-0 lg:hidden" aria-label={open ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={open}>
              <span className={`absolute h-px w-6 bg-bone transition-transform duration-500 ease-out-expo ${open ? 'rotate-45' : '-translate-y-[4px]'}`} />
              <span className={`absolute h-px w-6 bg-bone transition-transform duration-500 ease-out-expo ${open ? '-rotate-45' : 'translate-y-[4px]'}`} />
            </button>
          </div>
        </div>
      </header>

      <div ref={menu} className="fixed inset-0 z-40 hidden flex-col justify-between bg-coal px-5 pb-10 pt-28" style={{ clipPath: 'inset(0 0 100% 0)' }}>
        <ul className="space-y-2">
          {[{ id: 'top', label: 'Главная' }, ...nav].map((n, i) => (
            <li key={n.id} className="overflow-hidden">
              <button data-m onClick={() => go(n.id)} className="display flex w-full items-baseline gap-4 py-1 text-left text-[clamp(34px,9vw,64px)]">
                <span className="font-sans text-[11px] tracking-[0.2em] text-mute">0{i + 1}</span>{n.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="overflow-hidden">
          <div data-m className="space-y-2 text-sm text-bone/70">
            <a href={company.phoneHref} className="block text-2xl text-bone">{company.phone}</a>
            <p>{company.address}</p>
          </div>
        </div>
      </div>
    </>
  )
}
