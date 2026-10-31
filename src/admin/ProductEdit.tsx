import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, ImagePlus, Plus, Star, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { useCatalog } from '../data/catalog'
import { img, type Product } from '../data/products'
import { slugify } from '../data/backend'
import { compressPhoto } from '../lib/photo'
import { useLang, type Bi } from '../i18n'
import { BiInput, Confirm, EmptyState, Label, PageHead, Panel, Select, Spinner, Toggle, useAdmin, useL, useUnsavedWarning } from './ui'

type Draft = Omit<Product, 'slug'>
type Uploading = { id: string; preview: string }
type Errors = { name?: string; photos?: string; sale?: string }

/** Photos stored by the backend (not bundled with the site) can be deleted from storage. */
const isStoredPhoto = (url: string) => /^https?:/.test(url)
const errMsg = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback)

function emptyDraft(category: string, season: Product['season']): Draft {
  return {
    name: { en: '', hi: '' },
    description: { en: '', hi: '' },
    category,
    season,
    images: [],
    variants: [],
    sale: ['retail'],
    featured: false,
    inStock: true,
  }
}

function toDraft(p: Product): Draft {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { slug, ...rest } = p
  return { ...rest, variants: rest.variants ?? [], inStock: rest.inStock !== false, featured: !!rest.featured }
}

/** /admin/products/new and /admin/products/:slug — add or change one product. */
export default function ProductEdit() {
  const L = useL()
  const { slug } = useParams<{ slug?: string }>()
  const isNew = !slug
  const { products, categories, seasons, loading, bySlug } = useCatalog()
  const existing = slug ? bySlug(slug) : undefined

  if (!isNew && !existing) {
    if (loading) {
      return (
        <div className="grid min-h-[50vh] place-items-center opacity-60">
          <Spinner className="size-7" />
        </div>
      )
    }
    return (
      <div>
        <BackLink />
        <EmptyState
          title={L('Product not found', 'सामान नहीं मिला')}
          sub={L('It may have been deleted. Go back to the list and pick another one.', 'शायद यह हटा दिया गया है। सूची पर वापस जाकर कोई और चुनें।')}
          action={
            <Link to="/admin/products" className="btn btn-ink press no-underline">
              {L('Back to products', 'सामान की सूची')}
            </Link>
          }
        />
      </div>
    )
  }

  const initial = existing ? toDraft(existing) : emptyDraft(categories[0]?.id ?? 'toys', seasons.find((s) => s.id === categories[0]?.id)?.id ?? seasons[0]?.id ?? 'sports')
  // key remounts the form when switching between products
  return <Editor key={slug ?? 'new'} slug={slug} initial={initial} allSlugs={products.map((p) => p.slug)} />
}

function BackLink() {
  const L = useL()
  return (
    <Link to="/admin/products" className="press mb-3 inline-flex min-h-11 items-center gap-1.5 rounded-full pr-3 text-[15px] font-semibold text-[var(--ink)] no-underline">
      <ArrowLeft className="size-5" /> {L('All products', 'सारा सामान')}
    </Link>
  )
}

