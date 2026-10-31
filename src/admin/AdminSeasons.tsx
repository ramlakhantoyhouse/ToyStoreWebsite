import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, CalendarRange, Check, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { useCatalog } from '../data/catalog'
import type { Season } from '../config/seasons'
import { SEASON_IN_USE, slugify } from '../data/backend'
import { inkFor, isBuiltinSeason, SEASON_SWATCHES, seasonStyle } from '../lib/seasonColor'
import { useLang, type Bi } from '../i18n'
import { BiInput, Confirm, PageHead, Panel, Select, Spinner, TextInput, Toggle, useAdmin, useL, useUnsavedWarning } from './ui'
import { CoverPhoto } from './CoverPhoto'

type Win = [number, number, number, number]

const errMsg = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback)

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MONTHS_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर']
const DAYS_IN = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

/** Months (1-12) touched by the windows, for the year strip on the home page. */
function monthsOf(windows: Win[]) {
  const set = new Set<number>()
  for (const [sm, , em] of windows) for (let m = sm; m <= em; m++) set.add(m)
  return [...set].sort((a, b) => a - b)
}

/** /admin/seasons — festival seasons and the dates they show on the website. */
export default function AdminSeasons() {
  const L = useL()
  const { lang } = useLang()
  const { backend } = useAdmin()
  const { seasons: ordered, products, currentSeason, reload } = useCatalog()
  const now = currentSeason()
  const [adding, setAdding] = useState(false)
  const [scrollTo, setScrollTo] = useState<string | null>(null)
  const [moving, setMoving] = useState(false)
  const [toDelete, setToDelete] = useState<Season | null>(null)
  const [deleting, setDeleting] = useState(false)

  // bring a just-added season into view once it shows up in the list
  useEffect(() => {
    if (!scrollTo || !ordered.some((s) => s.id === scrollTo)) return
    document.getElementById(`season-${scrollTo}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setScrollTo(null)
  }, [scrollTo, ordered])

  const count = (id: string) => products.filter((p) => p.season === id).length

  async function move(index: number, dir: -1 | 1) {
    const j = index + dir
    if (j < 0 || j >= ordered.length) return
    const list = [...ordered]
    ;[list[index], list[j]] = [list[j], list[index]]
    setMoving(true)
    try {
      // save the new position of every season whose place changed
      for (const [i, x] of list.entries()) {
        if (x.sort !== i) await backend.saveSeason({ ...x, sort: i })
      }
      await reload()
    } catch (e) {
      toast.error(errMsg(e, L('Could not change the order. Please try again.', 'क्रम नहीं बदल सका। फिर से कोशिश करें।')))
    } finally {
      setMoving(false)
    }
  }

  async function remove() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await backend.deleteSeason(toDelete.id)
      await reload()
      toast.success(L(`${toDelete.name.en} deleted.`, `${toDelete.name.hi || toDelete.name.en} हटा दिया गया।`))
      setToDelete(null)
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      toast.error(
        msg === SEASON_IN_USE
          ? L(SEASON_IN_USE, 'पहले इस मौसम के सामान को किसी दूसरे मौसम में डालें।')
          : errMsg(e, L('Could not delete. Please try again.', 'हटाया नहीं जा सका। फिर से कोशिश करें।')),
      )
    } finally {
      setDeleting(false)
    }
  }

  const deleteBody = (s: Season) => {
    const n = count(s.id)
    if (n > 0)
      return L(
        `"${s.name.en}" still has ${n} product(s). Move them to another season first, then delete.`,
        `"${s.name.hi || s.name.en}" में अभी ${n} सामान हैं। पहले उन्हें दूसरे मौसम में डालें, फिर हटाएँ।`,
      )
    const base = L('It will disappear from the website.', 'यह वेबसाइट से हट जाएगा।')
    if (isBuiltinSeason(s.id))
      return `${base} ${L(
        'This is one of the shop’s original six seasons. Your changes to it will be lost, and it may come back later with its starting text and photo.',
        'यह दुकान के शुरुआती छह मौसमों में से एक है। इसमें किए गए बदलाव मिट जाएँगे, और यह बाद में अपने शुरुआती नाम-फ़ोटो के साथ वापस आ सकता है।',
      )}`
    return `${base} ${L('This cannot be undone.', 'इसे वापस नहीं लाया जा सकता।')}`
  }

  return (
    <div className="enter">
      <PageHead
        title={L('Seasons', 'मौसम')}
        sub={L(
          'The website automatically shows the season that matches today’s date. Change the dates below to move a season earlier or later.',
          'वेबसाइट आज की तारीख़ के हिसाब से अपने-आप सही मौसम दिखाती है। किसी मौसम को आगे-पीछे करने के लिए नीचे तारीख़ें बदलें।',
        )}
        actions={
          !adding && (
            <button type="button" onClick={() => setAdding(true)} className="btn btn-ink press">
              <Plus className="size-5" /> {L('Add season', 'मौसम जोड़ें')}
            </button>
          )
        }
      />

      {adding && (
        <div className="mb-6">
          <AddSeason
            seasons={ordered}
            onCancel={() => setAdding(false)}
            onAdded={(id) => {
              setAdding(false)
              setScrollTo(id)
            }}
          />
        </div>
      )}

      {now && (
        <div data-field={now.season.id} style={seasonStyle(now.season)} className="mb-6 flex items-center gap-3 rounded-[24px] bg-[var(--field)] p-4 text-[var(--ink)]">
          <CalendarRange className="size-6 shrink-0" />
          <p className="m-0 text-[15.5px] font-semibold">
            {now.upcoming ? L('Coming up next on the website: ', 'वेबसाइट पर अगला मौसम: ') : L('Showing on the website today: ', 'आज वेबसाइट पर दिख रहा है: ')}
            <span className="font-bold">{now.season.name[lang] || now.season.name.en}</span>
          </p>
        </div>
      )}

      <div className="grid gap-5">
        {ordered.map((s, i) => (
          <SeasonEditor
            key={s.id}
            season={s}
            first={i === 0}
            last={i === ordered.length - 1}
            moving={moving}
            onMove={(dir) => void move(i, dir)}
            onDelete={() => setToDelete(s)}
          />
        ))}
      </div>

      {moving && (
        <p className="ink-2 mt-3 flex items-center gap-2 text-[14px]" role="status">
          <Spinner className="size-4" /> {L('Saving the new order…', 'नया क्रम सेव हो रहा है…')}
        </p>
      )}

      <p className="ink-2 mt-6 text-[14px]">
        {L(
          'If two seasons share the same dates, festivals win in this order: Diwali, Holi, Rakhi, Kites, Summer, then the seasons you added, in the order shown above.',
          'अगर दो मौसमों की तारीख़ें एक साथ पड़ें, तो इस क्रम में दिखेंगे: दिवाली, होली, राखी, पतंग, गर्मी, फिर आपके जोड़े हुए मौसम, ऊपर दिखे क्रम में।',
        )}
      </p>

      <Confirm
        open={!!toDelete}
        title={L('Delete this season?', 'यह मौसम हटाएँ?')}
        body={toDelete ? deleteBody(toDelete) : undefined}
        confirmLabel={L('Delete', 'हटाएँ')}
        danger
        busy={deleting}
        onConfirm={() => void remove()}
        onClose={() => setToDelete(null)}
      />
    </div>
  )
}

/** Small form behind "+ Add season": name, colour, all-year. */
function AddSeason({ seasons, onCancel, onAdded }: { seasons: Season[]; onCancel: () => void; onAdded: (id: string) => void }) {
  const L = useL()
  const { backend } = useAdmin()
  const { categories, reload } = useCatalog()
  const [name, setName] = useState<Bi>({ en: '', hi: '' })
  const [color, setColor] = useState(SEASON_SWATCHES[0])
  const [allYear, setAllYear] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function create() {
    const en = name.en.trim()
    if (!en) {
      setError(L('Type the season name in English.', 'मौसम का नाम अंग्रेज़ी में लिखें।'))
      return
    }
    const hi = name.hi.trim()
    const taken = new Set(seasons.map((s) => s.id))
    const base = slugify(en)
    let id = base
    for (let n = 2; taken.has(id); n++) id = `${base}-${n}`
    const season: Season = {
      id,
      name: { en, hi: hi || en },
      months: allYear ? { en: 'All year', hi: 'साल भर' } : { en: '', hi: '' },
      line: { en: '', hi: '' },
      items: [],
      image: categories[0]?.image || '/images/toys-wooden.webp',
      alt: { en, hi: hi || en },
      windows: [],
      ...(allYear ? { allYear: true } : {}),
      headline: { en: `${en} is here.`, hi: hi || en },
      monthsOn: allYear ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : [],
      duo: ['#000000', '#ffffff'],
      photos: [],
      color,
      sort: Math.max(-1, ...seasons.map((s, i) => s.sort ?? i)) + 1,
    }
    setSaving(true)
    try {
      await backend.saveSeason(season)
      await reload()
      toast.success(L(`${en} added. Now set its dates and photo below.`, `${hi || en} जुड़ गया। अब नीचे इसकी तारीख़ें और फ़ोटो लगाएँ।`))
      onAdded(id)
    } catch (e) {
      toast.error(errMsg(e, L('Could not save. Please try again.', 'सेव नहीं हो सका। फिर से कोशिश करें।')))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Panel>
      <h2 className="m-0 text-[20px] font-bold tracking-[-0.03em]">{L('New season', 'नया मौसम')}</h2>
      <p className="ink-2 mt-1 mb-4 text-[14px]">
        {L(
          'For example Christmas, Back to school or Eid. You can add dates, items and a photo after saving.',
          'जैसे क्रिसमस, स्कूल खुलने का मौसम या ईद। सेव करने के बाद तारीख़ें, सामान और फ़ोटो जोड़ सकते हैं।',
        )}
      </p>
      <div className="grid gap-5">
        <BiInput
          label={L('Season name', 'मौसम का नाम')}
          value={name}
          onChange={(v) => {
            setName(v)
            setError('')
          }}
          required
          error={error || undefined}
          placeholder={{ en: 'e.g. Christmas', hi: 'जैसे क्रिसमस' }}
        />
        <SwatchPicker label={L('Colour', 'रंग')} value={color} onChange={(v) => setColor(v ?? SEASON_SWATCHES[0])} />
        <Toggle
          checked={allYear}
          onChange={setAllYear}
          label={L('Available all year', 'साल भर उपलब्ध')}
          description={L('Turn on if it is not tied to dates (like Sports).', 'अगर यह किसी तारीख़ से नहीं जुड़ा (जैसे खेल), तो चालू करें।')}
        />
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => void create()} disabled={saving} className="btn btn-ink press min-w-40">
            {saving ? <Spinner /> : L('Save season', 'मौसम सेव करें')}
          </button>
          <button type="button" onClick={onCancel} disabled={saving} className="btn btn-line press">
            {L('Cancel', 'रहने दें')}
          </button>
        </div>
      </div>
    </Panel>
  )
}

/** Row of toy colours. Built-in seasons also get "Original" to go back to their own colour. */
function SwatchPicker({ label, value, onChange, original }: { label: string; value?: string; onChange: (v: string | undefined) => void; original?: boolean }) {
  const L = useL()
  return (
    <div role="radiogroup" aria-label={label}>
      <p className="mb-2 text-[14.5px] font-semibold">{label}</p>
      <div className="flex flex-wrap gap-2">
        {original && (
          <button
            type="button"
            role="radio"
            aria-checked={!value}
            onClick={() => onChange(undefined)}
            className={`press min-h-11 cursor-pointer rounded-full border-0 bg-[var(--chalk)] px-4 text-[14px] font-semibold text-[var(--ink)] ${!value ? 'shadow-[inset_0_0_0_3px_var(--ink)]' : ''}`}
          >
            {L('Original', 'पहले वाला')}
          </button>
        )}
        {SEASON_SWATCHES.map((hex) => {
          const on = value?.toLowerCase() === hex
          return (
            <button
              key={hex}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={hex}
              title={hex}
              onClick={() => onChange(hex)}
              style={{ background: hex, color: inkFor(hex) }}
              className={`press grid size-11 cursor-pointer place-items-center rounded-full border-0 ${on ? 'shadow-[0_0_0_3px_var(--chalk),0_0_0_5px_var(--ink)]' : ''}`}
            >
              {on && <Check className="size-5" strokeWidth={3} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function IconBtn({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="press grid size-11 cursor-pointer place-items-center rounded-full border-0 bg-[color-mix(in_srgb,var(--ink)_14%,transparent)] text-[var(--ink)] disabled:cursor-default disabled:opacity-30"
    >
      {children}
    </button>
  )
}

function SeasonEditor({
  season,
  first,
  last,
  moving,
  onMove,
  onDelete,
}: {
  season: Season
  first: boolean
  last: boolean
  moving: boolean
  onMove: (dir: -1 | 1) => void
  onDelete: () => void
}) {
  const L = useL()
  const { lang } = useLang()
  const { backend } = useAdmin()
  const { reload } = useCatalog()
  const [draft, setDraft] = useState<Season>(season)
  const [saved, setSaved] = useState(() => JSON.stringify(season))
  const [newItem, setNewItem] = useState<Bi>({ en: '', hi: '' })
  const [saving, setSaving] = useState(false)
  const dirty = JSON.stringify(draft) !== saved
  useUnsavedWarning(dirty)

  const set = <K extends keyof Season>(k: K, v: Season[K]) => setDraft((d) => ({ ...d, [k]: v }))
  const monthNames = lang === 'hi' ? MONTHS_HI : MONTHS_EN
  const monthOpts = monthNames.map((m, i) => ({ value: String(i + 1), label: m }))
  const dayOpts = (month: number) => Array.from({ length: DAYS_IN[month - 1] }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))

  const setWin = (i: number, part: number, value: number) => {
    const windows = draft.windows.map((w, j) => {
      if (j !== i) return w
      const next = [...w] as Win
      next[part] = value
      // keep the day valid for the month (e.g. 31 → 30 for June)
      next[1] = Math.min(next[1], DAYS_IN[next[0] - 1])
      next[3] = Math.min(next[3], DAYS_IN[next[2] - 1])
      return next
    })
    set('windows', windows)
  }

  const badWindow = draft.windows.findIndex(([sm, sd, em, ed]) => sm * 100 + sd > em * 100 + ed)

  function addItem() {
    const en = newItem.en.trim()
    if (!en) {
      toast.error(L('Type the item name in English first.', 'पहले अंग्रेज़ी में नाम लिखें।'))
      return
    }
    set('items', [...draft.items, { en, hi: newItem.hi.trim() || en }])
    setNewItem({ en: '', hi: '' })
  }

  async function save() {
    if (!draft.name.en.trim()) {
      toast.error(L('The season needs an English name.', 'मौसम का अंग्रेज़ी नाम ज़रूरी है।'))
      return
    }
    if (badWindow >= 0) {
      toast.error(L('A date window ends before it starts. Please fix it.', 'एक तारीख़ का समय शुरू होने से पहले ख़त्म हो रहा है। कृपया ठीक करें।'))
      return
    }
    if (!draft.allYear && draft.windows.length === 0) {
      toast.error(L('Add at least one date window, or the season will never show.', 'कम से कम एक तारीख़ जोड़ें, वरना यह मौसम कभी नहीं दिखेगा।'))
      return
    }
    // order is changed with the arrows, so keep the saved position
    const base: Season = { ...draft, sort: season.sort }
    const next: Season = base.allYear ? base : { ...base, monthsOn: monthsOf(base.windows) }
    setSaving(true)
    try {
      await backend.saveSeason(next)
      await reload()
      setDraft(next)
      setSaved(JSON.stringify(next))
      toast.success(L(`${next.name.en} saved.`, `${next.name.hi || next.name.en} सेव हो गया।`))
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : L('Could not save. Please try again.', 'सेव नहीं हो सका। फिर से कोशिश करें।'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Panel className="overflow-hidden !p-0">
      <div
        id={`season-${season.id}`}
        data-field={season.id}
        style={seasonStyle({ id: season.id, color: draft.color })}
        className="flex scroll-mt-24 items-center gap-3 bg-[var(--field)] px-4 py-3 text-[var(--ink)] sm:px-6"
      >
        <div className="min-w-0 flex-1">
          <h2 className="m-0 truncate text-[20px] font-bold tracking-[-0.03em]">{season.name[lang] || season.name.en}</h2>
          {season.months[lang] && <span className="text-[14px] font-semibold opacity-80">{season.months[lang]}</span>}
        </div>
        <div className="flex shrink-0 gap-1.5">
          <IconBtn label={L('Move up', 'ऊपर करें')} disabled={moving || first} onClick={() => onMove(-1)}>
            <ArrowUp className="size-5" />
          </IconBtn>
          <IconBtn label={L('Move down', 'नीचे करें')} disabled={moving || last} onClick={() => onMove(1)}>
            <ArrowDown className="size-5" />
          </IconBtn>
        </div>
      </div>

      <div className="grid gap-6 p-4 sm:p-6">
        <BiInput label={L('Season name', 'मौसम का नाम')} value={draft.name} onChange={(v) => set('name', v)} required />
        <SwatchPicker
          label={L('Colour on the website', 'वेबसाइट पर रंग')}
          value={draft.color}
          original={isBuiltinSeason(season.id)}
          onChange={(v) =>
            setDraft((d) => {
              const { color: _old, ...rest } = d
              void _old
              return v ? { ...rest, color: v } : rest
            })
          }
        />
        <BiInput label={L('Months (shown on cards)', 'महीने (कार्ड पर दिखते हैं)')} value={draft.months} onChange={(v) => set('months', v)} placeholder={{ en: 'e.g. Oct – Nov', hi: 'जैसे अक्टूबर – नवंबर' }} />
        <BiInput label={L('One-line description', 'एक लाइन में जानकारी')} value={draft.line} onChange={(v) => set('line', v)} multiline />

        {/* example items */}
        <div>
          <p className="mb-1 text-[14.5px] font-semibold">{L('Example items', 'उदाहरण सामान')}</p>
          <p className="ink-2 mb-3 text-[13.5px]">{L('A few things you sell in this season. Shown as a list on the website.', 'इस मौसम में बिकने वाली कुछ चीज़ें। वेबसाइट पर सूची में दिखती हैं।')}</p>
          {draft.items.length > 0 ? (
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {draft.items.map((it, i) => (
                <li key={`${it.en}-${i}`} className="flex min-h-11 items-center gap-1 rounded-full bg-[var(--chalk)] py-1 pr-1 pl-4 text-[14.5px] font-semibold">
                  <span>{it[lang] || it.en}</span>
                  <button
                    type="button"
                    aria-label={L(`Remove ${it.en}`, `${it.hi || it.en} हटाएँ`)}
                    onClick={() => set('items', draft.items.filter((_, j) => j !== i))}
                    className="press grid size-9 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[var(--ink)] hover:bg-[var(--card)]"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ink-2 text-[14px]">{L('No items yet — add one below.', 'अभी कोई सामान नहीं — नीचे जोड़ें।')}</p>
          )}
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <TextInput label={L('New item', 'नया सामान')} hint="English" value={newItem.en} onChange={(en) => setNewItem((v) => ({ ...v, en }))} />
            <TextInput label={L('New item', 'नया सामान')} hint="हिंदी" value={newItem.hi} onChange={(hi) => setNewItem((v) => ({ ...v, hi }))} />
            <button type="button" onClick={addItem} className="btn btn-line press">
              <Plus className="size-5" /> {L('Add', 'जोड़ें')}
            </button>
          </div>
        </div>

        {/* cover photo */}
        <div>
          <p className="mb-2 text-[14.5px] font-semibold">{L('Cover photo', 'कवर फ़ोटो')}</p>
          <CoverPhoto value={draft.image} onChange={(v) => set('image', v)} nameHint={`season-${season.id}`} alt={draft.alt?.en || draft.name.en} />
        </div>

        {/* date windows */}
        <div>
          <p className="mb-1 text-[14.5px] font-semibold">{L('When to show on the website', 'वेबसाइट पर कब दिखाना है')}</p>
          {draft.allYear ? (
            <p data-field="green" className="mt-2 inline-block rounded-full bg-[var(--field)] px-4 py-2 text-[14.5px] font-semibold text-[var(--ink)]">
              {L('Available all year', 'साल भर उपलब्ध')}
            </p>
          ) : (
            <>
              <p className="ink-2 mb-3 text-[13.5px]">
                {L(
                  'Pick the start and end date. A season can have more than one window (e.g. January and August for kites).',
                  'शुरू और ख़त्म होने की तारीख़ चुनें। एक मौसम के एक से ज़्यादा समय हो सकते हैं (जैसे पतंग के लिए जनवरी और अगस्त)।',
                )}
              </p>
              <div className="grid gap-3">
                {draft.windows.map((w, i) => (
                  <div key={i} className={`rounded-[18px] bg-[var(--chalk)] p-3 ${i === badWindow ? 'shadow-[inset_0_0_0_2px_var(--danger)]' : ''}`}>
                    <div className="grid grid-cols-[1fr_88px] gap-2">
                      <Select label={L('From — month', 'कब से — महीना')} value={String(w[0])} onChange={(v) => setWin(i, 0, Number(v))} options={monthOpts} />
                      <Select label={L('Day', 'तारीख़')} value={String(w[1])} onChange={(v) => setWin(i, 1, Number(v))} options={dayOpts(w[0])} />
                      <Select label={L('To — month', 'कब तक — महीना')} value={String(w[2])} onChange={(v) => setWin(i, 2, Number(v))} options={monthOpts} />
                      <Select label={L('Day', 'तारीख़')} value={String(w[3])} onChange={(v) => setWin(i, 3, Number(v))} options={dayOpts(w[2])} />
                    </div>
                    {i === badWindow && (
                      <p className="mt-2 text-[13.5px] font-medium text-[var(--danger)]">
                        {L(
                          'The end date is before the start date. To cross New Year, make two windows (e.g. 20 Dec–31 Dec and 1 Jan–10 Jan).',
                          'ख़त्म होने की तारीख़ शुरू से पहले है। नए साल के पार जाने के लिए दो समय बनाएँ (जैसे 20–31 दिसंबर और 1–10 जनवरी)।',
                        )}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => set('windows', draft.windows.filter((_, j) => j !== i))}
                      className="press mt-2 flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-0 bg-transparent px-2 text-[14px] font-semibold text-[var(--danger)]"
                    >
                      <Trash2 className="size-4" /> {L('Remove these dates', 'ये तारीख़ें हटाएँ')}
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => set('windows', [...draft.windows, [season.windows[0]?.[0] ?? 1, 1, season.windows[0]?.[2] ?? 1, 28]])} className="btn btn-line press mt-3">
                <Plus className="size-5" /> {L('Add dates', 'तारीख़ें जोड़ें')}
              </button>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t-2 border-[var(--chalk)] pt-4">
          <button type="button" onClick={() => void save()} disabled={!dirty || saving} className="btn btn-ink press min-w-40 disabled:opacity-40">
            {saving ? <Spinner /> : L('Save season', 'मौसम सेव करें')}
          </button>
          {dirty && !saving && (
            <>
              <span className="ink-2 text-[14px]">{L('You have unsaved changes', 'बदलाव अभी सेव नहीं हुए')}</span>
              <button
                type="button"
                onClick={() => setDraft(JSON.parse(saved) as Season)}
                className="press min-h-11 cursor-pointer rounded-full border-0 bg-transparent px-3 text-[14px] font-semibold text-[var(--ink)] underline"
              >
                {L('Undo changes', 'बदलाव वापस लें')}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="press ml-auto flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-0 bg-transparent px-3 text-[14px] font-semibold text-[var(--danger)]"
          >
            <Trash2 className="size-4" /> {L('Delete season', 'मौसम हटाएँ')}
          </button>
        </div>
      </div>
    </Panel>
  )
}
