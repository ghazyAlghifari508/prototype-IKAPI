---
name: IKAPI Store — Playful Editorial Bookstore
colors:
  background: '#FFFFFF'
  surface: '#FFFFFF'
  surface-container-lowest: '#FFFFFF'
  surface-container-low: '#FFF1E3'
  surface-container: '#F8F7FF'
  surface-container-high: '#F0EFFF'
  surface-container-highest: '#E7E5FF'
  on-background: '#191923'
  on-surface: '#191923'
  on-surface-variant: '#555665'
  primary: '#5956E9'
  on-primary: '#FFFFFF'
  primary-container: '#E5E4FF'
  on-primary-container: '#272373'
  secondary: '#F7B8CB'
  on-secondary: '#231B2D'
  secondary-container: '#FFF0E3'
  on-secondary-container: '#322A29'
  tertiary: '#FFD34F'
  on-tertiary: '#292317'
  tertiary-container: '#E0F6FC'
  on-tertiary-container: '#173843'
  outline: '#CFD0DD'
  outline-variant: '#E7E7EF'
  inverse-surface: '#24233D'
  inverse-on-surface: '#FFFFFF'
  error: '#B42318'
  on-error: '#FFFFFF'
typography:
  display-lg:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 1.08
    letterSpacing: '-0.04em'
  display-md:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: 44px
    fontWeight: '800'
    lineHeight: 1.12
    letterSpacing: '-0.035em'
  headline-lg:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 1.18
    letterSpacing: '-0.03em'
  headline-md:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 1.22
    letterSpacing: '-0.025em'
  title-md:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 1.35
    letterSpacing: '-0.01em'
  body-base:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 1.6
    letterSpacing: '0'
  body-small:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 1.5
    letterSpacing: '0'
  label:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 1.35
    letterSpacing: '0'
rounded:
  sm: 6px
  DEFAULT: 10px
  md: 12px
  lg: 18px
  xl: 28px
  hero: 48px
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  '2xl': 48px
  '3xl': 72px
  gutter-mobile: 20px
  gutter-desktop: 40px
---

# Design System: IKAPI Store — Playful Editorial Bookstore

> **Status:** Image-derived visual direction for Google Stitch; adapted to IKAPI Store's existing user-facing product requirements. Not a source-code/CSS extraction and not the original Redex design system.
>
> **Reference:** User-provided screenshot of the Redex Library concept (composite desktop presentation). **Observed** characteristics are distinguished below from **recommended** implementation tokens. Exact colors, font names, pixel spacing, animation, and mobile behavior are not recoverable from this raster image alone.
>
> **Scope:** Visual system and presentation rules for buyer-facing IKAPI Store screens. This document does not authorize adding new business features, content, sections, or operational flows; the IKAPI PRD and confirmed user decisions take precedence.

## 1. Visual Theme & Atmosphere

### Core visual idea

A **playful, editorial digital bookstore**: vivid periwinkle-violet, beautifully lit reading illustrations, friendly geometric typography, ample open white space, warm cream editorial sections, and deliberately varied compositions. The visual energy comes from **large, meaningful imagery and color-blocking**, not from badges, floating particles, random icons, or generic dashboard cards.

The reference's main composition is a dominant violet hero with a centered, large white heading and a **substantial open-book illustration anchored to the hero's lower edge**. Below it, the layout changes rhythm: warm cream background; large, offset editorial typography; asymmetrically placed information and book visuals. To the right, the reference shows a secondary sequence of clean white sections with **small pastel product presentations**, editorial image/text pairings, and another violet feature panel. The overall effect is youthful, tactile, colorful, and approachable without becoming a neon SaaS template.

**Transfer the design language, not the Redex content.** Redex logos, English headlines, testimonial claims, book names, “Download Now,” and CTA wording in the inspiration image are not IKAPI assets or requirements. IKAPI e-books are read through a protected web reader, not downloaded by the purchaser.

### Visual priorities, in order

1. Book covers and book-related illustrations, correctly sourced and scaled.
2. Clear bookstore information hierarchy: discover → inspect → purchase → read.
3. Strong expressive typographic hierarchy with concise natural Indonesian copy.
4. Section-to-section visual rhythm with open layouts and occasional bold color fields.
5. Consistent functional controls, including accessibility and responsive states.

### Negative direction

