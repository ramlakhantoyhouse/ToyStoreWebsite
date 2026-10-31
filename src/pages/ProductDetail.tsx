import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight, Phone, Truck } from 'lucide-react'
import { useLang } from '../i18n'
import type { Product } from '../data/products'
import { useCatalog } from '../data/catalog'
import { inStockFirst, useShop } from '../lib/useShop'
import { FieldSection } from '../components/Field'
import { isBuiltinSeason, seasonStyle } from '../lib/seasonColor'
import { Photo } from '../components/DuoPhoto'
import { ProductCard } from '../components/ProductCard'
import { EnquiryDrawer } from '../components/EnquiryDrawer'
import { WhatsAppIcon } from '../components/Icons'
import { usePageTitle } from '../lib/usePageTitle'
import { NotFound } from './NotFound'

const D = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties
const OUT_NOTE = { en: 'Out of stock right now — ask us when it’s back.', hi: 'अभी स्टॉक में नहीं है — पूछें कब वापस आएगा।' }
const ASK_BACK = { en: 'Ask when it’s back', hi: 'पूछें कब आएगा' }

export function ProductDetail() {
  const { slug = '' } = useParams()
  const { bySlug } = useCatalog()
  const p = bySlug(slug)
  const { pick } = useLang()
  usePageTitle(p ? pick(p.name) : undefined, p ? pick(p.description) : undefined)
  if (!p) return <NotFound />
  // Keyed by slug so the gallery position and chosen variant reset when
  // moving from one product to a related one.
  return <ProductView key={p.slug} p={p} />
}

