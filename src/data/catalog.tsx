import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getBackend, starterCatalog } from './backend'
import type { Catalog, DayHours, Settings } from './types'
import { calendarOrder, type Season } from '../config/seasons'

type Ctx = Catalog & {
  loading: boolean
  /** true when the live data could not be reached and the bundled list is shown */
  offline: boolean
  reload: () => Promise<void>
}

const CatalogCtx = createContext<Ctx | null>(null)

/**
 * Loads products, categories, seasons and shop settings once for the whole
 * app. Starts from the bundled starter catalogue so the site paints instantly
 * and still works if the database is unreachable.
 */
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Catalog>(() => starterCatalog())
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)

  const reload = useCallback(async () => {
    try {
      const b = await getBackend()
      const c = await b.loadCatalog()
      // an empty database (before the starter import) keeps the bundled list
      setData(c.products.length || c.categories.length ? c : { ...starterCatalog(), settings: c.settings })
      setOffline(false)
    } catch {
      setOffline(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const value = useMemo(() => ({ ...data, loading, offline, reload }), [data, loading, offline, reload])
  return <CatalogCtx.Provider value={value}>{children}</CatalogCtx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCatalog() {
  const c = useContext(CatalogCtx)
  if (!c) throw new Error('useCatalog outside CatalogProvider')
  const visible = useMemo(
    () => [...c.products].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)),
    [c.products],
  )
  const categories = useMemo(() => [...c.categories].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)), [c.categories])
  const seasons = useMemo(() => sortedSeasons(c.seasons), [c.seasons])
  return {
    ...c,
    products: visible,
    categories,
    seasons,
    bySlug: (slug: string) => visible.find((p) => p.slug === slug),
    catById: (id: string) => categories.find((x) => x.id === id),
    seasonById: (id: string) => seasons.find((s) => s.id === id),
    currentSeason: () => currentSeasonFrom(seasons),
    isOpenNow: () => isOpenFrom(c.settings),
    todayHours: () => hoursFor(c.settings, istNow().getDay()),
  }
}

/* ---------- pure helpers (also used by the admin) ---------- */

export function istNow(now = new Date()) {
  return new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000)
}

export const hoursFor = (s: Settings, dow: number): DayHours | undefined => s.hours.find((h) => h.dow === dow)

export function isOpenFrom(s: Settings, now = new Date()) {
  if (s.holiday.on) return false
  const ist = istNow(now)
  const h = hoursFor(s, ist.getDay())
  if (!h || h.closed) return false
  const mins = ist.getHours() * 60 + ist.getMinutes()
  const toM = (t: string) => {
    const [a, b] = t.split(':').map(Number)
    return a * 60 + b
  }
  return mins >= toM(h.open) && mins < toM(h.close)
}

/** "09:00" → "9 AM" / "सुबह 9" */
export function fmtTime(t: string, lang: 'en' | 'hi') {
  const [h, m] = t.split(':').map(Number)
  const h12 = ((h + 11) % 12) + 1
  const mm = m ? `:${String(m).padStart(2, '0')}` : ''
  if (lang === 'en') return `${h12}${mm} ${h < 12 ? 'AM' : 'PM'}`
  const part = h < 12 ? 'सुबह' : h < 16 ? 'दोपहर' : h < 19 ? 'शाम' : 'रात'
  return `${part} ${h12}${mm}`
}

export function fmtHours(h: DayHours | undefined, lang: 'en' | 'hi') {
  if (!h || h.closed) return lang === 'en' ? 'Closed' : 'बंद'
  return `${fmtTime(h.open, lang)} – ${fmtTime(h.close, lang)}`
}

/** Site order: the saved sort, else calendar order, new seasons last. */
export function sortedSeasons(seasons: Season[]): Season[] {
  const rank = (s: Season) => {
    if (typeof s.sort === 'number') return s.sort
    const i = calendarOrder.indexOf(s.id)
    return i >= 0 ? i : 999
  }
  return [...seasons].sort((a, b) => rank(a) - rank(b))
}

// Festival seasons win over kites when windows overlap (Rakhi beats August kites).
const PRIORITY: string[] = ['diwali', 'holi', 'rakhi', 'kites', 'summer']

function inWindow(d: Date, [sm, sd, em, ed]: [number, number, number, number]) {
  const v = (d.getMonth() + 1) * 100 + d.getDate()
  return v >= sm * 100 + sd && v <= em * 100 + ed
}

export function currentSeasonFrom(seasons: Season[], now = new Date()): { season: Season; upcoming: boolean } {
  const d = istNow(now)
  // dated seasons: built-ins by festival priority, then added seasons by sort
  const sorted = sortedSeasons(seasons)
  const dated = sorted.filter((s) => !s.allYear && s.windows.length > 0)
  const pr = (s: Season) => {
    const i = PRIORITY.indexOf(s.id)
    return i >= 0 ? i : PRIORITY.length + sorted.indexOf(s)
  }
  dated.sort((a, b) => pr(a) - pr(b))
  const on = (day: Date) => dated.find((s) => s.windows.some((w) => inWindow(day, w)))
  const today = on(d)
  if (today) return { season: today, upcoming: false }
  for (let i = 1; i <= 366; i++) {
    const s = on(new Date(d.getTime() + i * 86400000))
    if (s) return { season: s, upcoming: true }
  }
  return { season: sorted.find((s) => s.allYear) ?? sorted[0], upcoming: false }
}
