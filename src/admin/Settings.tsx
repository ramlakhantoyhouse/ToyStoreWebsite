import { useState } from 'react'
import { Copy, KeyRound, Megaphone, Phone, Store, Clock, CalendarOff } from 'lucide-react'
import { toast } from 'sonner'
import { useCatalog } from '../data/catalog'
import { defaultSettings } from '../data/backend'
import type { DayHours, Settings as ShopSettings } from '../data/types'
import { useLang } from '../i18n'
import { BiInput, PageHead, Panel, Spinner, TextInput, Toggle, useAdmin, useL, useUnsavedWarning } from './ui'

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] // Monday first, Sunday last
const DAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार']

const digits = (s: string) => s.replace(/\D/g, '')
/** "+919540528086" or "919540528086" → "9540528086" */
const local10 = (s: string) => {
  const d = digits(s)
  return d.length > 10 && d.startsWith('91') ? d.slice(-10) : d
}
const validMobile = (d: string) => /^[6-9]\d{9}$/.test(d)

type Form = { phone: string; whatsapp: string; hours: DayHours[]; holiday: ShopSettings['holiday']; banner: ShopSettings['banner'] }

function toForm(s: ShopSettings): Form {
  const fallback = defaultSettings().hours
  return {
    phone: local10(s.phone),
    whatsapp: local10(s.whatsapp),
    hours: DAY_ORDER.map((dow) => ({ ...(s.hours.find((h) => h.dow === dow) ?? fallback.find((h) => h.dow === dow) ?? { dow, open: '09:00', close: '21:00' }) })),
    holiday: { on: s.holiday.on, text: { ...s.holiday.text } },
    banner: { on: s.banner.on, text: { ...s.banner.text } },
  }
}

/** /admin/settings — phone numbers, opening hours, notices and password. */
export default function Settings() {
  const { settings, loading } = useCatalog()
  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center opacity-60">
        <Spinner className="size-7" />
      </div>
    )
  }
  return <SettingsForm initial={settings} />
}

