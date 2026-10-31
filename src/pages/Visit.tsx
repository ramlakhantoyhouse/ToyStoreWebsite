import { ArrowUpRight, Phone } from 'lucide-react'
import { useLang } from '../i18n'
import { directionsHref, shop } from '../config/shop'
import { useShop } from '../lib/useShop'
import { FieldSection } from '../components/Field'
import { WhatsAppIcon } from '../components/Icons'
import { MapFrame } from '../components/MapFrame'
import { usePageTitle } from '../lib/usePageTitle'

const D = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties

export function Visit() {
  const { t } = useLang()
  usePageTitle(t('nav_visit'))
  const { open, dow, week, tel, phoneDisplay, wa } = useShop()
  return (
    <FieldSection field="chalk">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 pt-10 pb-24 sm:px-10 sm:pt-16 sm:pb-32 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <div>
          <h1 className="enter text-[clamp(3rem,9vw,8.4rem)] leading-[0.9] font-bold tracking-[-0.06em]">{t('visit_title')}</h1>
          <p className="enter ink-2 mt-6 max-w-[30rem] text-[17px] leading-relaxed sm:text-[18px]" style={D(80)}>
            {t('visit_sub')}
          </p>

          <address
            className="enter mt-10 text-[clamp(1.6rem,3.4vw,2.7rem)] leading-[1.05] font-bold tracking-[-0.045em] not-italic"
            style={D(160)}
          >
            {shop.address.line1},
            <br />
            {shop.address.line2},
            <br />
            {shop.address.city}
          </address>

          <div className="enter mt-9 grid gap-3 sm:flex sm:flex-wrap" style={D(240)}>
            <a href={directionsHref} target="_blank" rel="noreferrer" className="btn btn-ink press">
              {t('directions')} <ArrowUpRight className="size-4" />
            </a>
            <a href={tel} className="btn btn-line press">
              <Phone className="size-[18px]" strokeWidth={1.75} /> {phoneDisplay}
            </a>
            <a href={wa()} target="_blank" rel="noreferrer" className="btn btn-line press">
              <WhatsAppIcon /> {t('wa_us')}
            </a>
          </div>

          <div className="reveal mt-14">
            <h2 className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-[clamp(1.6rem,2.6vw,2.2rem)] font-bold tracking-[-0.045em]">
              {t('hours')}
              <span className="inline-flex items-center gap-2.5 text-[15px] font-medium tracking-normal">
                <span className={`size-2 rounded-full ${open ? 'bg-[var(--ink)]' : 'border-[1.5px] border-[var(--ink)]'}`} />
                {open ? t('open_now') : t('closed_now')}
              </span>
            </h2>
            <dl className="hair mt-5 grid max-w-xl border-t text-[16px] sm:text-[17px]">
              {week.map((h) => {
                const today = h.dow === dow
                return (
                  <div
                    key={h.dow}
                    aria-current={today ? 'date' : undefined}
                    className={`hair flex justify-between gap-6 border-b py-3.5 ${today ? 'font-semibold' : 'ink-2'}`}
                  >
                    <dt>
                      {h.day}
                      {today && <span className="ml-2 font-medium">· {t('today')}</span>}
                    </dt>
                    <dd className="m-0 text-right">{h.hours}</dd>
                  </div>
                )
              })}
            </dl>
          </div>
        </div>

        <div className="enter lg:sticky lg:top-[96px] lg:self-start" style={D(200)}>
          <MapFrame />
        </div>
      </div>
    </FieldSection>
  )
}
