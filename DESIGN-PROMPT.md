# Ram Lakhan Patang House — Full Website Build Prompt

> **How to use:** Paste this whole file as the prompt (or say "build the website from DESIGN-PROMPT.md").
> **Skills to use:** `impeccable` (design direction, build, finish review) + `emil-design-eng` (motion, interaction polish).
> **Output:** one complete, working React website in this folder. Catalog + enquiry. **No cart, no payments, no login.**

---

## 1. The business

- **Name:** Ram Lakhan Patang House (logo monogram "RL")
- **Type:** Wholesaler & retailer — kites (patang), manjha/dor, charkhi (spools), toys, sports items (footballs, cricket balls)
- **Address:** Shop No. 5-A/C, Main Bazar, Near Delhi Gate, Najafgarh, New Delhi-110043
- **Phone / WhatsApp:** +91 95405 28086
- **Customers:** local people of Najafgarh and nearby areas only. Families, kids' parents, kite flyers, and local shopkeepers who buy in bulk. The shop is **not** trying to expand to other cities — the site exists so local people can find the shop, see what it sells, and contact it.
- **Device reality:** most visitors use mid-range Android phones on 4G. They read Hindi and English.

## 2. Brand assets (already in repo)

- `public/brand/logo-banner.jpg` — RL logo: 3D glossy letters (orange-red R, blue L), kites, football, cricket ball, spools, red ribbon "Ram Lakhan", green strip "PATANG HOUSE", on an aqua wave background
- `public/brand/visiting-card.jpg` — "WHOLESALERS & RETAILER", aqua/turquoise flowing waves, bubbles, small birds, sparkles

Crop the logo from the banner for the header and hero. The logo is the loudest element; the UI around it stays calm.

## 3. Design direction

**Mood:** "A kite catching wind on a clear Sankranti sky." Joyful, airy, festive and Indian — but clean, professional and trustworthy. Not a cluttered bazaar look, not a generic toy-store template.

**Fonts — simple and professional, no cursive, no decorative serif:**
- **Poppins** for everything (headings 600–700, body 400–500). Poppins supports Devanagari, so Hindi and English match.
- Load from Google Fonts with `display=swap`, only weights actually used.

**Colors (tokens on `:root`, from the card):**

| Token | Light mode | Dark mode |
|---|---|---|
| `--bg` | very light aqua / white | deep night navy |
| `--surface` | white | slightly lighter navy |
| `--text` | deep navy | near-white |
| `--text-muted` | teal-grey | soft aqua-grey |
| `--primary` | teal | bright aqua |
| `--accent-1..4` | kite orange-red, royal blue, saffron yellow, leaf green (sparingly) | same, slightly brighter |
| `--whatsapp` | WhatsApp green (WhatsApp buttons only) | same |

**Light + dark mode (both required):**
- Default follows the phone's system setting (`prefers-color-scheme`)
- Sun/moon toggle in header overrides it; choice saved in `localStorage` (wrapped in try/catch)
- No flash of wrong theme on load (set theme class before React renders, in `index.html`)
- Dark mode theme: "night kite festival" — navy sky, soft glowing aqua waves, small star sparkles
- Check contrast (WCAG AA) in both modes

**Signature visuals (keep it to these):**
- Hero: soft animated aqua waves (SVG/CSS) with 2–3 kites gently drifting, string line trailing to the logo
- A thin manjha-thread line as a section divider
- Category cards with a slight kite-like tilt on hover/press
- Very few floating bubbles/birds from the card
- Festival banner slot (Sankranti / 15 August / Diwali) switchable from data

**Avoid:** stock e-commerce look, autoplay carousels, popups, chatbots, emoji overload, heavy shadows, glassmorphism, purple gradients.

## 4. Motion & interaction (emil-design-eng)

- Ease-out curves for entering things, e.g. `cubic-bezier(0.23, 1, 0.32, 1)`; linear only for continuous loops (waves, kite drift)
- UI transitions 150–300 ms; ambient hero loops slow and calm
- Buttons `scale(0.97)` on press
- Never animate from `scale(0)`; start around 0.95 + opacity 0
- Popovers scale from their trigger (`transform-origin`)
- On mobile, the enquiry form is a bottom drawer (Vaul-style): drag to close, interruptible
- Toasts for "enquiry sent" (Sonner-style)
- Light stagger (30–50 ms) for grid reveal, first view only
- Hover effects only inside `@media (hover: hover)`
- Full `prefers-reduced-motion` support: stop drift and parallax, keep simple fades
- Animate only `transform` and `opacity`; must stay smooth on a cheap Android phone
- Theme switch: smooth color crossfade, no layout jump

## 5. Pages

Use React Router. Bottom-anchored actions on mobile.

1. **Home**
   - Header: logo, nav (Home, Products, Wholesale, Visit Us), Hindi/English toggle, light/dark toggle
   - Hero: logo, tagline ("Patang, Manjha & Khilone — Najafgarh ki apni dukaan"), CTAs **WhatsApp Us** and **Visit Store**
   - Shop by category: Kites, Manjha & Dor, Charkhi, Toys, Sports, Festival Specials
   - Featured / new stock products
   - Shopkeepers strip: "Shopkeeper? Get wholesale rates" → Wholesale page
   - Why us: wholesale + retail rates, big variety, right at Delhi Gate, Main Bazar
   - Visit block: Google Map embed, shop hours, **Get Directions**
   - Footer: address, phone, WhatsApp, Google reviews link
