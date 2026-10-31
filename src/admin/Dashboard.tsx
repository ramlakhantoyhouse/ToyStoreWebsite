import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowRight, Database, Inbox, Info, MessageCircle, Megaphone, Phone, Plus } from 'lucide-react'
import { EmptyState, Panel, Spinner, Toggle, timeAgo, useAdmin, useL } from './ui'
import { fmtHours, hoursFor, isOpenFrom, istNow, useCatalog } from '../data/catalog'
import type { EnquiryRow } from '../data/types'
import { useLang } from '../i18n'
import { telHref, waReplyHref } from './enquiryLinks'

/** /admin — the first screen the owner sees: today at a glance. */
export default function Dashboard() {
  const L = useL()
  const { lang } = useLang()
  const { backend } = useAdmin()
  const { products, categories, settings, reload } = useCatalog()

  const [enquiries, setEnquiries] = useState<EnquiryRow[] | null>(null)
  const [enqError, setEnqError] = useState(false)
  const [empty, setEmpty] = useState(false)
  const [importing, setImporting] = useState(false)
  const [savingHoliday, setSavingHoliday] = useState(false)
  // re-render every minute so "open now" and "x min ago" stay fresh
  const [, setTick] = useState(0)

  const loadEnquiries = useCallback(async () => {
    try {
      const rows = await backend.listEnquiries()
      setEnquiries([...rows].sort((a, b) => b.created_at.localeCompare(a.created_at)))
      setEnqError(false)
    } catch {
      setEnqError(true)
      setEnquiries([])
    }
  }, [backend])

  useEffect(() => {
    void loadEnquiries()
  }, [loadEnquiries])

  useEffect(() => {
    const t = window.setInterval(() => setTick((n) => n + 1), 60000)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    if (backend.mode !== 'supabase') return
    let alive = true
    backend
      .isEmpty()
      .then((v) => {
        if (alive) setEmpty(v)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [backend])

  const hour = istNow().getHours()
  const greeting = hour < 12 ? L('Good morning', 'सुप्रभात') : hour < 17 ? L('Good afternoon', 'नमस्कार') : L('Good evening', 'शुभ संध्या')

  const open = isOpenFrom(settings)
  const today = hoursFor(settings, istNow().getDay())
  const newCount = enquiries?.filter((e) => e.status === 'new').length ?? 0
  const outOfStock = products.filter((p) => p.inStock === false).length

  async function setHoliday(on: boolean) {
    setSavingHoliday(true)
    try {
      await backend.saveSettings({ ...settings, holiday: { ...settings.holiday, on } })
      await reload()
      toast.success(on ? L('Website now says the shop is closed today', 'वेबसाइट पर अब "आज दुकान बंद है" दिख रहा है') : L('Shop is shown as open again', 'दुकान फिर से खुली दिख रही है'))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : L('Could not save. Please try again.', 'सेव नहीं हुआ। फिर से कोशिश करें।'))
    } finally {
      setSavingHoliday(false)
    }
  }

  async function importStarter() {
    setImporting(true)
    try {
      await backend.importStarter()
      await reload()
      setEmpty(false)
      toast.success(L('Starter catalogue added. You can now edit it.', 'शुरुआती सामान जुड़ गया। अब आप इसे बदल सकते हैं।'))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : L('Import failed. Please try again.', 'इम्पोर्ट नहीं हुआ। फिर से कोशिश करें।'))
    } finally {
      setImporting(false)
    }
  }

  const tiles = [
    { to: '/admin/enquiries', field: 'yellow', value: enquiries ? newCount : null, label: L('New enquiries', 'नई पूछताछ') },
    { to: '/admin/products', field: 'blue', value: products.length, label: L('Products', 'सामान') },
    { to: '/admin/products', field: 'pink', value: outOfStock, label: L('Out of stock', 'स्टॉक में नहीं') },
    { to: '/admin/categories', field: 'green', value: categories.length, label: L('Categories', 'कैटेगरी') },
  ]

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-[clamp(1.9rem,4vw,2.8rem)] font-bold tracking-[-0.045em]">{greeting}</h1>
        <p className="ink-2 mt-1 text-[15.5px]">{L('Here is your shop today.', 'आज आपकी दुकान का हाल।')}</p>
      </div>

      {backend.mode === 'demo' && (
        <Panel className="flex gap-3">
          <Info className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">{L('You are in practice (demo) mode', 'आप अभ्यास (डेमो) मोड में हैं')}</p>
            <p className="ink-2 mt-1 text-[14.5px]">
              {L(
                'Changes are saved only in this browser, so customers will not see them. Follow ADMIN-SETUP.md to connect the real database — then every change goes live on the website.',
                'बदलाव सिर्फ इसी ब्राउज़र में सेव होते हैं, ग्राहकों को नहीं दिखेंगे। असली डेटाबेस जोड़ने के लिए ADMIN-SETUP.md देखें — फिर हर बदलाव वेबसाइट पर तुरंत दिखेगा।',
              )}
            </p>
          </div>
        </Panel>
      )}

      {empty && (
        <Panel className="grid gap-4">
          <div className="flex gap-3">
            <Database className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">{L('Your shop is empty — import the starter catalogue', 'आपकी दुकान खाली है — शुरुआती सामान जोड़ें')}</p>
              <p className="ink-2 mt-1 text-[14.5px]">
                {L('This copies the sample products, categories and seasons into your database. You can edit or delete any of them later.', 'इससे नमूने का सामान, कैटेगरी और मौसम आपके डेटाबेस में आ जाएंगे। बाद में आप इन्हें बदल या हटा सकते हैं।')}
              </p>
            </div>
          </div>
          <button type="button" onClick={() => void importStarter()} disabled={importing} className="btn btn-ink press w-full sm:w-auto sm:justify-self-start">
            {importing ? <Spinner /> : L('Import starter catalogue', 'शुरुआती सामान जोड़ें')}
          </button>
        </Panel>
      )}

      {/* today's status */}
      <Panel className="grid gap-4">
        <div className="flex items-center gap-3">
          <span className={`size-3.5 shrink-0 rounded-full ${open ? 'bg-[var(--t-green)]' : 'bg-[var(--danger)]'}`} aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[19px] font-bold tracking-[-0.02em]">
              {settings.holiday.on ? L('Closed today (holiday notice on)', 'आज बंद (छुट्टी की सूचना चालू)') : open ? L('Shop is open now', 'दुकान अभी खुली है') : L('Shop is closed now', 'दुकान अभी बंद है')}
            </p>
            <p className="ink-2 text-[14.5px]">
              {L("Today's hours", 'आज का समय')}: {fmtHours(today, lang)}
            </p>
          </div>
        </div>
        <div className="hair border-t-2 pt-4">
          <Toggle
            checked={settings.holiday.on}
            onChange={(v) => {
              if (!savingHoliday) void setHoliday(v)
            }}
            label={savingHoliday ? L('Saving…', 'सेव हो रहा है…') : L('Shop closed today', 'आज दुकान बंद है')}
            description={L('Turn on to show "closed today" on the website. Turn off tomorrow.', 'चालू करने पर वेबसाइट पर "आज बंद" दिखेगा। कल बंद कर दें।')}
          />
        </div>
      </Panel>

      {/* stat tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} to={t.to} data-field={t.field} className="press flex min-h-[112px] flex-col justify-between rounded-[24px] bg-[var(--field)] p-4 text-[var(--ink)] no-underline">
            <span className="text-[34px] leading-none font-bold tracking-[-0.04em]">{t.value ?? <Spinner className="size-6" />}</span>
            <span className="flex items-center justify-between gap-2 text-[14.5px] font-semibold">
              {t.label} <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>

      {/* quick actions */}
      <div className="grid gap-2 sm:grid-cols-3">
        <Link to="/admin/products/new" className="btn btn-ink press">
          <Plus className="size-5" aria-hidden="true" /> {L('Add product', 'सामान जोड़ें')}
        </Link>
        <Link to="/admin/enquiries" className="btn btn-line press">
          <Inbox className="size-5" aria-hidden="true" /> {L('See enquiries', 'पूछताछ देखें')}
        </Link>
        <Link to="/admin/settings" className="btn btn-line press">
          <Megaphone className="size-5" aria-hidden="true" /> {L('Edit home banner', 'होम बैनर बदलें')}
        </Link>
      </div>

      {/* latest enquiries */}
      <section className="grid gap-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-[22px] font-bold tracking-[-0.03em]">{L('Latest enquiries', 'नई पूछताछ')}</h2>
          <Link to="/admin/enquiries" className="press text-[15px] font-semibold underline-offset-4 hover:underline">
            {L('See all', 'सब देखें')}
          </Link>
        </div>
        {enquiries === null ? (
          <div className="grid place-items-center py-10 opacity-60">
            <Spinner className="size-6" />
          </div>
        ) : enqError ? (
          <EmptyState title={L('Could not load enquiries', 'पूछताछ लोड नहीं हुई')} sub={L('Check your internet and try again.', 'इंटरनेट देखें और फिर कोशिश करें।')} action={<button type="button" className="btn btn-line press" onClick={() => void loadEnquiries()}>{L('Try again', 'फिर कोशिश करें')}</button>} />
        ) : enquiries.length === 0 ? (
          <EmptyState title={L('No enquiries yet', 'अभी कोई पूछताछ नहीं')} sub={L('When a customer asks about a product on the website, it will show up here.', 'जब कोई ग्राहक वेबसाइट पर किसी सामान के बारे में पूछेगा, वह यहाँ दिखेगा।')} />
        ) : (
          <ul className="m-0 grid list-none gap-2 p-0">
            {enquiries.slice(0, 5).map((e) => (
              <li key={e.id}>
                <Panel className="flex flex-wrap items-center gap-3 sm:p-4!">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-bold">
                      {e.status === 'new' && <span className="size-2.5 shrink-0 rounded-full bg-[var(--t-yellow)]" aria-label={L('New', 'नई')} />}
                      <span className="truncate">{e.name}</span>
                    </p>
                    <p className="ink-2 truncate text-[14.5px]">
                      {e.product}
                      {e.variant ? ` · ${e.variant}` : ''} · {timeAgo(e.created_at, lang)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a href={telHref(e.mobile)} aria-label={`${L('Call', 'कॉल करें')} ${e.name}`} className="btn btn-line press min-h-12 px-4">
                      <Phone className="size-5" aria-hidden="true" />
                      <span className="hidden sm:inline">{L('Call', 'कॉल')}</span>
                    </a>
                    <a href={waReplyHref(e)} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${e.name}`} className="btn btn-wa press min-h-12 px-4">
                      <MessageCircle className="size-5" aria-hidden="true" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                  </div>
                </Panel>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
