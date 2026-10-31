import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useLang } from '../i18n'
import { calendarOrder } from '../config/seasons'
import { useCatalog } from '../data/catalog'
import { inStockFirst } from '../lib/useShop'
import { FieldSection } from '../components/Field'
import { DuoPhoto } from '../components/DuoPhoto'
import { ProductCard } from '../components/ProductCard'
import { EnquiryDrawer } from '../components/EnquiryDrawer'
import { WhatsAppIcon } from '../components/Icons'
import { usePageTitle } from '../lib/usePageTitle'
import { NotFound } from './NotFound'

const D = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties

/* ---------------- /seasons: the year, one field per season ---------------- */

export function Seasons() {
  const { t, pick } = useLang()
  usePageTitle(t('seasons_title'), t('seasons_sub'))
  const { currentSeason, seasonById } = useCatalog()
  const now = currentSeason()

  return (
    <>
      <FieldSection field="chalk">
        <div className="mx-auto max-w-[1400px] px-4 pt-12 pb-16 sm:px-10 sm:pt-20 sm:pb-24">
          <h1 className="enter text-[clamp(3.4rem,12vw,11rem)] leading-[0.9] font-bold tracking-[-0.06em]">{t('seasons_title')}</h1>
          <p className="enter ink-2 mt-7 max-w-[34rem] text-[17px] leading-relaxed sm:text-[19px]" style={D(80)}>
            {t('seasons_sub')}
          </p>
        </div>
      </FieldSection>

      <ul className="mx-auto grid max-w-[1400px] gap-4 px-4 pb-28 sm:grid-cols-2 sm:gap-5 sm:px-10 lg:grid-cols-3" role="list">
        {calendarOrder.map((id) => {
          const s = seasonById(id)
          if (!s) return null
          const status = s.allYear ? t('all_year') : s.id === now.season.id ? (now.upcoming ? t('coming_up') : t('now_in')) : null
          return (
            <li key={id} className="reveal">
              <Link
                to={`/seasons/${s.id}`}
                viewTransition
                data-field={s.id}
                className="press group flex h-full flex-col rounded-[34px] bg-[var(--field)] p-3 text-[var(--ink)] no-underline"
              >
                <span className="relative block">
                  <DuoPhoto file={s.image} season={s.id} alt={pick(s.alt)} className="aspect-[4/3] rounded-[26px]" />
                  {status && (
                    <span className="absolute top-3 left-3 rounded-full bg-[var(--field)] px-3 py-1 text-[13px] font-semibold">{status}</span>
                  )}
                </span>
                <span className="flex flex-1 flex-col px-2 pt-4 pb-2">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-[26px] font-bold tracking-[-0.04em]">{pick(s.name)}</span>
                    <span className="text-[14px] font-semibold opacity-80">{pick(s.months)}</span>
                  </span>
                  <span className="mt-2 block text-[15px] opacity-85">{pick(s.line)}</span>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[15px] font-semibold underline">
                    {t('season_view')} <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out)] [@media(hover:hover)]:group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </>
  )
}

/* ---------------- /seasons/:id ---------------- */

export function SeasonDetail() {
  const { id = '' } = useParams()
  const { seasonById, products } = useCatalog()
  const s = seasonById(id)
  const { t, pick } = useLang()
  const [ask, setAsk] = useState(false)
  usePageTitle(s ? pick(s.name) : undefined, s ? pick(s.line) : undefined)
  if (!s) return <NotFound />
  const list = inStockFirst(products.filter((p) => p.season === s.id))

  return (
    <>
      <FieldSection inset field={s.id}>
        <div className="mx-auto max-w-[1400px] px-4 pt-6 pb-20 sm:px-10 sm:pt-8 sm:pb-28">
          <Link
            to="/seasons"
            viewTransition
            className="enter press ink-2 -ml-1 inline-flex min-h-11 items-center gap-2 px-1 text-[15px] font-medium no-underline [@media(hover:hover)]:hover:underline"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} /> {t('seasons_title')}
          </Link>

          <div className="mt-6 grid gap-10 lg:mt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16">
            <div>
              <p className="enter text-[15px] font-medium" style={D(40)}>
                {s.allYear ? t('all_year') : pick(s.months)}
              </p>
              <h1 className="enter mt-3 text-[clamp(3.2rem,10vw,9.2rem)] leading-[0.9] font-bold tracking-[-0.06em]" style={D(80)}>
                {pick(s.name)}
              </h1>
              <p className="enter ink-2 mt-6 max-w-[30rem] text-[17px] leading-relaxed sm:text-[19px]" style={D(160)}>
                {pick(s.line)}
              </p>
              <ul className="enter hair mt-9 grid max-w-xl border-t sm:grid-cols-2 sm:gap-x-10" role="list" style={D(220)}>
                {s.items.map((it) => (
                  <li key={it.en} className="hair border-b py-3.5 text-[16px] font-medium">
                    {pick(it)}
                  </li>
                ))}
              </ul>
              <div className="enter mt-9" style={D(280)}>
                <button type="button" onClick={() => setAsk(true)} className="btn btn-ink press w-full sm:w-auto">
                  <WhatsAppIcon /> {t('season_enquire')}
                </button>
              </div>
            </div>

            <div className="enter grid grid-cols-2 gap-3 sm:gap-4" style={D(140)}>
              <DuoPhoto file={s.image} season={s.id} alt={pick(s.alt)} eager className="col-span-2 aspect-[4/3] rounded-[28px] lg:aspect-[5/4]" />
              {s.photos.map((f, i) => (
                <DuoPhoto key={`${i}-${f.slice(0, 80)}`} file={f} season={s.id} alt="" className="aspect-square rounded-[22px]" />
              ))}
            </div>
          </div>
        </div>
      </FieldSection>

      {list.length > 0 && (
        <FieldSection field="chalk">
          <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-10 sm:py-28">
            <h2 className="reveal text-[clamp(2.2rem,5vw,4.4rem)] leading-none font-bold tracking-[-0.05em]">{t('in_this_season')}</h2>
            <ul className="hair mt-10 grid grid-cols-2 gap-x-4 gap-y-10 border-t pt-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4" role="list">
              {list.map((p) => (
                <ProductCard key={p.slug} p={p} />
              ))}
            </ul>
          </div>
        </FieldSection>
      )}

      <EnquiryDrawer open={ask} onOpenChange={setAsk} product={`${s.name.en} items`} season={s.name.en} />
    </>
  )
}
