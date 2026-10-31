---
version: 1
slug: "src-pages-home-tsx"
primary_target: "src/pages/Home.tsx"
related_targets: ["src/pages/Products.tsx","src/pages/ProductDetail.tsx","src/pages/Seasons.tsx","src/pages/Wholesale.tsx","src/pages/Visit.tsx"]
---

# Surface: Ram Lakhan Toy House website (all routes)

Scope: whole site — Home, Shop, Product, Seasons, Season detail, Wholesale, Visit, Credits, 404. Mode: Persuade (home), Operate-leaning for shop + enquiry.

Audience: Najafgarh locals on mid-range Android over 4G, Hindi/English; local shopkeepers for wholesale. Action: Enquire (drawer → Sheet save → WhatsApp prefilled) or Call. Proof: real address, hours (9 AM – 9 PM daily, Wed 9 AM – 2 PM), phone, the seasonal calendar of stock. No invented years, reviews, prices, delivery. No firecrackers, no glass/Chinese manjha. Sample photos from Wikimedia Commons with credits.

Constraints (user-pinned): name Ram Lakhan Toy House; new RL logo; Poppins only; light + dark; premium, no kite gimmicks; purposeful animation; seasons section with Sports all year. Code-led (no image generation). Replaces the previous "quiet premium" build, which the user rejected as plain/AI-slop.

## Direction contract

THESIS: A premium neighbourhood toy house — the page is a clean, well-lit toy shelf where toys sit in chunky rounded colour blocks, like building blocks and toy boxes. Refuses both the plain white template store and the festival-themed page (user rejected Gulaal: "it is a toy house").

OWN-WORLD: Clean white ground (#fbfbfd; dark #0f1024) and deep navy ink (#14163a). Toy primaries as solid rounded blocks only: tomato red, sunny yellow, block blue, grass green, plus pink/orange accents; navy ink on blocks (white on blue). Big radii (28–40px), chunky pills, no hairline-heavy editorial look. Poppins 700 display with tight tracking, 400/500 text. True-colour photos inside blocks. Seasons keep their own colours but live in one section, not the whole page.

STORY: "Najafgarh's toy house: lots of toys, games and sports — plus festival stock through the year. One tap to ask or call."

FIRST VIEWPORT: Left: open-now chip, huge headline "The toy house of Najafgarh.", subline, WhatsApp (ink) + Call (outline). Right: a playful bento of five rounded colour blocks of different sizes, each holding a toy photo, that drop in and settle with a spring. Mobile: headline, actions, then the block bento in a 2-col grid.

FORM: Toy House (user-pinned after rejecting the rolled Gulaal Market direction). seed:f86613e91cb770de (roll kept for record; user pin overrides)

Signature interaction: toy-spring motion — blocks tumble in on load with a spring overshoot (CSS linear() spring easing), lean toward the pointer in 3D and spring back (rAF lerp), and press with a squash-and-release.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