The result must **not** resemble a corporate banking dashboard, payment-provider marketing page, conventional SaaS feature grid, or AI-generated collection of repeated rounded cards. Do not fill unused space with decorative pills, glowing dots, gradients, icon confetti, or marketing paragraphs.

## 2. Evidence from the Screenshot vs. Suggested Tokens

| Design characteristic | Visible in screenshot | Design token / implementation decision |
|---|---|---|
| Hero color | Saturated blue-violet / periwinkle | `primary: #5956E9` (approximate sampled visual match) |
| Hero text | Large bold white sans serif | `on-primary: #FFFFFF`; recommended Plus Jakarta Sans ExtraBold |
| Canvas | White, spacious, editorial | `background: #FFFFFF` |
| Lower editorial band | Warm cream-peach | `surface-container-low: #FFF1E3` |
| Highlight product treatment | Muted peach, lavender, and pale cyan surfaces | `secondary`, `primary-container`, `tertiary-container` |
| Accent object | Warm yellow lightbulb, book covers | `tertiary: #FFD34F`, mostly reserved for illustration details and selective actions |
| Display headline | Centered and very large in hero | 44–56px recommended desktop scale, not an exact measured size |
| Corner shape | Large, soft lower hero corners | `hero: 48px` as design target, responsive reduction on mobile |
| Product presentations | Individual pastel display panels | Flat/pastel media surfaces rather than identical floating SaaS cards |
| Depth | Low-medium depth from illustrated book objects and soft shadows | Shadows on imagery or raised controls, not every container |
| Layout | Wide hero; asymmetric 2-column editorial stories; smaller 3-column product row | 12-column desktop grid and intentional mobile restacking, recommended |

**Not source facts:** The precise typeface, token values, 4px spacing scale, breakpoints, focus states, hover behavior, and animations in this document are inferred implementation choices. They must not be described as directly measured from the screenshot.

## 3. Color Palette & Roles

### Primary: Electric Periwinkle — `#5956E9`

The main expressive color. Use for the signature homepage hero, occasional full-width editorial sections, selected actions, and focus states. Pair large violet sections with pure white copy. Do **not** make every content section violet or create a monotonous repeating purple card grid.

### Supporting violet — `#E5E4FF`

Pastel lilac for product photography/illustration staging, selected informational backgrounds, and subtle interaction surfaces. **Do not** make this a decorative badge fill.

### White canvas — `#FFFFFF`

Default page background; essential to the airy editorial rhythm. Product sections and reading surfaces should have space to breathe.

### Warm paper — `#FFF1E3`

A large editorial background inspired by the cream band beneath the reference hero. Use selectively for about/library stories or appropriate collection highlights. Avoid using it as the automatic background of every card.

### Blush pink — `#F7B8CB`

Used sparingly for illustrations or selected media staging panels. It is an accent supporting the main violet, not an additional competing CTA color.

### Pale sky — `#E0F6FC`

Alternative soft product/media stage. Creates contrast among curated products without introducing many unrelated hues.

### Bookish yellow — `#FFD34F`

A warm accent motivated by the lightbulb and book details in the screenshot. Prefer within illustration compositions or one deliberate high-contrast element, not sprinkled through interface badges or decorative symbols.

### Ink — `#191923`; secondary copy — `#555665`

Headings and product labels use nearly black ink, with secondary information subdued but readable. Avoid pale gray tiny text, particularly on cream or lilac backgrounds.

### Structural outline — `#E7E7EF`

A barely visible divider used when semantics require grouping (form fields, data tables, filters). Prefer whitespace over outlining every element.

### Semantic statuses

Use clearly differentiated success/warning/error semantics for genuine account, payment, or validation states. Do not treat decorative colors as payment status. Color must not be the sole status indicator. Validate contrast to WCAG 2.2 AA for applicable content.

## 4. Typography

### Preferred family

**Plus Jakarta Sans**, with **Inter** as an acceptable substitute if the preferred font is unavailable. This is a recommended stylistic match to the screenshot, not a verified identification of Redex's font.

### Hierarchy

