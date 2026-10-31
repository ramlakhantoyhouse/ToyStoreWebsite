import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Check, Phone } from 'lucide-react'
import { useLang, type Key } from '../i18n'
import { cleanMobile, MOBILE_RE, sendEnquiry } from '../lib/enquiry'
import { FieldSection } from '../components/Field'
import { DuoPhoto } from '../components/DuoPhoto'
import { FormField as Field } from '../components/FormField'
import { WhatsAppIcon } from '../components/Icons'
import { usePageTitle } from '../lib/usePageTitle'
import { useShop } from '../lib/useShop'

const D = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties
const steps: Key[] = ['wholesale_how_1', 'wholesale_how_2', 'wholesale_how_3']

export function Wholesale() {
  const { t } = useLang()
  usePageTitle(t('wholesale_title'))
  const { tel, whatsapp } = useShop()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sent, setSent] = useState(false)

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const get = (k: string) => String(f.get(k) || '').trim()
    const mobile = cleanMobile(get('mobile'))
    const errs: Record<string, string> = {}
    if (!get('name')) errs.name = t('err_name')
    if (!MOBILE_RE.test(mobile)) errs.mobile = t('err_mobile')
    if (!get('area')) errs.area = t('err_area')
    if (!get('items')) errs.items = t('err_items')
    setErrors(errs)
    if (Object.keys(errs).length) {
      e.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`)?.focus()
      return
    }
    sendEnquiry({
      type: 'wholesale',
      product: get('items'),
      name: get('shop') ? `${get('name')} (${get('shop')})` : get('name'),
      mobile,
      area: get('area'),
      website: get('website'),
    }, whatsapp)
    toast.success(t('toast_saved'))
    setSent(true)
  }

  return (
    <FieldSection inset field="indigo">
      <div className="mx-auto max-w-[1400px] px-4 pt-10 pb-24 sm:px-10 sm:pt-16 sm:pb-32">
        <h1 className="enter max-w-[14ch] text-[clamp(3rem,9.4vw,9.2rem)] leading-[0.9] font-bold tracking-[-0.06em]">
          {t('wholesale_title')}
        </h1>
        <p className="enter ink-2 mt-7 max-w-[32rem] text-[17px] leading-relaxed sm:text-[19px]" style={D(80)}>
          {t('wholesale_sub')}
        </p>

        <div className="mt-12 grid gap-12 sm:mt-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-20">
          <div className="enter" style={D(160)}>
            <ol className="hair grid border-t" role="list">
              {steps.map((k, i) => (
                <li key={k} className="hair flex items-baseline gap-6 border-b py-5 sm:py-6">
                  <span className="ink-2 w-6 shrink-0 text-[15px] tabular-nums">{i + 1}</span>
                  <span className="text-[clamp(1.35rem,2.6vw,2rem)] leading-tight font-semibold tracking-[-0.03em]">{t(k)}</span>
                </li>
              ))}
            </ol>
            <DuoPhoto file="rakhi-stall" season="rakhi" alt="" className="mt-12 hidden aspect-[16/11] rounded-[28px] lg:block" />
          </div>

          <div
            data-field="chalk"
            className="enter relative rounded-[28px] bg-[var(--chalk)] p-6 text-[var(--ink)] sm:p-10"
            style={D(240)}
          >
            {sent ? (
              <div className="py-8 text-center sm:py-12" role="status">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-[var(--sports)] text-white">
                  <Check className="size-8" strokeWidth={2.25} />
                </span>
                <h2 className="mx-auto mt-6 max-w-md text-[clamp(1.6rem,3vw,2.2rem)] leading-tight font-bold tracking-[-0.04em]">
                  {t('sent_title')}
                </h2>
                <p className="ink-2 mx-auto mt-3 max-w-sm text-[16px]">{t('sent_sub')}</p>
                <a href={tel} className="btn btn-ink press mt-8">
                  <Phone className="size-[18px]" strokeWidth={1.75} /> {t('call_shop')}
                </a>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field name="name" label={t('f_name')} autoComplete="name" error={errors.name} />
                  <Field name="shop" label={t('f_shop')} autoComplete="organization" />
                  <Field
                    name="mobile"
                    label={t('f_mobile')}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={14}
                    error={errors.mobile}
                  />
                  <Field name="area" label={t('f_area')} placeholder={t('f_area_ph')} error={errors.area} />
                </div>
                <Field name="items" label={t('f_items')} placeholder={t('f_items_ph')} multiline error={errors.items} />
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                />
                <button type="submit" className="btn btn-ink press mt-2 w-full sm:w-auto sm:justify-self-start">
                  <WhatsAppIcon /> {t('submit')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </FieldSection>
  )
}
