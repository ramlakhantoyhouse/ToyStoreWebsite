---
name: Ram Lakhan Patang House
description: The neighbourhood kite and toy shop at Delhi Gate, Najafgarh, as a festival-week shop ceiling over an aqua sky.
colors:
  sky-0: "#f3fbfc"
  sky-1: "#e1f5f8"
  sky-2: "#bfe9ef"
  wave-1: "#7fd6e0"
  wave-2: "#3fb8c9"
  wave-3: "#1592a8"
  surface: "#ffffff"
  surface-2: "#f0f9fa"
  ink: "#0b2a4a"
  ink-2: "#33586b"
  ink-3: "#4b6a78"
  line: "#cfe6ea"
  primary: "#0b6f7c"
  primary-ink: "#ffffff"
  manjha: "#c8401a"
  kite-red: "#e0402f"
  kite-blue: "#1f5fd6"
  kite-marigold: "#f2a516"
  kite-green: "#2f9e44"
  kite-pink: "#e2477d"
  wa: "#25d366"
  wa-ink: "#04301a"
typography:
  display:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.95rem, 6.4vw, 3.6rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 4.5vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  focus: "10px"
  field: "14px"
  menu: "16px"
  card: "22px"
  sheet: "28px"
  panel: "32px"
  pill: "999px"
spacing:
  gutter: "16px"
  gutter-wide: "24px"
  stack: "12px"
  section: "56px"
  section-wide: "80px"
components:
  button-wa:
    backgroundColor: "{colors.wa}"
    textColor: "{colors.wa-ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "48px"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "48px"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "48px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "11px 15px"
    height: "48px"
  product-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "12px 14px 14px"
  nav-link-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  nav-link:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  enquiry-sheet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "12px 20px 20px"
  shopkeeper-panel:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-ink}"
    rounded: "{rounded.panel}"
    padding: "40px 24px"
---

# Design System: Ram Lakhan Patang House

## Overview

**Creative North Star: "The Shop Ceiling on Festival Week"**

The site is the inside of a kite shop in the days before Makar Sankranti: kites hung on taut manjha strings, swaying over an aqua sky lifted from the shop's visiting card. Grounds are a vertical sky gradient with three drifting SVG wave layers at the foot; content sits on white cards and pill controls that float in that sky. Deep navy carries the text, a single teal carries action, and the kite-paper colours (red, blue, marigold, green, pink) appear only where something is a kite or marks a kite's category.

One structural line runs through the whole world: the manjha, a thin vermilion string (1.6px) that sags in a quadratic curve from edge to edge. Categories hang from it as diamond kites; featured stock hangs from it on wooden pegs at varied drops; on content lists it becomes a straight top rule with a kite mark pinned to it. Everything hanging sways on a slow pendulum and tugs when a pointer passes, a finger presses, or the page scrolls briskly.

Night mode is the same shop after dark: an indigo-navy sky, the waves recoloured and edged with a faint aqua glow line, small twinkling stars in the open sky, and every kite colour lifted in lightness so it stays saturated against the dark. Density is relaxed and mobile-first; tap targets are 44px or more and the primary contact actions sit at thumb reach.

**Key Characteristics:**
- Aqua sky gradient with three drifting wave layers (from the visiting card) as the hero ground.
- Navy ink, one teal action colour, kite-paper colours reserved for kites and category marks.
- The manjha string (1.6px, sagging curve) as the structural rule and hanging rail.
- Diamond kite silhouette as the recurring mark: category tags, bullets, success state.
- Pendulum sway plus tug as the signature motion; all of it stops under reduced motion.
- Poppins only, 400 to 700; Hindi and English set in the same face.
- Full light and dark themes through the same token names.

## Colors

A cool aqua-and-navy sky world with one teal for action and a box of kite paper held back for the kites themselves.

