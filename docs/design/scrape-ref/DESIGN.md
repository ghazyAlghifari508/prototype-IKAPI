# Midtrans | Solusi Payment Gateway Indonesia Terlengkap - Style Reference

## Overview & Capture Confidence

**Source:** https://midtrans.com/ · captured 2026-11-13T10:24:09.725Z
**Requested scope:** viewport desktop; theme auto; focus complete; depth standard; code reference both.
**Analysis status:** 250 visible elements measured across 1 capture; AI synthesis unavailable, so this is a measurement-only document.

The AI synthesis step did not produce a narrative for this capture. AI synthesis is unavailable or did not run. Available measurements remain usable within the capture scope, not a complete website specification.

**Verified contexts:** Desktop 1440x900 (light).
**Not verified:** a second viewport — only 1440x900 was measured, so no responsive rule is established; interaction states (hover, focus, disabled) and content outside the sampled elements.

## AI Agent Implementation Guide

**Quick reference**
- text: `#000000`
- surface: `#ffffff`
- action fill: `#d2eaff`
- primary action: not measured
- base spacing unit: not measured

**Design brief**

### Visual direction

- light appearance; surfaces around `#ffffff`; text in `#000000`; actions in `#d2eaff`; type set in Poppins-Regular.

### Typography hierarchy

- Families: Poppins-Regular, Poppins-Medium, Poppins-Bold, Poppins-Semibold, Poppins-SemiBold.
- Measured steps (largest first): Large heading 32px/52.16px · 400; Heading 25px/normal · 400; Subheading 20px/normal · 400; Body large 20px/36px · 400; Body 16px/normal · 400.
- Keep this size order; do not flatten display and body into a single step.

### Color roles

- Primary / brand: `#d2eaff` (Action accent; inferred).
- Text: `#0000ee` (Text; role unproven); `#000000` (Base text; role unproven); `#7686ab` (Text; role unproven); `rgba(255, 255, 255, 0.46)` (Text; role unproven); `#123049` (Text; role unproven); `#232f51` (Text; role unproven); `#8f8e98` (Text; role unproven).
- Surface: `#ffffff` (Text and surface; inferred); `#054fbf` (Text and surface; role unproven); `#002855` (Surface; role unproven); `#f7fcff` (Surface; role unproven).
- Assign colour by role; a measured value whose role the capture did not prove is not a palette decision.

### Surfaces & elevation

- Surfaces: `#ffffff` (element, canvas).
- Elevation: `rgba(45, 50, 55, 0.06) 0px 10px 20px 0px` (element).

### Spacing & shapes

- Measured spacing: `10px 15px` (Measured spacing); `-25px 0px 24px` (Measured spacing); `0px 10px 20px 0px` (Measured spacing); `0px 10px` (Measured spacing); `0px 0px 5px` (Measured spacing).
- Radius by component: buttons `0px`; element `15px`; element `22px`.
- Measured once, so scoped evidence rather than a shared rule: buttons `24px 24px 0px 0px`.
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

**Theme:** light

### Colors & Semantic Roles

| Semantic Role | Value | Confidence |
| --- | --- | --- |
| Text and surface | #ffffff | inferred |
| Text | #0000ee | unknown |
| Base text | #000000 | unknown |
| Text | #7686ab | unknown |
| Text | rgba(255, 255, 255, 0.46) | unknown |
| Text and surface | #054fbf | unknown |
| Text | #123049 | unknown |
| Text | #232f51 | unknown |
| Text | #8f8e98 | unknown |
| Surface | #002855 | unknown |
| Action accent | #d2eaff | inferred |
| Surface | #f7fcff | unknown |

### Typography Scale

| Role | Family | Size | Weight | Line height | Letter spacing |
| --- | --- | --- | --- | --- | --- |
| Large heading | Poppins-Bold | 32px | 400 | 52.16px | normal |
| Heading | Poppins-Bold | 25px | 400 | normal | normal |
| Subheading | Poppins-Semibold | 20px | 400 | normal | normal |
| Body large | Poppins-Medium | 20px | 400 | 36px | normal |
| Body | Poppins-Regular | 16px | 400 | normal | normal |
| Body small | Poppins-Regular | 14px | 400 | normal | normal |
| Caption | Poppins-Medium | 12px | 400 | 18px | normal |

### Fonts & Type Faces

**Poppins-Regular**
- Roles: Body, Body small, Caption
- Weights: 400
- Sizes: 16px, 14px, 12px, 10px
- Line heights: normal, 24px, 21px, 18px, 35.98px
- Letter spacing: normal, 0.5px
- CSS stack: `Poppins-Regular`
- Font loading evidence: normal loaded

