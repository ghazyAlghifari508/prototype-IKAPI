# Hostinger - Bring Your Idea Online With a Website - Style Reference

## Overview & Capture Confidence

**Source:** https://www.hostinger.com/ · captured 2026-11-15T14:17:15.654Z
**Requested scope:** viewport desktop; theme auto; focus complete; depth standard; code reference both.
**Analysis status:** 250 visible elements measured across 1 capture; AI synthesis unavailable, so this is a measurement-only document.

The AI synthesis step did not produce a narrative for this capture. AI synthesis is unavailable or did not run. Available measurements remain usable within the capture scope, not a complete website specification.

**Verified contexts:** Desktop 1440x900 (unknown).
**Not verified:** the page appearance — the measured canvas could not establish light or dark, so the theme is reported as unknown; a second viewport — only 1440x900 was measured, so no responsive rule is established; interaction states (hover, focus, disabled) and content outside the sampled elements.

## AI Agent Implementation Guide

**Quick reference**
- text: `#222225`
- surface: `#000000`
- action fill: not measured
- primary action: `#673de6`
- base spacing unit: 4px

**Design brief**

### Visual direction

- surfaces around `#000000`; text in `#222225`; actions in `#673de6`; type set in DM Sans.

### Typography hierarchy

- Families: DM Sans (the only family measured).
- Measured steps (largest first): Display 48px/56px · 399 · tracking -0.24px; Large heading 36px/44px · 399 · tracking -0.18px; Heading 24px/32px · 399 · tracking -0.12px; Body large 24px/32px · 499 · tracking -0.12px; Subheading 18px/26px · 399 · tracking -0.09px.
- Keep this size order; do not flatten display and body into a single step.

### Color roles

- Primary / brand: `#673de6` (Primary action; inferred); `#9d99ff` (Brand accent; inferred).
- Text: `#222225` (Base text; role unproven); `#9d9ea4` (Text; role unproven); `rgba(255, 255, 255, 0.75)` (Text; role unproven); `#161718` (Text; role unproven); `rgba(255, 255, 255, 0.9)` (Text; role unproven); `#dedee2` (Text; role unproven).
- Surface: `#000000` (Text and surface; inferred); `#f5f6ff` (Surface; role unproven); `#f5f5f6` (Surface; role unproven); `#ff4646` (Surface; role unproven).
- Semantic state: `#18181a` (Semantic state; inferred); `#f8f9fa` (Semantic state; inferred); `#ffffff` (Semantic state; inferred); `#797980` (Semantic state; inferred).
- Browser default or unclassifiable, so evidence only: `rgba(0, 0, 0, 0.75)` (Default text; role unproven); `rgba(0, 0, 0, 0.5)` (Default text; role unproven).
- Assign colour by role; a measured value whose role the capture did not prove is not a palette decision.

### Surfaces & elevation

- Surfaces: `#000000` (nav, section); `#ffffff` (cta, section).
- Elevation: `rgba(0, 0, 0, 0) 0px 0px 0px 1px` (cta); `rgb(255, 255, 255) 0px 0px 0px 1px` (cta); `rgba(0, 0, 0, 0.1) 0px 0px 0px 1px` (cta); `rgba(0, 0, 0, 0.1) 0px 4px 10px 0px` (element).

### Spacing & shapes

- Base unit: 4px; keep new spacing on its multiples.
- Measured spacing steps: `0px 0px 8px`, `0px 8px 0px 0px`, `8px`, `24px`, `8px 16px`.
- Radius by component: buttons `12px`; buttons `0px`; buttons pill fully rounded; buttons pill fully rounded; element `6px`; element `16px`; navigation `0px`.
- Measured once, so scoped evidence rather than a shared rule: inputs `0px`; navigation pill `999px`; navigation `50%`.
- Keep each component's measured radius; no single radius was measured across those classes.

### Responsive behaviour

- Only one viewport (1440px) was measured, so no responsive behaviour is prescribed.

