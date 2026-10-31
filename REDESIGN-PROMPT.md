# Ram Lakhan Toy House — Premium Redesign Prompt

> **How to use:** say "build the redesign from REDESIGN-PROMPT.md".
> **Skills:** `impeccable` (direction, build, finish review) + `emil-design-eng` (motion and interaction polish).
> **Scope:** redesign the existing Vite + React + TS + Tailwind site in this folder. Keep the working enquiry flow, keep all real shop facts, and replace the visual world completely.

---

## 1. What changes and why

1. **New name:** the shop is now **Ram Lakhan Toy House**, not "Ram Lakhan Patang House". Update every mention: site text in both languages, the page `<title>`, meta and Open Graph tags, the business data in `index.html`, `src/config/shop.ts`, the README, PRODUCT.md, and the WhatsApp message templates.
2. **New logo:** the old logo says "Patang House" and is a busy, glossy 3D clip-art badge. Remove it from the site and design a new one (section 4).
3. **New Seasons section:** the shop sells different things through the year (section 5). This becomes a core part of the site.
4. **Premium look:** the current site is overdone with kites. The hanging kite strings, diamond-kite bullets, drifting kites, manjha divider lines and wave background feel gimmicky and fake. **Remove all of them.** The site should feel like a well-run, trusted neighbourhood store with a premium online presence, not a themed kite page.
5. **Real animation:** smooth, purposeful motion throughout (section 7), not decorative wobbling.

## 2. The business (facts; do not change or invent)

- **Name:** Ram Lakhan Toy House
- **What it is:** wholesaler and retailer of toys, seasonal festival items and sports goods
- **Address:** Shop No. 5-A/C, Main Bazar, Near Delhi Gate, Najafgarh, New Delhi-110043
- **Phone / WhatsApp:** +91 95405 28086
- **Hours:** 9 AM – 9 PM daily. Wednesday is a half day, 9 AM – 2 PM.
- **Customers:** local people of Najafgarh and nearby areas, plus local shopkeepers buying wholesale. The shop is not trying to expand beyond its area.
- **Devices:** mostly mid-range Android phones on 4G. Visitors read Hindi and English.
- **Never invent:** a founding year, reviews or ratings, prices, delivery promises, customer counts or awards.
- **Legal:** do not mention glass-coated or Chinese manjha, and do not list or show firecrackers. Both are restricted in Delhi.

## 3. Design direction: premium and calm

**Feeling:** a quality toy and festival store. Clean, confident, warm and trustworthy. Colour comes from the products and the seasons, not from decoration.

**Principles:**
- **Restraint.** Generous whitespace, strong alignment, few elements per screen, and one clear action per section.
- **The products are the colour.** Photography and season imagery carry the vibrancy. The interface itself stays quiet: a near-white or ink background, one brand colour, and fine detail.
- **Season-aware accent.** The site's accent colour shifts with the active season: Holi magenta, Rakhi saffron, Diwali gold, kite-season sky blue, sports green. The accent is automatic, based on today's date, and is the one "living" detail of the brand.
- **No gimmicks.** No illustrated kites, strings, waves, bubbles, birds, stars, emoji, gradient text, glassmorphism, or hard offset shadows.

**Typography:**
- Poppins only (user-pinned: simple and professional, nothing cursive or decorative). Poppins also covers Hindi.
- Use a disciplined scale: large confident display (700) with tight tracking, calm body (400), and small medium labels (500).
- Use plenty of size contrast and few weights per screen.

**Colour tokens (both themes required):**

