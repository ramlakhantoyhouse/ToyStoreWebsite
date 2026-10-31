import type { Bi } from '../i18n'

export type SeasonId = 'holi' | 'summer' | 'rakhi' | 'kites' | 'diwali' | 'sports'

export type Season = {
  id: SeasonId
  name: Bi
  months: Bi // shown on cards
  line: Bi // one-line pitch
  items: Bi[] // example items shown in the feature
  image: string
  alt: Bi
  // Date windows as [startMonth, startDay, endMonth, endDay], 1-based months.
  // Edit these to move a season. Sports has none: it is always available.
  windows: [number, number, number, number][]
  allYear?: boolean
  headline: Bi // hero line when this season is on
  monthsOn: number[] // 1-12, lit on the year axis
  duo: [string, string] // duotone shadow, highlight
  photos: string[] // extra image files shown in its section
}

export const seasons: Season[] = [
  {
    id: 'holi',
    headline: { en: 'Holi is on the counter.', hi: 'होली का सामान आ गया है।' },
    monthsOn: [2, 3],
    duo: ['#3d0620', '#ffd0e3'],
    photos: ['holi-packets', 'pichkari-stall'],
    name: { en: 'Holi', hi: 'होली' },
    months: { en: 'Feb – Mar', hi: 'फ़रवरी – मार्च' },
    line: { en: 'Gulaal, pichkari and everything for a colourful Holi.', hi: 'गुलाल, पिचकारी और रंग-बिरंगी होली का पूरा सामान।' },
    items: [
      { en: 'Herbal gulaal', hi: 'हर्बल गुलाल' },
      { en: 'Pichkari & water guns', hi: 'पिचकारी व वॉटर गन' },
      { en: 'Water balloons', hi: 'पानी के गुब्बारे' },
      { en: 'Holi caps & masks', hi: 'होली टोपी व मास्क' },
    ],
    image: '/images/holi-bowls.webp',
    alt: { en: 'Bowls of bright gulaal colours', hi: 'चमकीले गुलाल के कटोरे' },
    windows: [[2, 1, 3, 31]],
  },
  {
    id: 'summer',
    headline: { en: 'Summer games are in.', hi: 'गर्मियों के खेल आ गए हैं।' },
    monthsOn: [4, 5, 6],
    duo: ['#03343b', '#c9f4f8'],
    photos: ['carrom', 'toy-cars'],
    name: { en: 'Summer fun', hi: 'गर्मियों की मस्ती' },
    months: { en: 'Apr – Jun', hi: 'अप्रैल – जून' },
    line: { en: 'Water guns for the afternoon, board games for the evening.', hi: 'दोपहर के लिए वॉटर गन, शाम के लिए बोर्ड गेम।' },
    items: [
      { en: 'Water guns', hi: 'वॉटर गन' },
      { en: 'Carrom boards', hi: 'कैरम बोर्ड' },
      { en: 'Ludo & board games', hi: 'लूडो व बोर्ड गेम' },
      { en: 'Outdoor toys', hi: 'आउटडोर खिलौने' },
    ],
    image: '/images/pichkari.webp',
    alt: { en: 'Bright plastic water guns', hi: 'रंगीन प्लास्टिक वॉटर गन' },
    windows: [[4, 1, 6, 30]],
  },
  {
    id: 'rakhi',
    headline: { en: 'Rakhi is on the counter.', hi: 'राखी आ गई है।' },
    monthsOn: [7, 8],
    duo: ['#3d1300', '#ffd9bf'],
    photos: ['rakhi', 'tiranga'],
    name: { en: 'Rakhi & 15 August', hi: 'राखी व 15 अगस्त' },
    months: { en: 'Jul – Aug', hi: 'जुलाई – अगस्त' },
    line: { en: 'Rakhis for every brother, and tiranga for Independence Day.', hi: 'हर भाई के लिए राखी, और स्वतंत्रता दिवस के लिए तिरंगा।' },
    items: [
      { en: 'Designer rakhis', hi: 'डिज़ाइनर राखी' },
      { en: 'Kids’ rakhis', hi: 'बच्चों की राखी' },
      { en: 'Tiranga flags & badges', hi: 'तिरंगा झंडे व बैज' },
      { en: 'Kites for 15 August', hi: '15 अगस्त की पतंगें' },
    ],
    image: '/images/rakhi-stall.webp',
    alt: { en: 'A table full of rakhis', hi: 'राखियों से भरी मेज़' },
    windows: [[7, 15, 8, 20]],
  },
  {
    id: 'kites',
    headline: { en: 'Kite season is here.', hi: 'पतंग का मौसम आ गया।' },
    monthsOn: [1, 7, 8],
    duo: ['#0a1f4a', '#d6e5ff'],
    photos: ['kites-sky', 'kite-single'],
    name: { en: 'Kite season', hi: 'पतंग का मौसम' },
    months: { en: 'Jan · Jul – Aug', hi: 'जनवरी · जुलाई – अगस्त' },
    line: { en: 'Kites, dor and charkhi for Sankranti and the August skies.', hi: 'संक्रांति और अगस्त के आसमान के लिए पतंग, डोर और चरखी।' },
    items: [
      { en: 'Paper kites', hi: 'कागज़ की पतंगें' },
      { en: 'Cotton dor', hi: 'सूती डोर' },
      { en: 'Charkhi', hi: 'चरखी' },
      { en: 'Kids’ kites', hi: 'बच्चों की पतंगें' },
    ],
    image: '/images/kites-roof.webp',
    alt: { en: 'Paper kites on a rooftop', hi: 'छत पर रखी कागज़ की पतंगें' },
    windows: [[1, 1, 1, 20], [7, 15, 8, 20]],
  },
  {
    id: 'diwali',
    headline: { en: 'Diwali is on the counter.', hi: 'दिवाली का सामान आ गया है।' },
    monthsOn: [10, 11],
    duo: ['#1d1b4b', '#ffd77a'],
    photos: ['diwali-lights', 'rangoli'],
    name: { en: 'Diwali', hi: 'दिवाली' },
    months: { en: 'Oct – Nov', hi: 'अक्टूबर – नवंबर' },
    line: { en: 'Lights, diyas and decoration to make the house glow.', hi: 'घर को रोशन करने के लिए लाइट, दीये और सजावट।' },
    items: [
      { en: 'Decoration lights', hi: 'सजावटी लाइटें' },
      { en: 'Diyas', hi: 'दीये' },
      { en: 'Rangoli colours', hi: 'रंगोली के रंग' },
      { en: 'Toran & hanging decor', hi: 'तोरण व लटकने वाली सजावट' },
    ],
    image: '/images/diwali-diyas.webp',
    alt: { en: 'Lit clay diyas', hi: 'जलते मिट्टी के दीये' },
    windows: [[10, 1, 11, 20]],
  },
  {
    id: 'sports',
    headline: { en: 'Game on, all year.', hi: 'खेल, साल भर।' },
    monthsOn: [1,2,3,4,5,6,7,8,9,10,11,12],
    duo: ['#052e1f', '#c8f0de'],
    photos: ['football', 'badminton'],
    name: { en: 'Sports', hi: 'खेल' },
    months: { en: 'All year', hi: 'साल भर' },
    line: { en: 'Bats, balls, rackets and more — in stock all 12 months.', hi: 'बैट, बॉल, रैकेट और भी बहुत कुछ — बारहों महीने स्टॉक में।' },
    items: [
      { en: 'Cricket bats & balls', hi: 'क्रिकेट बैट व बॉल' },
      { en: 'Footballs', hi: 'फ़ुटबॉल' },
      { en: 'Badminton', hi: 'बैडमिंटन' },
      { en: 'Skipping ropes', hi: 'रस्सी कूद' },
    ],
    image: '/images/cricket.webp',
    alt: { en: 'Cricket bat and leather ball', hi: 'क्रिकेट बैट और लेदर बॉल' },
    windows: [],
    allYear: true,
  },
]