**Operational Guidelines**
1. **Understand the product first:** decide what the application must do before styling it.
2. **Treat this document as a style reference:** it describes visual language, not features or content.
3. **Map styles to existing components:** reuse the application's own component classes instead of inventing equivalents.
4. **Preserve hierarchy and semantic roles:** keep the measured role of each colour and type step; never promote an inferred role to a measurement.
5. **Apply only proven responsive differences:** use the values recorded for desktop and mobile, and treat the endpoint widths as observations, not breakpoints.
6. **Invent no unseen variants:** hover, focus, disabled and intermediate breakpoints were not captured unless stated.
7. **Copy no proprietary assets:** do not reuse the source site's text, logos, images or brand assets as product content.
8. **Build the product, not a design showcase:** no palette galleries, token inspectors or design-documentation pages unless the user asks for them.
9. **Report what this document cannot establish:** treat an uncovered requirement as a new product decision and say it is unknown.

## Foundations / Shared Tokens

**Theme:** unknown

### Colors & Semantic Roles

| Semantic Role | Value | Confidence |
| --- | --- | --- |
| Semantic state | #18181a | inferred |
| Semantic state | #f8f9fa | inferred |
| Base text | #222225 | unknown |
| Semantic state | #ffffff | inferred |
| Primary action | #673de6 | inferred |
| Default text | rgba(0, 0, 0, 0.75) | unknown |
| Text and surface | #000000 | inferred |
| Default text | rgba(0, 0, 0, 0.5) | unknown |
| Text | #9d9ea4 | unknown |
| Text | rgba(255, 255, 255, 0.75) | unknown |
| Text | #161718 | unknown |
| Brand accent | #9d99ff | inferred |
| Surface | #f5f6ff | unknown |
| Text | rgba(255, 255, 255, 0.9) | unknown |
| Semantic state | #797980 | inferred |
| Text | #dedee2 | unknown |
| Surface | #f5f5f6 | unknown |
| Surface | #ff4646 | unknown |

### Typography Scale

| Role | Family | Size | Weight | Line height | Letter spacing |
| --- | --- | --- | --- | --- | --- |
| Display | DM Sans | 48px | 399 | 56px | -0.24px |
| Large heading | DM Sans | 36px | 399 | 44px | -0.18px |
| Heading | DM Sans | 24px | 399 | 32px | -0.12px |
| Subheading | DM Sans | 18px | 399 | 26px | -0.09px |
| Body large | DM Sans | 24px | 499 | 32px | -0.12px |
| Body | DM Sans | 16px | 399 | 24px | normal |
| Body small | DM Sans | 14px | 400 | 20px | normal |
| Caption | DM Sans | 12px | 399 | 16px | normal |

### Fonts & Type Faces

**DM Sans**
- Roles: Display, Large heading, Heading, Subheading, Body large, Body, Body small, Caption
- Weights: 399, 400, 499, 599, 600, 700
- Sizes: 56px, 48px, 36px, 24px, 20px, 18px, 16px, 14px, 12px
- Line heights: 20px, 24px, 56px, 16px, 44px, 28px, 32px, 26px, 64px
- Letter spacing: normal, -0.24px, -0.18px, -0.1px, -0.12px, -0.09px, -0.28px
- CSS stack: `"DM Sans", sans-serif`
- Uncertainty: No declared font resource for this family reported a loaded state, so the glyph font is not confirmed.

### Spacing & Shapes

**Base unit:** 4px