function SettingsForm({ initial }: { initial: ShopSettings }) {
  const L = useL()
  const { lang } = useLang()
  const { backend } = useAdmin()
  const { reload } = useCatalog()
  const [form, setForm] = useState<Form>(() => toForm(initial))
  const [saved, setSaved] = useState(() => JSON.stringify(toForm(initial)))
  const [saving, setSaving] = useState(false)
  const [tried, setTried] = useState(false)
  const dirty = JSON.stringify(form) !== saved
  useUnsavedWarning(dirty)

  const dayName = (dow: number) => (lang === 'hi' ? DAY_HI[dow] : DAY_EN[dow])
  const setDay = (dow: number, patch: Partial<DayHours>) => setForm((f) => ({ ...f, hours: f.hours.map((h) => (h.dow === dow ? { ...h, ...patch } : h)) }))

  const phoneErr = !validMobile(form.phone) ? L('Enter a 10-digit mobile number, e.g. 9540528086', '10 अंकों का मोबाइल नंबर लिखें, जैसे 9540528086') : ''
  const waErr = !validMobile(form.whatsapp) ? L('Enter the 10-digit WhatsApp number', '10 अंकों का व्हाट्सऐप नंबर लिखें') : ''
  const badHours = form.hours.filter((h) => !h.closed && (!h.open || !h.close || h.close <= h.open)).map((h) => h.dow)

  function copyMonday() {
    const mon = form.hours.find((h) => h.dow === 1)
    if (!mon) return
    setForm((f) => ({ ...f, hours: f.hours.map((h) => ({ ...h, open: mon.open, close: mon.close, closed: mon.closed })) }))
    toast.success(L('Monday’s hours copied to every day. Press Save to keep them.', 'सोमवार का समय सभी दिनों पर लग गया। रखने के लिए सेव दबाएँ।'))
  }

  async function save() {
    setTried(true)
    if (phoneErr || waErr) {
      toast.error(L('Please fix the phone numbers first.', 'पहले फ़ोन नंबर ठीक करें।'))
      return
    }
    if (badHours.length) {
      toast.error(L('Closing time must be after opening time.', 'बंद होने का समय खुलने के बाद होना चाहिए।'))
      return
    }
    if (form.banner.on && !form.banner.text.en.trim()) {
      toast.error(L('Type the banner message, or turn the banner off.', 'बैनर का संदेश लिखें, या बैनर बंद करें।'))
      return
    }
    const next: ShopSettings = {
      ...initial,
      phone: `+91${form.phone}`,
      whatsapp: `91${form.whatsapp}`,
      hours: form.hours,
      holiday: { on: form.holiday.on, text: { en: form.holiday.text.en.trim(), hi: form.holiday.text.hi.trim() } },
      banner: { on: form.banner.on, text: { en: form.banner.text.en.trim(), hi: form.banner.text.hi.trim() } },
    }
    setSaving(true)
    try {
      await backend.saveSettings(next)
      await reload()
      setSaved(JSON.stringify(form))
      setTried(false)
      toast.success(L('Saved. The website is updated.', 'सेव हो गया। वेबसाइट अपडेट हो गई।'))
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : L('Could not save. Please try again.', 'सेव नहीं हो सका। फिर से कोशिश करें।'))
    } finally {
      setSaving(false)
    }
  }

  const bannerText = form.banner.text[lang] || form.banner.text.en

  return (
    <div className="enter">
      <PageHead title={L('Shop settings', 'दुकान की सेटिंग')} sub={L('Phone numbers, opening hours and notices shown on the website.', 'वेबसाइट पर दिखने वाले फ़ोन नंबर, दुकान का समय और सूचनाएँ।')} />

      <div className="grid gap-5">
        {/* 1. contact */}
        <Panel>
          <SectionTitle icon={<Phone className="size-5" />} title={L('Contact numbers', 'संपर्क नंबर')} sub={L('Customers call and WhatsApp these numbers from the website.', 'ग्राहक वेबसाइट से इन्हीं नंबरों पर कॉल और व्हाट्सऐप करते हैं।')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <PhoneField label={L('Phone number', 'फ़ोन नंबर')} value={form.phone} onChange={(phone) => setForm((f) => ({ ...f, phone }))} error={tried || form.phone.length === 10 ? phoneErr : ''} />
            <PhoneField label={L('WhatsApp number', 'व्हाट्सऐप नंबर')} value={form.whatsapp} onChange={(whatsapp) => setForm((f) => ({ ...f, whatsapp }))} error={tried || form.whatsapp.length === 10 ? waErr : ''} />
          </div>
          {form.phone.length === 10 && form.phone !== form.whatsapp && (
            <button type="button" onClick={() => setForm((f) => ({ ...f, whatsapp: f.phone }))} className="press mt-3 min-h-11 cursor-pointer rounded-full border-0 bg-transparent px-1 text-[14px] font-semibold text-[var(--ink)] underline">
              {L('Use the phone number for WhatsApp too', 'व्हाट्सऐप के लिए भी यही नंबर रखें')}
            </button>
          )}
        </Panel>

        {/* 2. hours */}
        <Panel>
          <SectionTitle icon={<Clock className="size-5" />} title={L('Shop hours', 'दुकान का समय')} sub={L('The website shows "Open now" or "Closed" using these times.', 'वेबसाइट इसी समय से "अभी खुली है" या "बंद है" दिखाती है।')} />
          <ul className="m-0 grid list-none gap-2 p-0">
            {form.hours.map((h) => {
              const bad = badHours.includes(h.dow)
              return (
                <li key={h.dow} className={`rounded-[18px] bg-[var(--chalk)] p-3 ${bad ? 'shadow-[inset_0_0_0_2px_var(--danger)]' : ''}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[16px] font-bold">{dayName(h.dow)}</span>
                    <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[14.5px] font-semibold">
                      <input type="checkbox" checked={!!h.closed} onChange={(e) => setDay(h.dow, { closed: e.target.checked })} className="size-5 cursor-pointer accent-[var(--danger)]" />
                      {L('Closed', 'बंद')}
                    </label>
                  </div>
                  {h.closed ? (
                    <p className="ink-2 mt-1 text-[14px]">{L('Shop closed all day', 'पूरे दिन दुकान बंद')}</p>
                  ) : (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <TimeField label={L('Opens', 'खुलती है')} value={h.open} onChange={(open) => setDay(h.dow, { open })} />
                      <TimeField label={L('Closes', 'बंद होती है')} value={h.close} onChange={(close) => setDay(h.dow, { close })} />
                    </div>
                  )}
                  {bad && <p className="mt-2 text-[13.5px] font-medium text-[var(--danger)]">{L('Closing time must be after opening time.', 'बंद होने का समय खुलने के बाद होना चाहिए।')}</p>}
                </li>
              )
            })}
          </ul>
          <button type="button" onClick={copyMonday} className="btn btn-line press mt-4 w-full sm:w-auto">
            <Copy className="size-5" /> {L('Copy Monday to all days', 'सोमवार का समय सभी दिनों पर लगाएँ')}
          </button>
        </Panel>

        {/* 3. holiday */}
        <Panel>
          <SectionTitle icon={<CalendarOff className="size-5" />} title={L('Holiday notice', 'छुट्टी की सूचना')} />
          <Toggle
            checked={form.holiday.on}
            onChange={(on) => setForm((f) => ({ ...f, holiday: { ...f.holiday, on } }))}
            label={L('Shop closed today', 'आज दुकान बंद है')}
            description={L('Turn on for a sudden holiday. Remember to turn it off when you open again.', 'अचानक छुट्टी हो तो चालू करें। दुकान फिर खुलने पर बंद करना न भूलें।')}
          />
          {form.holiday.on && (
            <div className="mt-4">
              <BiInput label={L('Message for customers', 'ग्राहकों के लिए संदेश')} value={form.holiday.text} onChange={(text) => setForm((f) => ({ ...f, holiday: { ...f.holiday, text } }))} placeholder={{ en: 'The shop is closed today.', hi: 'आज दुकान बंद है।' }} />
            </div>
          )}
        </Panel>

        {/* 4. banner */}
        <Panel>
          <SectionTitle icon={<Megaphone className="size-5" />} title={L('Home page banner', 'होम पेज बैनर')} />
          <Toggle
            checked={form.banner.on}
            onChange={(on) => setForm((f) => ({ ...f, banner: { ...f.banner, on } }))}
            label={L('Show a banner on the home page', 'होम पेज पर बैनर दिखाएँ')}
            description={L('A short line at the top, e.g. "New Diwali lights have arrived!"', 'ऊपर एक छोटी लाइन, जैसे "दिवाली की नई लाइटें आ गई हैं!"')}
          />
          {form.banner.on && (
            <div className="mt-4 grid gap-4">
              <BiInput label={L('Banner message', 'बैनर का संदेश')} value={form.banner.text} onChange={(text) => setForm((f) => ({ ...f, banner: { ...f.banner, text } }))} placeholder={{ en: 'New Diwali lights have arrived!', hi: 'दिवाली की नई लाइटें आ गई हैं!' }} />
              <div>
                <p className="ink-2 mb-1.5 text-[13px] font-semibold tracking-[0.04em] uppercase">{L('Preview', 'झलक')}</p>
                <div data-field="indigo" className="rounded-[16px] bg-[var(--field)] px-4 py-3 text-center text-[14.5px] font-semibold text-[var(--ink)]">
                  {bannerText || <span className="opacity-60">{L('Your message will appear here', 'आपका संदेश यहाँ दिखेगा')}</span>}
                </div>
              </div>
            </div>
          )}
        </Panel>

        {/* sticky save for panels 1-4 */}
        <div className="sticky bottom-20 z-20 lg:bottom-4">
          <div className="flex items-center gap-3 rounded-[24px] bg-[var(--chalk)] p-3 shadow-[0_8px_30px_rgb(10_9_30_/_0.18)]">
            <p className="ink-2 m-0 min-w-0 flex-1 pl-2 text-[14px]">
              {dirty ? L('You have unsaved changes', 'बदलाव अभी सेव नहीं हुए') : L('Everything is saved', 'सब कुछ सेव है')}
            </p>
            {dirty && (
              <button type="button" disabled={saving} onClick={() => { setForm(JSON.parse(saved) as Form); setTried(false) }} className="btn btn-line press !px-4">
                {L('Undo', 'वापस')}
              </button>
            )}
            <button type="button" disabled={!dirty || saving} onClick={() => void save()} className="btn btn-ink press min-w-32 disabled:opacity-40">
              {saving ? <Spinner /> : L('Save', 'सेव करें')}
            </button>
          </div>
        </div>

        {/* 5. account */}
        <AccountPanel />
      </div>
    </div>
  )
}

function SectionTitle({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="m-0 flex items-center gap-2 text-[19px] font-bold tracking-[-0.03em]">
        {icon} {title}
      </h2>
      {sub && <p className="ink-2 mt-1 text-[14px]">{sub}</p>}
    </div>
  )
}

function PhoneField({ label, value, onChange, error }: { label: string; value: string; onChange: (v: string) => void; error?: string }) {
  const L = useL()
  return (
    <div>
      <label className="mb-1.5 block text-[14.5px] font-semibold">
        {label}
        <span className="mt-1.5 flex items-stretch gap-2">
          <span className="grid min-h-[54px] place-items-center rounded-[16px] bg-[var(--chalk)] px-3 text-[16px] font-semibold" aria-hidden="true">
            +91
          </span>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            value={value}
            onChange={(e) => onChange(local10(e.target.value).slice(0, 10))}
            placeholder={L('10-digit number', '10 अंकों का नंबर')}
            className="field-input font-normal"
            aria-invalid={error ? true : undefined}
          />
        </span>
      </label>
      {error && <p className="mt-1.5 text-[13.5px] font-medium text-[var(--danger)]">{error}</p>}
    </div>
  )
}

function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-[13.5px] font-semibold">
      {label}
      <input type="time" value={value} onChange={(e) => onChange(e.target.value)} className="field-input mt-1 font-normal" />
    </label>
  )
}

function AccountPanel() {
  const L = useL()
  const { backend, user } = useAdmin()
  const demo = backend.mode === 'demo'
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [busy, setBusy] = useState(false)
  const [tried, setTried] = useState(false)

  const err1 = pw.length < 8 ? L('At least 8 characters', 'कम से कम 8 अक्षर') : ''
  const err2 = pw2 !== pw ? L('The two passwords do not match', 'दोनों पासवर्ड एक जैसे नहीं हैं') : ''

  async function change() {
    setTried(true)
    if (err1 || err2) return
    setBusy(true)
    try {
      await backend.updatePassword(pw)
      toast.success(L('Password changed. Use the new one next time you log in.', 'पासवर्ड बदल गया। अगली बार नए पासवर्ड से लॉग इन करें।'))
      setPw('')
      setPw2('')
      setTried(false)
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : L('Could not change the password.', 'पासवर्ड नहीं बदल सका।'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Panel>
      <SectionTitle icon={<KeyRound className="size-5" />} title={L('Your account', 'आपका अकाउंट')} sub={user?.email ? L(`Logged in as ${user.email}`, `${user.email} से लॉग इन`) : undefined} />
      {demo ? (
        <div data-field="yellow" className="flex gap-3 rounded-[18px] bg-[var(--field)] p-4 text-[var(--ink)]">
          <Store className="size-5 shrink-0" />
          <p className="m-0 text-[14.5px]">
            {L(
              'This is the demo version, so the password cannot be changed here. Once the real database is connected, you can change your password from this screen.',
              'यह डेमो वर्ज़न है, इसलिए यहाँ पासवर्ड नहीं बदला जा सकता। असली डेटाबेस जुड़ने के बाद आप यहीं से पासवर्ड बदल सकेंगे।',
            )}
          </p>
        </div>
      ) : (
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            void change()
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label={L('New password', 'नया पासवर्ड')} type="password" value={pw} onChange={setPw} error={tried ? err1 : ''} hint={L('min 8 characters', 'कम से कम 8 अक्षर')} />
            <TextInput label={L('Type it again', 'दोबारा लिखें')} type="password" value={pw2} onChange={setPw2} error={tried ? err2 : ''} />
          </div>
          <div>
            <button type="submit" disabled={busy || !pw} className="btn btn-ink press disabled:opacity-40">
              {busy ? <Spinner /> : L('Change password', 'पासवर्ड बदलें')}
            </button>
          </div>
        </form>
      )}
    </Panel>
  )
}
