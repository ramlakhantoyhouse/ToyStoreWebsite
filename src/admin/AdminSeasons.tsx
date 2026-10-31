import { useState } from 'react'
import { CalendarRange, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { useCatalog } from '../data/catalog'
import { calendarOrder, type Season } from '../config/seasons'
import { useLang, type Bi } from '../i18n'
import { BiInput, PageHead, Panel, Select, Spinner, TextInput, useAdmin, useL, useUnsavedWarning } from './ui'
import { CoverPhoto } from './CoverPhoto'

type Win = [number, number, number, number]

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
  const { seasons, currentSeason } = useCatalog()
  const ordered = [...seasons].sort((a, b) => calendarOrder.indexOf(a.id) - calendarOrder.indexOf(b.id))
  const now = currentSeason()

  return (
    <div className="enter">
      <PageHead
        title={L('Seasons', 'मौसम')}
        sub={L(
          'The website automatically shows the season that matches today’s date. Change the dates below to move a season earlier or later.',
          'वेबसाइट आज की तारीख़ के हिसाब से अपने-आप सही मौसम दिखाती है। किसी मौसम को आगे-पीछे करने के लिए नीचे तारीख़ें बदलें।',
        )}
      />

      {now && (
        <div data-field={now.season.id} className="mb-6 flex items-center gap-3 rounded-[24px] bg-[var(--field)] p-4 text-[var(--ink)]">
          <CalendarRange className="size-6 shrink-0" />
          <p className="m-0 text-[15.5px] font-semibold">
            {now.upcoming ? L('Coming up next on the website: ', 'वेबसाइट पर अगला मौसम: ') : L('Showing on the website today: ', 'आज वेबसाइट पर दिख रहा है: ')}
            <span className="font-bold">{now.season.name[lang]}</span>
          </p>
        </div>
      )}

      <div className="grid gap-5">
        {ordered.map((s) => (
          <SeasonEditor key={s.id} season={s} />
        ))}
      </div>

      <p className="ink-2 mt-6 text-[14px]">
        {L(
          'If two seasons share the same dates, festivals win in this order: Diwali, Holi, Rakhi, Kites, Summer.',
          'अगर दो मौसमों की तारीख़ें एक साथ पड़ें, तो इस क्रम में दिखेंगे: दिवाली, होली, राखी, पतंग, गर्मी।',
        )}
      </p>
    </div>
  )
}

function SeasonEditor({ season }: { season: Season }) {
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
    const next: Season = draft.allYear ? draft : { ...draft, monthsOn: monthsOf(draft.windows) }
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
      <div data-field={season.id} className="flex items-center gap-3 bg-[var(--field)] px-4 py-3 text-[var(--ink)] sm:px-6">
        <h2 className="m-0 text-[20px] font-bold tracking-[-0.03em]">{season.name[lang] || season.name.en}</h2>
        <span className="ml-auto text-[14px] font-semibold opacity-80">{season.months[lang]}</span>
      </div>

      <div className="grid gap-6 p-4 sm:p-6">
        <BiInput label={L('Season name', 'मौसम का नाम')} value={draft.name} onChange={(v) => set('name', v)} required />
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
        </div>
      </div>
    </Panel>
  )
}