| Purpose | Property | Value | Measured on | On scale |
| --- | --- | --- | --- | --- |
| Repeated spacing scale | margin | `0px 0px 8px` | 65 | yes |
| Repeated spacing scale | padding | `0px 8px 0px 0px` | 65 | yes |
| Element gap | gap | `8px` | 11 | yes |
| Repeated spacing scale | padding | `24px` | 7 | yes |
| Action padding | padding | `8px 16px` | 6 | yes |
| Repeated spacing scale | margin | `0px 0px 12px` | 6 | yes |
| Navigation spacing | gap | `2px` | 6 | no |
| Container max-width | max-width | `646px` | 5 | no |
| Action padding | padding | `12px 40px` | 5 | yes |
| Card padding | padding | `80px 0px` | 4 | yes |
| Section gap | margin | `16px 0px 48px` | 3 | yes |
| Repeated spacing scale | margin | `24px 0px 0px` | 3 | yes |
| Repeated spacing scale | margin | `16px 0px 0px` | 3 | yes |
| Action padding | padding | `10px 16px` | 3 | yes |
| Container max-width | max-width | `930px` | 2 | no |
| Element gap | gap | `48px` | 2 | yes |
| Repeated spacing scale | margin | `0px 0px 16px` | 2 | yes |
| Measured spacing | max-width | `2230px` | 1 | no |
| Measured spacing | max-width | `2043px` | 1 | no |
| Measured spacing | max-width | `736px` | 1 | yes |
| Measured spacing | max-width | `678px` | 1 | no |
| Measured spacing | margin | `0px 486.453px` | 1 | no |
| Measured spacing | max-width | `423px` | 1 | no |
| Measured spacing | margin | `0px 312.547px` | 1 | no |
| Section gap | margin | `224px 0px 0px` | 1 | yes |
| Section gap | margin | `204px 0px 0px` | 1 | yes |
| Section gap | margin | `184px 0px 0px` | 1 | yes |
| Section gap | margin | `156px 0px 0px` | 1 | yes |
| Card padding | padding | `0px 0px 104px` | 1 | yes |
| Section gap | margin | `96px 0px` | 1 | yes |
| Section gap | margin | `80px 0px 0px` | 1 | yes |
| Card padding | padding | `0px 0px 80px` | 1 | yes |
| Card padding | padding | `12px 0px 80px` | 1 | yes |
| Card padding | padding | `48px 0px` | 1 | yes |
| Navigation spacing | padding | `0px 0px 0px 40px` | 1 | yes |
| Navigation spacing | padding | `16px 40px 16px 32px` | 1 | yes |
| Navigation spacing | gap | `32px` | 1 | yes |
| Measured spacing | margin | `0px 0px 32px` | 1 | yes |
| Action padding | padding | `0px 32px` | 1 | yes |
| Navigation spacing | gap | `24px` | 1 | yes |
| Measured spacing | margin | `0px 0px 24px` | 1 | yes |
| Action padding | padding | `12px 16px` | 1 | yes |
| Measured spacing | margin | `12px 0px 0px` | 1 | yes |
| Navigation spacing | margin | `0px 8px 0px 0px` | 1 | yes |
| Measured spacing | padding | `6px 8px` | 1 | yes |
| Navigation spacing | padding | `8px` | 1 | yes |
| Navigation spacing | gap | `4px` | 1 | yes |
| Navigation spacing | padding | `1px` | 1 | no |
| Measured spacing | max-width | `100%` | 1 | no |

| Context | Value | Captured in | Measured on |
| --- | --- | --- | --- |
| Buttons | `12px` | single capture | 9 |
| Buttons | `0px` | single capture | 5 |
| Buttons | `999px` (fully rounded / pill) | single capture | 4 |
| Buttons | `40px` (fully rounded / pill) | single capture | 3 |
| Inputs | `0px` | single capture | 1 |
| Measured radius | `6px` | single capture | 8 |
| Measured radius | `16px` | single capture | 7 |
| Navigation | `0px` | single capture | 18 |
| Navigation | `999px` (fully rounded / pill) | single capture | 1 |
| Navigation | `50%` | single capture | 1 |

### Surfaces

| Value | Roles | Measured on |
| --- | --- | --- |
| `#000000` | nav, section | 6 |
| `#ffffff` | cta, section | 5 |

### Elevation

