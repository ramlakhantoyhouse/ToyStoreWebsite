import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Phone, Truck } from 'lucide-react'
import { useLang } from '../i18n'
import { useCatalog } from '../data/catalog'
import type { Season } from '../config/seasons'
import { seasonStyle } from '../lib/seasonColor'
import { directionsHref, shop } from '../config/shop'
import { inStockFirst, useShop } from '../lib/useShop'
import { FieldSection, type FieldId } from '../components/Field'
import { Photo } from '../components/DuoPhoto'
import { ProductCard } from '../components/ProductCard'
import { Tilt } from '../components/Tilt'
import { MapFrame } from '../components/MapFrame'
import { WhatsAppIcon } from '../components/Icons'
import { EnquiryDrawer } from '../components/EnquiryDrawer'
import { usePageTitle } from '../lib/usePageTitle'

const D = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties
const BLOCKS: FieldId[] = ['red', 'yellow', 'blue', 'green', 'pink', 'orange', 'yellow']

export function Home() {
  usePageTitle()
  const now = useCatalog().currentSeason()
  const [ask, setAsk] = useState<Season | null>(null)

  return (
    <>
      <Hero />
      <Marquee />
      <Categories />
      <Shelf />
      <Delivery />
      <SeasonsRow current={now.season.id} upcoming={now.upcoming} onAsk={setAsk} />
      <Wholesale />
      <Visit />
      <EnquiryDrawer
        open={!!ask}
        onOpenChange={(o) => {
          if (!o) setAsk(null)
        }}
        product={ask ? `${ask.name.en} items` : ''}
        season={ask?.name.en}
      />
    </>
  )
}

/* ---------------- Hero: toys in colour blocks ---------------- */

// Five fixed slots on the toy shelf; what fills them comes from the live catalogue.
const heroSlots: { field: FieldId; cls: string; r0: string; r1: string; d: number }[] = [
  { field: 'red', cls: 'col-span-4 row-span-4', r0: '-7deg', r1: '-1.5deg', d: 120 },
  { field: 'yellow', cls: 'col-span-2 row-span-3', r0: '9deg', r1: '2deg', d: 220 },
  { field: 'blue', cls: 'col-span-2 row-span-3', r0: '-10deg', r1: '-1deg', d: 320 },
  { field: 'green', cls: 'col-span-2 row-span-2', r0: '8deg', r1: '1.5deg', d: 420 },
  { field: 'pink', cls: 'col-span-2 row-span-2', r0: '-6deg', r1: '-2deg', d: 520 },
]

type HeroItem = { key: string; file: string; label: { en: string; hi: string }; to: string }

/**
 * Big slot: the Toys category (or the first category). Small slots: in-stock
 * "Popular" products first, then other in-stock products, then categories.
 * So removing or hiding a product in /admin removes it here too.
 */
function useHeroItems(): HeroItem[] {
  const { products, categories } = useCatalog()
  const lead = categories.find((c) => c.id === 'toys') ?? categories[0]
  const items: HeroItem[] = []
  if (lead) items.push({ key: `c-${lead.id}`, file: lead.image, label: lead.name, to: `/products?c=${lead.id}` })
  const usable = products.filter((p) => p.inStock !== false && p.images[0])
  // it's a toy house: popular toys & sports first, then other popular items, then the rest
  // Popular products always come first (newest first, since new products get the lowest sort);
  // toys & sports only break ties among the rest.
  const rank = (p: (typeof usable)[number]) => (p.featured ? 0 : 2) + (p.featured || p.category === 'toys' || p.category === 'sports' ? 0 : 1)
  const ordered = [...usable].sort((a, b) => rank(a) - rank(b) || (a.sort ?? 0) - (b.sort ?? 0))
  for (const p of ordered) {
    if (items.length >= heroSlots.length) break
    if (items.some((x) => x.file === p.images[0])) continue
    items.push({ key: `p-${p.slug}`, file: p.images[0], label: p.name, to: `/products/${p.slug}` })
  }
  for (const c of categories) {
    if (items.length >= heroSlots.length) break
    if (items.some((x) => x.key === `c-${c.id}` || x.file === c.image)) continue
    items.push({ key: `c-${c.id}`, file: c.image, label: c.name, to: `/products?c=${c.id}` })
  }
  return items
}

