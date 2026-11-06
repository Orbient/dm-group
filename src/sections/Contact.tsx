import { useState, type FormEvent } from 'react'
import Img from '../components/Img'
import Magnet from '../components/rb/Magnet/Magnet'
import { company } from '../data'

const kinds = ['Монолитная', 'Облицовка', 'Стеклянное ограждение', 'На металлокаркасе', 'Крыльцо']

type Status = 'idle' | 'sending' | 'ok' | 'error' | 'demo'

export default function Contact() {
  const [kind, setKind] = useState<string[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [started] = useState(() => Date.now())

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    if (f.get('website')) return // honeypot
    if (Date.now() - started < 2500) return // filled faster than a human can
    setStatus('sending')
    const body = { name: f.get('name'), phone: f.get('phone'), kind: kind.join(', '), comment: f.get('comment'), page: location.href }
    try {
      if (import.meta.env.DEV) { await new Promise((r) => setTimeout(r, 900)); setStatus('ok'); return }
      // demo build (GitHub Pages) has no server: say so honestly instead of pretending the lead was sent
      if (import.meta.env.VITE_DEMO === '1') { setStatus('demo'); return }
      const res = await fetch(`${import.meta.env.BASE_URL}lead.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      setStatus(res.ok ? 'ok' : 'error')
    } catch { setStatus('error') }
  }

  const field = 'peer w-full border-b border-white/15 bg-transparent pb-3 pt-6 text-[15px] text-bone outline-none transition-colors placeholder:text-transparent focus:border-oak'
  const label = 'pointer-events-none absolute left-0 top-6 text-[11px] uppercase tracking-[0.24em] text-mute transition-all duration-300 peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-oak peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px]'

  return (
    <section id="contact" className="relative overflow-hidden py-28 md:py-40">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] md:block" aria-hidden>
        <Img name="spiral" widths={[600, 896]} sizes="52vw" alt="" className="h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/50 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink" />
      </div>

      <div className="relative mx-auto max-w-[1600px] px-5 md:px-10">
        <p className="eyebrow mb-5 flex items-center gap-3"><span className="text-bone/80">07</span><span className="h-px w-8 bg-white/20" />Заявка</p>
        <h2 className="display text-[clamp(38px,6.4vw,92px)]">Почувствуйте фактуру</h2>
        <p className="mt-6 max-w-[460px] text-[15px] leading-relaxed text-bone/65">Оставьте телефон — перезвоним в течение часа в рабочее время, ответим на вопросы и договоримся о бесплатном замере.</p>

        <div className="mt-14 grid gap-16 md:grid-cols-[minmax(0,560px)_1fr]">
          {status === 'ok' ? (
            <div className="border border-white/10 p-10">
              <p className="display text-3xl">Заявка принята</p>
              <p className="mt-4 text-bone/65">Перезвоним с номера {company.phone}. Если удобнее — напишите нам в Telegram.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-8" noValidate={false}>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
              <div className="relative">
                <input id="f-name" name="name" required placeholder="Имя" autoComplete="name" className={field} />
                <label htmlFor="f-name" className={label}>Имя</label>
              </div>
              <div className="relative">
                <input id="f-phone" name="phone" type="tel" required placeholder="Телефон" autoComplete="tel" inputMode="tel" pattern="[\d\s\-\+\(\)]{10,}" className={field} />
                <label htmlFor="f-phone" className={label}>Телефон</label>
              </div>
              <fieldset>
                <legend className="mb-4 text-[11px] uppercase tracking-[0.24em] text-mute">Что нужно</legend>
                <div className="flex flex-wrap gap-2">
                  {kinds.map((k) => {
                    const on = kind.includes(k)
                    return (
                      <button type="button" key={k} aria-pressed={on} onClick={() => setKind((v) => (on ? v.filter((x) => x !== k) : [...v, k]))}
                        className={`rounded-full border px-4 py-2 text-[12px] tracking-wide transition-colors duration-300 ${on ? 'border-oak bg-oak text-ink' : 'border-white/15 text-bone/75 hover:border-white/40'}`}>{k}</button>
                    )
                  })}
                </div>
              </fieldset>
              <div className="relative">
                <input id="f-comment" name="comment" placeholder="Комментарий" className={field} />
                <label htmlFor="f-comment" className={label}>Комментарий, если есть</label>
              </div>
              <label className="flex cursor-pointer items-start gap-3 text-[12px] leading-relaxed text-bone/60">
                <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 shrink-0 accent-[#c99b62]" />
                <span>Даю согласие на обработку персональных данных в соответствии с <a href="/consent" className="underline decoration-white/30 underline-offset-4 hover:text-bone">условиями</a> и <a href="/privacy" className="underline decoration-white/30 underline-offset-4 hover:text-bone">политикой</a></span>
              </label>
              <div className="flex items-center gap-2">
                <Magnet padding={50} magnetStrength={4}>
                  <button type="submit" disabled={status === 'sending'} className="pill pill-solid disabled:opacity-60">{status === 'sending' ? 'Отправляем…' : 'Отправить заявку'}</button>
                </Magnet>
                <span className="arrow-dot" aria-hidden>→</span>
              </div>
              {status === 'demo' && <p className="text-sm text-oak">Это демо-версия сайта — заявки с неё пока не отправляются. Позвоните: <a className="underline" href={company.phoneHref}>{company.phone}</a></p>}
              {status === 'error' && <p className="text-sm text-[#e8a07a]">Не получилось отправить. Позвоните нам: <a className="underline" href={company.phoneHref}>{company.phone}</a></p>}
            </form>
          )}

          <div className="grid content-end gap-10 text-sm sm:grid-cols-2 md:pb-2">
            <div>
              <p className="eyebrow mb-3 !text-[10px]">Телефон</p>
              <a href={company.phoneHref} className="display text-2xl tracking-[0.06em] hover:text-oak">{company.phone}</a>
              <p className="mt-1 text-mute">{company.hours}</p>
            </div>
            <div>
              <p className="eyebrow mb-3 !text-[10px]">Мессенджеры</p>
              <div className="flex gap-4">
                <a href={company.telegram} target="_blank" rel="noreferrer" className="hover:text-oak">Telegram</a>
                <a href={company.whatsapp} target="_blank" rel="noreferrer" className="hover:text-oak">WhatsApp</a>
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className="eyebrow mb-3 !text-[10px]">Офис</p>
              <p>{company.address}</p>
              <p className="text-mute">{company.addressNote}</p>
              <a href={company.map} target="_blank" rel="noreferrer" className="mt-3 inline-block text-[11px] uppercase tracking-[0.24em] text-oak hover:text-bone">Показать на карте ↗</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
