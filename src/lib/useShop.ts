import { useLang } from '../i18n'
import { fmtHours, hoursFor, istNow, useCatalog } from '../data/catalog'
import type { Product, Settings } from '../data/types'
import { fmtPhone, telLink, waLink } from './enquiry'

/** Mon..Sun as day-of-week numbers (0 = Sunday). */
export const WEEK = [1, 2, 3, 4, 5, 6, 0]

const DAY = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  hi: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
}
const SHORT = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  hi: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
}

export const dayName = (dow: number, lang: 'en' | 'hi') => DAY[lang][dow]

/** "9 AM – 9 PM daily · Wed 9 AM – 2 PM": the usual hours, then the days that differ. */
export function hoursSummary(s: Settings, lang: 'en' | 'hi') {
  const txt = WEEK.map((d) => fmtHours(hoursFor(s, d), lang))
  const counts = new Map<string, number>()
  txt.forEach((x) => counts.set(x, (counts.get(x) ?? 0) + 1))
  const common = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
  const head = lang === 'en' ? `${common} daily` : `रोज़ ${common}`
  const rest = WEEK.map((d, i) => (txt[i] === common ? '' : `${SHORT[lang][d]} ${txt[i]}`)).filter(Boolean)
  return [head, ...rest].join(' · ')
}

/** Live phone, WhatsApp and hours from the owner's settings. */
export function useShop() {
  const { settings, isOpenNow } = useCatalog()
  const { lang } = useLang()
  const dow = istNow().getDay()
  return {
    settings,
    phoneDisplay: fmtPhone(settings.phone),
    tel: telLink(settings.phone),
    wa: (text?: string) => waLink(settings.whatsapp, text),
    whatsapp: settings.whatsapp,
    open: isOpenNow(),
    dow,
    todayHours: fmtHours(hoursFor(settings, dow), lang),
    summary: hoursSummary(settings, lang),
    week: WEEK.map((d) => ({ dow: d, day: dayName(d, lang), hours: fmtHours(hoursFor(settings, d), lang) })),
  }
}

export const OUT_OF_STOCK = { en: 'Out of stock', hi: 'अभी स्टॉक में नहीं' }

/** In-stock first, keeping the owner's order within each group. */
export const inStockFirst = (list: Product[]) =>
  [...list].sort((a, b) => Number(a.inStock === false) - Number(b.inStock === false))