**Poppins-Medium**
- Roles: Subheading, Body large, Body, Caption
- Weights: 400
- Sizes: 20px, 16px, 12px
- Line heights: normal, 24px, 36px, 18px, 50px
- Letter spacing: normal
- CSS stack: `Poppins-Medium`
- Font loading evidence: normal loaded

**Poppins-Bold**
- Roles: Large heading, Heading
- Weights: 400
- Sizes: 32px, 25px
- Line heights: 48px, 52.16px, normal
- Letter spacing: normal
- CSS stack: `Poppins-Bold`
- Font loading evidence: normal loaded

**Poppins-Semibold**
- Roles: Subheading, Body
- Weights: 400
- Sizes: 20px, 16px
- Line heights: normal
- Letter spacing: normal
- CSS stack: `Poppins-Semibold`
- Uncertainty: No declared font resource for this family reported a loaded state, so the glyph font is not confirmed.

**Poppins-SemiBold**
- Roles: Body small
- Weights: 400
- Sizes: 14px
- Line heights: normal
- Letter spacing: normal
- CSS stack: `Poppins-SemiBold`
- Font loading evidence: normal loaded

### Spacing & Shapes

| Purpose | Property | Value | Measured on | On scale |
| --- | --- | --- | --- | --- |
| Measured spacing | padding | `10px 15px` | 71 | no |
| Measured spacing | margin | `-25px 0px 24px` | 11 | no |
| Measured spacing | margin | `0px 10px 20px 0px` | 11 | no |
| Measured spacing | padding | `0px 10px` | 11 | no |
| Measured spacing | margin | `0px 0px 5px` | 11 | no |
| Measured spacing | padding | `0px 0px 0px 26px` | 8 | no |
| Measured spacing | margin | `0px 20px 0px 0px` | 6 | no |
| Measured spacing | padding | `36px 30px 36px 0px` | 5 | no |
| Measured spacing | margin | `0px 0px 24px` | 5 | no |
| Action padding | padding | `18px 50px 18px 28px` | 4 | no |
| Measured spacing | margin | `0px 0px 20px` | 4 | no |
| Measured spacing | margin | `0px 0px 8px` | 4 | no |
| Measured spacing | padding | `12px 24px` | 3 | no |
| Measured spacing | margin | `0px 0px 0px 32px` | 2 | no |
| Measured spacing | margin | `0px 0px 32px` | 2 | no |
| Measured spacing | margin | `0px 0px 15px` | 2 | no |
| Measured spacing | margin | `0px 0px 60px` | 1 | no |
| Measured spacing | margin | `0px 0px 55px` | 1 | no |
| Measured spacing | margin | `0px 14px 50px 0px` | 1 | no |
| Measured spacing | margin | `0px 0px 40px` | 1 | no |
| Measured spacing | margin | `0px 0px 33px` | 1 | no |
| Measured spacing | margin | `0px 0px 28px` | 1 | no |

| Context | Value | Captured in | Measured on |
| --- | --- | --- | --- |
| Buttons | `0px` | single capture | 3 |
| Buttons | `24px 24px 0px 0px` | single capture | 1 |
| Measured radius | `15px` | single capture | 71 |
| Measured radius | `22px` | single capture | 2 |

### Surfaces

| Value | Roles | Measured on |
| --- | --- | --- |
| `#ffffff` | element, canvas | 72 |

### Elevation

| Shadow | Roles | Measured on | Notes |
| --- | --- | --- | --- |
| `rgba(45, 50, 55, 0.06) 0px 10px 20px 0px` | element | 71 | Repeated across 71 measured elements. Structure: blur 20px. |

## Component Specifications

**Applies to every measured component:**
- Do not copy the reference site's text, links, images, or brand assets as product content.

### Body copy

**Purpose:** Body copy.

**Base style**
- Corner radius: 0px
- Padding: 0px
- Gap: normal

**Variant 1** (12 measured samples):
- Typography: Poppins-Regular · 14px · normal
- Text color: rgb(255, 255, 255)
- Margin: 0px

**Variant 2** (11 measured samples):
- Typography: Poppins-Regular · 16px · normal
- Text color: rgb(118, 134, 171)
- Margin: -25px 0px 24px

**Variant 3** (5 measured samples):
- Typography: Poppins-Regular · 16px · normal
- Text color: rgb(118, 134, 171)
- Margin: 0px 0px 24px

**Variant 4** (2 measured samples):
- Typography: Poppins-Regular · 16px · normal
- Line height: 24px
- Text color: rgb(118, 134, 171)
- Margin: 0px 0px 20px