| Shadow | Roles | Measured on | Notes |
| --- | --- | --- | --- |
| `rgba(0, 0, 0, 0) 0px 0px 0px 1px` | cta | 8 | Repeated across 8 measured elements. Structure: blur 1px. |
| `rgb(255, 255, 255) 0px 0px 0px 1px` | cta | 2 | Repeated across 2 measured elements. Structure: blur 1px. |
| `rgba(0, 0, 0, 0.1) 0px 0px 0px 1px` | cta | 1 | Measured once, so it is not presented as a system elevation. Structure: blur 1px. |
| `rgba(0, 0, 0, 0.1) 0px 4px 10px 0px` | element | 1 | Measured once, so it is not presented as a system elevation. Structure: blur 10px. |

## Component Specifications

**Applies to every measured component:**
- Do not copy the reference site's text, links, images, or brand assets as product content.

### Body copy

**Purpose:** Body copy.

**Base style**
- Corner radius: 0px
- Padding: 0px
- Gap: normal

**Variant 1** (5 measured samples):
- Typography: DM Sans · 18px · 399
- Line height: 26px
- Tracking: -0.09px
- Text color: rgb(248, 249, 250)
- Margin: 0px

**Variant 2** (4 measured samples):
- Typography: DM Sans · 14px · 599
- Line height: 20px
- Text color: rgb(248, 249, 250)
- Margin: 0px 0px 12px

**Variant 3** (4 measured samples):
- Typography: DM Sans · 14px · 399
- Line height: 20px
- Text color: rgb(255, 255, 255)
- Margin: 0px

**Variant 4** (3 measured samples):
- Typography: DM Sans · 16px · 399
- Line height: 24px
- Text color: rgba(255, 255, 255, 0.75)
- Margin: 0px

**Variant 5** (3 measured samples):
- Typography: DM Sans · 14px · 399
- Line height: 20px
- Text color: rgb(248, 249, 250)
- Margin: 0px

**Variant 6** (3 measured samples):
- Typography: DM Sans · 16px · 399
- Line height: 24px
- Text color: rgba(0, 0, 0, 0.75)
- Margin: 16px 0px 48px

Unseen variants, interaction states, and intermediate breakpoints are not established by this capture.

**Evidence:** Measured on 44 body elements; 22 distinct measured treatments. Role inferred from DOM.

**Notes**
- Apply these measured values only to components that match this class and capture scope.

### Subheading

**Purpose:** Subheading within a section.

**Base style**
- Corner radius: 0px
- Padding: 0px
- Gap: normal

**Variant 1** (14 measured samples):
- Typography: DM Sans · 18px · 399
- Line height: 26px
- Tracking: -0.09px
- Text color: rgb(24, 24, 26)
- Margin: 0px

**Variant 2** (5 measured samples):
- Typography: DM Sans · 20px · 399
- Line height: 28px
- Tracking: -0.1px
- Text color: rgb(255, 255, 255)
- Margin: 0px

**Variant 3** (3 measured samples):
- Typography: DM Sans · 36px · 399
- Line height: 44px
- Tracking: -0.18px
- Text color: rgb(24, 24, 26)
- Margin: 16px 0px 0px

**Variant 4** (1 measured sample):
- Typography: DM Sans · 20px · 399
- Line height: 28px
- Tracking: -0.1px
- Text color: rgb(255, 255, 255)
- Margin: 224px 0px 0px

**Variant 5** (1 measured sample):
- Typography: DM Sans · 20px · 399
- Line height: 28px
- Tracking: -0.1px
- Text color: rgb(255, 255, 255)
- Margin: 184px 0px 0px

**Variant 6** (1 measured sample):
- Typography: DM Sans · 20px · 399
- Line height: 28px
- Tracking: -0.1px
- Text color: rgb(255, 255, 255)
- Margin: 156px 0px 0px

Unseen variants, interaction states, and intermediate breakpoints are not established by this capture.

**Evidence:** Measured on 27 h3 elements; 8 distinct measured treatments. Role inferred from DOM.

**Notes**
- Apply these measured values only to components that match this class and capture scope.

### Buttons and CTAs

**Purpose:** Action controls, such as buttons and calls to action.

