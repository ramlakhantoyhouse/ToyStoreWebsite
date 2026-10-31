import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useLang } from '../i18n'
import { WhatsAppIcon } from './Icons'
import { useShop } from '../lib/useShop'

export function FloatingWhatsApp() {
  const { t } = useLang()
  const { wa } = useShop()
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  // On home the hero already shows a WhatsApp button; appear once it scrolls away.
  const [past, setPast] = useState(!onHome)
  useEffect(() => {
    if (!onHome) {
      setPast(true)
      return
    }
    const on = () => setPast(window.scrollY > window.innerHeight * 0.7)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [onHome])

  // Product pages already have a sticky WhatsApp bar.
  if (pathname.startsWith('/products/')) return null
  return (
    <a
      href={wa('Namaste! I have a question about Ram Lakhan Toy House.')}
      target="_blank"
      rel="noreferrer"
      aria-label={t('wa_us')}
      tabIndex={past ? 0 : -1}
      aria-hidden={!past}
      className={`press fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 grid size-14 place-items-center rounded-full bg-[var(--wa)] text-[var(--wa-ink)] no-underline shadow-[0_12px_30px_-10px_rgb(4_48_26_/_0.6)] transition-[opacity,transform] duration-200 ease-[var(--ease-out)] ${
        past ? 'scale-100 opacity-100' : 'pointer-events-none scale-90 opacity-0'
      }`}
    >
      <WhatsAppIcon className="size-7" />
    </a>
  )
}