// Festival seasons win over kites when windows overlap (Rakhi beats August kites).
const PRIORITY: SeasonId[] = ['diwali', 'holi', 'rakhi', 'kites', 'summer']

function istNow(now = new Date()) {
  return new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000)
}

function inWindow(d: Date, [sm, sd, em, ed]: [number, number, number, number]) {
  const v = (d.getMonth() + 1) * 100 + d.getDate()
  return v >= sm * 100 + sd && v <= em * 100 + ed
}

/** The season the shop is in today, or the next one coming up. */
export function currentSeason(now = new Date()): { season: Season; upcoming: boolean } {
  const d = istNow(now)
  for (const id of PRIORITY) {
    const s = seasonById(id)!
    if (s.windows.some((w) => inWindow(d, w))) return { season: s, upcoming: false }
  }
  // Nothing on right now: lead with the nearest season ahead.
  for (let i = 1; i <= 366; i++) {
    const f = new Date(d.getTime() + i * 86400000)
    for (const id of PRIORITY) {
      const s = seasonById(id)!
      if (s.windows.some((w) => inWindow(f, w))) return { season: s, upcoming: true }
    }
  }
  return { season: seasonById('sports')!, upcoming: false }
}

// Calendar order for the year walk on the home page; sports closes it.
export const calendarOrder: SeasonId[] = ['kites', 'holi', 'summer', 'rakhi', 'diwali', 'sports']

export const seasonById = (id: string) => seasons.find((s) => s.id === id)
