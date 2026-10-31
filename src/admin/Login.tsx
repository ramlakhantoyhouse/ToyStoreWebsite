import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Info } from 'lucide-react'
import { Spinner, TextInput, useAdmin, useL } from './ui'
import { Monogram } from '../components/Logo'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../data/demoBackend'

export function Login() {
  const L = useL()
  const { backend } = useAdmin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [forgot, setForgot] = useState(false)
  const demo = backend.mode === 'demo'

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setErr('')
    if (!email.trim()) return setErr(L('Enter your email.', 'अपना ईमेल लिखें।'))
    setBusy(true)
    try {
      if (forgot) {
        await backend.sendPasswordReset(email)
        toast.success(L('Check your email for a reset link.', 'पासवर्ड बदलने का लिंक ईमेल पर भेजा गया है।'))
        setForgot(false)
      } else {
        await backend.signIn(email, password)
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-[var(--chalk)] px-4 py-10 text-[var(--ink)]">
      <form onSubmit={submit} noValidate className="enter w-full max-w-sm">
        <Monogram className="size-14" />
        <h1 className="mt-6 text-[2.2rem] leading-none font-bold tracking-[-0.05em]">{L('Control Centre', 'कंट्रोल सेंटर')}</h1>
        <p className="ink-2 mt-3 text-[15.5px]">
          {forgot ? L('We’ll email you a link to set a new password.', 'नया पासवर्ड बनाने का लिंक ईमेल पर भेजेंगे।') : L('Log in to manage products and enquiries.', 'सामान और पूछताछ संभालने के लिए लॉग इन करें।')}
        </p>

        {demo && (
          <div className="mt-6 flex gap-3 rounded-[18px] bg-[var(--card)] p-4 text-[14px]">
            <Info className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">{L('Demo mode', 'डेमो मोड')}</p>
              <p className="ink-2 mt-1">
                {L('Changes stay in this browser only. Email', 'बदलाव सिर्फ़ इसी ब्राउज़र में रहेंगे। ईमेल')} <b className="text-[var(--ink)]">{DEMO_EMAIL}</b>, {L('password', 'पासवर्ड')} <b className="text-[var(--ink)]">{DEMO_PASSWORD}</b>
              </p>
              <button
                type="button"
                className="press mt-2 cursor-pointer border-0 bg-transparent p-0 font-semibold text-[var(--ink)] underline"
                onClick={() => {
                  setEmail(DEMO_EMAIL)
                  setPassword(DEMO_PASSWORD)
                }}
              >
                {L('Fill demo login', 'डेमो लॉगिन भरें')}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-4">
          <TextInput label={L('Email', 'ईमेल')} type="email" value={email} onChange={setEmail} inputMode="email" />
          {!forgot && <TextInput label={L('Password', 'पासवर्ड')} type="password" value={password} onChange={setPassword} />}
        </div>
        {err && (
          <p role="alert" className="mt-4 rounded-[14px] bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] px-4 py-3 text-[14.5px] font-medium text-[var(--danger)]">
            {err}
          </p>
        )}
        <button type="submit" disabled={busy} className="btn btn-ink press mt-6 w-full">
          {busy ? <Spinner /> : forgot ? L('Send reset link', 'लिंक भेजें') : L('Log in', 'लॉग इन')}
        </button>
        {!demo && (
          <button type="button" onClick={() => setForgot((f) => !f)} className="press mt-4 w-full cursor-pointer border-0 bg-transparent py-2 text-[14.5px] font-semibold text-[var(--ink)] underline">
            {forgot ? L('Back to login', 'वापस लॉग इन') : L('Forgot password?', 'पासवर्ड भूल गए?')}
          </button>
        )}
      </form>
    </div>
  )
}

export function ResetPassword() {
  const L = useL()
  const { backend } = useAdmin()
  const nav = useNavigate()
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (pw.length < 8) return setErr(L('Use at least 8 characters.', 'कम से कम 8 अक्षर रखें।'))
    setBusy(true)
    try {
      await backend.updatePassword(pw)
      toast.success(L('Password changed.', 'पासवर्ड बदल गया।'))
      nav('/admin', { replace: true })
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="grid min-h-dvh place-items-center bg-[var(--chalk)] px-4 text-[var(--ink)]">
      <form onSubmit={submit} noValidate className="w-full max-w-sm">
        <Monogram className="size-14" />
        <h1 className="mt-6 text-[2rem] leading-none font-bold tracking-[-0.05em]">{L('Set a new password', 'नया पासवर्ड बनाएं')}</h1>
        <div className="mt-6">
          <TextInput label={L('New password', 'नया पासवर्ड')} type="password" value={pw} onChange={setPw} error={err} />
        </div>
        <button type="submit" disabled={busy} className="btn btn-ink press mt-6 w-full">
          {busy ? <Spinner /> : L('Save password', 'पासवर्ड सेव करें')}
        </button>
      </form>
    </div>
  )
}