| Role | Desktop recommendation | Mobile recommendation | Behavior |
|---|---|---|---|
| Hero display | 48–56px, 800, tight tracking | 32–38px, 800 | Aim for a compact 2–3 line headline, not 6 cramped lines |
| Editorial display | 36–44px, 700–800 | 28–34px | Can align left or use offset composition |
| Section heading | 26–32px, 700 | 22–26px | Clear, useful, no obligatory eyebrow label |
| Product heading | 16–18px, 700 | 15–17px | Enough room for realistic titles |
| Body | 16px, 400, 1.55–1.65 line height | 15–16px | Short, meaningful copy |
| Metadata | 13–14px | 13–14px | Must remain readable |
| Buttons | 14–16px, 600 | 14–16px | Action-oriented wording |

Do not reproduce the screenshot's tiny illegible demonstration copy. Preserve legibility at realistic application sizes.

### Copywriting principles for Indonesian screens

- Write in direct, natural Bahasa Indonesia; be warm, specific, and readable, not slang-heavy.
- Prefer short section titles such as **Katalog Buku**, **Pilihan Buku**, **Detail Buku**, **Keranjang**, **Perpustakaan Saya**, **Agenda Literasi**.
- Use precise actions: **Jelajahi Katalog**, **Lihat Detail**, **Tambah ke Keranjang**, **Lanjut ke Pembayaran**, **Baca Buku**.
- Do not convert internal architecture into promotional copy. Avoid section headlines about Midtrans Snap, API, webhook, browser-based PDF, licenses, or prototype infrastructure.
- If a sentence does not help the user decide or act, remove it rather than replacing it with another marketing sentence.
- Do not display prototype disclaimers as repeated marketing subtitles. Keep demo provenance in project documentation and appropriate controlled prototype context.
- Never invent claims about official inventories, ratings, reviews, book counts, discounts, or event schedules.

## 5. Geometry, Shape & Depth

### Hero geometry

The screenshot's focal shape is a **wide, saturated violet hero panel with noticeably rounded bottom corners**, while its top edge stays aligned closely to the navigation. Use a generous lower radius and a restrained upper edge when it fits the design. Its open book illustration may slightly overlap the panel's lower boundary if deliberately composed and not cropped.

### General shapes

- Buttons: gentle 8–12px radius; solid primary and restrained outline/white secondary.
- Product displays: media/image-focused panels with 12–18px corners only where helpful.
- Standard content: open layout by default; use containers only for grouping or interaction.
- Modal/form surfaces: coherent 12–18px corners; avoid nested card-within-card layers.
- Functional chips: optional when they encode a selected filter or real status; do not add promotional pill labels.

### Shadows

Use soft ambient shadow only when there is real elevation: floating image cutouts, modal, menu, or main interactive panel. Typical suggested shadow for raised elements: `0 12px 32px rgba(30,25,80,0.12)`. Flat cards and product grids do not need shadows by default.

### Illustration depth

The books in the screenshot have a tactile 3D/illustrated treatment with visual overlap and layering. Stage objects deliberately and preserve believable shadows. **Depth must come from the content visual, not a stack of gratuitous glassmorphism surfaces.**

## 6. Imagery and Iconography

### Primary imagery direction

A friendly, expressive **book-centered illustration language**: stacked colorful books, an open book, writing/reading motifs, and occasional carefully chosen editorial illustrations. The source hero uses a large open-book and book-stack arrangement with a yellow lightbulb as a secondary storytelling element. The composition is playful but has a clear dominant object.

### Source and reuse order for IKAPI

1. Inspect `docs/design/page-ref/` and the supplied reference screenshots.
2. Inspect `docs/ilustration/README.md`, `docs/ilustration/*.svg`, `docs/ilustration/3d/*.png`.
3. Inspect `docs/design/assets/assets.json` and `docs/design/assets/covers/`.
4. Use appropriate existing project assets. Do **not** force their use if mismatched.
5. If assets are missing, independently research free licensed photo/illustration/icon assets from legitimate sources; record source URL, asset author, license, attribution conditions, and intended usage.
6. When nothing appropriate exists, create a consistent original SVG illustration/icon rather than falling back to emoji, blank color blocks, or generic AI art.

For book listings, **real supplied book cover art wins over generic 3D illustration**. Use illustrated book objects as hero/editorial support; do not make all catalog covers look like the same synthetic object.

### Icon system

Use a coherent SVG icon set such as Lucide for functional actions (search, account, cart, chevron, close, bookmark, pagination). Use consistent stroke/size and color. Custom icons are fine when necessary, but must match the set. Do not use operating-system emoji, star/sparkle icon confetti, decorative pill/dot motifs, or random floating 3D icons as UI controls.

