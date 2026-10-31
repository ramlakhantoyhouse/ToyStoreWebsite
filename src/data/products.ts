import type { Bi } from '../i18n'
import type { SeasonId } from '../config/seasons'

export type Category = { id: string; name: Bi; image: string; sort?: number }

export type Product = {
  slug: string
  name: Bi
  category: string
  season: SeasonId
  description: Bi
  images: string[] // file names in public/images ("toy-cars") or full photo URLs from the admin
  variants?: Bi[]
  sale: ('retail' | 'wholesale')[]
  featured?: boolean
  inStock?: boolean // false = shown as "Out of stock"
  sort?: number
}

export const categories: Category[] = [
  { id: 'toys', name: { en: 'Toys', hi: 'खिलौने' }, image: '/images/toys-wooden.webp' },
  { id: 'holi', name: { en: 'Holi', hi: 'होली' }, image: '/images/holi-sacks.webp' },
  { id: 'rakhi', name: { en: 'Rakhi', hi: 'राखी' }, image: '/images/rakhi.webp' },
  { id: 'diwali', name: { en: 'Diwali Decor', hi: 'दिवाली सजावट' }, image: '/images/diyas-four.webp' },
  { id: 'kites', name: { en: 'Kites', hi: 'पतंग' }, image: '/images/kites-sky.webp' },
  { id: 'sports', name: { en: 'Sports', hi: 'खेल' }, image: '/images/football.webp' },
  { id: 'festival', name: { en: 'Festival Specials', hi: 'त्योहार स्पेशल' }, image: '/images/tiranga.webp' },
]

