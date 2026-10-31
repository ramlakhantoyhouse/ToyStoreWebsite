import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Check, MessageCircle, Phone, RefreshCw, RotateCcw, Search, Trash2, X } from 'lucide-react'
import { Confirm, EmptyState, PageHead, Panel, Spinner, timeAgo, useAdmin, useL } from './ui'
import type { EnquiryRow, EnquiryStatus } from '../data/types'
import { useLang } from '../i18n'
import { telHref, waReplyHref } from './enquiryLinks'

type Tab = EnquiryStatus | 'all'

const STATUS_FIELD: Record<EnquiryStatus, string> = { new: 'yellow', called: 'blue', done: 'green' }

/** /admin/enquiries — every customer question from the website, newest first. */
export default function Enquiries() {
  const L = useL()
  const { lang } = useLang()
  const { backend } = useAdmin()

  const [rows, setRows] = useState<EnquiryRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [tab, setTab] = useState<Tab>('new')
  const [q, setQ] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<EnquiryRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(
    async (manual = false) => {
      if (manual) setRefreshing(true)
      try {
        const list = await backend.listEnquiries()
        setRows([...list].sort((a, b) => b.created_at.localeCompare(a.created_at)))
        setError(null)
        if (manual) toast.success(L('Up to date', 'सब ताज़ा है'))
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        setError(msg)
        if (manual) toast.error(L('Could not refresh. Check your internet.', 'रिफ्रेश नहीं हुआ। इंटरनेट देखें।'))
      } finally {
        if (manual) setRefreshing(false)
      }
    },
    [backend, L],
  )

  // first load + quiet auto-refresh every minute while this page is open
  useEffect(() => {
    void load()
    const t = window.setInterval(() => {
      void load()
    }, 60000)
    return () => window.clearInterval(t)
  }, [load])

  const counts = useMemo(() => {
    const c = { new: 0, called: 0, done: 0, all: 0 }
    for (const r of rows ?? []) {
      c[r.status] += 1
      c.all += 1
    }
    return c
  }, [rows])

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const digits = needle.replace(/\D/g, '')
    return (rows ?? []).filter((r) => {
      if (tab !== 'all' && r.status !== tab) return false
      if (!needle) return true
      return (
        r.name.toLowerCase().includes(needle) ||
        r.product.toLowerCase().includes(needle) ||
        (r.variant ?? '').toLowerCase().includes(needle) ||
        r.area.toLowerCase().includes(needle) ||
        (digits.length > 0 && r.mobile.replace(/\D/g, '').includes(digits))
      )
    })
  }, [rows, tab, q])

  async function setStatus(r: EnquiryRow, status: EnquiryStatus) {
    const before = rows
    setBusyId(r.id)
    setRows((cur) => cur?.map((x) => (x.id === r.id ? { ...x, status } : x)) ?? cur)
    try {
      await backend.setEnquiryStatus(r.id, status)
      toast.success(
        status === 'called'
          ? L(`${r.name} marked as called`, `${r.name} — कॉल हो गया`)
          : status === 'done'
            ? L(`${r.name} marked as done`, `${r.name} — काम पूरा`)
            : L(`${r.name} moved back to new`, `${r.name} — वापस नई में`),
      )
    } catch (e) {
      setRows(before)
      toast.error(e instanceof Error ? e.message : L('Could not save. Please try again.', 'सेव नहीं हुआ। फिर से कोशिश करें।'))
    } finally {
      setBusyId(null)
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await backend.deleteEnquiry(toDelete.id)
      setRows((cur) => cur?.filter((x) => x.id !== toDelete.id) ?? cur)
      toast.success(L('Enquiry deleted', 'पूछताछ हटा दी गई'))
      setToDelete(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : L('Could not delete. Please try again.', 'हटाया नहीं जा सका। फिर से कोशिश करें।'))
    } finally {
      setDeleting(false)
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'new', label: L('New', 'नई') },
    { id: 'called', label: L('Called', 'कॉल हो गया') },
    { id: 'done', label: L('Done', 'पूरा') },
    { id: 'all', label: L('All', 'सभी') },
  ]

  const empty: Record<Tab, { title: string; sub: string }> = {
    new: { title: L('No new enquiries', 'कोई नई पूछताछ नहीं'), sub: L('You are all caught up. New questions from customers will appear here.', 'सब निपट गया। ग्राहकों के नए सवाल यहाँ दिखेंगे।') },
    called: { title: L('Nobody waiting for a follow-up', 'किसी का इंतज़ार नहीं'), sub: L('After you call a customer, tap "Mark called" and they move here.', 'ग्राहक को कॉल करने के बाद "कॉल हो गया" दबाएं, वह यहाँ आ जाएगा।') },
    done: { title: L('Nothing finished yet', 'अभी कुछ पूरा नहीं'), sub: L('When a sale or question is complete, tap "Mark done".', 'जब बिक्री या सवाल पूरा हो जाए, "पूरा हुआ" दबाएं।') },
    all: { title: L('No enquiries yet', 'अभी कोई पूछताछ नहीं'), sub: L('When a customer asks about a product on the website, it will show up here.', 'जब कोई ग्राहक वेबसाइट पर किसी सामान के बारे में पूछेगा, वह यहाँ दिखेगा।') },
  }

  return (
    <div>
      <PageHead
        title={L('Enquiries', 'पूछताछ')}
        sub={L('Customers who asked about a product. Call or WhatsApp them, then mark what you did.', 'जिन ग्राहकों ने सामान के बारे में पूछा। उन्हें कॉल या WhatsApp करें, फिर बताएं क्या किया।')}
        actions={
          <button type="button" onClick={() => void load(true)} disabled={refreshing} className="btn btn-line press">
            {refreshing ? <Spinner /> : <RefreshCw className="size-5" aria-hidden="true" />} {L('Refresh', 'रिफ्रेश')}
          </button>
        }
      />

      {/* tabs */}
      <div role="group" aria-label={L('Filter enquiries', 'पूछताछ छाँटें')} className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
        {tabs.map((t) => (
          <button key={t.id} type="button" aria-pressed={tab === t.id} onClick={() => setTab(t.id)} className="chip press min-h-12">
            {t.label}
            <span className={`min-w-6 rounded-full px-1.5 text-center text-[13px] leading-6 font-bold ${tab === t.id ? 'bg-[var(--chalk)] text-[var(--ink)]' : 'bg-[var(--chalk)]'}`}>{rows ? counts[t.id] : '–'}</span>
          </button>
        ))}
      </div>

      {/* search */}
      <div className="relative mb-5">
        <label htmlFor="enq-search" className="sr-only">
          {L('Search by name, mobile or product', 'नाम, मोबाइल या सामान से खोजें')}
        </label>
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 opacity-50" aria-hidden="true" />
        <input id="enq-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={L('Search name, mobile or product', 'नाम, मोबाइल या सामान खोजें')} className="field-input pr-12 pl-12" />
        {q && (
          <button type="button" onClick={() => setQ('')} aria-label={L('Clear search', 'खोज हटाएं')} className="press absolute top-1/2 right-2 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[var(--ink)]">
            <X className="size-5" />
          </button>
        )}
      </div>

      {rows === null && !error ? (
        <div className="grid place-items-center py-16 opacity-60">
          <Spinner className="size-7" />
        </div>
      ) : error && rows === null ? (
        <EmptyState
          title={L('Could not load enquiries', 'पूछताछ लोड नहीं हुई')}
          sub={L('Check your internet and try again.', 'इंटरनेट देखें और फिर कोशिश करें।')}
          action={
            <button type="button" className="btn btn-ink press" onClick={() => void load(true)}>
              {L('Try again', 'फिर कोशिश करें')}
            </button>
          }
        />
      ) : shown.length === 0 ? (
        q.trim() ? (
          <EmptyState
            title={L('No match found', 'कुछ नहीं मिला')}
            sub={L('Try a different name or number, or look in the "All" tab.', 'दूसरा नाम या नंबर डालें, या "सभी" टैब देखें।')}
            action={
              <button type="button" className="btn btn-line press" onClick={() => setQ('')}>
                {L('Clear search', 'खोज हटाएं')}
              </button>
            }
          />
        ) : (
          <EmptyState title={empty[tab].title} sub={empty[tab].sub} />
        )
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0">
          {shown.map((r) => (
            <li key={r.id}>
              <EnquiryCard r={r} busy={busyId === r.id} onStatus={(s) => void setStatus(r, s)} onDelete={() => setToDelete(r)} lang={lang} />
            </li>
          ))}
        </ul>
      )}

      <Confirm
        open={!!toDelete}
        title={L('Delete this enquiry?', 'यह पूछताछ हटाएं?')}
        body={toDelete ? L(`${toDelete.name}'s enquiry will be removed for ever.`, `${toDelete.name} की पूछताछ हमेशा के लिए हट जाएगी।`) : undefined}
        confirmLabel={L('Delete', 'हटाएं')}
        danger
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onClose={() => {
          if (!deleting) setToDelete(null)
        }}
      />
    </div>
  )
}

