import { Phone } from 'lucide-react'
import { useLang } from '../i18n'
import { useShop } from '../lib/useShop'
import { WhatsAppIcon } from './Icons'

/**
 * The extra numbers the owner added in /admin → Shop settings, each with its
 * own Call / WhatsApp buttons. Renders nothing when there are none.
 */
export function ContactList({ compact = false, className = '' }: { compact?: boolean; className?: string }) {
  const { t } = useLang()
  const { contacts } = useShop()
  if (!contacts.length) return null

  if (compact)
    return (
      <ul className={`m-0 grid list-none gap-2 p-0 ${className}`} role="list">
        {contacts.map((c, i) => (
          <li key={i} className="grid gap-0.5">
            {c.name && <span className="text-[13px] opacity-60">{c.name}</span>}
            <span className="flex flex-wrap gap-x-4 gap-y-1">
              {c.tel && (
                <a href={c.tel} className="no-underline opacity-80 transition-opacity hover:opacity-100">
                  {c.phoneDisplay}
                </a>
              )}
              {c.wa && (
                <a href={c.wa} target="_blank" rel="noreferrer" className="no-underline opacity-80 transition-opacity hover:opacity-100">
                  WhatsApp{!c.tel ? ` · ${c.phoneDisplay}` : ''}
                </a>
              )}
            </span>
          </li>
        ))}
      </ul>
    )

  return (
    <div className={className}>
      <h3 className="text-[15px] font-semibold tracking-normal">{t('more_contacts')}</h3>
      <ul className="m-0 mt-3 grid list-none gap-3 p-0" role="list">
        {contacts.map((c, i) => (
          <li key={i} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[18px] bg-[var(--card)] p-3 pl-4">
            <span className="mr-auto min-w-0">
              {c.name && <span className="block truncate text-[15.5px] font-semibold">{c.name}</span>}
              <span className="ink-2 block text-[14.5px]">{c.phoneDisplay}</span>
            </span>
            <span className="flex gap-2">
              {c.tel && (
                <a href={c.tel} className="btn btn-line press min-h-11 px-4 text-[14.5px]" aria-label={`${t('call')} ${c.name || c.phoneDisplay}`}>
                  <Phone className="size-4" strokeWidth={2} /> {t('call')}
                </a>
              )}
              {c.wa && (
                <a href={c.wa} target="_blank" rel="noreferrer" className="btn btn-ink press min-h-11 px-4 text-[14.5px]" aria-label={`WhatsApp ${c.name || c.phoneDisplay}`}>
                  <WhatsAppIcon className="size-4" /> WhatsApp
                </a>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