**Variant 5** (2 measured samples):
- Typography: Poppins-Regular · 12px · normal
- Line height: 18px
- Text color: rgb(143, 142, 152)
- Margin: 0px 0px 20px

**Variant 6** (1 measured sample):
- Typography: Poppins-Regular · 16px · normal
- Line height: 24px
- Text color: rgb(255, 255, 255)
- Margin: 0px 0px 40px

Unseen variants, interaction states, and intermediate breakpoints are not established by this capture.

**Evidence:** Measured on 35 body elements; 8 distinct measured treatments. Role inferred from DOM.

**Notes**
- Apply these measured values only to components that match this class and capture scope.

### Subheading

**Purpose:** Subheading within a section.

**Base style**
- Corner radius: 0px
- Gap: normal

**Variant 1** (8 measured samples):
- Typography: Poppins-Semibold · 20px · normal
- Text color: rgb(18, 48, 73)
- Padding: 0px 0px 0px 26px
- Margin: 0px

**Variant 2** (4 measured samples):
- Typography: Poppins-Medium · 16px · normal
- Line height: 24px
- Text color: rgb(18, 48, 73)
- Padding: 0px
- Margin: 0px 0px 8px

**Variant 3** (2 measured samples):
- Typography: Poppins-Bold · 12px · normal
- Line height: 19.56px
- Text color: rgb(143, 142, 152)
- Padding: 0px
- Margin: 0px 0px 15px

**Variant 4** (1 measured sample):
- Typography: Poppins-Bold · 25px · normal
- Layout: inline-block
- Text color: rgb(255, 255, 255)
- Padding: 0px
- Margin: 0px 14px 50px 0px

Unseen variants, interaction states, and intermediate breakpoints are not established by this capture.

**Evidence:** Measured on 15 h3 elements; 4 distinct measured treatments. Role inferred from DOM.

**Notes**
- Apply these measured values only to components that match this class and capture scope.

### Section heading

**Purpose:** Section heading.

**Base style**
- Corner radius: 0px
- Padding: 0px
- Gap: normal

**Variant 1** (2 measured samples):
- Typography: Poppins-Bold · 32px · normal
- Line height: 52.16px
- Text color: rgb(18, 48, 73)
- Margin: 0px 0px 32px

**Variant 2** (1 measured sample):
- Typography: Poppins-Bold · 32px · normal
- Line height: 52.16px
- Text color: rgb(18, 48, 73)
- Margin: 0px 0px 60px

**Variant 3** (1 measured sample):
- Typography: Poppins-Bold · 32px · normal
- Line height: 52.16px
- Text color: rgb(18, 48, 73)
- Margin: 0px 0px 55px

**Variant 4** (1 measured sample):
- Typography: Poppins-Bold · 32px · normal
- Line height: 52.16px
- Text color: rgb(255, 255, 255)
- Margin: 0px

**Variant 5** (1 measured sample):
- Typography: Poppins-Bold · 16px · normal
- Text color: rgb(0, 0, 0)
- Margin: 0px

Unseen variants, interaction states, and intermediate breakpoints are not established by this capture.

**Evidence:** Measured on 6 h2 elements; 5 distinct measured treatments. Role inferred from DOM.

**Notes**
- Apply these measured values only to components that match this class and capture scope.

### Buttons and CTAs

**Purpose:** Action controls, such as buttons and calls to action.

**Base style**
- Typography: Poppins-Medium · 20px · normal
- Line height: 36px
- Layout: inline-block
- Text color: rgb(35, 47, 81)
- Padding: 18px 50px 18px 28px
- Gap: normal
- Margin: 0px

**Variant 1** (3 measured samples):
- Corner radius: 0px

**Variant 2** (1 measured sample):
- Background: rgb(210, 234, 255)
- Corner radius: 24px 24px 0px 0px

Unseen variants, interaction states, and intermediate breakpoints are not established by this capture.

**Evidence:** Measured on 4 cta elements; 2 distinct measured treatments. Role inferred from DOM.

**Notes**
- Apply these measured values only to components that match this class and capture scope.

### Hero heading

**Purpose:** Lead hero heading.

**Base style**
- Typography: Poppins-Bold · 32px · normal
- Line height: 48px
- Text color: rgb(255, 255, 255)
- Corner radius: 0px
- Padding: 0px
- Gap: normal
- Margin: 0px 0px 28px

This is a single measured observation, not a repeated pattern; it applies to the cited sample only and supports no shared rule.

**Evidence:** Measured on 1 h1 element; 1 distinct measured treatment. Role inferred from DOM.

**Notes**
- Apply this recipe only to the measured sample; do not treat it as a shared rule.


## Do's & Don'ts

