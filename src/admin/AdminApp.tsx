import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ExternalLink, Home, Inbox, LayoutGrid, LogOut, Moon, MoreHorizontal, Package, Settings as Cog, Sparkles, Sun, X } from 'lucide-react'
import { Toaster } from 'sonner'
import { AdminProvider, FullSpinner, useAdmin, useL } from './ui'
import { Login, ResetPassword } from './Login'
import { Monogram } from '../components/Logo'
import { useLang } from '../i18n'
import { useTheme } from '../lib/theme'

const Dashboard = lazy(() => import('./Dashboard'))
const Enquiries = lazy(() => import('./Enquiries'))
const ProductsList = lazy(() => import('./ProductsList'))
const ProductEdit = lazy(() => import('./ProductEdit'))
const Categories = lazy(() => import('./Categories'))
const AdminSeasons = lazy(() => import('./AdminSeasons'))
const Settings = lazy(() => import('./Settings'))

/** /admin — the shop owner's control centre. Customers never see this. */
export default function AdminApp() {
  useEffect(() => {
    document.title = 'Control Centre · Ram Lakhan Toy House'
    const m = document.createElement('meta')
    m.name = 'robots'
    m.content = 'noindex, nofollow'
    document.head.appendChild(m)
    return () => m.remove()
  }, [])
  return (
    <AdminProvider>
      <Gate />
      <Toaster position="top-center" richColors closeButton toastOptions={{ style: { fontFamily: 'Poppins, sans-serif' } }} />
    </AdminProvider>
  )
}