// SAMPLE CATALOGUE — names and descriptions are placeholders written for the
// demo. Replace them with the shop's real stock, and the sample photos with
// the shop's own (photo credits: src/data/photo-credits.json).
export const products: Product[] = [
  // Holi
  {
    slug: 'gulaal-colours',
    name: { en: 'Gulaal Colours', hi: 'गुलाल के रंग' },
    category: 'holi',
    season: 'holi',
    description: { en: 'Bright dry colours in many shades, loose or in packets.', hi: 'कई रंगों में सूखा गुलाल, खुला या पैकेट में।' },
    images: ['holi-bowls', 'holi-packets'],
    variants: [
      { en: 'Small packet', hi: 'छोटा पैकेट' },
      { en: 'Large packet', hi: 'बड़ा पैकेट' },
      { en: 'Loose (by kg)', hi: 'खुला (किलो में)' },
    ],
    sale: ['retail', 'wholesale'],
    featured: true,
  },
  {
    slug: 'gulaal-bulk',
    name: { en: 'Gulaal in Bulk', hi: 'थोक गुलाल' },
    category: 'holi',
    season: 'holi',
    description: { en: 'Sacks of gulaal for shopkeepers and big celebrations.', hi: 'दुकानदारों और बड़े आयोजनों के लिए गुलाल की बोरियां।' },
    images: ['holi-sacks'],
    sale: ['wholesale'],
  },
  {
    slug: 'pichkari',
    name: { en: 'Pichkari & Water Guns', hi: 'पिचकारी व वॉटर गन' },
    category: 'holi',
    season: 'holi',
    description: { en: 'From small hand pichkaris to big tank water guns.', hi: 'छोटी हाथ वाली पिचकारी से बड़ी टंकी वाली वॉटर गन तक।' },
    images: ['pichkari', 'pichkari-stall'],
    variants: [
      { en: 'Small', hi: 'छोटी' },
      { en: 'Medium', hi: 'मीडियम' },
      { en: 'Tank', hi: 'टंकी वाली' },
    ],
    sale: ['retail', 'wholesale'],
    featured: true,
  },
  // Toys and summer
  {
    slug: 'wooden-toys',
    name: { en: 'Wooden Toys', hi: 'लकड़ी के खिलौने' },
    category: 'toys',
    season: 'summer',
    description: { en: 'Colourful hand-painted wooden toys.', hi: 'हाथ से रंगे रंग-बिरंगे लकड़ी के खिलौने।' },
    images: ['toys-wooden'],
    sale: ['retail', 'wholesale'],
    featured: true,
  },
  {
    slug: 'pull-along-elephant',
    name: { en: 'Pull-Along Elephant', hi: 'खींचने वाला हाथी' },
    category: 'toys',
    season: 'summer',
    description: { en: 'A wooden elephant on wheels with a pull string, for toddlers.', hi: 'छोटे बच्चों के लिए डोरी वाला पहियों पर लकड़ी का हाथी।' },
    images: ['toy-elephant'],
    sale: ['retail'],
  },
  {
    slug: 'wooden-cars',
    name: { en: 'Wooden Cars', hi: 'लकड़ी की गाड़ियां' },
    category: 'toys',
    season: 'summer',
    description: { en: 'Simple smooth wooden cars for small hands.', hi: 'छोटे हाथों के लिए चिकनी लकड़ी की गाड़ियां।' },
    images: ['toy-cars'],
    sale: ['retail', 'wholesale'],
  },
  {
    slug: 'wooden-lattu',
    name: { en: 'Wooden Lattu', hi: 'लकड़ी का लट्टू' },
    category: 'toys',
    season: 'summer',
    description: { en: 'The classic spinning top.', hi: 'पुराना पसंदीदा लट्टू।' },
    images: ['lattu'],
    sale: ['retail', 'wholesale'],
  },
  {
    slug: 'carrom-board',
    name: { en: 'Carrom Board', hi: 'कैरम बोर्ड' },
    category: 'toys',
    season: 'summer',
    description: { en: 'Full-size carrom boards with coins and striker.', hi: 'गोटियों और स्ट्राइकर के साथ फ़ुल साइज़ कैरम बोर्ड।' },
    images: ['carrom'],
    variants: [
      { en: 'Medium', hi: 'मीडियम' },
      { en: 'Full size', hi: 'फ़ुल साइज़' },
    ],
    sale: ['retail', 'wholesale'],
  },
  // Rakhi and 15 August
  {
    slug: 'designer-rakhi',
    name: { en: 'Designer Rakhi', hi: 'डिज़ाइनर राखी' },
    category: 'rakhi',
    season: 'rakhi',
    description: { en: 'Beaded and stone-work rakhis in many designs.', hi: 'मोती और नग वाली कई डिज़ाइनों की राखियां।' },
    images: ['rakhi'],
    sale: ['retail', 'wholesale'],
    featured: true,
  },
  {
    slug: 'om-rakhi',
    name: { en: 'Om Rakhi', hi: 'ॐ राखी' },
    category: 'rakhi',
    season: 'rakhi',
    description: { en: 'A simple thread rakhi with an Om charm.', hi: 'ॐ वाली सादी धागे की राखी।' },
    images: ['rakhi-om'],
    sale: ['retail', 'wholesale'],
  },
  {
    slug: 'rakhi-assorted',
    name: { en: 'Assorted Rakhis (Wholesale)', hi: 'मिक्स राखियां (थोक)' },
    category: 'rakhi',
    season: 'rakhi',
    description: { en: 'Mixed rakhi boxes for shopkeepers.', hi: 'दुकानदारों के लिए मिक्स राखियों के डिब्बे।' },
    images: ['rakhi-stall'],
    sale: ['wholesale'],
  },
  {
    slug: 'tiranga-flag',
    name: { en: 'Tiranga Flags', hi: 'तिरंगा झंडे' },
    category: 'festival',
    season: 'rakhi',
    description: { en: 'Hand flags and larger flags for 15 August and 26 January.', hi: '15 अगस्त और 26 जनवरी के लिए हाथ वाले और बड़े झंडे।' },
    images: ['tiranga'],
    variants: [
      { en: 'Hand flag', hi: 'हाथ वाला' },
      { en: 'Medium', hi: 'मीडियम' },
      { en: 'Large', hi: 'बड़ा' },
    ],
    sale: ['retail', 'wholesale'],
  },
  // Diwali
  {
    slug: 'clay-diyas',
    name: { en: 'Clay Diyas', hi: 'मिट्टी के दीये' },
    category: 'diwali',
    season: 'diwali',
    description: { en: 'Plain and painted clay diyas, by the dozen or in bulk.', hi: 'सादे और रंगे मिट्टी के दीये, दर्जन में या थोक में।' },
    images: ['diwali-diyas', 'diya-market'],
    sale: ['retail', 'wholesale'],
    featured: true,
  },
  {
    slug: 'decorative-diyas',
    name: { en: 'Decorative Diyas', hi: 'सजावटी दीये' },
    category: 'diwali',
    season: 'diwali',
    description: { en: 'Painted diya sets for the puja thali and doorway.', hi: 'पूजा की थाली और दरवाज़े के लिए रंगे दीयों के सेट।' },
    images: ['diyas-four'],
    sale: ['retail', 'wholesale'],
  },
  {
    slug: 'decoration-lights',
    name: { en: 'Decoration Lights', hi: 'सजावटी लाइटें' },
    category: 'diwali',
    season: 'diwali',
    description: { en: 'String lights in many colours and lengths.', hi: 'कई रंगों और लंबाई में लड़ी वाली लाइटें।' },
    images: ['diwali-lights'],
    variants: [
      { en: 'Warm white', hi: 'वॉर्म व्हाइट' },
      { en: 'Multicolour', hi: 'मल्टीकलर' },
    ],
    sale: ['retail', 'wholesale'],
    featured: true,
  },
  {
    slug: 'rangoli-colours',
    name: { en: 'Rangoli Colours', hi: 'रंगोली के रंग' },
    category: 'diwali',
    season: 'diwali',
    description: { en: 'Bright rangoli powder in single colours and sets.', hi: 'एक रंग और सेट में चमकीला रंगोली पाउडर।' },
    images: ['rangoli'],
    sale: ['retail', 'wholesale'],
  },
  // Kites
  {
    slug: 'paper-kites',
    name: { en: 'Paper Kites', hi: 'कागज़ की पतंगें' },
    category: 'kites',
    season: 'kites',
    description: { en: 'Light paper kites in every colour, single or by the hundred.', hi: 'हर रंग की हल्की कागज़ी पतंगें, एक या सैकड़ों में।' },
    images: ['kites-roof', 'kites-sky'],
    sale: ['retail', 'wholesale'],
    featured: true,
  },
  {
    slug: 'kids-kites',
    name: { en: 'Kids’ Kites', hi: 'बच्चों की पतंगें' },
    category: 'kites',
    season: 'kites',
    description: { en: 'Easy-to-fly kites for children.', hi: 'बच्चों के लिए आसानी से उड़ने वाली पतंगें।' },
    images: ['kite-single'],
    sale: ['retail', 'wholesale'],
  },
  {
    slug: 'kites-wholesale',
    name: { en: 'Kites & Dor (Wholesale)', hi: 'पतंग व डोर (थोक)' },
    category: 'kites',
    season: 'kites',
    description: { en: 'Kites, cotton dor and charkhi in bulk for shops.', hi: 'दुकानों के लिए थोक में पतंग, सूती डोर और चरखी।' },
    images: ['kite-shop'],
    sale: ['wholesale'],
  },
  // Sports
  {
    slug: 'cricket-bat-ball',
    name: { en: 'Cricket Bat & Ball', hi: 'क्रिकेट बैट व बॉल' },
    category: 'sports',
    season: 'sports',
    description: { en: 'Bats for every age, tennis and leather balls.', hi: 'हर उम्र के बैट, टेनिस और लेदर बॉल।' },
    images: ['cricket'],
    variants: [
      { en: 'Kids’ bat', hi: 'बच्चों का बैट' },
      { en: 'Full size bat', hi: 'फ़ुल साइज़ बैट' },
      { en: 'Tennis ball', hi: 'टेनिस बॉल' },
      { en: 'Leather ball', hi: 'लेदर बॉल' },
    ],
    sale: ['retail', 'wholesale'],
    featured: true,
  },
  {
    slug: 'football',
    name: { en: 'Football', hi: 'फ़ुटबॉल' },
    category: 'sports',
    season: 'sports',
    description: { en: 'Stitched footballs in sizes 3, 4 and 5.', hi: 'साइज़ 3, 4 और 5 में सिली हुई फ़ुटबॉल।' },
    images: ['football'],
    variants: [
      { en: 'Size 3', hi: 'साइज़ 3' },
      { en: 'Size 4', hi: 'साइज़ 4' },
      { en: 'Size 5', hi: 'साइज़ 5' },
    ],
    sale: ['retail', 'wholesale'],
  },
  {
    slug: 'badminton-set',
    name: { en: 'Badminton Set', hi: 'बैडमिंटन सेट' },
    category: 'sports',
    season: 'sports',
    description: { en: 'Rackets and shuttles for evening games.', hi: 'शाम के खेल के लिए रैकेट और शटल।' },
    images: ['badminton'],
    sale: ['retail', 'wholesale'],
  },
]

// Accepts a bundled file name or a full URL / absolute path.
export const img = (file: string) => (/^(https?:|data:|\/)/.test(file) ? file : `/images/${file}.webp`)
export const bySlug = (slug: string) => products.find((p) => p.slug === slug)
export const catById = (id: string) => categories.find((c) => c.id === id)