function Hero() {
  const { t, pick } = useLang()
  const items = useHeroItems()
  const { open, todayHours, wa, tel } = useShop()
  return (
    <section className="mx-auto grid max-w-[1400px] items-center gap-12 px-4 pt-6 pb-16 sm:px-10 lg:min-h-[min(calc(100svh-72px),860px)] lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:pt-4 lg:pb-20">
      <div>
        <p className="enter inline-flex items-center gap-2.5 rounded-full bg-[var(--card)] py-2 pr-4 pl-3 text-[14px] font-medium">
          <span className={`size-2.5 rounded-full ${open ? 'bg-[var(--t-green)]' : 'bg-[color-mix(in_srgb,var(--ink)_35%,transparent)]'}`} />
          {open ? t('open_now') : t('closed_now')}
          <span className="ink-2">
            · {t('today')} {todayHours}
          </span>
        </p>
        <h1 className="enter mt-6 text-[clamp(3rem,8.2vw,7.6rem)] leading-[0.92] font-bold tracking-[-0.06em]" style={D(80)}>
          {t('toy_title')}
        </h1>
        <p className="enter ink-2 mt-7 max-w-[32rem] text-[17px] leading-relaxed sm:text-[19px]" style={D(160)}>
          {t('toy_sub')}
        </p>
        <div className="enter mt-9 flex flex-wrap gap-3" style={D(240)}>
          <a href={wa('Namaste! I have a question about Ram Lakhan Toy House.')} target="_blank" rel="noreferrer" className="btn btn-ink press flex-1 sm:flex-none">
            <WhatsAppIcon /> {t('wa_us')}
          </a>
          <a href={tel} className="btn btn-line press flex-1 sm:flex-none">
            <Phone className="size-[18px]" strokeWidth={2} /> {t('call')}
          </a>
        </div>
      </div>

      {/* the toy shelf: five blocks tumble in and settle */}
      <div className="grid aspect-square grid-cols-6 grid-rows-6 gap-3 sm:gap-4 lg:aspect-[1/0.95]">
        {items.map((it, i) => {
          const b = heroSlots[i]
          return (
            <Tilt key={it.key} className={b.cls}>
              <Link
                to={it.to}
                viewTransition
                data-field={b.field}
                className="tumble press group block-shadow relative block h-full overflow-hidden rounded-[30px] bg-[var(--field)] p-2.5 text-[var(--ink)] no-underline sm:rounded-[36px] sm:p-3"
                style={{ '--d': `${b.d}ms`, '--r0': b.r0, '--r1': b.r1 } as React.CSSProperties}
              >
                <Photo file={it.file} alt={pick(it.label)} eager className="h-full rounded-[22px] sm:rounded-[28px]" />
                <span className="absolute bottom-4 left-4 max-w-[calc(100%-2rem)] truncate rounded-full bg-[var(--field)] px-3 py-1 text-[13px] font-semibold sm:bottom-5 sm:left-5 sm:text-[14px]">
                  {pick(it.label)}
                </span>
              </Link>
            </Tilt>
          )
        })}
      </div>
    </section>
  )
}

/* ---------------- Marquee ---------------- */