### Primary
- **Deep Lagoon Teal** (primary): the one action colour. Primary buttons, the second line of the hero headline, inline "see all" links, information icons, focus outlines, the field focus border and the shopkeeper panel ground. Dark theme lifts it to a bright lagoon (#5fd3dc) with dark ink on top.
- **Manjha Vermilion** (manjha): the string. Only for the manjha curve, hanging drop-lines, list top-rules (at 60% opacity), the text caret and string ties. It is a line colour, never a fill or text colour.

### Secondary
- **WhatsApp Green** (wa) with **Bottle-Green Ink** (wa-ink): the WhatsApp contact button only, so the most important action reads as WhatsApp at a glance. Same values in both themes.

### Tertiary
- **Kite Paper** (kite-red, kite-blue, kite-marigold, kite-green, kite-pink): fills for kite and product art, category kite marks and the tint behind product tiles. They also carry three state signals: kite-red for field error borders and error text, kite-green for the open-now dot and the sent confirmation kite, kite-marigold for text selection. Dark theme lifts each to a brighter version.

### Neutral
- **Morning Sky** (sky-0): page ground and the scrolled header's ground; top stop of the hero gradient.
- **Clear Sky** (sky-1): mid gradient stop and the ground of quieter bands (Visit section, wave section edges).
- **Horizon Aqua** (sky-2): bottom gradient stop and scrollbar thumb.
- **Wave Shallows / Wave Mid / Wave Deep** (wave-1, wave-2, wave-3): the three wave layers, back to front, at 55%, 60% and 75% opacity.
- **Paper White** (surface): cards, pills, the enquiry sheet, ghost buttons, inputs.
- **Pale Lagoon** (surface-2): product tile grounds, the product line in the enquiry sheet, hover fills for icon buttons, the active row in the mobile menu.
- **Night Navy Ink** (ink): headings and body text.
- **Slate Teal** (ink-2): secondary text, inactive nav links, category names.
- **Mist Slate** (ink-3): placeholders and the closed-now dot.
- **Aqua Rule** (line): card rings, ghost-button inset borders, field borders, the drawer handle.

### Named Rules
**The One Teal Rule.** Action is teal and only teal. A second action colour exists only for WhatsApp, and it is WhatsApp's own green.

**The Kite Paper Rule.** Kite-paper colours fill kites, product art and category marks, and signal error, open and selection. They are never a section ground, a button, or running text.

**The Same Names Rule.** Every colour is a CSS custom property redefined under `.dark`. Components reference the token, never a literal, so night mode costs nothing.

## Typography

**Display Font:** Poppins (with ui-sans-serif, system-ui)
**Body Font:** Poppins (same family)

**Character:** One geometric, friendly face across every role, chosen by the owner for a professional, non-decorative voice. Weight does the hierarchy work: 700 for headlines, 600 for titles and buttons, 500 for labels, 400 for reading.

### Hierarchy
- **Display** (700, clamp(1.95rem, 6.4vw, 3.6rem), 1.15): the hero headline only, navy first half, teal second half, balanced wrapping.
- **Headline** (700, clamp(1.5rem, 4.5vw, 2.25rem), 1.15): section headings. The shopkeeper panel runs it slightly larger (up to 2.6rem).
- **Title** (600, 1.125rem to 1.25rem, 1.15): list item headings and the enquiry sheet title. Card titles sit at 15px / 600, snug leading.
- **Body** (400, 16px, 1.6): running text, with lead paragraphs at 15.5px on phones and 1.125rem from 640px. Lead paragraphs cap at 34 to 36rem. Pretty wrapping on paragraphs.
- **Label** (500 or 600, 13px): category names, field errors, hint lines, the status chip. Field labels are 14px / 500.

### Named Rules
**The One Face Rule.** Poppins only, 400 to 700. No second family, no script or decorative face, no system display face.

**The Bilingual Rule.** Hindi and English share the same face, sizes and weights. The language toggle swaps the copy, never the type scale.

## Layout

Single centred column with a 72rem (max-w-6xl) container, side gutters of 16px on phones and 24px from 640px. Sections breathe at 56px top padding on phones and 80px from 640px. Two-column splits appear from 768px (hero text 1.15fr beside the logo 1fr; visit details 1fr beside the map 1.2fr; shopkeeper copy 1.3fr beside the kite bundle). Groups of actions use a 12px gap.

The manjha always runs edge to edge of the viewport, whatever column its kites sit in. On phones the category string splits into two strings of three kites; featured stock scrolls sideways under its string, and only from 1280px does that string bleed to the full viewport. The hero's contact pair goes full width and side by side at the bottom of the phone viewport, and moves under the headline from 768px.

The header is sticky, 64px tall, transparent over the sky and turning sky-0 with a 1px line once the page scrolls past 8px.

## Elevation & Depth

Depth is soft and atmospheric: white objects float in the sky on one shared, navy-tinted ambient shadow, layered with a 1px aqua ring. Kites and product art carry their own drop shadow, as hung paper would. Dark theme swaps the shadow to a deeper black version. Nothing uses hard offsets.

### Shadow Vocabulary
- **Sky float** (`box-shadow: 0 1px 2px rgb(11 42 74 / 0.06), 0 8px 24px -8px rgb(11 42 74 / 0.18)`): cards, hanging tags, kite labels, the active nav pill, the status chip, the mobile menu.
- **WhatsApp glow** (`box-shadow: 0 6px 18px -6px rgb(37 211 102 / 0.55)`): the WhatsApp button only.
- **Kite drop** (`filter: drop-shadow(0 6px 8px rgb(11 42 74 / 0.18))`): hanging kite silhouettes.
- **Field focus halo** (`box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 18%, transparent)`): inputs on focus.

### Named Rules
**The One Float Rule.** Every floating surface uses the same sky-float shadow token plus the aqua ring. No per-component shadow recipes.

## Shapes

Soft and rounded throughout, against the one sharp silhouette of the world: the diamond kite. Controls are full pills; inputs have gently rounded 14px corners; cards and tags are generously rounded (20 to 22px); the enquiry sheet rounds only its top corners (28px); the shopkeeper panel is the largest curve (32px). The diamond kite (a four-point rhombus with a cross spar and a slight bowed cross-stick) is the recurring mark: category tags, list bullets pinned to rules, and the sent-confirmation badge. Lines are 1.5 to 1.6px, matching the manjha.

## Components

### Buttons
Round, confident, thumb-sized.
- **Shape:** full pill (999px), minimum 48px tall, 20px side padding, 600 weight at about 15.7px, icon gap about 9px.
- **WhatsApp:** green with bottle-green ink and its own glow. The primary contact action on every page.
- **Primary:** teal with white ink (dark ink in night mode). Directions, call-back, page-level actions.
- **Ghost:** white with navy ink and a 1.5px inset aqua ring. Call and secondary actions; paired beside WhatsApp or primary.
- **Hover / Focus:** hover only on fine pointers: primary brightens 8%, ghost ring turns teal, WhatsApp lightens. Every pressable scales to 0.97 on press (160ms ease-out). Focus is a 2.5px teal outline at 3px offset.

### Chips
- **Status chip:** a white pill with the sky-float shadow, 13px / 600, carrying a live open or closed dot and the real hours. It exists only to report live shop state.
- **Nav pills:** see Navigation.

### Cards / Containers
- **Corner Style:** 22px (product card), 20px (hanging tag).
- **Background:** paper white, with a square art tile on pale lagoon tinted 12% toward the category colour (0% tint in night mode).
- **Shadow Strategy:** sky float plus 1px aqua ring.
- **Internal Padding:** about 12px top, 14px sides and bottom; 16px sides from 640px.
- **Hover:** the product art lifts 4px and rotates -3deg on fine pointers.

### Inputs / Fields
- **Style:** paper white, 1.5px aqua border, 14px radius, 48px minimum height, label above at 14px / 500, vermilion caret.
- **Focus:** border turns teal plus the 4px teal halo; no outline.
- **Error:** border turns kite red, with a 13px / 500 kite-red message below, announced as an alert.

### Navigation
- **Desktop (768px and up):** pill links at 15px / 500 in slate teal; the active link becomes a white pill with the sky-float shadow in navy ink.
- **Mobile:** a 44px icon button opens a 224px white menu (16px radius, sky-float shadow, aqua ring) with 48px rows; the active row fills pale lagoon. Closes on Escape, outside press, or route change.
- **Header controls:** language toggle (हिं / EN) and theme toggle as transparent 44px round buttons with a pale lagoon hover.

### Manjha String (signature)
A vermilion 1.6px quadratic curve spanning the viewport, sagging 26px for categories and 34px for featured stock. It draws itself in once (1100ms ease-out). Items hang from the exact curve height at their x position.

### Hanging Kite and Hanging Tag (signature)
Kites (category links) and tags (featured stock on a wooden peg) hang from the manjha on a 1px vermilion drop-line at 70% opacity, with drops varied by position. Each sways on a slow pendulum (4 to 7s, 1.4 to 4deg, alternating) with staggered phase. A pointer passing, a press, or a brisk scroll tugs it in a damped swing (1100ms). Press dips the body 4px and scales it to 0.97; navigation is never delayed for the animation.

### Enquiry Sheet
A bottom drawer (Vaul) that drags up like reeling in a kite: paper white, 28px top corners, max 32rem wide and 92dvh tall, 48px by 6px aqua handle, dimmed navy overlay at 45%. The product sits in a pale lagoon block above the form; the submit is the full-width WhatsApp button.

## Do's and Don'ts

### Do:
- **Do** set every colour through its token so `.dark` can redefine it.
- **Do** hang kites and featured stock from a manjha curve that runs edge to edge, and pin kite marks to straight 1.5px manjha rules on lists.
- **Do** keep the WhatsApp and Call pair together, full width at the bottom of the phone viewport.
- **Do** give every pressable a 0.97 press scale and a 2.5px teal focus outline at 3px offset.
- **Do** stop wave drift, sway, drift and twinkle under reduced motion, and draw the string in its final state.
- **Do** start entrance animations at 0.4 opacity so a stalled animation never hides content.

### Don't:
- **Don't** use kite-paper colours for section grounds, buttons, or running text.
- **Don't** add a second typeface or any weight outside 400 to 700.
- **Don't** use hard offset shadows or per-component shadow recipes; use the sky-float token.
- **Don't** delay navigation to finish a kite's tug animation.
