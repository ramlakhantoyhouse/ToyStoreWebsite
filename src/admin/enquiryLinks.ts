import type { EnquiryRow } from '../data/types'

/** Last 10 digits of a stored mobile number (drops +91 / 0 prefixes). */
export const mobile10 = (m: string) => m.replace(/\D/g, '').slice(-10)

export const telHref = (m: string) => `tel:+91${mobile10(m)}`

/** WhatsApp link with a polite, ready-to-send reply in Hinglish. */
export function waReplyHref(e: EnquiryRow) {
  const item = `${e.product}${e.variant ? ` (${e.variant})` : ''}`
  const text =
    `Namaste ${e.name} ji, Ram Lakhan Toy House se baat kar rahe hain. ` +
    `Aapne "${item}"${e.qty ? ` (${e.qty})` : ''} ke baare mein poocha tha. ` +
    `Ye hamare paas available hai. Aap kab dukaan aa sakte hain? Koi sawaal ho to yahin message kar dijiye. Dhanyavaad!`
  return `https://wa.me/91${mobile10(e.mobile)}?text=${encodeURIComponent(text)}`
}