2. **Products** — category chips, search box, product grid (photo, name, optional "from ₹X", **Enquire** button)
3. **Product detail** — swipeable gallery, name, description, variants (size / ply / colour), Retail/Wholesale tag, sticky bottom bar: **Call** | **Enquire on WhatsApp**
4. **Wholesale** — bulk enquiry form: shop name, area, items + quantities, phone
5. **Visit Us** — map, hours, directions, call button
6. **Global** — floating WhatsApp button; 404 page; Hindi/English via a simple `i18n` object (no heavy library)

## 6. Enquiry flow (core feature)

1. User taps **Enquire** → drawer form: name, mobile (10 digits, starts 6–9), area/address, quantity, note. Hidden honeypot field to block spam bots.
2. On submit:
   - **Save first:** `POST` the enquiry to the Google Apps Script URL (section 7). This saves it in the Google Sheet and alerts the owner. Works even if the customer never presses Send in WhatsApp.
   - **Then open WhatsApp:** `https://wa.me/919540528086?text=<encodeURIComponent(message)>`
     ```
     🪁 New Enquiry – Ram Lakhan Patang House
     Product: <name> (<variant>)
     Qty: <qty>
     Name: <name>
     Mobile: <mobile>
     Area: <area>
     Note: <note>
     ```
   - If the save request fails, still open WhatsApp (never block the customer).
3. Success screen: "Thank you! We'll call you shortly 🙏" with a Call button.
4. Every Call button = `tel:+919540528086`.

No WhatsApp Business API. No payments. No accounts.

## 7. The only "backend": Google Apps Script

No separate server. The one backend job (save enquiry + alert owner) runs as a free Google Apps Script attached to a Google Sheet. The React app only calls its URL.

**Sheet tabs:** `Enquiries` with headers: `Time | Type | Product | Variant | Qty | Name | Mobile | Area | Note`

**Script** (create file `apps-script/Code.gs` in the repo so it can be copy-pasted into the Sheet → Extensions → Apps Script):

```js
const OWNER_EMAIL = 'OWNER_EMAIL_HERE';

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  if (d.website) return json({ ok: true }); // honeypot
  SpreadsheetApp.getActive().getSheetByName('Enquiries').appendRow([
    new Date(), d.type, d.product, d.variant, d.qty, d.name, d.mobile, d.area, d.note,
  ]);
  const text = `New ${d.type} enquiry\nProduct: ${d.product} ${d.variant || ''}\nQty: ${d.qty}\nName: ${d.name}\nMobile: ${d.mobile}\nArea: ${d.area}\nNote: ${d.note || '-'}`;
  MailApp.sendEmail(OWNER_EMAIL, `New enquiry: ${d.product}`, text);
  const p = PropertiesService.getScriptProperties();
  const token = p.getProperty('TELEGRAM_TOKEN'), chat = p.getProperty('TELEGRAM_CHAT_ID');
  if (token && chat) {
    UrlFetchApp.fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'post', payload: { chat_id: chat, text },
    });
  }
  return json({ ok: true });
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
```

**React side:** `fetch(import.meta.env.VITE_ENQUIRY_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) })` — `text/plain` avoids the CORS preflight that Apps Script can't answer.

Also write `apps-script/SETUP.md`: create Sheet → paste script → Deploy as Web app (Execute as: Me, Access: Anyone) → copy URL into `.env` as `VITE_ENQUIRY_URL` → optional Telegram bot token/chat id in Script Properties.

## 8. Tech

- **Vite + React + TypeScript**, single project, no separate backend
- **Tailwind CSS** with the color tokens above (`darkMode: 'class'`)
- **React Router** for pages
- **Motion** (`motion/react`) only where CSS can't do it; **vaul** for the drawer; **sonner** for toasts
- Products in `src/data/products.json` (~20 realistic sample items across all categories), images in `public/products/` (use tasteful placeholders until real photos arrive)
- Shop info (phone, address, hours, map link) in one `src/config/shop.ts`
- Images lazy-loaded, WebP, explicit width/height
- SEO: per-page titles/meta, LocalBusiness JSON-LD (address, phone, geo, hours), Open Graph image from logo; keywords: "kite shop Najafgarh", "patang shop Najafgarh", "manjha Najafgarh", "toy shop Najafgarh"
- Deploy target: Vercel or Netlify free tier (static build)
- Lighthouse mobile ≥ 90 on all scores; WCAG AA; tap targets ≥ 44 px; visible focus states

## 9. Inspiration websites

Take the noted quality — don't copy layouts.

| Site | Take from it |
|---|---|
| hamleys.in | How a toy store organises categories |
| lovevery.com | Warm, calm product photography, generous whitespace |
| tonies.com | Confident playful colour without chaos |
| duolingo.com | Joyful feel, tactile bouncy buttons |
| magicspoon.com | Bold playful brand that still feels premium |
| headspace.com | Soft illustrated scenes, friendly motion |
| sonner.emilkowal.ski / vaul.emilkowal.ski | Toast and drawer interaction quality |
| emilkowal.ski | Motion restraint, detail craft |
| linear.app | Crisp typography, subtle polish, dark mode quality |

> _Add your own references:_
> -
> -

## 10. Process

1. Read this file and the brand images
2. Build mobile-first: Home → Products → Product detail → Wholesale → Visit Us
3. Polish pass with `emil-design-eng` on every interaction, in both light and dark mode
4. `impeccable` finish review against this brief; fix what it finds
5. Run `npm run build` with zero errors; run the dev server and check every page on a phone-width viewport

## 11. Done means

- `npm install && npm run dev` runs the full site
- Light and dark mode both look intentional
- Enquiry saves to the Sheet, alerts the owner, and opens WhatsApp prefilled
- Owner adds a product by editing `products.json` + adding a photo (Sheet-based products can come later)
- A local customer opening it thinks "this kite shop has a website this good?!"