**Variant 1** (4 measured samples):
- Typography: DM Sans · 14px · normal
- Line height: 20px
- Layout: flex
- Text color: rgb(248, 249, 250)
- Corner radius: 0px
- Padding: 0px
- Gap: 2px
- Margin: 0px

**Variant 2** (2 measured samples):
- Typography: DM Sans · 16px · semibold
- Layout: flex
- Text color: rgba(255, 255, 255, 0.9)
- Corner radius: 999px (pill)
- Padding: 8px 16px
- Gap: 8px
- Margin: 0px

**Variant 3** (2 measured samples):
- Typography: DM Sans · 16px · semibold
- Line height: 24px
- Layout: flex
- Text color: rgb(255, 255, 255)
- Corner radius: 12px
- Padding: 12px 40px
- Gap: 0px
- Margin: 24px 0px 0px
- Elevation: rgb(255, 255, 255) 0px 0px 0px 1px

**Variant 4** (2 measured samples):
- Typography: DM Sans · 14px · 599
- Line height: 20px
- Layout: flex
- Text color: rgb(24, 24, 26)
- Corner radius: 40px (pill)
- Padding: 10px 16px
- Gap: 8px
- Margin: 0px

**Variant 5** (1 measured sample):
- Typography: DM Sans · 16px · semibold
- Layout: inline-flex
- Text color: rgb(248, 249, 250)
- Corner radius: 999px (pill)
- Padding: 8px 16px
- Gap: 0px
- Margin: 0px
- Elevation: rgba(0, 0, 0, 0) 0px 0px 0px 1px

**Variant 6** (1 measured sample):
- Typography: DM Sans · 16px · semibold
- Line height: 24px
- Layout: flex
- Background: rgb(255, 255, 255)
- Text color: rgb(22, 23, 24)
- Corner radius: 999px (pill)
- Padding: 0px 32px
- Gap: 0px
- Margin: 0px
- Elevation: rgba(0, 0, 0, 0) 0px 0px 0px 1px

Unseen variants, interaction states, and intermediate breakpoints are not established by this capture.

**Evidence:** Measured on 21 cta elements; 15 distinct measured treatments. Role inferred from DOM.

**Notes**
- Apply these measured values only to components that match this class and capture scope.

### Navigation

**Purpose:** Primary site navigation.

**Base style**
- Margin: 0px

**Variant 1** (4 measured samples):
- Typography: DM Sans · 14px · normal
- Line height: 20px
- Layout: flex
- Text color: rgb(248, 249, 250)
- Corner radius: 0px
- Padding: 0px
- Gap: normal

**Variant 2** (2 measured samples):
- Typography: DM Sans · 16px · semibold
- Line height: 24px
- Layout: flex
- Text color: rgb(248, 249, 250)
- Corner radius: 0px
- Padding: 0px
- Gap: normal

**Variant 3** (2 measured samples):
- Typography: DM Sans · 16px · 399
- Line height: 24px
- Text color: rgb(34, 34, 37)
- Corner radius: 0px
- Padding: 0px
- Gap: normal

**Variant 4** (1 measured sample):
- Typography: DM Sans · 16px · 399
- Line height: 24px
- Layout: flex
- Background: rgb(0, 0, 0)
- Text color: rgb(34, 34, 37)
- Corner radius: 0px
- Padding: 0px
- Gap: normal
- Maximum content width: 100%

**Variant 5** (1 measured sample):
- Typography: DM Sans · 14px · normal
- Line height: 20px
- Layout: flex
- Text color: rgb(248, 249, 250)
- Corner radius: 0px
- Padding: 0px
- Gap: 2px

**Variant 6** (1 measured sample):
- Typography: DM Sans · 14px · normal
- Line height: 20px
- Layout: flex
- Text color: rgb(248, 249, 250)
- Corner radius: 50%
- Padding: 8px
- Gap: 2px

Unseen variants, interaction states, and intermediate breakpoints are not established by this capture.

**Evidence:** Measured on 20 nav elements; 15 distinct measured treatments. Role inferred from DOM.

**Notes**
- Apply these measured values only to components that match this class and capture scope.

