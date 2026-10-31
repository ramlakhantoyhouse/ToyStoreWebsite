import { shop } from '../config/shop'
import { getBackend } from '../data/backend'

export type Enquiry = {
  type: 'retail' | 'wholesale'
  product: string
  variant?: string
  qty?: string
  season?: string
  name: string
  mobile: string
  area: string
  note?: string
  website?: string // honeypot: real people never fill this
}

export const MOBILE_RE = /^[6-9]\d{9}$/

export function cleanMobile(v: string) {
  return v.replace(/\D/g, '').replace(/^(91|0)(?=[6-9]\d{9}$)/, '')
}

/** wa.me link for the shop's WhatsApp number (digits only, with country code). */
export function waLink(whatsapp: string, text?: string) {
  const n = whatsapp.replace(/\D/g, '') || shop.whatsapp
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}

/** "+919540528086" → "+91 95405 28086" */
export function fmtPhone(phone: string) {
  const d = phone.replace(/\D/g, '')
  const local = d.length === 12 && d.startsWith('91') ? d.slice(2) : d.length === 11 && d.startsWith('0') ? d.slice(1) : d
  if (local.length === 10) return `+91 ${local.slice(0, 5)} ${local.slice(5)}`
  return phone
}

/** tel: link that always dials with the country code. */
export function telLink(phone: string) {
  const d = phone.replace(/\D/g, '')
  if (d.length === 10) return `tel:+91${d}`
  return `tel:+${d || shop.phone.replace(/\D/g, '')}`
}

function message(e: Enquiry) {
  const lines = [
    `New ${e.type === 'wholesale' ? 'Wholesale ' : ''}Enquiry – ${shop.name}`,
    `${e.type === 'wholesale' ? 'Items' : 'Product'}: ${e.product}${e.variant ? ` (${e.variant})` : ''}`,
    e.qty ? `Qty: ${e.qty}` : '',
    e.season ? `Season: ${e.season}` : '',
    `Name: ${e.name}`,
    `Mobile: ${e.mobile}`,
    `Area: ${e.area}`,
    e.note ? `Note: ${e.note}` : '',
  ]
  return lines.filter(Boolean).join('\n')
}

/**
 * Save the enquiry for the owner's inbox, then hand off to WhatsApp.
 * The save is started but NOT awaited: WhatsApp must open inside the same
 * click or popup blockers stop it. WhatsApp still carries the enquiry if the
 * save fails.
 */
export function sendEnquiry(e: Enquiry, whatsapp: string) {
  void getBackend()
    .then((b) =>
      b.addEnquiry({
        type: e.type,
        product: e.product,
        variant: e.variant || null,
        qty: e.qty || null,
        season: e.season || null,
        name: e.name,
        mobile: e.mobile,
        area: e.area,
        note: e.note || null,
        website: e.website ?? '',
      }),
    )
    .catch(() => {
      /* never block the customer */
    })
  const href = waLink(whatsapp, message(e))
  // No 'noopener' feature here: with it window.open always returns null and we
  // couldn't tell a blocked popup from an opened one. Detach the opener instead.
  const w = window.open(href, '_blank')
  if (w) w.opener = null
  else window.location.href = href
}
