import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { useLang, type Key } from '../i18n'
import { useTheme } from '../lib/theme'
import { Logo } from './Logo'

const nav: { to: string; k: Key }[] = [
  { to: '/products', k: 'nav_shop' },
  { to: '/seasons', k: 'nav_seasons' },
  { to: '/wholesale', k: 'nav_wholesale' },
  { to: '/visit', k: 'nav_visit' },
]

// The header has no colour of its own: it sits on whatever field is live.
export function Header() {
  const { t, lang, setLang } = useLang()
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const loc = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [loc.pathname])
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  const iconBtn = 'press grid size-11 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_10%,transparent)]'

  return (
    <header
      className={`sticky top-0 z-40 text-[var(--ink)] transition-[background-color,box-shadow,color] duration-700 ease-[var(--ease-out)] ${
        scrolled ? 'bg-[var(--field)] shadow-[0_1px_0_color-mix(in_srgb,var(--ink)_18%,transparent)]' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center gap-1 px-4 sm:px-10">
        <Link to="/" viewTransition className="press mr-auto no-underline" aria-label="Ram Lakhan Toy House, home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} viewTransition className="group relative px-4 py-2 text-[15.5px] font-medium no-underline">
              {({ isActive }) => (
                <>
                  {t(n.k)}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-4 bottom-0.5 h-[2px] origin-left rounded-full bg-[var(--ink)] transition-transform duration-300 ease-[var(--ease-out)] ${
                      isActive ? 'scale-x-100' : 'scale-x-0 [@media(hover:hover)]:group-hover:scale-x-100'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <span aria-hidden="true" className="mx-2 hidden h-5 w-px bg-[color-mix(in_srgb,var(--ink)_30%,transparent)] lg:block" />
        <button
          type="button"
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className="press h-11 min-w-11 cursor-pointer rounded-full border-0 bg-transparent px-2 text-[15px] font-medium text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_10%,transparent)]"
          aria-label={lang === 'en' ? 'हिंदी में देखें' : 'View in English'}
        >
          {lang === 'en' ? 'हिं' : 'EN'}
        </button>
        <button type="button" onClick={toggle} className={iconBtn} aria-label={theme === 'dark' ? t('theme_light') : t('theme_dark')}>
          {theme === 'dark' ? <Sun className="size-[19px]" strokeWidth={1.75} /> : <Moon className="size-[19px]" strokeWidth={1.75} />}
        </button>

        <div ref={menuRef} className="relative lg:hidden">
          <button type="button" onClick={() => setOpen((o) => !o)} className={iconBtn} aria-expanded={open} aria-controls="mobile-menu" aria-label={t('menu')}>
            {open ? <X className="size-5" strokeWidth={1.75} /> : <Menu className="size-5" strokeWidth={1.75} />}
          </button>
          <div
            id="mobile-menu"
            aria-hidden={!open}
            className={`absolute right-0 top-full mt-2 w-64 origin-top-right rounded-[22px] bg-[var(--ink)] p-2 text-[var(--field)] shadow-[0_24px_50px_-20px_rgb(0_0_0_/_0.5)] transition-[opacity,transform] duration-200 ease-[var(--ease-out)] ${
              open ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
            }`}
          >
            {[{ to: '/', k: 'nav_home' as Key }, ...nav].map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                viewTransition
                tabIndex={open ? 0 : -1}
                className={({ isActive }) =>
                  `flex min-h-13 items-center rounded-[16px] px-4 text-[17px] font-medium no-underline ${isActive ? 'bg-[color-mix(in_srgb,var(--field)_16%,transparent)]' : ''}`
                }
              >
                {t(n.k)}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
