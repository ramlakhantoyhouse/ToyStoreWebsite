import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'hi'
export type Bi = { en: string; hi: string }

const dict = {
  nav_home: { en: 'Home', hi: 'होम' },
  nav_shop: { en: 'Shop', hi: 'सामान' },
  nav_seasons: { en: 'Seasons', hi: 'मौसम' },
  nav_wholesale: { en: 'Wholesale', hi: 'थोक' },
  nav_visit: { en: 'Visit', hi: 'दुकान' },
  hero_title: { en: 'Toys, festivals and sports. All year, in Najafgarh.', hi: 'खिलौने, त्योहार और खेल। साल भर, नजफगढ़ में।' },
  hero_sub: {
    en: 'Gulaal for Holi, rakhis in August, lights for Diwali and bats and balls every day. Wholesale and retail at Main Bazar, near Delhi Gate.',
    hi: 'होली का गुलाल, अगस्त में राखी, दिवाली की लाइटें और हर दिन बैट-बॉल। मेन बाज़ार, दिल्ली गेट के पास — थोक और फुटकर।',
  },
  hero_where: { en: 'Wholesale and retail at Main Bazar, near Delhi Gate, Najafgarh.', hi: 'मेन बाज़ार, दिल्ली गेट के पास, नजफगढ़ — थोक और फुटकर।' },
  is_coming: { en: 'is coming.', hi: 'आने वाली है।' },
  touch_colour: { en: 'Point at the photo to see its colours', hi: 'असली रंग देखने के लिए फ़ोटो पर जाएं' },
  every_month: { en: 'Every month', hi: 'हर महीने' },
  footer_big: {
    en: 'Main Bazar, near Delhi Gate. Come by the shop, or just send us a WhatsApp.',
    hi: 'मेन बाज़ार, दिल्ली गेट के पास। दुकान पर आइए, या बस WhatsApp कर दीजिए।',
  },
  pd_sold: { en: 'Sold', hi: 'बिक्री' },
  pd_photos: { en: 'Photos', hi: 'फ़ोटो' },
  pd_photo_n: { en: 'Photo', hi: 'फ़ोटो' },
  toy_title: { en: 'The toy house of Najafgarh.', hi: 'नजफगढ़ का खिलौना घर।' },
  toy_sub: {
    en: 'Toys, games and sports for every age, plus festival stock through the year. Wholesale and retail at Main Bazar, near Delhi Gate.',
    hi: 'हर उम्र के खिलौने, गेम और खेल का सामान, साथ में साल भर त्योहारों का सामान। मेन बाज़ार, दिल्ली गेट के पास — थोक और फुटकर।',
  },
  marquee: {
    en: 'Toys · Board games · Cricket · Football · Holi · Rakhi · Diwali · Kites · Wholesale & retail',
    hi: 'खिलौने · बोर्ड गेम · क्रिकेट · फ़ुटबॉल · होली · राखी · दिवाली · पतंग · थोक व फुटकर',
  },
  popular: { en: 'Popular on the shelf', hi: 'सबसे पसंदीदा' },
  popular_sub: { en: 'A few toys and games from the shelf. Tap one to enquire.', hi: 'शेल्फ़ से कुछ खिलौने और गेम। पूछने के लिए टैप करें।' },
  wa_us: { en: 'WhatsApp us', hi: 'WhatsApp करें' },
  call: { en: 'Call', hi: 'कॉल करें' },
  call_shop: { en: 'Call the shop', hi: 'दुकान पर कॉल करें' },
  open_now: { en: 'Open now', hi: 'अभी खुली है' },
  closed_now: { en: 'Closed now', hi: 'अभी बंद है' },
  today: { en: 'Today', hi: 'आज' },
  now_in: { en: 'In season now', hi: 'अभी का मौसम' },
  coming_up: { en: 'Coming up', hi: 'आने वाला' },
  season_at: { en: 'at Ram Lakhan', hi: 'राम लखन पर' },
  season_enquire: { en: 'Ask about this season’s stock', hi: 'इस मौसम का सामान पूछें' },
  season_view: { en: 'See the range', hi: 'पूरा सामान देखें' },
  through_year: { en: 'Something for every season', hi: 'हर मौसम के लिए कुछ खास' },
  through_year_sub: {
    en: 'Our counter changes with the calendar. Tap a season to preview it.',
    hi: 'हमारा काउंटर कैलेंडर के साथ बदलता है। देखने के लिए किसी मौसम पर टैप करें।',
  },
  all_year: { en: 'Available all year', hi: 'साल भर उपलब्ध' },
  shop_by: { en: 'Shop by category', hi: 'कैटेगरी से देखें' },
  see_all: { en: 'See all products', hi: 'सारा सामान देखें' },
  wholesale_band_t: { en: 'Run a shop? Buy at wholesale rates.', hi: 'दुकानदार हैं? थोक रेट पर लें।' },
  wholesale_band_d: {
    en: 'Send us your list. We call back with today’s rates, and you collect from the shop.',
    hi: 'अपनी लिस्ट भेजें। हम आज के रेट के साथ कॉल करेंगे, और आप दुकान से ले जाएं।',
  },
  wholesale_band_cta: { en: 'Send a bulk enquiry', hi: 'थोक enquiry भेजें' },
  visit_title: { en: 'Come by the shop', hi: 'दुकान पर आइए' },
  visit_sub: { en: 'Main Bazar gets busy before festivals. Calling ahead helps.', hi: 'त्योहारों से पहले मेन बाज़ार में भीड़ रहती है। पहले कॉल कर लें तो अच्छा।' },
  hours: { en: 'Hours', hi: 'समय' },
  address: { en: 'Address', hi: 'पता' },
  directions: { en: 'Get directions', hi: 'रास्ता देखें' },
  shop_title: { en: 'Shop', hi: 'सामान' },
  shop_sub: { en: 'Tap any item to enquire. No online payment. We call you and sort it out.', hi: 'किसी भी सामान पर टैप करके पूछें। ऑनलाइन पेमेंट नहीं — हम कॉल करके बात करेंगे।' },
  all: { en: 'All', hi: 'सब' },
  category: { en: 'Category', hi: 'कैटेगरी' },
  season: { en: 'Season', hi: 'मौसम' },
  search: { en: 'Search gulaal, rakhi, lights, bats…', hi: 'गुलाल, राखी, लाइट, बैट खोजें…' },
  no_results: { en: 'Nothing matches that. Ask us directly. We probably have it.', hi: 'ऐसा कुछ नहीं मिला। सीधे पूछ लीजिए — शायद हमारे पास हो।' },
  items: { en: 'items', hi: 'सामान' },
  choose: { en: 'Choose', hi: 'चुनें' },
  back: { en: 'Back to shop', hi: 'वापस सामान पर' },
  sample_photo: { en: 'Sample photo. The shop’s own photos are coming soon.', hi: 'नमूना फ़ोटो। दुकान की असली फ़ोटो जल्द आएंगी।' },
  price_note: { en: 'Rates change with stock and season. Call for today’s rate.', hi: 'रेट स्टॉक और मौसम के हिसाब से बदलते हैं। आज का रेट कॉल करके पूछें।' },
  enquire_wa: { en: 'Enquire on WhatsApp', hi: 'WhatsApp पर पूछें' },
  retail: { en: 'Retail', hi: 'फुटकर' },
  wholesale: { en: 'Wholesale', hi: 'थोक' },
  more_in: { en: 'More from', hi: 'और देखें:' },
  form_title: { en: 'Send an enquiry', hi: 'Enquiry भेजें' },
  form_sub: { en: 'We save it, then WhatsApp opens so you can send it too.', hi: 'हम इसे सेव करते हैं, फिर WhatsApp खुलेगा ताकि आप भी भेज सकें।' },
  f_name: { en: 'Your name', hi: 'आपका नाम' },
  f_mobile: { en: 'Mobile number', hi: 'मोबाइल नंबर' },
  f_area: { en: 'Area / address', hi: 'एरिया / पता' },
  f_area_ph: { en: 'e.g. Dichaon Road, Najafgarh', hi: 'जैसे ढिचाऊं रोड, नजफगढ़' },
  f_qty: { en: 'Quantity', hi: 'कितना चाहिए' },
  f_note: { en: 'Anything else? (optional)', hi: 'कुछ और? (ज़रूरी नहीं)' },
  f_shop: { en: 'Shop name', hi: 'दुकान का नाम' },
  f_items: { en: 'Items and quantities', hi: 'सामान और मात्रा' },
  f_items_ph: { en: 'e.g. 200 packets gulaal, 50 pichkari', hi: 'जैसे 200 पैकेट गुलाल, 50 पिचकारी' },
  err_name: { en: 'Please enter your name.', hi: 'कृपया अपना नाम लिखें।' },
  err_mobile: { en: 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.', hi: '6, 7, 8 या 9 से शुरू होने वाला 10 अंकों का नंबर लिखें।' },
  err_area: { en: 'Tell us your area so we know where you are.', hi: 'अपना एरिया बताइए ताकि हमें पता चले आप कहां हैं।' },
  err_items: { en: 'List at least one item.', hi: 'कम से कम एक सामान लिखें।' },
  submit: { en: 'Send on WhatsApp', hi: 'WhatsApp पर भेजें' },
  sent_title: { en: 'Thank you. We’ll call you shortly.', hi: 'धन्यवाद! हम जल्द कॉल करेंगे।' },
  sent_sub: { en: 'Your enquiry is saved. If WhatsApp didn’t open, call us directly.', hi: 'आपकी enquiry सेव हो गई। WhatsApp नहीं खुला तो सीधे कॉल करें।' },
  toast_saved: { en: 'Enquiry saved. Opening WhatsApp.', hi: 'Enquiry सेव हुई — WhatsApp खुल रहा है' },
  close: { en: 'Close', hi: 'बंद करें' },
  wholesale_title: { en: 'Wholesale for shopkeepers', hi: 'दुकानदारों के लिए थोक' },
  wholesale_sub: { en: 'Tell us what you need and how much. We call back with today’s rates.', hi: 'बताइए क्या और कितना चाहिए। हम आज के रेट के साथ कॉल करेंगे।' },
  wholesale_how_1: { en: 'Send your list', hi: 'अपनी लिस्ट भेजें' },
  wholesale_how_2: { en: 'We call with rates', hi: 'हम रेट के साथ कॉल करेंगे' },
  wholesale_how_3: { en: 'Collect from the shop', hi: 'दुकान से ले जाएं' },
  seasons_title: { en: 'Seasons', hi: 'मौसम' },
  seasons_sub: {
    en: 'What we stock changes through the year. Sports goods are here every month.',
    hi: 'हमारा सामान साल भर बदलता रहता है। खेल का सामान हर महीने मिलता है।',
  },
  in_this_season: { en: 'In this season', hi: 'इस मौसम में' },
  footer_line: { en: 'Toys, festival items and sports goods. Wholesale and retail.', hi: 'खिलौने, त्योहार का सामान और खेल का सामान। थोक और फुटकर।' },
  reviews: { en: 'Find us on Google', hi: 'Google पर देखें' },
  credits: { en: 'Photo credits', hi: 'फ़ोटो क्रेडिट' },
  credits_sub: {
    en: 'Sample photos from Wikimedia Commons, used under their licences until the shop’s own photos replace them.',
    hi: 'Wikimedia Commons की नमूना फ़ोटो, उनके लाइसेंस के तहत, जब तक दुकान की असली फ़ोटो नहीं आ जातीं।',
  },
  nf_title: { en: 'We couldn’t find that page', hi: 'ये पेज नहीं मिला' },
  nf_sub: { en: 'It may have moved. Everything we sell is in the shop.', hi: 'शायद ये हट गया है। हमारा सारा सामान शॉप में है।' },
  go_home: { en: 'Back home', hi: 'होम पर जाएं' },
  theme_light: { en: 'Switch to light mode', hi: 'लाइट मोड' },
  theme_dark: { en: 'Switch to dark mode', hi: 'डार्क मोड' },
  menu: { en: 'Menu', hi: 'मेनू' },
} satisfies Record<string, Bi>

export type Key = keyof typeof dict

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string; pick: (b: Bi) => string }
const LangCtx = createContext<Ctx | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (document.documentElement.lang === 'hi' ? 'hi' : 'en'))
  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem('rl-lang', l)
    } catch {
      /* storage blocked: language still switches for this visit */
    }
  }, [])
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  const t = useCallback((k: Key) => dict[k][lang], [lang])
  const pick = useCallback((b: Bi) => b[lang], [lang])
  return <LangCtx.Provider value={{ lang, setLang, t, pick }}>{children}</LangCtx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const c = useContext(LangCtx)
  if (!c) throw new Error('useLang outside LangProvider')
  return c
}
