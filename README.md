# Ram Lakhan Toy House — website

Catalog + enquiry site for the toy, festival and sports shop at Main Bazar, Near Delhi Gate, Najafgarh, New Delhi.
No cart, no payments: customers send an enquiry, it is saved for the shop, WhatsApp opens prefilled to the shop, and the shop calls back.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Control centre (/admin)

The shop owner manages the whole site from a phone at `/admin`: products and photos, categories, seasons, shop timings, "Shop closed today", the home page banner, and customer enquiries. Customers never log in.

- **Setting it up (helper / developer):** [ADMIN-SETUP.md](ADMIN-SETUP.md) — Supabase project, `supabase/schema.sql`, owner login, Vercel env vars.
- **Using it (shop owner, Hindi):** [OWNER-GUIDE.md](OWNER-GUIDE.md).

**Demo mode:** without `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, the site shows the bundled starter catalogue and `/admin` still works, but changes are saved only in that browser. Demo login: `demo@ramlakhan.shop` / `demo1234`.

## Where to change things

| What | Where |
|---|---|
| Products, photos, categories, seasons | Control centre `/admin` |
| Shop timings, holiday notice, banner, phone/WhatsApp | Control centre `/admin` → Shop settings |
| Enquiries from customers | Control centre `/admin` → Enquiries |
| Bundled starter data (used in demo mode and by "Import starter catalogue") | `src/data/products.ts`, `src/config/seasons.ts` |
| Shop name, address, map links | `src/config/shop.ts` |
| Database tables and security rules | `supabase/schema.sql` |
| All site text, English + Hindi | `src/i18n.tsx` |
| Colours (light + dark) | `src/index.css` (top of file) |
| Logo | `public/brand/logo.png` |

## Enquiries

Enquiries are saved in Supabase and shown in `/admin` → Enquiries. WhatsApp also opens prefilled to the shop, so nothing is lost even if saving fails. The old Google Apps Script route (`apps-script/`, `VITE_ENQUIRY_URL`) is no longer used.

## Deploy

Vercel or Netlify, free tier. Build command `npm run build`, output `dist`. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables, then redeploy. SPA rewrites are already in `vercel.json` and `public/_redirects`. Full steps in [ADMIN-SETUP.md](ADMIN-SETUP.md).