function ProductView({ p }: { p: Product }) {
  const { t, pick } = useLang()
  const [vi, setVi] = useState(0)
  const [open, setOpen] = useState(false)
  const { products, catById, seasonById } = useCatalog()
  const { tel } = useShop()

  const cat = catById(p.category)
  const season = seasonById(p.season)
  const variant = p.variants?.[vi]
  const related = inStockFirst(products.filter((x) => x.category === p.category && x.slug !== p.slug)).slice(0, 4)
  const out = p.inStock === false
  const askLabel = out ? pick(ASK_BACK) : t('enquire_wa')
  // festival and owner-added seasons paint the product's block
  const onSeason = !!season && (['holi', 'rakhi', 'kites', 'diwali'].includes(season.id) || !isBuiltinSeason(season.id))

  return (
    <>
      {/* The product sits on its season's field */}
      <FieldSection inset field={onSeason ? p.season : 'card'} style={onSeason ? seasonStyle(season) : undefined} className="relative">
        <div className="mx-auto max-w-[1400px] px-4 pt-4 pb-16 sm:px-10 sm:pt-8 lg:pb-28">
          <Link
            to="/products"
            viewTransition
            className="enter press -ml-1 inline-flex min-h-11 items-center gap-2 px-1 text-[15px] font-medium no-underline [@media(hover:hover)]:hover:underline"
          >
            <ArrowLeft className="size-4" strokeWidth={2} /> {t('back')}
          </Link>

          <div className="mt-4 grid gap-8 sm:mt-6 lg:grid-cols-[1.08fr_0.92fr] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-0">
            <h1
              className="enter text-[clamp(2.9rem,8.6vw,6.6rem)] leading-[0.92] font-bold tracking-[-0.06em] lg:col-start-2 lg:row-start-1 lg:pt-4"
              style={D(80)}
            >
              {pick(p.name)}
            </h1>

            <div className="enter lg:col-start-1 lg:row-span-2 lg:row-start-1" style={D(160)}>
              <Gallery p={p} />
            </div>

            <div className="enter lg:col-start-2 lg:row-start-2" style={D(240)}>
              <p className="ink-2 max-w-[34rem] text-[17px] leading-relaxed sm:text-[19px] lg:mt-7">{pick(p.description)}</p>

              <dl className="hair mt-9 grid max-w-[34rem] border-t text-[15.5px]">
                {cat && (
                  <div className="hair flex items-center justify-between gap-6 border-b">
                    <dt className="ink-2 py-2">{t('category')}</dt>
                    <dd className="m-0">
                      <Link
                        to={`/products?c=${cat.id}`}
                        viewTransition
                        className="press inline-flex min-h-11 items-center gap-1 font-medium no-underline [@media(hover:hover)]:hover:underline"
                      >
                        {pick(cat.name)} <ArrowUpRight className="size-3.5" />
                      </Link>
                    </dd>
                  </div>
                )}
                {season && (
                  <div className="hair flex items-center justify-between gap-6 border-b">
                    <dt className="ink-2 py-2">{t('season')}</dt>
                    <dd className="m-0">
                      <Link
                        to={`/seasons/${season.id}`}
                        viewTransition
                        className="press inline-flex min-h-11 items-center gap-1 font-medium no-underline [@media(hover:hover)]:hover:underline"
                      >
                        {pick(season.name)} <ArrowUpRight className="size-3.5" />
                      </Link>
                    </dd>
                  </div>
                )}
                <div className="hair flex min-h-11 items-center justify-between gap-6 border-b">
                  <dt className="ink-2 py-2">{t('pd_sold')}</dt>
                  <dd className="m-0 font-medium">{p.sale.map((s) => t(s)).join(' · ')}</dd>
                </div>
              </dl>

              {p.variants && (
                <fieldset className="mt-9 border-0 p-0">
                  <legend className="mb-3 p-0 text-[15px] font-medium">{t('choose')}</legend>
                  <div className="flex flex-wrap gap-2">
                    {p.variants.map((v, i) => (
                      <button key={v.en} type="button" className="chip press" aria-pressed={vi === i} onClick={() => setVi(i)}>
                        {pick(v)}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {out && (
                <p
                  data-field="indigo"
                  role="status"
                  className="mt-9 max-w-[34rem] rounded-[18px] bg-[var(--field)] px-5 py-4 text-[16.5px] leading-snug font-semibold text-[var(--ink)]"
                >
                  {pick(OUT_NOTE)}
                </p>
              )}

              <p className="mt-9 max-w-[30rem] text-[clamp(1.15rem,1.8vw,1.4rem)] leading-snug font-medium tracking-[-0.02em]">{t('price_note')}</p>
              <p className="mt-4 flex max-w-[30rem] items-start gap-3 text-[15.5px] font-medium">
                <Truck className="mt-0.5 size-5 shrink-0" strokeWidth={2} />
                {t('deliv_line')}
              </p>

              <div className="mt-8 hidden flex-wrap gap-3 md:flex">
                <button type="button" onClick={() => setOpen(true)} className="btn btn-ink press">
                  <WhatsAppIcon /> {askLabel}
                </button>
                <a href={tel} className="btn btn-line press">
                  <Phone className="size-[18px]" strokeWidth={1.75} /> {t('call')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </FieldSection>

      {related.length > 0 && cat && (
        <FieldSection field="chalk">
          <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-10 sm:py-28">
            <div className="reveal flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-[clamp(2.2rem,5vw,4.4rem)] font-bold tracking-[-0.05em]">
                {t('more_in')} {pick(cat.name)}
              </h2>
              <Link to={`/products?c=${cat.id}`} viewTransition className="press inline-flex min-h-11 items-center gap-1.5 font-medium underline">
                {t('see_all')} <ArrowRight className="size-4" />
              </Link>
            </div>
            <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 p-0 sm:gap-x-6 md:grid-cols-4" role="list">
              {related.map((r) => (
                <ProductCard key={r.slug} p={r} />
              ))}
            </ul>
          </div>
        </FieldSection>
      )}

      {/* room for the fixed action bar on phones */}
      <div aria-hidden="true" className="h-[calc(88px+env(safe-area-inset-bottom))] md:hidden" />

      <div className="hair fixed inset-x-0 bottom-0 z-30 border-t bg-[var(--field)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-[var(--ink)] transition-colors duration-700 ease-[var(--ease-out)] md:hidden">
        <div className="flex gap-3">
          <a href={tel} className="btn btn-line press px-5" aria-label={t('call')}>
            <Phone className="size-[18px]" strokeWidth={1.75} /> {t('call')}
          </a>
          <button type="button" onClick={() => setOpen(true)} className="btn btn-ink press min-w-0 flex-1 px-4">
            <WhatsAppIcon /> <span className="truncate">{askLabel}</span>
          </button>
        </div>
      </div>

      <EnquiryDrawer open={open} onOpenChange={setOpen} product={out ? `${p.name.en} (out of stock – ask when back)` : p.name.en} variant={variant?.en} season={season?.name.en} />
    </>
  )
}

/* True-colour photos: customers need to see the real colours before they ask. */
function Gallery({ p }: { p: Product }) {
  const { t, pick } = useLang()
  const [slide, setSlide] = useState(0)
  const rowRef = useRef<HTMLDivElement>(null)
  const n = p.images.length

  const go = (i: number) => {
    const el = rowRef.current
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div>
      <div className="overflow-hidden rounded-[32px] sm:rounded-[40px]">
        <div
          ref={rowRef}
          tabIndex={n > 1 ? 0 : undefined}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
          onScroll={(e) => {
            const el = e.currentTarget
            setSlide(Math.round(el.scrollLeft / el.clientWidth))
          }}
          aria-label={t('pd_photos')}
        >
          {p.images.map((f, i) => (
            <Photo
              key={`${i}-${f.slice(0, 80)}`}
              file={f}
              alt={n > 1 ? `${pick(p.name)}, ${t('pd_photo_n')} ${i + 1}` : pick(p.name)}
              eager={i === 0}
              className="aspect-square w-full shrink-0 snap-center lg:aspect-[4/5]"
            />
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="ink-2 text-[13.5px] leading-snug">{t('sample_photo')}</p>
        {n > 1 && (
          <div className="-mr-2 flex shrink-0" role="tablist" aria-label={t('pd_photos')}>
            {p.images.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={slide === i}
                aria-label={`${t('pd_photo_n')} ${i + 1} / ${n}`}
                onClick={() => go(i)}
                className="grid size-11 cursor-pointer place-items-center border-0 bg-transparent p-0 text-[var(--ink)]"
              >
                <span
                  className={`block h-2 rounded-full transition-[width,background-color] duration-300 ease-[var(--ease-out)] ${
                    slide === i ? 'w-7 bg-[var(--ink)]' : 'w-2 bg-[color-mix(in_srgb,var(--ink)_32%,transparent)]'
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
