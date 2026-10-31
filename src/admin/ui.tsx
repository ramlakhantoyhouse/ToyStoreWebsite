import { createContext, useCallback, useContext, useEffect, useId, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, X } from 'lucide-react'
import { getBackend, type AdminUser, type Backend } from '../data/backend'
import { useLang, type Bi } from '../i18n'

/* ======================================================================
   Admin shared kit. Every admin screen builds from these pieces so the
   control centre feels like one simple app.
   ====================================================================== */

/** Bilingual label helper for the admin: L('Products', 'सामान'). */
export function useL() {
  const { lang } = useLang()
  return useCallback((en: string, hi: string) => (lang === 'hi' ? hi : en), [lang])
}

/* ---------- backend + auth ---------- */

type AdminCtx = { backend: Backend; user: AdminUser | null; ready: boolean }
const Ctx = createContext<AdminCtx | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [backend, setBackend] = useState<Backend | null>(null)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let off = () => {}
    let alive = true
    void getBackend().then(async (b) => {
      if (!alive) return
      setBackend(b)
      setUser(await b.getUser())
      setReady(true)
      off = b.onAuthChange(setUser)
    })
    return () => {
      alive = false
      off()
    }
  }, [])

  if (!backend) return <FullSpinner />
  return <Ctx.Provider value={{ backend, user, ready }}>{children}</Ctx.Provider>
}

export function useAdmin() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAdmin outside AdminProvider')
  return c
}

/* ---------- layout pieces ---------- */

export function FullSpinner() {
  return (
    <div className="grid min-h-dvh place-items-center bg-[var(--chalk)]">
      <Loader2 className="size-7 animate-spin opacity-60" />
    </div>
  )
}

/** Page header with a big title, optional subtitle and right-side actions. */
export function PageHead({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
      <div className="min-w-0">
        <h1 className="text-[clamp(1.9rem,4vw,2.8rem)] font-bold tracking-[-0.045em]">{title}</h1>
        {sub && <p className="ink-2 mt-2 max-w-xl text-[15.5px]">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

/** A white rounded panel. */
export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[24px] bg-[var(--card)] p-4 sm:p-6 ${className}`}>{children}</div>
}

export function Spinner({ className = 'size-5' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} />
}

export function EmptyState({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="rounded-[24px] border-2 border-dashed border-[color-mix(in_srgb,var(--ink)_14%,transparent)] px-6 py-14 text-center">
      <p className="text-[18px] font-semibold">{title}</p>
      {sub && <p className="ink-2 mx-auto mt-2 max-w-sm text-[15px]">{sub}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

/* ---------- form controls ---------- */

export function Label({ htmlFor, children, hint }: { htmlFor?: string; children: ReactNode; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[14.5px] font-semibold">
      {children}
      {hint && <span className="ink-2 ml-2 font-normal">{hint}</span>}
    </label>
  )
}

export function TextInput({
  label,
  hint,
  value,
  onChange,
  placeholder,
  multiline,
  type = 'text',
  required,
  error,
  inputMode,
}: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  multiline?: boolean
  type?: string
  required?: boolean
  error?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
}) {
  const id = useId()
  return (
    <div>
      <Label htmlFor={id} hint={hint}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </Label>
      {multiline ? (
        <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className="field-input resize-y" aria-invalid={error ? true : undefined} />
      ) : (
        <input id={id} type={type} inputMode={inputMode} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="field-input" aria-invalid={error ? true : undefined} />
      )}
      {error && <p className="mt-1.5 text-[13.5px] font-medium text-[var(--danger)]">{error}</p>}
    </div>
  )
}

/** English + Hindi pair for any customer-facing text. */
export function BiInput({
  label,
  value,
  onChange,
  multiline,
  required,
  error,
  placeholder,
}: {
  label: string
  value: Bi
  onChange: (v: Bi) => void
  multiline?: boolean
  required?: boolean
  error?: string
  placeholder?: Bi
}) {
  const L = useL()
  return (
    <fieldset className="m-0 grid gap-3 border-0 p-0 sm:grid-cols-2">
      <legend className="sr-only">{label}</legend>
      <TextInput label={label} hint="English" value={value.en} onChange={(en) => onChange({ ...value, en })} multiline={multiline} required={required} error={error} placeholder={placeholder?.en} />
      <TextInput label={L(`${label}`, `${label}`)} hint="हिंदी" value={value.hi} onChange={(hi) => onChange({ ...value, hi })} multiline={multiline} placeholder={placeholder?.hi} />
    </fieldset>
  )
}

export function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const id = useId()
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="field-input cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2214%22 height=%2214%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23888%22 stroke-width=%222.5%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_14px_center] bg-no-repeat pr-10">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/** Big friendly on/off switch with a label and optional description. */
export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-[15.5px] font-semibold">{label}</span>
        {description && <span className="ink-2 mt-0.5 block text-[14px]">{description}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`press relative h-8 w-14 shrink-0 cursor-pointer rounded-full border-0 transition-colors duration-200 ${checked ? 'bg-[var(--t-green)]' : 'bg-[color-mix(in_srgb,var(--ink)_22%,transparent)]'}`}
      >
        <span
          className={`absolute top-1 left-1 size-6 rounded-full bg-white shadow-[0_2px_6px_rgb(0_0_0_/_0.25)] transition-transform duration-300 ease-[var(--spring)] ${checked ? 'translate-x-6' : ''}`}
        />
      </button>
    </div>
  )
}

/* ---------- confirm dialog ---------- */

export function Confirm({
  open,
  title,
  body,
  confirmLabel,
  danger,
  busy,
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  body?: string
  confirmLabel: string
  danger?: boolean
  busy?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  const L = useL()
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open, onClose])
  if (!open) return null
  // Portal to <body>: an animated/transformed parent must never trap the dialog inside the page.
  return createPortal(
    <div className="fixed inset-0 z-[60] grid place-items-end bg-[rgb(10_9_30_/_0.5)] p-3 sm:place-items-center" onClick={onClose}>
      <div role="alertdialog" aria-modal="true" aria-label={title} className="enter w-full max-w-sm rounded-[28px] bg-[var(--chalk)] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[20px] font-bold tracking-[-0.03em]">{title}</h2>
          <button type="button" onClick={onClose} aria-label={L('Close', 'बंद करें')} className="press -mt-1 -mr-2 grid size-10 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[var(--ink)]">
            <X className="size-5" />
          </button>
        </div>
        {body && <p className="ink-2 mt-2 text-[15px]">{body}</p>}
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button type="button" onClick={onClose} className="btn btn-line press">
            {L('Cancel', 'रहने दें')}
          </button>
          <button type="button" onClick={onConfirm} disabled={busy} className={`btn press ${danger ? 'bg-[var(--danger)] text-white' : 'btn-ink'}`}>
            {busy ? <Spinner /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/** Warn before leaving a page with unsaved changes. */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirty])
}

/** "5 min ago" style times. */
export function timeAgo(iso: string, lang: 'en' | 'hi') {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  const m = Math.round(s / 60)
  const h = Math.round(m / 60)
  const d = Math.round(h / 24)
  if (lang === 'hi') return s < 60 ? 'अभी' : m < 60 ? `${m} मिनट पहले` : h < 24 ? `${h} घंटे पहले` : `${d} दिन पहले`
  return s < 60 ? 'just now' : m < 60 ? `${m} min ago` : h < 24 ? `${h} h ago` : `${d} d ago`
}
