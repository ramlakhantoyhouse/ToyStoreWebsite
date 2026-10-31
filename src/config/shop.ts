// Single source for shop facts. Edit here and the whole site updates.
export const shop = {
  name: 'Ram Lakhan Toy House',
  phone: '+919540528086',
  phoneDisplay: '+91 95405 28086',
  whatsapp: '919540528086',
  address: {
    line1: 'Shop No. 5-A/C, Main Bazar',
    line2: 'Near Delhi Gate, Najafgarh',
    city: 'New Delhi – 110043',
  },
  // Wednesday is a half day.
  hours: {
    open: '09:00',
    close: '21:00',
    wedClose: '14:00',
    label: {
      en: '9 AM – 9 PM daily · Wed 9 AM – 2 PM',
      hi: 'सुबह 9 – रात 9 बजे रोज़ · बुधवार सुबह 9 – दोपहर 2 बजे',
    },
  },
  // The shop is still listed on Google Maps under its old name; keep that until the listing is renamed.
  mapsQuery: 'Ram Lakhan Patang House, Main Bazar, Near Delhi Gate, Najafgarh, New Delhi 110043',
  // Replace with the shop's Google Business review link once the profile exists.
  reviewsUrl: 'https://www.google.com/maps/search/?api=1&query=Ram+Lakhan+Patang+House+Najafgarh',
} as const

export const telHref = `tel:${shop.phone}`
export const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(shop.mapsQuery)}&output=embed`
export const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(shop.mapsQuery)}`
export const waHref = (text?: string) =>
  `https://wa.me/${shop.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`

export const weekHours: { day: { en: string; hi: string }; dow: number; hours: { en: string; hi: string } }[] = [
  { day: { en: 'Monday', hi: 'सोमवार' }, dow: 1, hours: { en: '9 AM – 9 PM', hi: 'सुबह 9 – रात 9' } },
  { day: { en: 'Tuesday', hi: 'मंगलवार' }, dow: 2, hours: { en: '9 AM – 9 PM', hi: 'सुबह 9 – रात 9' } },
  { day: { en: 'Wednesday', hi: 'बुधवार' }, dow: 3, hours: { en: '9 AM – 2 PM (half day)', hi: 'सुबह 9 – दोपहर 2 (आधा दिन)' } },
  { day: { en: 'Thursday', hi: 'गुरुवार' }, dow: 4, hours: { en: '9 AM – 9 PM', hi: 'सुबह 9 – रात 9' } },
  { day: { en: 'Friday', hi: 'शुक्रवार' }, dow: 5, hours: { en: '9 AM – 9 PM', hi: 'सुबह 9 – रात 9' } },
  { day: { en: 'Saturday', hi: 'शनिवार' }, dow: 6, hours: { en: '9 AM – 9 PM', hi: 'सुबह 9 – रात 9' } },
  { day: { en: 'Sunday', hi: 'रविवार' }, dow: 0, hours: { en: '9 AM – 9 PM', hi: 'सुबह 9 – रात 9' } },
]

export const istDay = (now = new Date()) => new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000).getDay()

export function isOpenNow(now = new Date()) {
  // Shop time is IST; compute from UTC so it is right on any device clock zone.
  const ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000)
  const mins = ist.getHours() * 60 + ist.getMinutes()
  const [oh, om] = shop.hours.open.split(':').map(Number)
  const close = ist.getDay() === 3 ? shop.hours.wedClose : shop.hours.close
  const [ch, cm] = close.split(':').map(Number)
  return mins >= oh * 60 + om && mins < ch * 60 + cm
}