### Image rights

Reference screenshot = inspiration for visual principles only. Do not copy Redex's exact logo, text, testimonial portraits, illustrations, or branded graphics. Use properly licensed alternatives or user-supplied assets whose reuse is authorized. No image-search result is automatically free to use. Document the licenses of all externally sourced assets.

## 7. Navigation & Header

### Reference observation

The source shows a simple horizontally aligned hero navigation with a left-aligned wordmark, small centered links, and one compact white CTA. Its hierarchy is quiet so the headline and illustration remain dominant.

### IKAPI adaptation

Keep the functional IKAPI navigation rather than copying Redex's labels:

- Brand: **IKAPI Store**.
- Search by book title/author/publisher.
- Catalog and categories.
- Agenda and community, where confirmed.
- Account and cart.

On desktop, a clean split header may be used to make product search prominent. The hero and navigation should feel visually coordinated without hiding commerce functionality. On mobile, prioritize brand, search, cart/account, and an understandable menu. Real dropdowns use a proper chevron icon and meaningful expanded state, not a literal letter `V`.

Do not add a fake CTA such as **Download Now**, because purchased e-book files are not downloadable.

## 8. Component Styling

### Primary action

A compact, readable solid violet action (`#5956E9`, white text) on light surfaces. On the violet hero, use a white action with dark-violet/ink text to create enough contrast. Avoid three competing saturated CTA colors. Use clear Bahasa Indonesia verbs.

### Secondary action

Light white/transparent surface with a subtle outline; visual weight below primary. Do not make every link into a pill button. Normal text links are useful for category and product navigation.

### Book product tile

Book artwork must dominate. Show cover at approximately 2:3 ratio when source assets support it; title, author, and price align consistently below. Avoid heavy boxed cards, bogus ratings, large category badges, or black overlays covering existing cover titles. Use pastels as media staging only if their application genuinely improves the product presentation.

### Curated collection/media panel

The small colorful panels in the reference use pastel backgrounds to stage individual objects. For IKAPI, use this selectively for a **real curated grouping or editorial campaign**. Each panel can differ in image crop or composition, but typography, action styles, and spacing remain consistent. Do not manufacture extra product categories or promotions just to reproduce the screenshot's card count.

### Editorial block

Paired large text and image, sometimes asymmetrical; may use cream/pink backgrounds with strong negative space. Different editorial blocks should not repeat `small badge → heading → paragraph → button` mechanically. If the content is irrelevant, omit the block entirely.

### Form fields

Clean white/light surface, medium-radius outline, visible labels, high contrast, keyboard focus, clear validation. Reuse styles across login, registration, profile, checkout. Avoid floating icons and verbose marketing descriptions inside forms.

### Reader and checkout

**These are functional screens, not homepage promotional sections.** The reader should be calm, highly legible, and largely neutral so it does not inherit a giant violet background behind every page. Payment screens prioritize transaction clarity and faithful payment states. Keep vibrant brand language in header/interaction accents while allowing a content-first UI.

### Status / error / success

Use semantic text, a relevant icon if useful, and clear next actions. No celebration confetti, glowing success badge, made-up transaction metrics, or ambiguous colors. Invoice downloads may exist as permitted by the product specs; e-book file downloads must not be offered.

## 9. Layout Principles & Section Rhythm

### Desktop grid

Suggested max content width: `1180–1240px`, 12-column layout with approximately `24px` gutters; outer page margins should feel generous. These are recommendations, not screenshot measurements. Let book art and editorial typography command attention.

### Main homepage rhythm inspired by screenshot

```text
┌──────────────────────────────────────────────────────────────────┐
│  IKAPI BRAND    SEARCH     KATALOG  KATEGORI  AGENDA  AKUN  CART│
├──────────────────────────────────────────────────────────────────┤
│  ELECTRIC VIOLET HERO                                            │
│                                                                  │
│         Large, confident Indonesian headline                     │
│              Very short useful explanation                       │
│                [ Explore catalog ]                               │
│                                                                  │
│             LARGE BOOK-FOCUSED ILLUSTRATION                      │
│           overlaps lower edge intentionally                      │
└───────────────╮                                  ╭──────────────┘
                └──────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────┐
│  WHITE / WARM PAPER EDITORIAL SPACE                              │
│  Categories + curated real books, artwork-first                  │
│  Different composition from hero; no duplicate marketing panels │
├──────────────────────────────────────────────────────────────────┤
│  BOOK CATALOG / FEATURED REAL DEMO TITLES                         │
│  Cover        Cover        Cover        Cover                     │
│  Title/author/price and meaningful actions                       │
├──────────────────────────────────────────────────────────────────┤
│  CONFIRMED EVENTS / LITERACY CONTENT (only if data is appropriate)│
├──────────────────────────────────────────────────────────────────┤
│  FOOTER: BRAND / CATALOG / ACCOUNT / HELP / PUBLISHERS           │
└──────────────────────────────────────────────────────────────────┘
```