function Editor({ slug, initial, allSlugs }: { slug?: string; initial: Draft; allSlugs: string[] }) {
  const L = useL()
  const { lang } = useLang()
  const nav = useNavigate()
  const { backend } = useAdmin()
  const { products, categories, seasons, reload } = useCatalog()
  const isNew = !slug

  const [draft, setDraft] = useState<Draft>(initial)
  const [uploading, setUploading] = useState<Uploading[]>([])
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [askDelete, setAskDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [varEn, setVarEn] = useState('')
  const [varHi, setVarHi] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  // photos uploaded in this visit; safe to delete from storage if removed before saving
  const sessionUploads = useRef(new Set<string>())
  const savedRef = useRef(false)

  const initialJson = useMemo(() => JSON.stringify(initial), [initial])
  const dirty = !savedRef.current && (JSON.stringify(draft) !== initialJson || uploading.length > 0)
  useUnsavedWarning(dirty)

  // release preview URLs when leaving
  const previews = useRef<string[]>([])
  useEffect(() => {
    const list = previews.current
    return () => {
      list.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [])

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }))

  /* ---------- photos ---------- */

  async function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const hint = slug || slugify(draft.name.en || 'product')
    const jobs = Array.from(files).map((file) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const preview = URL.createObjectURL(file)
      previews.current.push(preview)
      return { id, preview, file }
    })
    setUploading((u) => [...u, ...jobs.map(({ id, preview }) => ({ id, preview }))])
    setErrors((e) => ({ ...e, photos: undefined }))
    let ok = 0
    await Promise.all(
      jobs.map(async ({ id, file }) => {
        try {
          const blob = await compressPhoto(file)
          const url = await backend.uploadPhoto(blob, hint)
          sessionUploads.current.add(url)
          setDraft((d) => ({ ...d, images: [...d.images, url] }))
          ok++
        } catch (e) {
          toast.error(errMsg(e, L('A photo could not be uploaded. Please try again.', 'एक फ़ोटो अपलोड नहीं हुई। फिर से कोशिश करें।')))
        } finally {
          setUploading((u) => u.filter((x) => x.id !== id))
        }
      }),
    )
    if (ok > 0) toast.success(ok === 1 ? L('Photo added', 'फ़ोटो जुड़ गई') : L(`${ok} photos added`, `${ok} फ़ोटो जुड़ गईं`))
    if (fileRef.current) fileRef.current.value = ''
  }

  function removePhoto(i: number) {
    const url = draft.images[i]
    set('images', draft.images.filter((_, j) => j !== i))
    if (sessionUploads.current.has(url) && isStoredPhoto(url)) {
      sessionUploads.current.delete(url)
      void backend.deletePhoto(url).catch(() => {})
    }
  }

  function movePhoto(i: number, to: number) {
    if (to < 0 || to >= draft.images.length) return
    const next = [...draft.images]
    const [x] = next.splice(i, 1)
    next.splice(to, 0, x)
    set('images', next)
  }

  /* ---------- variants ---------- */

  function addVariant() {
    const en = varEn.trim()
    const hi = varHi.trim()
    if (!en && !hi) return
    set('variants', [...(draft.variants ?? []), { en: en || hi, hi: hi || en }])
    setVarEn('')
    setVarHi('')
  }

  function onVarKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addVariant()
    }
  }

  /* ---------- sale ---------- */

  function setSale(kind: 'retail' | 'wholesale', on: boolean) {
    const s = new Set(draft.sale)
    if (on) s.add(kind)
    else s.delete(kind)
    set('sale', (['retail', 'wholesale'] as const).filter((k) => s.has(k)))
    if (s.size > 0) setErrors((e) => ({ ...e, sale: undefined }))
  }

  /* ---------- save / delete ---------- */

  function uniqueSlug(base: string) {
    const taken = new Set(allSlugs)
    if (!taken.has(base)) return base
    let n = 2
    while (taken.has(`${base}-${n}`)) n++
    return `${base}-${n}`
  }

  async function save() {
    const errs: Errors = {}
    if (!draft.name.en.trim()) errs.name = L('Please write the product name in English.', 'कृपया सामान का नाम अंग्रेज़ी में लिखें।')
    if (draft.images.length === 0) errs.photos = L('Please add at least one photo.', 'कम से कम एक फ़ोटो जोड़ें।')
    if (draft.sale.length === 0) errs.sale = L('Choose Retail, Wholesale, or both.', 'रिटेल, थोक या दोनों चुनें।')
    setErrors(errs)
    const first = Object.values(errs)[0]
    if (first) {
      toast.error(first)
      return
    }
    if (uploading.length > 0) {
      toast.error(L('Please wait for the photos to finish uploading.', 'कृपया फ़ोटो अपलोड पूरा होने दें।'))
      return
    }

    const fill = (b: Bi): Bi => ({ en: b.en.trim(), hi: b.hi.trim() || b.en.trim() })
    const product: Product = {
      ...draft,
      slug: slug ?? uniqueSlug(slugify(draft.name.en)),
      name: fill(draft.name),
      description: fill(draft.description),
      variants: (draft.variants ?? []).map(fill).filter((v) => v.en),
      // new products go to the top of every list (lowest sort value)
      sort: slug ? draft.sort : Math.min(0, ...products.map((p) => p.sort ?? 0)) - 1,
    }

    setSaving(true)
    try {
      await backend.saveProduct(product, slug)
      // photos that were on the saved product but removed now
      const removed = initial.images.filter((u) => !product.images.includes(u) && isStoredPhoto(u))
      await Promise.all(removed.map((u) => backend.deletePhoto(u).catch(() => {})))
      await reload()
      savedRef.current = true
      toast.success(isNew ? L('Product added to the website', 'सामान वेबसाइट पर जुड़ गया') : L('Changes saved', 'बदलाव सेव हो गए'))
      nav('/admin/products')
    } catch (e) {
      toast.error(errMsg(e, L('Could not save. Please check your internet and try again.', 'सेव नहीं हुआ। इंटरनेट देखकर फिर से कोशिश करें।')))
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!slug) return
    setDeleting(true)
    try {
      await backend.deleteProduct(slug)
      const photos = new Set([...initial.images, ...draft.images].filter(isStoredPhoto))
      await Promise.all([...photos].map((u) => backend.deletePhoto(u).catch(() => {})))
      await reload()
      savedRef.current = true
      toast.success(L('Product deleted', 'सामान हटा दिया गया'))
      nav('/admin/products')
    } catch (e) {
      toast.error(errMsg(e, L('Could not delete. Please try again.', 'हटाया नहीं जा सका। फिर से कोशिश करें।')))
      setDeleting(false)
      setAskDelete(false)
    }
  }

  const seasonOptions = seasons.map((s) => ({
    value: s.id,
    label: `${s.name[lang] || s.name.en}${s.allYear ? L(' — all year', ' — पूरे साल') : ` (${s.months[lang] || s.months.en})`}`,
  }))
  const catOptions = categories.map((c) => ({ value: c.id, label: c.name[lang] || c.name.en }))
  if (!categories.some((c) => c.id === draft.category)) catOptions.unshift({ value: draft.category, label: draft.category })

  const busy = saving || deleting
  const sectionTitle = 'mb-4 text-[19px] font-bold tracking-[-0.03em]'

  return (
    <div>
      <BackLink />
      <PageHead
        title={isNew ? L('Add product', 'नया सामान') : draft.name[lang] || draft.name.en || L('Edit product', 'सामान बदलें')}
        sub={isNew ? L('Fill in the details below and tap Save. Fields with * are needed.', 'नीचे जानकारी भरें और सेव दबाएं। * वाली चीज़ें ज़रूरी हैं।') : L('Change anything below and tap Save.', 'नीचे कुछ भी बदलें और सेव दबाएं।')}
        actions={
          !isNew && (
            <a href={`/products/${slug}`} target="_blank" rel="noreferrer" className="btn btn-line press no-underline">
              <ExternalLink className="size-5" /> {L('View on website', 'वेबसाइट पर देखें')}
            </a>
          )
        }
      />

      <div className="grid gap-4">
        {/* 1. photos */}
        <Panel>
          <h2 className={sectionTitle}>
            1. {L('Photos', 'फ़ोटो')} <span aria-hidden="true">*</span>
          </h2>
          <p className="ink-2 -mt-2 mb-4 text-[14.5px]">{L('The first photo is the cover customers see first.', 'पहली फ़ोटो कवर है, ग्राहक इसे सबसे पहले देखते हैं।')}</p>
          <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4">
            {draft.images.map((u, i) => (
              <li key={u + i} className="overflow-hidden rounded-[18px] bg-[var(--chalk)]">
                <div className="relative aspect-square">
                  <img src={img(u)} alt={L(`Photo ${i + 1}`, `फ़ोटो ${i + 1}`)} className="size-full object-cover" />
                  {i === 0 && (
                    <span data-field="yellow" className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-[var(--field)] px-2.5 py-1 text-[12.5px] font-bold text-[var(--ink)]">
                      <Star className="size-3.5" fill="currentColor" /> {L('Cover', 'कवर')}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label={L(`Remove photo ${i + 1}`, `फ़ोटो ${i + 1} हटाएं`)}
                    className="press absolute top-1.5 right-1.5 grid size-11 cursor-pointer place-items-center rounded-full border-0 bg-[rgb(10_9_30_/_0.65)] text-white"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-1 p-1">
                  <button type="button" onClick={() => movePhoto(i, i - 1)} disabled={i === 0} aria-label={L('Move left', 'बाएं करें')} className="press grid size-11 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[var(--ink)] disabled:cursor-default disabled:opacity-25">
                    <ChevronLeft className="size-5" />
                  </button>
                  {i > 0 ? (
                    <button type="button" onClick={() => movePhoto(i, 0)} className="press min-h-11 cursor-pointer rounded-full border-0 bg-transparent px-2 text-[13px] font-semibold text-[var(--ink)]">
                      {L('Make cover', 'कवर बनाएं')}
                    </button>
                  ) : (
                    <span className="ink-2 text-[13px] font-semibold">{L('Cover', 'कवर')}</span>
                  )}
                  <button type="button" onClick={() => movePhoto(i, i + 1)} disabled={i === draft.images.length - 1} aria-label={L('Move right', 'दाएं करें')} className="press grid size-11 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[var(--ink)] disabled:cursor-default disabled:opacity-25">
                    <ChevronRight className="size-5" />
                  </button>
                </div>
              </li>
            ))}
            {uploading.map((u) => (
              <li key={u.id} className="relative aspect-square overflow-hidden rounded-[18px] bg-[var(--chalk)]">
                <img src={u.preview} alt="" className="size-full object-cover opacity-40" />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="flex flex-col items-center gap-1 text-[13px] font-semibold">
                    <Spinner className="size-7" />
                    {L('Uploading…', 'अपलोड हो रही है…')}
                  </span>
                </span>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={`press flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed bg-transparent text-[var(--ink)] ${errors.photos ? 'border-[var(--danger)]' : 'border-[color-mix(in_srgb,var(--ink)_22%,transparent)]'}`}
              >
                <ImagePlus className="size-8" strokeWidth={1.75} />
                <span className="text-[15px] font-semibold">{L('Add photo', 'फ़ोटो जोड़ें')}</span>
                <span className="ink-2 px-2 text-center text-[12.5px]">{L('Camera or gallery', 'कैमरा या गैलरी')}</span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => void addFiles(e.target.files)} />
            </li>
          </ul>
          {errors.photos && <p className="mt-3 text-[14px] font-medium text-[var(--danger)]">{errors.photos}</p>}
        </Panel>

        {/* 2. name + description */}
        <Panel>
          <h2 className={sectionTitle}>2. {L('Name & description', 'नाम और जानकारी')}</h2>
          <div className="grid gap-5">
            <BiInput
              label={L('Product name', 'सामान का नाम')}
              value={draft.name}
              onChange={(v) => {
                set('name', v)
                if (v.en.trim()) setErrors((e) => ({ ...e, name: undefined }))
              }}
              required
              error={errors.name}
              placeholder={{ en: 'e.g. Pichkari', hi: 'जैसे पिचकारी' }}
            />
            <BiInput
              label={L('Description', 'जानकारी')}
              value={draft.description}
              onChange={(v) => set('description', v)}
              multiline
              placeholder={{ en: 'One or two lines about it', hi: 'इसके बारे में एक-दो लाइन' }}
            />
            <p className="ink-2 -mt-2 text-[13.5px]">{L('Hindi is optional. If left empty, the English text is used.', 'हिंदी ज़रूरी नहीं है। खाली छोड़ने पर अंग्रेज़ी दिखेगी।')}</p>
          </div>
        </Panel>

        {/* 3. where it shows */}
        <Panel>
          <h2 className={sectionTitle}>3. {L('Where it shows', 'कहाँ दिखेगा')}</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label={L('Category', 'कैटेगरी')}
              value={draft.category}
              onChange={(v) => {
                const match = isNew ? seasons.find((s) => s.id === v) : undefined
                setDraft((d) => ({ ...d, category: v, ...(match ? { season: match.id } : {}) }))
              }}
              options={catOptions}
            />
            <Select label={L('Season', 'मौसम')} value={draft.season} onChange={(v) => set('season', v as Product['season'])} options={seasonOptions} />
          </div>
          <div className="mt-6">
            <Label>
              {L('Sold as', 'कैसे बिकता है')} <span aria-hidden="true">*</span>
            </Label>
            <div className="mt-3 grid gap-4">
              <Toggle checked={draft.sale.includes('retail')} onChange={(v) => setSale('retail', v)} label={L('Retail', 'रिटेल (फुटकर)')} description={L('Customers buy a few pieces', 'ग्राहक कुछ पीस खरीदते हैं')} />
              <Toggle checked={draft.sale.includes('wholesale')} onChange={(v) => setSale('wholesale', v)} label={L('Wholesale', 'थोक')} description={L('Shopkeepers buy in bulk', 'दुकानदार ज़्यादा मात्रा में खरीदते हैं')} />
            </div>
            {errors.sale && <p className="mt-3 text-[14px] font-medium text-[var(--danger)]">{errors.sale}</p>}
          </div>
        </Panel>

        {/* 4. variants */}
        <Panel>
          <h2 className={sectionTitle}>4. {L('Types / sizes', 'प्रकार / साइज़')}</h2>
          <p className="ink-2 -mt-2 mb-4 text-[14.5px]">{L('Optional. For example: Small, Medium, Large.', 'ज़रूरी नहीं। जैसे: छोटा, मीडियम, बड़ा।')}</p>
          {(draft.variants ?? []).length > 0 ? (
            <ul className="m-0 mb-4 flex list-none flex-wrap gap-2 p-0">
              {(draft.variants ?? []).map((v, i) => (
                <li key={i} className="flex min-h-11 items-center gap-1 rounded-full bg-[var(--chalk)] pl-4">
                  <span className="text-[14.5px] font-semibold">
                    {v.en}
                    {v.hi && v.hi !== v.en && <span className="ink-2 font-normal"> · {v.hi}</span>}
                  </span>
                  <button
                    type="button"
                    onClick={() => set('variants', (draft.variants ?? []).filter((_, j) => j !== i))}
                    aria-label={L(`Remove ${v.en}`, `${v.hi || v.en} हटाएं`)}
                    className="press grid size-11 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[var(--ink)]"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ink-2 mb-4 text-[14px] italic">{L('No types added.', 'कोई प्रकार नहीं जोड़ा।')}</p>
          )}
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div>
              <Label htmlFor="var-en" hint="English">
                {L('New type', 'नया प्रकार')}
              </Label>
              <input id="var-en" value={varEn} onChange={(e) => setVarEn(e.target.value)} onKeyDown={onVarKey} placeholder="Small" className="field-input" />
            </div>
            <div>
              <Label htmlFor="var-hi" hint="हिंदी">
                {L('New type', 'नया प्रकार')}
              </Label>
              <input id="var-hi" value={varHi} onChange={(e) => setVarHi(e.target.value)} onKeyDown={onVarKey} placeholder="छोटा" className="field-input" />
            </div>
            <button type="button" onClick={addVariant} disabled={!varEn.trim() && !varHi.trim()} className="btn btn-line press disabled:opacity-40">
              <Plus className="size-5" /> {L('Add', 'जोड़ें')}
            </button>
          </div>
        </Panel>

        {/* 5. switches */}
        <Panel>
          <h2 className={sectionTitle}>5. {L('Stock & highlight', 'स्टॉक और ख़ास')}</h2>
          <div className="grid gap-5">
            <Toggle
              checked={draft.inStock !== false}
              onChange={(v) => set('inStock', v)}
              label={L('In stock', 'स्टॉक में है')}
              description={L('Turn off when it runs out. It stays on the website marked "Out of stock".', 'खत्म होने पर बंद करें। वेबसाइट पर "स्टॉक खत्म" लिखा दिखेगा।')}
            />
            <Toggle
              checked={!!draft.featured}
              onChange={(v) => set('featured', v)}
              label={L('Show in "Popular"', '"लोकप्रिय" में दिखाएं')}
              description={L('Shows this product on the home page.', 'यह सामान होम पेज पर दिखेगा।')}
            />
          </div>
        </Panel>
      </div>

      {/* sticky action bar (sits above the mobile bottom tabs) */}
      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 mt-6 lg:bottom-4">
        <div className="flex gap-2 rounded-[24px] bg-[var(--chalk)] p-2 shadow-[0_8px_30px_-8px_rgb(10_9_30_/_0.35)]">
          {!isNew && (
            <button type="button" onClick={() => setAskDelete(true)} disabled={busy} className="btn btn-line press text-[var(--danger)] disabled:opacity-50" aria-label={L('Delete product', 'सामान हटाएं')}>
              <Trash2 className="size-5" />
              <span className="hidden sm:inline">{L('Delete', 'हटाएं')}</span>
            </button>
          )}
          <button type="button" onClick={() => void save()} disabled={busy || uploading.length > 0} className="btn btn-ink press flex-1 disabled:opacity-60">
            {saving ? <Spinner /> : uploading.length > 0 ? L('Uploading photos…', 'फ़ोटो अपलोड हो रही हैं…') : isNew ? L('Save product', 'सामान सेव करें') : L('Save changes', 'बदलाव सेव करें')}
          </button>
        </div>
      </div>

      <Confirm
        open={askDelete}
        title={L('Delete this product?', 'यह सामान हटाएं?')}
        body={L(`"${draft.name.en}" and its photos will be removed from the website. This cannot be undone.`, `"${draft.name.hi || draft.name.en}" और इसकी फ़ोटो वेबसाइट से हट जाएंगी। यह वापस नहीं होगा।`)}
        confirmLabel={L('Yes, delete', 'हाँ, हटाएं')}
        danger
        busy={deleting}
        onConfirm={() => void remove()}
        onClose={() => {
          if (!deleting) setAskDelete(false)
        }}
      />
    </div>
  )
}
