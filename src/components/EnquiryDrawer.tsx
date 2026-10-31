import { useState, type FormEvent } from 'react'
import { Drawer } from 'vaul'
import { toast } from 'sonner'
import { Check, Phone, X } from 'lucide-react'
import { useLang } from '../i18n'
import { cleanMobile, MOBILE_RE, sendEnquiry } from '../lib/enquiry'
import { useShop } from '../lib/useShop'
import { WhatsAppIcon } from './Icons'
import { FormField as Field } from './FormField'

type Props = {
  open: boolean
  onOpenChange: (o: boolean) => void
  product: string
  variant?: string
  season?: string
}

export function EnquiryDrawer({ open, onOpenChange, product, variant, season }: Props) {
  const { t } = useLang()
  const { tel, whatsapp } = useShop()
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get('name') || '').trim()
    const mobile = cleanMobile(String(f.get('mobile') || ''))
    const area = String(f.get('area') || '').trim()
    const errs: Record<string, string> = {}
    if (!name) errs.name = t('err_name')
    if (!MOBILE_RE.test(mobile)) errs.mobile = t('err_mobile')
    if (!area) errs.area = t('err_area')
    setErrors(errs)
    if (Object.keys(errs).length) {
      e.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`)?.focus()
      return
    }
    sendEnquiry({
      type: 'retail',
      product,
      variant,
      season,
      qty: String(f.get('qty') || '').trim(),
      name,
      mobile,
      area,
      note: String(f.get('note') || '').trim(),
      website: String(f.get('website') || ''),
    }, whatsapp)
    toast.success(t('toast_saved'))
    setSent(true)
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) window.setTimeout(() => (setSent(false), setErrors({})), 300)
      }}
      repositionInputs={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-[rgb(10_9_30_/_0.55)]" />
        <Drawer.Content data-field="chalk" className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] max-w-lg flex-col rounded-t-[28px] bg-[var(--chalk)] text-[var(--ink)] outline-none">
          <div aria-hidden="true" className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-[color-mix(in_srgb,var(--ink)_20%,transparent)]" />
          <div className="overflow-y-auto px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {sent ? (
              <div className="enter py-6 text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--sports)] text-white">
                  <Check className="size-7" strokeWidth={2} />
                </span>
                <Drawer.Title className="mt-4 text-xl font-semibold tracking-[-0.02em]">{t('sent_title')}</Drawer.Title>
                <Drawer.Description className="mx-auto mt-2 max-w-xs text-[15px] ink-2">{t('sent_sub')}</Drawer.Description>
                <div className="mt-6 flex justify-center gap-3">
                  <a href={tel} className="btn btn-ink press">
                    <Phone className="size-[18px]" /> {t('call_shop')}
                  </a>
                  <Drawer.Close className="btn btn-line press">{t('close')}</Drawer.Close>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <div className="mr-auto">
                    <Drawer.Title className="text-xl font-semibold tracking-[-0.02em]">{t('form_title')}</Drawer.Title>
                    <Drawer.Description className="mt-1 text-sm ink-2">{t('form_sub')}</Drawer.Description>
                  </div>
                  <Drawer.Close className="press -mr-2 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent ink-2" aria-label={t('close')}>
                    <X className="size-5" />
                  </Drawer.Close>
                </div>
                <p className="mt-4 rounded-[14px] bg-[color-mix(in_srgb,var(--ink)_7%,transparent)] px-4 py-3 text-[15px] font-medium">
                  {product}
                  {variant && <span className="ink-2"> · {variant}</span>}
                </p>
                <form onSubmit={submit} noValidate className="mt-4 grid gap-3.5">
                  <Field name="name" label={t('f_name')} autoComplete="name" error={errors.name} />
                  <Field name="mobile" label={t('f_mobile')} type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={14} error={errors.mobile} />
                  <Field name="area" label={t('f_area')} placeholder={t('f_area_ph')} autoComplete="street-address" error={errors.area} />
                  <Field name="qty" label={t('f_qty')} placeholder="1" />
                  <Field name="note" label={t('f_note')} multiline />
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                  <button type="submit" className="btn btn-wa press mt-1 w-full">
                    <WhatsAppIcon /> {t('submit')}
                  </button>
                </form>
              </>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