| Token | Light | Dark |
|---|---|---|
| `--bg` | warm white | deep ink (blue-black) |
| `--surface` | white | slightly lifted ink |
| `--ink` | deep ink navy | soft white |
| `--ink-2` | muted slate | muted cool grey |
| `--brand` | deep royal blue (from the card's navy) | lighter royal blue |
| `--season` | set by the active season | same, tuned for dark |
| `--wa` | WhatsApp green, on WhatsApp actions only | same |

- Keep dark mode: it follows the phone setting, the header toggle overrides it, the choice is saved, and there is no flash on load.
- Check contrast to WCAG AA in both themes.

**Depth and shape:**
- Soft, layered shadows with offset and blur.
- One radius scale: 12, 20 and 28 px, plus pills for buttons and chips.
- Thin 1px hairlines in place of heavy borders.

## 4. New logo

There is no image-generation tool here, so build the logo as a crafted SVG in the repo:

- **Monogram:** "RL" set in Poppins 700, custom-kerned inside a rounded square in `--brand`, white letters, with a subtle detail such as a small spinning-top or star cut-out. It must stay legible at 32px (favicon).
- **Wordmark:** "Ram Lakhan" (700) over "TOY HOUSE" (500, letter-spaced) beside the monogram.
- **Variants:** horizontal for the header, stacked for the footer, and monogram-only as the favicon and app icon.
- **Light and dark:** both versions are drawn from tokens.

Save it as `src/components/Logo.tsx`, plus `public/brand/logo.svg` and `public/brand/favicon.svg` (with a PNG fallback). Keep the old files in `public/brand/` but stop using them. Note in the README that a professionally designed logo can replace this one later.

## 5. Seasons section (new, core feature)

The shop's stock follows the Indian calendar. Show this as its own section on Home and as its own page, `/seasons`.

| Season | When (approx.) | Items to show |
|---|---|---|
| **Holi** | Feb – Mar | gulaal (herbal colours), pichkari, water guns, water balloons, Holi caps |
| **Summer fun** | Apr – Jun | water guns, outdoor toys, carrom, ludo and indoor games for vacations |
| **Rakhi & Independence Day** | Jul – Aug | rakhis (kids' and designer), tiranga flags and badges, kites for 15 August |
| **Kite season** | Jan (Sankranti) and Jul – Aug | kites, dor, charkhi |
| **Diwali** | Oct – Nov | decoration lights, diyas, rangoli colours, toran, hanging decor. **No firecrackers.** |
| **Sports** | **All 12 months** | cricket bats and balls, footballs, badminton, skipping ropes, etc. |

**Behaviour:**
- **Season detection:** the current season is worked out from today's date (IST). Season dates live in one config file, `src/config/seasons.ts`, so the owner can change them.
- **"In season now" leads:** on Home, the current season gets a large feature. It shows a large photo, the season name, 3–4 example items, and an action: **Enquire on WhatsApp** for that season's items.
- **Season rail:** the other seasons follow as a horizontal rail of season cards, each with photo, name and months. Sports is marked **"Available all year"** with a small badge.
- **Season accent:** the active season sets `--season`, which tints accents site-wide (link underlines, active chip, focus ring tint, small highlights).
- **Season page (`/seasons/:id`):** a hero image, an item grid, and an enquiry button.
- **Data:** products get a `season` field. The product list can be filtered by season as well as by category.

**Categories** (replaces the kite-led set): Toys, Holi, Rakhi, Diwali Decor, Kites, Sports, Festival Specials.

## 6. Pages

1. **Home**
   - Header: logo, nav (Home, Shop, Seasons, Wholesale, Visit), हिं/EN toggle, theme toggle.
   - Hero: a premium, confident headline in English and Hindi about Najafgarh's toy and festival shop. Use a large image composition, with an open/closed status chip for today's hours and primary actions **WhatsApp us** and **Call**. No illustrations.
   - In season now: the featured current season (section 5).
   - Season rail: all seasons, Sports marked "all year".
   - Shop by category: a refined grid with image tiles and labels.
   - Wholesale: a short, confident band for shopkeepers that leads to the Wholesale page.
   - Visit: map, address, today's hours (Wednesday shows the half day) and directions.
   - Footer: logo, address, hours, phone, WhatsApp, links.
2. **Shop (`/products`):** search, category and season filter chips, and a product grid.
3. **Product detail:** a swipeable gallery, variants, a "Call for today's rate" note, and a sticky bottom bar on phones with **Call** and **Enquire on WhatsApp**.
4. **Seasons (`/seasons`)** and **season detail (`/seasons/:id`)**.
5. **Wholesale:** the bulk enquiry form. Steps: send your list, we call with rates, collect from the shop. No delivery promise.
6. **Visit Us:** map, the full weekly hours table, directions, call and WhatsApp.
7. **404:** a simple, elegant page.

## 7. Animation (premium, purposeful)

Follow `emil-design-eng`. Motion should feel expensive because it is precise, not because there is a lot of it.

- **Page transitions:** a short crossfade with a slight upward shift between routes, 200–300ms ease-out (View Transitions API, with a fallback).
- **Scroll reveals:** sections fade and rise 12–16px once, when they enter view, staggered 40–60ms. Content stays visible by default; the animation only adds polish. Never hide content behind an animation.
- **Hero:** an image composition with a subtle parallax depth on scroll, and a slow, calm crossfade between 3 season images. No autoplay carousel controls.
- **Season feature:** when the season changes (preview via the rail), the accent colour and image crossfade smoothly with a 2px blur bridge.
- **Season rail:** horizontal scroll-snap with momentum; cards lift slightly on hover (pointer devices only).
- **Image reveals:** a clip-path inset reveal on first view for large images.
- **Buttons:** `scale(0.97)` on press, with ease-out hover colour.
- **Enquiry drawer (Vaul):** drag to dismiss, interruptible. Toasts via Sonner.
- **Numbers and badges:** the open/closed chip pulses softly once on load. Nothing loops forever.
- **Rules:** animate only transform, opacity, filter and clip-path. Use custom ease-out `cubic-bezier(0.23, 1, 0.32, 1)`. UI motion stays under 300ms. Hover effects only under `(hover: hover)`. Fully support `prefers-reduced-motion` (fades only). Motion must stay smooth on a cheap Android phone.
- **Library:** use `motion` (`motion/react`) only where CSS and WAAPI can't do it, such as scroll-linked parallax. Use the full `transform` string for hardware acceleration.

## 8. Imagery

- A premium site needs real photography. Until the owner's photos arrive, use **free-licence photos from Unsplash or Pexels**: gulaal colours, pichkari, rakhis, diyas and lights, kites, cricket and football, wooden toys.
- Download them into `public/images/` (WebP, sized for use, lazy-loaded, explicit width and height).
- Verify every photo actually loads, and record each photo's source URL and licence in `public/images/CREDITS.md`.
- Mark them as sample photos, so the owner knows to replace them.
- Keep one consistent photographic look: warm natural light, a clean background, and similar crop and colour grade. Don't mix clashing styles.
- Do not use AI-looking, cartoon or clip-art images.

## 9. Keep (already working; do not break)

- **Enquiry flow:** the form saves to the Google Apps Script URL (`VITE_ENQUIRY_URL`), WhatsApp opens prefilled to 919540528086, and the success state shows. Add a "season" field to the enquiry and WhatsApp message.
- **Pieces to keep:** `apps-script/Code.gs`, `SETUP.md`, the honeypot, and mobile validation.
- **Language:** the Hindi/English toggle stays (`src/i18n.tsx`), with every new string in both languages.
- **Open/closed logic:** keep `isOpenNow()` with the Wednesday half day.
- **SEO:** LocalBusiness JSON-LD (updated name and hours) and per-page titles. Keywords: "toy shop Najafgarh", "Holi colours Najafgarh", "rakhi shop Najafgarh", "Diwali decoration Najafgarh", "kite shop Najafgarh", "sports shop Najafgarh".
- **Technical:** SPA rewrites (`vercel.json`, `public/_redirects`). React effects must never return a non-function: write effect bodies with braces.

## 10. Inspiration (take the quality, not the layout)

| Site | Take from it |
|---|---|
| apple.com/in | Restraint, image-led sections, calm scroll motion |
| lovevery.com | Warm, premium photography of kids' products |
| hape.com | A toy brand that feels high-end without being childish |
| smallable.com | Clean product grids and seasonal edits |
| aesop.com | Confident whitespace and quiet typography |
| linear.app | Precise motion and dark-mode quality |
| sonner.emilkowal.ski / vaul.emilkowal.ski | Toast and drawer feel |

## 11. Process

1. Update PRODUCT.md (new name, seasons, hours) and replace DESIGN.md after the build. This is a new visual world.
2. Build the logo first, then the tokens, then Home, Seasons, Shop, Product detail, Wholesale, Visit and 404.
3. Do a polish pass with `emil-design-eng` on every interaction, in both themes.
4. Inspect screenshots at 390px and 1440px, in light and dark mode, then run the impeccable finish review and fix what it finds.
5. `npm run build` must finish with zero errors. The dev server (`npm run dev`) must render every page with no console errors.

## 12. Done means

- The name reads "Ram Lakhan Toy House" everywhere, with the new logo in the header, footer and favicon.
- No kite strings, waves or cartoon decoration remain; the site looks like a premium store.
- The current season is detected automatically and leads the home page. Sports shows as available all year.
- Light and dark mode both look intentional.
- Enquiries still save and open WhatsApp.
- Motion is smooth and purposeful, and reduced-motion is respected.
- A local visitor's first reaction: "This shop has a proper, classy website."
