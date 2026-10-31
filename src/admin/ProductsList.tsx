import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Plus, Search, Star, X } from 'lucide-react'
import { toast } from 'sonner'
import { useCatalog } from '../data/catalog'
import { img, type Product } from '../data/products'
import { useLang } from '../i18n'
import { EmptyState, PageHead, useAdmin, useL } from './ui'

/** /admin/products — every product, with a quick in-stock switch. */
export default function ProductsList() {
  const L = useL()
  const { lang } = useLang()
  const nav = useNavigate()
  const { backend } = useAdmin()
  const { products, categories, catById, reload, loading } = useCatalog()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>('all')
  const [outOnly, setOutOnly] = useState(false)
  // optimistic stock values while a save is in flight
  const [pending, setPending] = useState<Record<string, boolean>>({})

  const stockOf = (p: Product) => (p.slug in pending ? pending[p.slug] : p.inStock !== false)

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return products.filter((p) => {
      if (cat !== 'all' && p.category !== cat) return false
      if (outOnly && (p.slug in pending ? pending[p.slug] : p.inStock !== false)) return false
      if (!term) return true
      return `${p.name.en} ${p.name.hi} ${p.slug}`.toLowerCase().includes(term)
    })
  }, [products, q, cat, outOnly, pending])

  const outCount = products.filter((p) => p.inStock === false).length

  async function setStock(p: Product, inStock: boolean) {
    setPending((m) => ({ ...m, [p.slug]: inStock }))
    try {
      await backend.saveProduct({ ...p, inStock }, p.slug)
      await reload()
      toast.success(
        inStock
          ? L(`${p.name.en} is now in stock`, `${p.name.hi || p.name.en} अब स्टॉक में है`)
          : L(`${p.name.en} marked out of stock`, `${p.name.hi || p.name.en} स्टॉक में नहीं है`),
      )
    } catch (e) {
      toast.error(e instanceof Error ? e.message : L('Could not save. Please try again.', 'सेव नहीं हुआ। फिर से कोशिश करें।'))
    } finally {
      setPending((m) => {
        const n = { ...m }
        delete n[p.slug]
        return n
      })
    }
  }

  const addBtn = (
    <Link to="/admin/products/new" className="btn btn-ink press no-underline">
      <Plus className="size-5" /> {L('Add product', 'सामान जोड़ें')}
    </Link>
  )

  const filtered = q.trim() !== '' || cat !== 'all' || outOnly

  return (
    <div>
      <PageHead
        title={L('Products', 'सामान')}
        sub={L('Everything shown on your website. Tap a product to change it.', 'आपकी वेबसाइट पर दिखने वाला सारा सामान। बदलने के लिए किसी सामान पर टैप करें।')}
        actions={addBtn}
      />

      {/* search */}
      <div className="relative">
        <label htmlFor="prod-search" className="sr-only">
          {L('Search products', 'सामान खोजें')}
        </label>
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 opacity-50" />
        <input
          id="prod-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={L('Search by name…', 'नाम से खोजें…')}
          className="field-input pl-12"
        />
        {q && (
          <button type="button" onClick={() => setQ('')} aria-label={L('Clear search', 'खोज हटाएं')} className="press absolute top-1/2 right-2 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[var(--ink)]">
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* filters */}
      <div className="scrollbar-none -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <button type="button" className="chip press" aria-pressed={cat === 'all'} onClick={() => setCat('all')}>
          {L('All', 'सभी')}
        </button>
        {categories.map((c) => (
          <button key={c.id} type="button" className="chip press" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>
            {c.name[lang] || c.name.en}
          </button>
        ))}
        <button type="button" className="chip press" aria-pressed={outOnly} onClick={() => setOutOnly((v) => !v)}>
          <span className="size-2.5 rounded-full bg-[var(--danger)]" aria-hidden="true" />
          {L('Out of stock only', 'सिर्फ़ खत्म हुआ सामान')}
          {outCount > 0 && <span className="text-[13px] opacity-70">({outCount})</span>}
        </button>
      </div>

      <p className="ink-2 mt-5 mb-3 text-[14.5px] font-medium" aria-live="polite">
        {filtered
          ? L(`Showing ${list.length} of ${products.length} products`, `${products.length} में से ${list.length} सामान`)
          : L(`${products.length} products`, `${products.length} सामान`)}
      </p>

      {loading && products.length === 0 ? null : products.length === 0 ? (
        <EmptyState
          title={L('No products yet', 'अभी कोई सामान नहीं है')}
          sub={L('Add your first product with a photo. It will show on the website right away.', 'फ़ोटो के साथ अपना पहला सामान जोड़ें। यह तुरंत वेबसाइट पर दिखेगा।')}
          action={addBtn}
        />
      ) : list.length === 0 ? (
        <EmptyState
          title={L('Nothing matches', 'कुछ नहीं मिला')}
          sub={L('Try another word or clear the filters.', 'कोई दूसरा शब्द लिखें या फ़िल्टर हटाएं।')}
          action={
            <button
              type="button"
              className="btn btn-line press"
              onClick={() => {
                setQ('')
                setCat('all')
                setOutOnly(false)
              }}
            >
              {L('Clear filters', 'फ़िल्टर हटाएं')}
            </button>
          }
        />
      ) : (
        <ul className="m-0 grid list-none gap-2 p-0">
          {list.map((p) => {
            const inStock = stockOf(p)
            const busy = p.slug in pending
            const name = p.name[lang] || p.name.en
            const wholesaleOnly = p.sale.length === 1 && p.sale[0] === 'wholesale'
            return (
              <li key={p.slug} className="flex min-w-0 items-center gap-2 rounded-[20px] bg-[var(--card)] p-2.5 pr-1.5">
                <button
                  type="button"
                  onClick={() => nav(`/admin/products/${p.slug}`)}
                  className="press flex min-h-16 min-w-0 flex-1 cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-left text-[var(--ink)]"
                  aria-label={L(`Edit ${p.name.en}`, `${name} बदलें`)}
                >
                  <span className="size-16 shrink-0 overflow-hidden rounded-[14px] bg-[var(--chalk)]">
                    {p.images[0] && <img src={img(p.images[0])} alt="" loading="lazy" className={`size-full object-cover ${inStock ? '' : 'opacity-50 grayscale'}`} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[16px] font-semibold tracking-[-0.01em]">{name}</span>
                    <span className="ink-2 block truncate text-[13.5px]">{catById(p.category)?.name[lang] || catById(p.category)?.name.en || p.category}</span>
                    <span className="mt-1 flex flex-wrap gap-1">
                      {!inStock && (
                        <span data-field="red" className="rounded-full bg-[var(--field)] px-2 py-0.5 text-[12px] font-semibold text-[var(--ink)]">
                          {L('Out of stock', 'स्टॉक खत्म')}
                        </span>
                      )}
                      {p.featured && (
                        <span data-field="yellow" className="inline-flex items-center gap-1 rounded-full bg-[var(--field)] px-2 py-0.5 text-[12px] font-semibold text-[var(--ink)]">
                          <Star className="size-3" fill="currentColor" /> {L('Popular', 'लोकप्रिय')}
                        </span>
                      )}
                      {wholesaleOnly && (
                        <span data-field="blue" className="rounded-full bg-[var(--field)] px-2 py-0.5 text-[12px] font-semibold text-[var(--ink)]">
                          {L('Wholesale only', 'सिर्फ़ थोक')}
                        </span>
                      )}
                    </span>
                  </span>
                </button>

                {/* quick in-stock switch */}
                <div className="flex shrink-0 flex-col items-center gap-1">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={inStock}
                    aria-label={L(`${p.name.en} in stock`, `${name} स्टॉक में`)}
                    disabled={busy}
                    onClick={() => void setStock(p, !inStock)}
                    className={`press relative h-8 w-14 cursor-pointer rounded-full border-0 transition-colors duration-200 disabled:cursor-wait disabled:opacity-70 ${inStock ? 'bg-[var(--t-green)]' : 'bg-[color-mix(in_srgb,var(--ink)_22%,transparent)]'}`}
                  >
                    <span className={`absolute top-1 left-1 size-6 rounded-full bg-white shadow-[0_2px_6px_rgb(0_0_0_/_0.25)] transition-transform duration-300 ease-[var(--spring)] ${inStock ? 'translate-x-6' : ''}`} />
                  </button>
                  <span className="ink-2 text-[11.5px] font-semibold">{inStock ? L('In stock', 'स्टॉक में') : L('Out', 'खत्म')}</span>
                </div>

                <Link
                  to={`/admin/products/${p.slug}`}
                  aria-label={L(`Edit ${p.name.en}`, `${name} बदलें`)}
                  className="press grid size-12 shrink-0 place-items-center rounded-full text-[var(--ink)] no-underline hover:bg-[var(--chalk)]"
                >
                  <ChevronRight className="size-5" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