function EnquiryCard({ r, busy, onStatus, onDelete, lang }: { r: EnquiryRow; busy: boolean; onStatus: (s: EnquiryStatus) => void; onDelete: () => void; lang: 'en' | 'hi' }) {
  const L = useL()
  const statusLabel = { new: L('New', 'नई'), called: L('Called', 'कॉल हो गया'), done: L('Done', 'पूरा') }[r.status]
  const exact = new Date(r.created_at).toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' })

  const details: [string, string | null | undefined][] = [
    [L('Option', 'प्रकार'), r.variant],
    [L('Quantity', 'मात्रा'), r.qty],
    [L('Season', 'मौसम'), r.season],
  ]

  return (
    <Panel className="grid gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[19px] font-bold tracking-[-0.02em] break-words">{r.name}</p>
          <p className="ink-2 text-[15px]">
            {r.mobile}
            {r.area ? ` · ${r.area}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span data-field={STATUS_FIELD[r.status]} className="rounded-full bg-[var(--field)] px-3 py-1 text-[13px] font-bold text-[var(--ink)]">
            {statusLabel}
          </span>
          {r.type === 'wholesale' && (
            <span data-field="orange" className="rounded-full bg-[var(--field)] px-3 py-1 text-[13px] font-bold text-[var(--ink)]">
              {L('Wholesale', 'थोक')}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-[16px] bg-[var(--chalk)] p-3.5">
        <p className="ink-2 text-[13px] font-semibold">{r.type === 'wholesale' ? L('Items wanted', 'चाहिए सामान') : L('Asked about', 'किस बारे में पूछा')}</p>
        <p className="text-[16px] font-semibold break-words">{r.product}</p>
        {details.some(([, v]) => v) && (
          <dl className="m-0 mt-2 grid gap-x-4 gap-y-1 text-[14.5px] sm:grid-cols-3">
            {details
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="flex gap-1.5">
                  <dt className="ink-2">{k}:</dt>
                  <dd className="m-0 font-medium">{v}</dd>
                </div>
              ))}
          </dl>
        )}
        {r.note && (
          <p className="mt-2 text-[14.5px] break-words">
            <span className="ink-2">{L('Note', 'नोट')}: </span>
            {r.note}
          </p>
        )}
      </div>

      <p className="ink-2 text-[13.5px]">
        <span className="font-semibold">{timeAgo(r.created_at, lang)}</span> · {exact}
      </p>

      <div className="grid grid-cols-2 gap-2">
        <a href={telHref(r.mobile)} className="btn btn-ink press px-4">
          <Phone className="size-5" aria-hidden="true" /> {L('Call', 'कॉल करें')}
        </a>
        <a href={waReplyHref(r)} target="_blank" rel="noreferrer" className="btn btn-wa press px-4">
          <MessageCircle className="size-5" aria-hidden="true" /> WhatsApp
        </a>
      </div>

      <div className="hair flex flex-wrap gap-2 border-t-2 pt-4">
        {r.status === 'new' && (
          <button type="button" disabled={busy} onClick={() => onStatus('called')} className="btn btn-line press min-h-12 flex-1 px-4">
            <Check className="size-5" aria-hidden="true" /> {L('Mark called', 'कॉल हो गया')}
          </button>
        )}
        {r.status !== 'done' && (
          <button type="button" disabled={busy} onClick={() => onStatus('done')} className="btn btn-line press min-h-12 flex-1 px-4">
            <Check className="size-5" aria-hidden="true" /> {L('Mark done', 'पूरा हुआ')}
          </button>
        )}
        {r.status !== 'new' && (
          <button type="button" disabled={busy} onClick={() => onStatus('new')} className="btn btn-line press min-h-12 flex-1 px-4">
            <RotateCcw className="size-5" aria-hidden="true" /> {L('Move back to new', 'वापस नई में')}
          </button>
        )}
        <button type="button" disabled={busy} onClick={onDelete} aria-label={`${L('Delete enquiry from', 'पूछताछ हटाएं:')} ${r.name}`} className="btn press min-h-12 bg-transparent px-4 text-[var(--danger)]">
          <Trash2 className="size-5" aria-hidden="true" /> <span className="sm:inline">{L('Delete', 'हटाएं')}</span>
        </button>
      </div>
    </Panel>
  )
}