### Page sections

**Purpose:** Page section container.

**Base style**
- Typography: DM Sans · 16px · 399
- Line height: 24px
- Corner radius: 0px
- Gap: normal

**Variant 1** (4 measured samples):
- Text color: rgb(34, 34, 37)
- Padding: 0px
- Margin: 0px

**Variant 2** (2 measured samples):
- Text color: rgb(248, 249, 250)
- Padding: 0px
- Margin: 0px

**Variant 3** (1 measured sample):
- Layout: flex
- Background: rgb(0, 0, 0)
- Text color: rgb(255, 255, 255)
- Padding: 12px 0px 80px
- Margin: 0px

**Variant 4** (1 measured sample):
- Background: rgb(0, 0, 0)
- Text color: rgb(248, 249, 250)
- Padding: 80px 0px
- Margin: 0px

**Variant 5** (1 measured sample):
- Background: rgb(0, 0, 0)
- Text color: rgb(34, 34, 37)
- Padding: 0px 0px 80px
- Margin: 0px

**Variant 6** (1 measured sample):
- Text color: rgb(34, 34, 37)
- Padding: 0px
- Margin: 80px 0px 0px

Unseen variants, interaction states, and intermediate breakpoints are not established by this capture.

**Evidence:** Measured on 17 section elements; 13 distinct measured treatments. Role inferred from DOM.

**Notes**
- Apply these measured values only to components that match this class and capture scope.

### Section heading

**Purpose:** Section heading.

**Base style**
- Corner radius: 0px
- Padding: 0px
- Gap: normal

**Variant 1** (3 measured samples):
- Typography: DM Sans · 48px · 399
- Line height: 56px
- Tracking: -0.24px
- Text color: rgb(24, 24, 26)
- Margin: 0px
- Maximum content width: 646px

**Variant 2** (2 measured samples):
- Typography: DM Sans · 48px · 399
- Line height: 56px
- Tracking: -0.24px
- Text color: rgb(248, 249, 250)
- Margin: 0px
- Maximum content width: 646px

**Variant 3** (1 measured sample):
- Typography: DM Sans · 36px · 399
- Line height: 44px
- Tracking: -0.18px
- Text color: rgb(248, 249, 250)
- Margin: 0px
- Maximum content width: 736px

**Variant 4** (1 measured sample):
- Typography: DM Sans · 24px · 399
- Line height: 32px
- Tracking: -0.12px
- Text color: rgb(34, 34, 37)
- Margin: 0px 0px 24px

**Variant 5** (1 measured sample):
- Typography: DM Sans · 36px · 399
- Line height: 44px
- Tracking: -0.18px
- Text color: rgb(248, 249, 250)
- Margin: 0px
- Maximum content width: 423px

**Variant 6** (1 measured sample):
- Typography: DM Sans · 36px · 399
- Line height: 44px
- Tracking: -0.18px
- Text color: rgb(248, 249, 250)
- Margin: 0px

Unseen variants, interaction states, and intermediate breakpoints are not established by this capture.

**Evidence:** Measured on 10 h2 elements; 7 distinct measured treatments. Role inferred from DOM.

**Notes**
- Apply these measured values only to components that match this class and capture scope.

### Main content area

**Purpose:** Main content area.

**Base style**
- Typography: DM Sans · 16px · 399
- Line height: 24px
- Text color: rgb(34, 34, 37)
- Corner radius: 0px
- Padding: 0px
- Gap: normal
- Margin: 0px

This is a single measured observation, not a repeated pattern; it applies to the cited sample only and supports no shared rule.

**Evidence:** Measured on 1 main element; 1 distinct measured treatment. Role inferred from DOM.

**Notes**
- Apply this recipe only to the measured sample; do not treat it as a shared rule.

### Inputs

**Purpose:** Form input controls.

**Base style**
- Typography: DM Sans · 16px · 399
- Line height: 24px
- Layout: inline-block
- Text color: rgb(222, 222, 226)
- Corner radius: 0px
- Padding: 0px
- Gap: normal
- Margin: 0px

