import { useLang } from '../i18n'
import { useCatalog } from '../data/catalog'

/** Owner's notices from the control centre: "shop closed today" and an announcement bar. */
export function SiteNotices() {
  const { pick } = useLang()
  const { settings } = useCatalog()
  const holiday = settings.holiday.on ? pick(settings.holiday.text).trim() || settings.holiday.text.en.trim() : ''
  const banner = settings.banner.on ? pick(settings.banner.text).trim() || settings.banner.text.en.trim() : ''
  if (!holiday && !banner) return null
  const bar = 'bg-[var(--field)] px-4 py-2.5 text-center text-[14.5px] leading-snug font-semibold text-[var(--ink)]'
  return (
    <div role="status">
      {holiday && (
        <p data-field="red" className={bar}>
          {holiday}
        </p>
      )}
      {banner && (
        <p data-field="yellow" className={bar}>
          {banner}
        </p>
      )}
    </div>
  )
}
