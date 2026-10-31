# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React + TypeScript + Tailwind CSS, single project (user asked for one React app, no separate backend). The only server-side job (save enquiry + alert owner) runs as a Google Apps Script attached to a Google Sheet. Static deploy on Vercel/Netlify free tier.

## Users

- Local people of Najafgarh (New Delhi) and nearby areas: families, kids' parents, kite flyers. They want to know what the shop sells, where it is, and how to reach it.
- Local shopkeepers who buy in bulk (wholesale).
- Mostly on mid-range Android phones over 4G; read Hindi and English.

## Product Purpose

An online shop window for Ram Lakhan Toy House (renamed from Ram Lakhan Patang House). Visitors browse products, find the store, and send an enquiry that reaches the owner by WhatsApp and an automatic alert. The owner then calls the customer and closes the sale offline. Success = local people find the shop and enquiries arrive with name, phone, area and product.

## Positioning

The neighbourhood toy, festival and sports shop at Delhi Gate, Main Bazar, Najafgarh — wholesale and retail from the same counter, with stock that follows the Indian calendar: Holi (gulaal, pichkari), summer games, Rakhi and 15 August, kite season, Diwali decoration, and sports all year. Not an online store and not expanding beyond the local area.

## Operating Context

- Customer path: browse → product → enquiry form → enquiry saved to Google Sheet + owner alert → WhatsApp opens prefilled to +91 95405 28086 → owner calls back.
- Seasons: Holi (Feb–Mar), summer (Apr–Jun), Rakhi & 15 August (Jul–Aug), kites (Jan; Jul–Aug), Diwali (Oct–Nov), sports all 12 months.
- Legal: no firecrackers and no glass-coated/Chinese manjha anywhere on the site (restricted in Delhi).
- Owner is non-technical; products are maintained in `src/data/products.ts`; photos in `public/images/` (free-licence samples until the owner's own photos arrive; credits in `src/data/photo-credits.json`).

## Capabilities and Constraints

- No cart, no online payments, no accounts, no WhatsApp Business API.
- Call buttons dial `tel:+919540528086`.
- Shop hours: 9 AM – 9 PM daily; Wednesday half day 9 AM – 2 PM.
- Owner alert email: not yet provided (placeholder `OWNER_EMAIL_HERE` in Apps Script).
- Open: Sheet-driven product catalog (later phase); real product photos (not yet supplied).

## Brand Commitments

- Name: Ram Lakhan Toy House. New code-drawn RL monogram + wordmark (`src/components/Logo.tsx`); the old "Patang House" badge (`public/brand/logo-banner.jpg`) is retired.
- Visiting card (`public/brand/visiting-card.jpg`): "Wholesalers & Retailer", aqua/turquoise wave world.
- User-pinned: Poppins font (professional, no cursive/decorative), both light and dark mode, premium and calm (no kite gimmicks), purposeful animation.
- Address: Shop No. 5-A/C, Main Bazar, Near Delhi Gate, Najafgarh, New Delhi-110043.

## Evidence on Hand

- Logo banner and visiting card images (paths above).
- No real product photos, prices, reviews, testimonials, or founding year. Do not invent a "since" year, ratings, or customer quotes.

## Product Principles

1. Every page leads to a phone call or a WhatsApp message within one tap.
2. Never lose an enquiry: save first, then hand off to WhatsApp.
3. Local first: speak to Najafgarh, not the whole internet.
4. Fast and readable on a cheap phone beats visual excess.

## Accessibility & Inclusion

Bilingual (Hindi/English). WCAG AA contrast in both themes, 44 px tap targets, reduced-motion support.