This is a single measured observation, not a repeated pattern; it applies to the cited sample only and supports no shared rule.

**Evidence:** Measured on 1 input element; 1 distinct measured treatment. Role inferred from DOM.

**Notes**
- Apply this recipe only to the measured sample; do not treat it as a shared rule.


## Do's & Don'ts

### DO
- Reuse the measured spacing steps: 0px 0px 8px, 0px 8px 0px 0px, 24px, 0px 0px 12px. _(evidence: Each step was measured on 65, 65, 7, 6 elements.)_
- Keep the measured type contrast: Display at 48px against Body small at 14px. _(evidence: Both sizes were measured on rendered text (5 and 74 elements of the same family); the hierarchy comes from measured size, not from colour or decoration.)_

### DON'T
- Do not collapse a component class to one radius: Navigation 0px / 999px / 50% were measured on different treatments. _(evidence: Different measured treatments of the same component class used different radii; no single value applies to all of them.)_
- Do not present rgba(0, 0, 0, 0.75) as a brand colour. _(evidence: Matches the user-agent text colour and carries no custom-property evidence, so it is not treated as a brand decision.)_

## CSS / Tailwind Reference

### CSS Custom Properties

Generated from validated measurements. These are implementation aliases derived from the capture, not declarations copied from the website's own stylesheet. A role name comes from a usage the capture proved; a `measured` name marks a value whose role the capture could not establish, and browser-default colours are listed as evidence only.

```css
:root {

  /* Colors */
  --color-semantic-state-18181a: #18181a;
  --color-semantic-state-f8f9fa: #f8f9fa;
  --color-measured-222225: #222225;
  --color-semantic-state-ffffff: #ffffff;
  --color-primary-action: #673de6;
  --color-text-and-surface: #000000;
  --color-measured-9d9ea4: #9d9ea4;
  --color-measured-rgba-255-255-255-0-75: rgba(255, 255, 255, 0.75);
  --color-measured-161718: #161718;
  --color-brand-accent: #9d99ff;
  --color-measured-f5f6ff: #f5f6ff;
  --color-measured-rgba-255-255-255-0-9: rgba(255, 255, 255, 0.9);
  --color-semantic-state-797980: #797980;
  --color-measured-dedee2: #dedee2;
  --color-measured-f5f5f6: #f5f5f6;
  --color-measured-ff4646: #ff4646;

  /* Font families */
  --font-dm-sans: "DM Sans", sans-serif;

  /* Type scale */
  --text-display: 48px;
  --leading-display: 56px;
  --tracking-display: -0.24px;
  --text-large-heading: 36px;
  --leading-large-heading: 44px;
  --tracking-large-heading: -0.18px;
  --text-heading: 24px;
  --leading-heading: 32px;
  --tracking-heading: -0.12px;
  --text-subheading: 18px;
  --leading-subheading: 26px;
  --tracking-subheading: -0.09px;
  --text-body-large: 24px;
  --leading-body-large: 32px;
  --tracking-body-large: -0.12px;
  --text-body: 16px;
  --leading-body: 24px;
  --text-body-small: 14px;
  --leading-body-small: 20px;
  --text-caption: 12px;
  --leading-caption: 16px;

  /* Spacing */
  --spacing-element-gap: 8px;
  --spacing-repeated-spacing-scale: 24px;
  --spacing-navigation: 2px;
  --spacing-element-gap-2: 48px;
  --spacing-navigation-2: 32px;
  --spacing-navigation-3: 24px;
  --spacing-navigation-4: 8px;
  --spacing-navigation-5: 4px;
  --spacing-navigation-6: 1px;

  /* Container */
  --container-max-width: 646px;
  --container-max-width-2: 930px;

  /* Radius */
  --radius-buttons: 12px;
  --radius-buttons-2: 0px;
  --radius-buttons-pill: 999px;
  --radius-buttons-pill-2: 40px;
  --radius-element: 6px;
  --radius-element-2: 16px;
  --radius-navigation: 0px;
  --radius-navigation-pill: 999px;
}
```