This is a **visual hierarchy reference**, not permission to add arbitrary homepage sections. Use the latest approved IKAPI homepage structure. The source screenshot's testimonial and purple contact panel are not required IKAPI features.

### Editorial variation rules

- Alternate visually meaningful full-width compositions and open white catalog sections.
- Introduce warmth through a cream section, not a rainbow of random card backgrounds.
- Do not repeat the same left-copy/right-image split in every section.
- Avoid overly empty giant panels where a small illustration occupies a corner.
- Use overlap only when it improves hierarchy and remains accessible across viewports.
- A visual section must have a clear purpose; visual variety alone is not a justification.

### Mobile adaptation (recommended, not observed)

- Reduce hero display to approximately 32–38px and hero bottom radius to 24–32px.
- Keep large meaningful hero art, but arrange it below or around text without clipping book covers or blocking CTA.
- Single-column editorial blocks; 1–2 book tiles per row depending on real product title density.
- Keep category/filter UI discoverable without compressing labels.
- Ensure controls have usable touch targets, readable text, and visible keyboard focus.
- Do not shrink the entire desktop artwork/typography into a tiny mobile copy.

## 10. Motion and Interaction (Proposals, Not Screenshot Evidence)

The screenshot is static; no animation behavior can be inferred. Optional motion should be restrained and purposeful: gentle 150–250ms transitions for hover/focus, small image elevation on interactive product tiles, and short panel transitions. Avoid constant floating ornaments, parallax distractions, fake typing, bouncing emojis, flashing indicators, or mandatory scroll-triggered animations. Respect reduced-motion preferences.

## 11. Explicit Anti-AI-Slop Design Contract

**Never automatically introduce:**

- Sparkles, fire/rocket emoji, colored dot accents, translucent badges, marketing pills, and miniature uppercase labels above every section.
- Repeated SaaS feature cards to describe system capabilities.
- Technical marketing headlines such as “Pembayaran lewat Midtrans Snap” or “Baca di browser, tanpa unduh berkas.”
- Artificial product statistics, ratings, reviews, discounts, inventory totals, or official event announcements.
- Fake site functionality, fake payments, fake publisher identity, or a fake working AI chatbot.
- Extra content sections only because an available illustration exists or because the reference picture contains one.
- The generic purple gradient + glass cards + glowing icons formula. The screenshot is predominantly a **flat violet field with book illustrations**, not a glassmorphism design.

**Allowed when functional:** actual cart count, selected filters, payment status, validation, focus state, actual content categories, and navigation indicators. Never eliminate a functional control just because it is rounded.

## 12. Product-Specific Boundaries for IKAPI Store

1. The catalog currently contains simulation/demo books and prices, not verified real publisher stock.
2. A buyer purchases access to read an e-book via the account and web reader. Do not show a download-book feature.
3. Payment belongs to checkout and transaction detail flows; do not add a full payment-service demo to the homepage.
4. Reader belongs to library/reading flows; do not add a giant fake reader mockup to the homepage.
5. Event and community are part of the product, but their exact UI must follow approved scope and content.
6. Do not add book-verification-by-admin flows; that requirement has been explicitly removed by the product owner.
7. The design should be accessible to younger audiences without forced Gen-Z slang, fake trend labels, or gratuitous 3D stickers.
8. Product PRD and confirmed user decisions override layout examples in this file.

## 13. Screen Family Guidance

