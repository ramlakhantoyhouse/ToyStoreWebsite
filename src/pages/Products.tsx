import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useLang } from '../i18n'
import { useCatalog } from '../data/catalog'
import { inStockFirst, useShop } from '../lib/useShop'
import { FieldSection } from '../components/Field'
import { ProductCard } from '../components/ProductCard'
import { WhatsAppIcon } from '../components/Icons'
import { usePageTitle } from '../lib/usePageTitle'

const D = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties

export function Products() {
  const { t, pick } = useLang()
  const [params, setParams] = useSearchParams()
  const cat = params.get('c') ?? 'all'
  const season = params.get('s') ?? 'all'
  const q = params.get('q') ?? ''
  usePageTitle(t('shop_title'))
  const { products, categories, seasons, seasonById } = useCatalog()
  const { wa } = useShop()

  const sel = season !== 'all' ? seasonById(season) : undefined

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return inStockFirst(products).filter(
      (p) =>
        (cat === 'all' || p.category === cat) &&
        (season === 'all' || p.season === season) &&
        (!needle || `${p.name.en} ${p.name.hi} ${p.description.en} ${p.category} ${p.season}`.toLowerCase().includes(needle)),
    )
  }, [products, cat, season, q])

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params)
    if (!v || v === 'all') next.delete(k)
    else next.set(k, v)
    setParams(next, { replace: true })
  }

  return (
    <>
      {/* Head: the chosen season floods the top; indigo when browsing everything */}
      <FieldSection inset field={sel ? sel.id : 'indigo'}>
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 pt-10 pb-14 sm:px-10 sm:pt-16 sm:pb-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-16 lg:pt-20 lg:pb-24">
          <div>
            <h1 className="enter text-[clamp(3.6rem,12vw,10rem)] leading-[0.88] font-bold tracking-[-0.06em]">
              {t('shop_title')}
              {sel && (
                <span key={sel.id} className="enter block" style={D(60)}>
                  {pick(sel.name)}
                </span>
              )}
            </h1>
            <p className="enter ink-2 mt-7 max-w-[30rem] text-[17px] leading-relaxed sm:text-[19px]" style={D(80)}>
              {sel ? `${pick(sel.line)} ${t('shop_sub')}` : t('shop_sub')}
            </p>
          </div>
          <label className="enter relative block w-full lg:mb-2" style={D(160)}>
            <span className="sr-only">{t('search')}</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-5 size-[19px] -translate-y-1/2 text-[#1d1b4b] opacity-60 dark:text-[#f1effa]"
              strokeWidth={1.75}
            />
            <input
              type="search"
              value={q}
              onChange={(e) => set('q', e.target.value)}
              placeholder={t('search')}
              enterKeyHint="search"
              className="field-input rounded-full! pl-13! text-[16px]"
            />
          </label>
        </div>
      </FieldSection>

      <FieldSection field="chalk" className="pb-28 sm:pb-36">
        {/* Filter bar sticks under the header for the whole result list */}
        <div className="hair sticky top-[72px] z-20 border-b bg-[var(--field)] transition-colors duration-700 ease-[var(--ease-out)]">
          <div className="mx-auto max-w-[1400px] py-2.5 sm:px-6 sm:py-3">
            <div className="scrollbar-none flex items-center gap-2 overflow-x-auto px-4 py-1" role="group" aria-label={t('category')}>
              <span className="ink-2 mr-1 w-[4.5rem] shrink-0 text-[13px] font-medium sm:w-20">{t('category')}</span>
              <button type="button" className="chip press" aria-pressed={cat === 'all'} onClick={() => set('c', 'all')}>
                {t('all')}
              </button>
              {categories.map((c) => (
                <button key={c.id} type="button" className="chip press" aria-pressed={cat === c.id} onClick={() => set('c', c.id)}>
                  {pick(c.name)}
                </button>
              ))}
            </div>
            <div className="scrollbar-none flex items-center gap-2 overflow-x-auto px-4 py-1" role="group" aria-label={t('season')}>
              <span className="ink-2 mr-1 w-[4.5rem] shrink-0 text-[13px] font-medium sm:w-20">{t('season')}</span>
              <button type="button" className="chip press" aria-pressed={season === 'all'} onClick={() => set('s', 'all')}>
                {t('all')}
              </button>
              {seasons.map((s) => (
                <button key={s.id} type="button" className="chip press" aria-pressed={season === s.id} onClick={() => set('s', s.id)}>
                  <span
                    aria-hidden="true"
                    data-field={s.id}
                    className="size-2.5 shrink-0 rounded-full bg-[var(--field)] shadow-[0_0_0_1.5px_color-mix(in_srgb,currentColor_25%,transparent)]"
                  />
                  {pick(s.name)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-10 sm:pt-14">
          <p className="ink-2 hair border-b pb-4 text-[15px] tabular-nums" aria-live="polite">
            <span className="font-semibold text-[var(--ink)]">{list.length}</span> {t('items')}
          </p>

          {list.length ? (
            <ul
              key={cat + season + q}
              className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8"
              role="list"
            >
              {list.map((p) => (
                <ProductCard key={p.slug} p={p} />
              ))}
            </ul>
          ) : (
            <div className="enter py-20 sm:py-28">
              <p className="max-w-[18ch] text-[clamp(2.2rem,6vw,4.6rem)] leading-[0.95] font-bold tracking-[-0.05em]">{t('no_results')}</p>
              <a
                href={wa(q ? `Do you have: ${q}?` : undefined)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ink press mt-10 w-full sm:w-auto"
              >
                <WhatsAppIcon /> {t('wa_us')}
              </a>
            </div>
          )}
        </div>
      </FieldSection>
    </>
  )
}