### DON'T
- Do not introduce a font family outside the measured set (Poppins-Regular, Poppins-Medium, Poppins-Bold, Poppins-Semibold, Poppins-SemiBold). _(evidence: 5 families were measured on rendered text.)_

## CSS / Tailwind Reference

### CSS Custom Properties

Generated from validated measurements. These are implementation aliases derived from the capture, not declarations copied from the website's own stylesheet. A role name comes from a usage the capture proved; a `measured` name marks a value whose role the capture could not establish, and browser-default colours are listed as evidence only.

```css
:root {

  /* Colors */
  --color-text-and-surface: #ffffff;
  --color-measured-0000ee: #0000ee;
  --color-measured-000000: #000000;
  --color-measured-7686ab: #7686ab;
  --color-measured-rgba-255-255-255-0-46: rgba(255, 255, 255, 0.46);
  --color-measured-054fbf: #054fbf;
  --color-measured-123049: #123049;
  --color-measured-232f51: #232f51;
  --color-measured-8f8e98: #8f8e98;
  --color-measured-002855: #002855;
  --color-action-accent: #d2eaff;
  --color-measured-f7fcff: #f7fcff;

  /* Font families */
  --font-poppins-regular: Poppins-Regular;
  --font-poppins-medium: Poppins-Medium;
  --font-poppins-bold: Poppins-Bold;
  --font-poppins-semibold: Poppins-Semibold;
  --font-poppins-semibold-2: Poppins-SemiBold;

  /* Type scale */
  --text-large-heading: 32px;
  --leading-large-heading: 52.16px;
  --text-heading: 25px;
  --text-subheading: 20px;
  --text-body-large: 20px;
  --leading-body-large: 36px;
  --text-body: 16px;
  --text-body-small: 14px;
  --text-caption: 12px;
  --leading-caption: 18px;

  /* Radius */
  --radius-buttons: 0px;
  --radius-element: 15px;
  --radius-element-2: 22px;
}
```

### Tailwind v4

```css
@theme {

  /* Colors */
  --color-text-and-surface: #ffffff;
  --color-measured-0000ee: #0000ee;
  --color-measured-000000: #000000;
  --color-measured-7686ab: #7686ab;
  --color-measured-rgba-255-255-255-0-46: rgba(255, 255, 255, 0.46);
  --color-measured-054fbf: #054fbf;
  --color-measured-123049: #123049;
  --color-measured-232f51: #232f51;
  --color-measured-8f8e98: #8f8e98;
  --color-measured-002855: #002855;
  --color-action-accent: #d2eaff;
  --color-measured-f7fcff: #f7fcff;

  /* Font families */
  --font-poppins-regular: Poppins-Regular;
  --font-poppins-medium: Poppins-Medium;
  --font-poppins-bold: Poppins-Bold;
  --font-poppins-semibold: Poppins-Semibold;
  --font-poppins-semibold-2: Poppins-SemiBold;

  /* Type scale */
  --text-large-heading: 32px;
  --leading-large-heading: 52.16px;
  --text-heading: 25px;
  --text-subheading: 20px;
  --text-body-large: 20px;
  --leading-body-large: 36px;
  --text-body: 16px;
  --text-body-small: 14px;
  --text-caption: 12px;
  --leading-caption: 18px;

  /* Radius */
  --radius-buttons: 0px;
  --radius-element: 15px;
  --radius-element-2: 22px;
}
```

## Coverage & Important Limitations

Measurements are observed; semantic classifications are inferred from measured usage. Missing evidence is reported as unknown rather than estimated.
- Only selected viewport sizes are measured; intermediate widths and interaction states are not verified.
- Computed font-family is a stack; selected glyph font is not verified.
- Pseudo-elements, third-party overlays and glyph-level font selection are not verified.
- Only the sampled portion of the DOM was measured; content beyond the sampling limit may contain styles this document does not describe.
- Theme capture sets only the browser prefers-color-scheme preference. Site theme controls, cookies and stored preferences are not changed; a requested scheme does not prove site support.
- Conflicting CTA radius measurements: capture 1: 1440x900, auto: 24px 24px 0px 0px, 0px. No shared button radius rule is established for this capture.
- Load status of 6 declared font resources was not verified, so the font actually used for glyphs is not confirmed.
- 1 observed component class measured more distinct treatments than the document lists, so the remaining treatments are omitted rather than summarised.
- Only a single surface colour was measured, so a surface stack cannot be established from this capture.

**Coverage:** 250 visible elements sampled from 328 colour observations (12 distinct values), 7 type styles, 166 spacing and 77 radius observations, 71 shadow observations.

Document model version 2. Captured 2026-11-13T10:24:09.725Z.