| Screen family | Apply from this design | Avoid |
|---|---|---|
| Homepage | Violet hero, impactful book imagery, warm editorial rhythm | Payment/reader marketing showcases, feature-card spam |
| Catalog & search | White canvas, cover-first grid, simple controls, selected pastel accents | Huge fake book illustrations replacing real covers |
| Book details | Big cover, clear title/author/price/action, clean content hierarchy | Fake testimonials and arbitrary category badges |
| Auth & profile | Warm/minimal surface, one deliberate illustration, focused forms | Purple full-screen decoration competing with inputs |
| Cart & checkout | Quiet functional canvas with selective brand accents | Large editorial illustration drowning out totals |
| Orders & status | Clean typography, explicit status and next action | Random success confetti or unverified claims |
| Personal library | Book-cover-based personal collection, restrained warmth | Dashboard analytics cards on reading pages |
| Web reader | Neutral reading canvas, clear typography and progress controls | Heavy purple backgrounds behind book text |
| Events & community | Editorial imagery where licensed and relevant | Invented events/people to satisfy visual reference |

## 14. Instructions for Google Stitch Generation

Use the following as a generation contract when this DESIGN.md is attached to an IKAPI screen request:

1. **Read the IKAPI buyer PRD** for page purpose and accepted flows, then read this file for design language. Neither file replaces the other.
2. **Use the attached screenshot for composition cues**: electric-violet hero, large book-focused imagery, warm/white section alternation, bold headings, playful yet deliberate visual rhythm.
3. **Choose the appropriate visual intensity for the screen**: expressive for editorial/public-facing marketing, restrained for forms, checkout, transactions, and reader.
4. **Inspect project assets first**. If an essential asset is missing, independently search for legitimately free-to-use alternatives and record source/license; or create an original high-quality SVG. Never use arbitrary copyright-restricted artwork.
5. **Do not clone Redex**. Replace its identity and screen content with IKAPI content from the PRD. Never copy its English copy or book-download CTA.
6. **Do not hallucinate new sections or features** because they appear in the reference. Keep page structure aligned with the selected screen specification.
7. **Design desktop and mobile intentionally**. Since the screenshot provides no mobile view, use responsive UX best practices rather than claiming fidelity to unseen mobile behavior.
8. **Use meaningful short Indonesian copy**. If the information is redundant, remove it. No filler descriptions.
9. **Visually inspect each generated result**. Evaluate artwork scale/cropping, spacing, type hierarchy, interactions, responsiveness, and AI-slop regressions.
10. **Report unverifiable details honestly**. This file is a visual-system proposal derived from one reference screenshot, not an exact token dump from an original design project.

### Compact Stitch prompt to pair with this file

> Design the requested IKAPI Store buyer screen using the attached `DESIGN.md` and IKAPI buyer PRD. Follow the reference's playful editorial bookstore aesthetic: electric violet as the signature statement color, warm cream and white sections, strong typography, and large, meaningful book illustration. Adapt the layout to the screen's actual user goal; don't add unrelated feature sections, decorative badges/pills/dots, fake data, or technical marketing copy. Use existing IKAPI assets before seeking properly licensed free alternatives. Make desktop and mobile designs, inspect them, and report remaining issues.

## 15. Visual Review Checklist

- [ ] Does it read immediately as a **bookstore**, not a SaaS or banking product?
- [ ] Is the large violet expression used intentionally, rather than everywhere?
- [ ] Does the focal artwork have enough scale and genuine visual quality?
- [ ] Does the next section change layout rhythm with warm cream/white space?
- [ ] Are book product covers real supplied assets rather than placeholders?
- [ ] Is the typographic hierarchy confident without sacrificing readability?
- [ ] Do buttons describe actual actions supported by the relevant flow?
- [ ] Are there no gratuitous pills, dots, emoji, sparkles, micro-labels, or fake reviews?
- [ ] Has no irrelevant homepage section been introduced merely to show a feature?
- [ ] Have source assets and licenses been checked where applicable?
- [ ] Is the mobile layout deliberately designed and checked?
- [ ] Is every visible statement consistent with the IKAPI PRD and demo-data status?
- [ ] Is e-book downloading absent from buyer UI?

---

### Provenance

- **Primary visual evidence:** User-uploaded composite screenshot of the Redex Library landing-page concept.
- **Design extraction method:** Visual inspection with approximate color sampling of the raster image; values and responsive guidance are proposed design tokens.
- **Format guidance:** Official Google Stitch design-md / extract-design-md skill output conventions.
- **Business rules:** Confirmed IKAPI user requirements and earlier reviewed IKAPI proposal/use case material; these rules should be kept synchronized with the latest approved PRD.