function Gate() {
  const { backend, user, ready } = useAdmin()
  const loc = useLocation()
  const [admin, setAdmin] = useState<boolean | null>(null)
  useEffect(() => {
    setAdmin(null)
    if (!user) return
    let alive = true
    void backend.isAdmin().then((ok) => {
      if (alive) setAdmin(ok)
    })
    return () => {
      alive = false
    }
  }, [backend, user])
  if (!ready) return <FullSpinner />
  if (loc.pathname.startsWith('/admin/reset')) return <ResetPassword />
  if (!user) return <Login />
  if (admin === null) return <FullSpinner />
  if (!admin) return <NotAdmin email={user.email} onLogout={() => void backend.signOut()} />
  return (
    <Shell>
      <Suspense fallback={<div className="grid min-h-[50vh] place-items-center opacity-60">…</div>}>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="products" element={<ProductsList />} />
          <Route path="products/new" element={<ProductEdit />} />
          <Route path="products/:slug" element={<ProductEdit />} />
          <Route path="categories" element={<Categories />} />
          <Route path="seasons" element={<AdminSeasons />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Suspense>
    </Shell>
  )
}

function NotAdmin({ email, onLogout }: { email: string; onLogout: () => void }) {
  const L = useL()
  return (
    <div className="grid min-h-dvh place-items-center bg-[var(--chalk)] px-4 text-[var(--ink)]">
      <div className="enter w-full max-w-md">
        <Monogram className="size-14" />
        <h1 className="mt-6 text-[2rem] leading-none font-bold tracking-[-0.05em]">{L('This account is not the shop owner yet', 'यह अकाउंट अभी मालिक के रूप में नहीं जुड़ा')}</h1>
        <p className="ink-2 mt-4 text-[15.5px]">
          {L('You are logged in as', 'आप लॉग इन हैं:')} <b className="text-[var(--ink)]">{email}</b>.{' '}
          {L(
            'Ask your helper to add this email to the admins list in Supabase (see ADMIN-SETUP.md, step "make the owner an admin"), then log in again.',
            'अपने हेल्पर से कहें कि वो Supabase में इस ईमेल को admins लिस्ट में जोड़ दे (ADMIN-SETUP.md देखें), फिर दोबारा लॉग इन करें।',
          )}
        </p>
        <button type="button" onClick={onLogout} className="btn btn-ink press mt-8 w-full">
          {L('Log out', 'लॉग आउट')}
        </button>
      </div>
    </div>
  )
}

function Shell({ children }: { children: ReactNode }) {
  const L = useL()
  const { lang, setLang } = useLang()
  const { theme, toggle } = useTheme()
  const { backend, user } = useAdmin()
  const [more, setMore] = useState(false)
  const loc = useLocation()

  useEffect(() => {
    setMore(false)
    window.scrollTo({ top: 0 })
  }, [loc.pathname])

  type NavItem = { to: string; end?: boolean; icon: typeof Home; label: string }
  const main: NavItem[] = [
    { to: '/admin', end: true, icon: Home, label: L('Home', 'होम') },
    { to: '/admin/enquiries', icon: Inbox, label: L('Enquiries', 'पूछताछ') },
    { to: '/admin/products', icon: Package, label: L('Products', 'सामान') },
  ]
  const extra: NavItem[] = [
    { to: '/admin/categories', icon: LayoutGrid, label: L('Categories', 'कैटेगरी') },
    { to: '/admin/seasons', icon: Sparkles, label: L('Seasons', 'मौसम') },
    { to: '/admin/settings', icon: Cog, label: L('Shop settings', 'दुकान की सेटिंग') },
  ]

  const sideLink = ({ isActive }: { isActive: boolean }) =>
    `press flex min-h-12 items-center gap-3 rounded-[16px] px-4 text-[15.5px] font-semibold no-underline ${
      isActive ? 'bg-[var(--ink)] text-[var(--chalk)]' : 'text-[var(--ink)] hover:bg-[var(--card)]'
    }`

  return (
    <div className="min-h-dvh bg-[var(--chalk)] text-[var(--ink)] lg:grid lg:grid-cols-[260px_1fr]">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col gap-1 border-r-2 border-[var(--card)] p-4 lg:flex">
        <Link to="/admin" className="mb-6 flex items-center gap-3 px-2 pt-2 no-underline">
          <Monogram className="size-10" />
          <span className="leading-tight">
            <span className="block font-bold tracking-[-0.02em]">Ram Lakhan</span>
            <span className="ink-2 block text-[12.5px] font-medium">{L('Control Centre', 'कंट्रोल सेंटर')}</span>
          </span>
        </Link>
        {[...main, ...extra].map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={sideLink}>
            <n.icon className="size-5" strokeWidth={2} /> {n.label}
          </NavLink>
        ))}
        <div className="mt-auto grid gap-1">
          <a href="/" target="_blank" rel="noreferrer" className="press flex min-h-12 items-center gap-3 rounded-[16px] px-4 text-[15px] font-semibold no-underline hover:bg-[var(--card)]">
            <ExternalLink className="size-5" /> {L('View website', 'वेबसाइट देखें')}
          </a>
          <div className="flex items-center gap-1 px-2">
            <button type="button" onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} className="press h-11 min-w-11 cursor-pointer rounded-full border-0 bg-transparent px-2 text-[15px] font-semibold text-[var(--ink)] hover:bg-[var(--card)]">
              {lang === 'en' ? 'हिं' : 'EN'}
            </button>
            <button type="button" onClick={toggle} aria-label="Theme" className="press grid size-11 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[var(--ink)] hover:bg-[var(--card)]">
              {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
            <button type="button" onClick={() => void backend.signOut()} className="press ml-auto flex h-11 cursor-pointer items-center gap-2 rounded-full border-0 bg-transparent px-3 text-[14.5px] font-semibold text-[var(--ink)] hover:bg-[var(--card)]">
              <LogOut className="size-4" /> {L('Log out', 'लॉग आउट')}
            </button>
          </div>
          <p className="ink-2 truncate px-3 pt-1 text-[12.5px]">{user?.email}</p>
        </div>
      </aside>

      {/* mobile top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-2 bg-[var(--chalk)] px-4 shadow-[0_1px_0_var(--card)] lg:hidden">
        <Link to="/admin" className="mr-auto flex items-center gap-2.5 no-underline">
          <Monogram className="size-9" />
          <span className="text-[15px] font-bold tracking-[-0.02em]">{L('Control Centre', 'कंट्रोल सेंटर')}</span>
        </Link>
        <button type="button" onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} className="press h-11 min-w-11 cursor-pointer rounded-full border-0 bg-transparent text-[15px] font-semibold text-[var(--ink)]">
          {lang === 'en' ? 'हिं' : 'EN'}
        </button>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pt-6 pb-32 sm:px-8 lg:pt-10 lg:pb-16">{children}</main>

      {/* mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 bg-[var(--chalk)] pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_0_var(--card)] lg:hidden" aria-label="Admin">
        {main.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) => `press flex min-h-16 flex-col items-center justify-center gap-1 text-[12.5px] font-semibold no-underline ${isActive ? 'text-[var(--ink)]' : 'opacity-55'}`}
          >
            <n.icon className="size-[22px]" strokeWidth={2} />
            {n.label}
          </NavLink>
        ))}
        <button type="button" onClick={() => setMore(true)} className={`press flex min-h-16 cursor-pointer flex-col items-center justify-center gap-1 border-0 bg-transparent text-[12.5px] font-semibold text-[var(--ink)] ${more ? '' : 'opacity-55'}`}>
          <MoreHorizontal className="size-[22px]" strokeWidth={2} />
          {L('More', 'और')}
        </button>
      </nav>

      {/* mobile "More" sheet */}
      {more && (
        <div className="fixed inset-0 z-50 flex items-end bg-[rgb(10_9_30_/_0.45)] lg:hidden" onClick={() => setMore(false)}>
          <div className="enter w-full rounded-t-[28px] bg-[var(--chalk)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-[18px] font-bold">{L('More', 'और')}</p>
              <button type="button" onClick={() => setMore(false)} aria-label={L('Close', 'बंद करें')} className="press grid size-11 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[var(--ink)]">
                <X className="size-5" />
              </button>
            </div>
            {extra.map((n) => (
              <NavLink key={n.to} to={n.to} className={sideLink}>
                <n.icon className="size-5" /> {n.label}
              </NavLink>
            ))}
            <a href="/" target="_blank" rel="noreferrer" className="press flex min-h-12 items-center gap-3 rounded-[16px] px-4 text-[15.5px] font-semibold no-underline">
              <ExternalLink className="size-5" /> {L('View website', 'वेबसाइट देखें')}
            </a>
            <button type="button" onClick={toggle} className="press flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-[16px] border-0 bg-transparent px-4 text-[15.5px] font-semibold text-[var(--ink)]">
              {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />} {theme === 'dark' ? L('Light mode', 'लाइट मोड') : L('Dark mode', 'डार्क मोड')}
            </button>
            <button type="button" onClick={() => void backend.signOut()} className="press flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-[16px] border-0 bg-transparent px-4 text-[15.5px] font-semibold text-[var(--danger)]">
              <LogOut className="size-5" /> {L('Log out', 'लॉग आउट')}
            </button>
            <p className="ink-2 truncate px-4 pt-2 text-[13px]">{user?.email}</p>
          </div>
        </div>
      )}
    </div>
  )
}