### Tailwind v4

```css
@theme {

  /* Colors */
  --color-semantic-state-18181a: #18181a;
  --color-semantic-state-f8f9fa: #f8f9fa;
  --color-measured-222225: #222225;
  --color-semantic-state-ffffff: #ffffff;
  --color-primary-action: #673de6;
  --color-text-and-surface: #000000;
  --color-measured-9d9ea4: #9d9ea4;
  --color-measured-rgba-255-255-255-0-75: rgba(255, 255, 255, 0.75);
  --color-measured-161718: #161718;
  --color-brand-accent: #9d99ff;
  --color-measured-f5f6ff: #f5f6ff;
  --color-measured-rgba-255-255-255-0-9: rgba(255, 255, 255, 0.9);
  --color-semantic-state-797980: #797980;
  --color-measured-dedee2: #dedee2;
  --color-measured-f5f5f6: #f5f5f6;
  --color-measured-ff4646: #ff4646;

  /* Font families */
  --font-dm-sans: "DM Sans", sans-serif;

  /* Type scale */
  --text-display: 48px;
  --leading-display: 56px;
  --tracking-display: -0.24px;
  --text-large-heading: 36px;
  --leading-large-heading: 44px;
  --tracking-large-heading: -0.18px;
  --text-heading: 24px;
  --leading-heading: 32px;
  --tracking-heading: -0.12px;
  --text-subheading: 18px;
  --leading-subheading: 26px;
  --tracking-subheading: -0.09px;
  --text-body-large: 24px;
  --leading-body-large: 32px;
  --tracking-body-large: -0.12px;
  --text-body: 16px;
  --leading-body: 24px;
  --text-body-small: 14px;
  --leading-body-small: 20px;
  --text-caption: 12px;
  --leading-caption: 16px;

  /* Spacing */
  --spacing-element-gap: 8px;
  --spacing-repeated-spacing-scale: 24px;
  --spacing-navigation: 2px;
  --spacing-element-gap-2: 48px;
  --spacing-navigation-2: 32px;
  --spacing-navigation-3: 24px;
  --spacing-navigation-4: 8px;
  --spacing-navigation-5: 4px;
  --spacing-navigation-6: 1px;

  /* Container */
  --container-max-width: 646px;
  --container-max-width-2: 930px;

  /* Radius */
  --radius-buttons: 12px;
  --radius-buttons-2: 0px;
  --radius-buttons-pill: 999px;
  --radius-buttons-pill-2: 40px;
  --radius-element: 6px;
  --radius-element-2: 16px;
  --radius-navigation: 0px;
  --radius-navigation-pill: 999px;
}
```

## Coverage & Important Limitations

Measurements are observed; semantic classifications are inferred from measured usage. Missing evidence is reported as unknown rather than estimated.
- Only selected viewport sizes are measured; intermediate widths and interaction states are not verified.
- Computed font-family is a stack; selected glyph font is not verified.
- Pseudo-elements, third-party overlays and glyph-level font selection are not verified.
- Only the sampled portion of the DOM was measured; content beyond the sampling limit may contain styles this document does not describe.
- Theme capture sets only the browser prefers-color-scheme preference. Site theme controls, cookies and stored preferences are not changed; a requested scheme does not prove site support.
- Conflicting CTA radius measurements: capture 1: 1440x900, auto: 0px, 999px, 12px, 40px. No shared button radius rule is established for this capture.
- Load status of 50 declared font resources was not verified, so the font actually used for glyphs is not confirmed.
- 6 observed component classes measured more distinct treatments than the document lists, so the remaining treatments are omitted rather than summarised.
- Theme could not be established from the measured canvas background, so it is reported as unknown rather than estimated.

**Coverage:** 250 visible elements sampled from 273 colour observations (18 distinct values), 8 type styles, 230 spacing and 57 radius observations, 12 shadow observations.

Document model version 2. Captured 2026-11-15T14:17:15.654Z.