function Marquee() {
  const { t } = useLang()
  const words = t('marquee').split(' · ')
  const row = (
    <span className="flex shrink-0 items-center gap-8 pr-8" aria-hidden="true">
      {words.map((w, i) => (
        <span key={i} className="flex items-center gap-8">
          <span>{w}</span>
          <span className={`size-3 rounded-[4px] ${['bg-[var(--t-red)]', 'bg-[var(--t-yellow)]', 'bg-[var(--t-blue)]', 'bg-[var(--t-green)]'][i % 4]}`} />
        </span>
      ))}
    </span>
  )
  return (
    <FieldSection field="indigo" className="overflow-hidden py-5 sm:py-6">
      <p className="sr-only">{t('marquee')}</p>
      <div className="marquee flex w-max text-[clamp(1.2rem,2.4vw,1.8rem)] font-bold tracking-[-0.03em]">
        {row}
        {row}
      </div>
    </FieldSection>
  )
}

/* ---------------- Categories ---------------- */

function Categories() {
  const { t, pick } = useLang()
  const { categories, products } = useCatalog()
  const count = (id: string) => products.filter((p) => p.category === id).length
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-24 sm:px-10 sm:py-32">
      <div className="reveal flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-[clamp(2.4rem,5.4vw,4.8rem)] font-bold tracking-[-0.055em]">{t('shop_by')}</h2>
        <Link to="/products" viewTransition className="press inline-flex items-center gap-1.5 text-[16px] font-semibold underline">
          {t('see_all')} <ArrowRight className="size-4" />
        </Link>
      </div>
      <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4" role="list">
        {categories.map((c, i) => (
          <li key={c.id} className={`reveal ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
            <Tilt className="h-full" max={5}>
              <Link
                to={`/products?c=${c.id}`}
                viewTransition
                data-field={BLOCKS[i % BLOCKS.length]}
                className="press group flex h-full flex-col rounded-[30px] bg-[var(--field)] p-2.5 text-[var(--ink)] no-underline sm:rounded-[36px] sm:p-3"
              >
                <Photo file={c.image} alt="" className={`rounded-[22px] sm:rounded-[28px] ${i === 0 ? 'aspect-[4/3] flex-1 lg:aspect-auto' : 'aspect-square'}`} />
                <span className="flex items-center justify-between gap-3 px-2.5 pt-3.5 pb-2 sm:px-3">
                  <span className={`font-bold tracking-[-0.03em] ${i === 0 ? 'text-[clamp(1.6rem,3vw,2.4rem)]' : 'text-[18px] sm:text-[20px]'}`}>{pick(c.name)}</span>
                  <span className="flex items-center gap-1.5 text-[14px] font-semibold">
                    {count(c.id)}
                    <ArrowUpRight className="size-4 transition-transform duration-300 ease-[var(--ease-out)] [@media(hover:hover)]:group-hover:translate-x-0.5 [@media(hover:hover)]:group-hover:-translate-y-0.5" />
                  </span>
                </span>
              </Link>
            </Tilt>
          </li>
        ))}
        <li className="reveal col-span-2">
          <Link
            to="/products"
            viewTransition
            data-field="indigo"
            className="press group flex h-full min-h-[140px] items-center justify-between rounded-[30px] bg-[var(--field)] p-6 text-[var(--ink)] no-underline sm:rounded-[36px] sm:p-8"
          >
            <span className="text-[clamp(1.5rem,2.6vw,2.2rem)] font-bold tracking-[-0.04em]">{t('see_all')}</span>
            <span data-field="yellow" className="grid size-14 place-items-center rounded-full bg-[var(--field)] text-[var(--ink)] transition-transform duration-500 ease-[var(--spring)] [@media(hover:hover)]:group-hover:rotate-[-12deg]">
              <ArrowRight className="size-6" />
            </span>
          </Link>
        </li>
      </ul>
    </section>
  )
}

/* ---------------- Popular on the shelf ---------------- */

function Shelf() {
  const { t } = useLang()
  const { products } = useCatalog()
  // The owner picks these with the "Popular" switch in /admin; topped up with other in-stock products.
  const inStock = inStockFirst(products).filter((p) => p.inStock !== false)
  const list = [...inStock.filter((p) => p.featured), ...inStock.filter((p) => !p.featured)].slice(0, 8)
  return (
    <FieldSection field="chalk" className="pb-24 sm:pb-32">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-10">
        <h2 className="reveal text-[clamp(2.4rem,5.4vw,4.8rem)] font-bold tracking-[-0.055em]">{t('popular')}</h2>
        <p className="reveal ink-2 mt-4 max-w-lg text-[17px]">{t('popular_sub')}</p>
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4" role="list">
          {list.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </ul>
      </div>
    </FieldSection>
  )
}

/* ---------------- Seasons: one section, fixed colours ---------------- */

function SeasonsRow({ current, upcoming, onAsk }: { current: string; upcoming: boolean; onAsk: (s: Season) => void }) {
  const { t, pick } = useLang()
  const { seasons: order } = useCatalog()
  return (
    <section className="pb-24 sm:pb-32">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-4 px-4 sm:px-10">
        <div>
          <h2 className="reveal text-[clamp(2.4rem,5.4vw,4.8rem)] font-bold tracking-[-0.055em]">{t('through_year')}</h2>
          <p className="reveal ink-2 mt-4 max-w-lg text-[17px]">{t('seasons_sub')}</p>
        </div>
        <Link to="/seasons" viewTransition className="press inline-flex items-center gap-1.5 text-[16px] font-semibold underline">
          {t('nav_seasons')} <ArrowRight className="size-4" />
        </Link>
      </div>
      <ul className="scrollbar-none mx-auto mt-12 flex max-w-[1400px] snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-6 sm:gap-5 sm:scroll-px-10 sm:px-10" role="list">
        {order.map((s) => {
          const isNow = s.id === current
          return (
            <li key={s.id} className="w-[78%] shrink-0 snap-start sm:w-[340px]">
              <div data-field={s.id} style={seasonStyle(s)} className="flex h-full flex-col rounded-[34px] bg-[var(--field)] p-3 text-[var(--ink)]">
                <Link to={`/seasons/${s.id}`} viewTransition className="press group relative block no-underline">
                  <Photo file={s.image} alt={pick(s.alt)} className="aspect-[4/3] rounded-[26px]" />
                  {(isNow || s.allYear) && (
                    <span className="absolute top-3 left-3 rounded-full bg-[var(--field)] px-3 py-1 text-[13px] font-semibold">
                      {s.allYear ? t('all_year') : upcoming ? t('coming_up') : t('now_in')}
                    </span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col px-2 pt-4 pb-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[24px] font-bold tracking-[-0.04em]">{pick(s.name)}</h3>
                    <span className="text-[14px] font-semibold opacity-80">{pick(s.months)}</span>
                  </div>
                  <p className="mt-2 text-[15px] opacity-85">{pick(s.line)}</p>
                  <button type="button" onClick={() => onAsk(s)} className="press mt-auto inline-flex min-h-11 cursor-pointer items-center gap-2 self-start border-0 bg-transparent p-0 pt-4 text-[15px] font-semibold text-[var(--ink)] underline">
                    {t('season_enquire')} <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* ---------------- Wholesale ---------------- */

/* ---------------- Delivery within Delhi (ordered on call, no online payment) ---------------- */

function Delivery() {
  const { t } = useLang()
  const { wa, tel } = useShop()
  const steps = (['deliv_1', 'deliv_2', 'deliv_3'] as const).map((k, i) => ({ k, field: (['yellow', 'green', 'red'] as const)[i] }))
  return (
    <section className="px-4 pb-24 sm:px-10 sm:pb-32">
      <div data-field="blue" className="reveal mx-auto grid max-w-[1400px] gap-10 overflow-hidden rounded-[40px] bg-[var(--field)] p-8 text-[var(--ink)] sm:p-14 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:p-20">
        <div>
          <span data-field="yellow" className="grid size-16 place-items-center rounded-[20px] bg-[var(--field)] text-[var(--ink)]">
            <Truck className="size-8" strokeWidth={2} />
          </span>
          <h2 className="mt-7 text-[clamp(2.2rem,5vw,4.6rem)] leading-[0.95] font-bold tracking-[-0.05em]">{t('deliv_title')}</h2>
          <p className="mt-5 max-w-lg text-[17px] opacity-90 sm:text-[18px]">{t('deliv_sub')}</p>
        </div>
        <div>
          <ol className="grid gap-3" role="list">
            {steps.map(({ k, field }, i) => (
              <li key={k} className="flex items-center gap-4 rounded-[22px] bg-[color-mix(in_srgb,var(--ink)_12%,transparent)] p-4 text-[17px] font-semibold">
                <span data-field={field} className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-[var(--field)] text-[16px] text-[var(--ink)] tabular-nums">
                  {i + 1}
                </span>
                {t(k)}
              </li>
            ))}
          </ol>
          <p className="mt-5 text-[15px] font-medium opacity-90">{t('deliv_note')}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={wa('Namaste! I want to order for home delivery in Delhi.')} target="_blank" rel="noreferrer" className="btn btn-ink press flex-1 sm:flex-none">
              <WhatsAppIcon /> {t('wa_us')}
            </a>
            <a href={tel} className="btn btn-line press flex-1 sm:flex-none">
              <Phone className="size-[18px]" strokeWidth={2} /> {t('call')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function Wholesale() {
  const { t } = useLang()
  return (
    <section className="px-4 pb-24 sm:px-10 sm:pb-32">
      <div data-field="indigo" className="reveal mx-auto grid max-w-[1400px] gap-10 overflow-hidden rounded-[40px] bg-[var(--field)] p-8 text-[var(--ink)] sm:p-14 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:p-20">
        <h2 className="text-[clamp(2.4rem,5.6vw,5.4rem)] leading-[0.94] font-bold tracking-[-0.055em]">{t('wholesale_band_t')}</h2>
        <div>
          <ol className="grid gap-3" role="list">
            {(['wholesale_how_1', 'wholesale_how_2', 'wholesale_how_3'] as const).map((k, i) => (
              <li key={k} className="flex items-center gap-4 text-[17px] font-semibold">
                <span
                  data-field={(['yellow', 'green', 'red'] as const)[i]}
                  className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-[var(--field)] text-[15px] text-[var(--ink)] tabular-nums"
                >
                  {i + 1}
                </span>
                {t(k)}
              </li>
            ))}
          </ol>
          <Link to="/wholesale" viewTransition className="btn btn-ink press mt-9">
            {t('wholesale_band_cta')} <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Visit ---------------- */

function Visit() {
  const { t } = useLang()
  const { dow, week, wa } = useShop()
  return (
    <section className="mx-auto grid max-w-[1400px] gap-12 px-4 pb-28 sm:px-10 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-20">
      <div className="reveal">
        <h2 className="text-[clamp(2.4rem,5.4vw,4.8rem)] font-bold tracking-[-0.055em]">{t('visit_title')}</h2>
        <p className="mt-6 text-[clamp(1.25rem,2.2vw,1.6rem)] leading-snug font-semibold tracking-[-0.02em]">
          {shop.address.line1},<br />
          {shop.address.line2}, {shop.address.city}
        </p>
        <dl className="mt-8 grid max-w-sm gap-1 text-[15.5px]">
          {week.map((h) => (
            <div
              key={h.dow}
              className={`flex justify-between gap-6 rounded-[12px] px-3 py-2 ${h.dow === dow ? 'bg-[var(--card)] font-semibold' : 'ink-2'}`}
            >
              <dt>{h.day}</dt>
              <dd className="m-0">{h.hours}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href={directionsHref} target="_blank" rel="noreferrer" className="btn btn-ink press">
            {t('directions')} <ArrowUpRight className="size-4" />
          </a>
          <a href={wa()} target="_blank" rel="noreferrer" className="btn btn-line press">
            <WhatsAppIcon /> WhatsApp
          </a>
        </div>
      </div>
      <div className="reveal">
        <MapFrame />
      </div>
    </section>
  )
}
