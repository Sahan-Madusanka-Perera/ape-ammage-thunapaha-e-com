---
name: Ape Ammage Thunapaha
description: Amma's spice price board painted as a Kandyan temple mural, in horizontal registers on lime plaster.
colors:
  vermilion: "#a3291b"
  vermilion-deep: "#7a1d12"
  vermilion-bright: "#c03a21"
  ochre: "#d9a21b"
  ochre-deep: "#9a6d0b"
  ochre-pale: "#f1dc9a"
  ink: "#1c130e"
  ink-soft: "#54443a"
  plaster: "#eeebe3"
  plaster-deep: "#e2ddd1"
  lime: "#f8f6f1"
  leaf: "#4e5a38"
  leaf-pale: "#dfe3d2"
typography:
  display:
    fontFamily: "Gemunu Libre, Yaldevi, ui-sans-serif, sans-serif"
    fontSize: "clamp(3rem, 10.5vw, 5.5rem)"
    fontWeight: 700
    lineHeight: 0.98
  headline:
    fontFamily: "Gemunu Libre, Yaldevi, ui-sans-serif, sans-serif"
    fontSize: "clamp(2.4rem, 5vw, 3rem)"
    fontWeight: 700
    lineHeight: 1
  title:
    fontFamily: "Gemunu Libre, Yaldevi, ui-sans-serif, sans-serif"
    fontSize: "1.45rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Hanken Grotesk, Yaldevi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Hanken Grotesk, Yaldevi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 600
    lineHeight: 1.4
  price:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.98rem"
    fontWeight: 700
    lineHeight: 1.25
    fontFeature: "tnum, lnum"
rounded:
  hairline: "2px"
  pill: "9999px"
spacing:
  gutter-sm: "16px"
  gutter-md: "24px"
  gutter-lg: "32px"
  cell-gap: "6px"
  tap-min: "44px"
  cell-min: "48px"
  section-y: "64px"
  section-y-lg: "96px"
components:
  button-primary:
    backgroundColor: "{colors.vermilion}"
    textColor: "{colors.lime}"
    rounded: "{rounded.hairline}"
    padding: "11px 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.vermilion-bright}"
    textColor: "{colors.lime}"
  button-ochre:
    backgroundColor: "{colors.ochre}"
    textColor: "{colors.ink}"
    rounded: "{rounded.hairline}"
    padding: "11px 22px"
    height: "48px"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.lime}"
    rounded: "{rounded.hairline}"
    padding: "11px 22px"
    height: "48px"
  price-cell:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
    typography: "{typography.price}"
    rounded: "{rounded.hairline}"
    height: "48px"
  price-cell-hover:
    backgroundColor: "{colors.ochre-pale}"
  price-cell-added:
    backgroundColor: "{colors.ochre}"
    textColor: "{colors.ink}"
  size-option-active:
    backgroundColor: "{colors.ochre}"
    textColor: "{colors.ink}"
    rounded: "{rounded.hairline}"
    height: "72px"
  field:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
    rounded: "{rounded.hairline}"
    padding: "11px 14px"
    height: "48px"
  register-head:
    backgroundColor: "{colors.vermilion}"
    textColor: "{colors.lime}"
    typography: "{typography.headline}"
  count-badge:
    backgroundColor: "{colors.ochre}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
---

# Design System: Ape Ammage Thunapaha

## Overview

**Creative North Star: "Amma's Board, Painted on the Temple Wall"**

The whole storefront is one Kandyan mural read top to bottom. Each category is a horizontal register: a flat vermilion head, then rows of spices on lime plaster, each spice priced cell by cell exactly as Amma writes her board. Registers are separated by framed ornament bands (a brush-black rule, a liyawela vine or pala-peti petal or bead band, a fine rule), and ornament lives nowhere else. Every product is its own pigment field holding a pointed arch niche in which the spice is drawn in flat fills with a brush-black contour.

The world is flat paint, not photography and not glossy packaging. Depth comes from paint order (field, niche, contour), from brush-black outlines and from the bands that frame each register, with only soft ambient lift on things that float above the wall (sticky heads, the bag bar, hover). Density is that of a price board: many tappable prices visible at once, tabular figures, every price a 48px target. Sinhala and English sit side by side everywhere; Sinhala is never a translation tucked away.

The confirmed refusal from the direction: no dark-roast-and-gold hero over a photo grid. The admin surface lives in the same world in a restrained mode: plaster ground, ink rail, vermilion only for the active destination and the primary action.

**Key Characteristics:**
- Lime-plaster ground, vermilion register heads, yellow ochre for the active and the just-added, brush-black for every line.
- Horizontal registers framed by ornament bands; ornament only between registers.
- Pointed arch niche as the recurring vessel for spices and Amma's portrait.
- Each spice carries its own pigment as a field (data-driven, not a fixed token).
- Hairline 2px corners; ink rules at 1.5px and 3px.
- Condensed Gemunu Libre display over Hanken Grotesk and Yaldevi text; tabular prices.

## Colors

Mural pigments on lime plaster: one hot earth red, one yellow ochre, one green earth, brush-black line.

### Primary
- **Temple Vermilion** (vermilion): owns the hero register, every category register head, the primary button and focus of attention on links (underline decoration). Error text and invalid field borders also use it, since it is the board's red chalk.
- **Deep Vermilion** (vermilion-deep): the ground under the bead band beneath register heads, the 1px lip under the primary button, and the diamond separators between press names.
- **Lit Vermilion** (vermilion-bright): hover state of vermilion buttons only.

### Secondary
- **Yellow Ochre** (ochre): the active size, the just-added price cell, count badges, the "See the price list" button, text selection, the ground of the vine band in every RegisterRule, and the whole Story register.
- **Burnt Ochre** (ochre-deep): the default focus ring on plaster and lime, and the 1px lip under the ochre button.
- **Pale Ochre** (ochre-pale): secondary text on vermilion and ink (English names under Sinhala, size headers), the title band of the hero inscription strip, hover fill of price cells, and the default arch niche fill behind the portrait.

### Tertiary
- **Green Earth** (leaf): positive confirmation only: saving notes, "saved" messages, toggle on-state, confirmed status text. Also the stem colour in spice drawings.
- **Pale Green Earth** (leaf-pale): confirmed-status badge ground.

### Neutral
- **Brush Black** (ink): all text, all outlines and rules, the footer and admin rail grounds, the bag bar, the ink button. Translucent ink (15-28%) draws the hairline row dividers and resting field borders.
- **Soft Soot** (ink-soft): secondary text, hints, the "from" before prices.
- **Lime Plaster** (plaster): the page ground and the arch fill inside pack faces.
- **Shaded Plaster** (plaster-deep): out-of-stock cells, skeletons, quantity-stepper hover, toggle off-state.
- **Fresh Lime** (lime): the brightest surface: price cells, fields, sticky save bar, and text on vermilion and ink.

### Named Rules
**The Pigment Field Rule.** Each spice's colour comes from its own `pigment` value and fills its pack face; it never becomes a UI colour (buttons, text, borders) and the UI palette never paints a pack face.

**The Ochre Means Chosen Rule.** Yellow ochre fill marks what is active, selected or just added (active size, added cell, count, selection). Do not use ochre fill as decoration inside fields; the ochre button and the Story register are its only large expanses.

**The Ring Swap Rule.** Focus is a 2.5px burnt-ochre outline at 2px offset on light grounds; on vermilion and ink fields it becomes a lime outline with a 5px ink halo.

## Typography

**Display Font:** Gemunu Libre (with Yaldevi for any missing Sinhala, then sans-serif)
**Body Font:** Hanken Grotesk for Latin and figures, Yaldevi for Sinhala
**Label/Mono Font:** none distinct; labels are Hanken Grotesk semibold, prices Hanken Grotesk bold tabular.

**Character:** Gemunu Libre is a condensed Sri Lankan face drawn for Sinhala and Latin together, so the shop name and every product name read like hand-lettered board headings in both scripts. Hanken Grotesk is a quiet, sturdy text face whose tabular lining figures keep every price column aligned.

### Hierarchy
- **Display** (700, clamp(3rem, 10.5vw, 5.5rem), 0.98): the Sinhala shop name in the hero register only.
- **Headline** (700, 2.4rem to 3rem at sm, 1): section titles on plaster (Favourites, Price list, How to order, Story) and admin page titles (2.2rem to 2.6rem).
- **Title** (700, 1.25rem to 2rem, 1.1 to 1.25): register-head category names (1.7rem to 2rem), product names in tiles and rows (1.35rem to 1.45rem), checkout station and admin panel titles (1.55rem to 1.6rem), mobile menu links (1.25rem).
- **Body** (400, 1rem to 1.08rem, relaxed 1.625): leads and story paragraphs at max 62ch; step bodies at 34ch.
- **Label** (600, 0.85rem to 0.95rem): nav links, field labels, size headers, hints (hints at 0.88rem regular in ink-soft).
- **Price** (700, 0.98rem, tabular lining figures): every price on the board, in the bag bar and in totals.

### Named Rules
**The Two Scripts Rule.** Every name is set in both scripts: the visitor's language as the display line, the other as a smaller secondary line in ink-soft (or ochre-pale on vermilion), each tagged with its `lang`. Sinhala text runs at line-height 1.7.

**The Tabular Price Rule.** Every number that is a price, count, quantity or phone number uses tabular lining figures. Prices on the board are bare numerals; the "Rs" appears in labels, totals and the "from" line.

## Layout

The page is a stack of full-bleed registers whose content sits in a centred 80rem column (max-w-7xl) with gutters of 16px, 24px at sm and 32px at lg. Plaster sections breathe at 64px vertical (96px at lg); register heads are sticky under the 64px header so the category and the size column labels stay in view while scrolling a register.

A price row is a two-column grid at sm and up: name and pack thumbnail on the left, a fixed five-column price ladder (50g, 100g, 250g, 500g, 1kg) at min(30rem, 46%) on the right, cells 6px apart. On phones the row stacks and each cell carries its own size label because the column header is hidden. Missing sizes keep their column as a faint dashed slot so columns never shift.

The hero is a two-column register at lg (copy and the 5-cell inscription strip left, the arched portrait niche right, seated on the RegisterRule band); on phones the niche shrinks to a small arch beside the name. Grids elsewhere use explicit fractional columns (favourites 2 then 4 across; how-to steps divided by 1.5px ink rules into 3 columns at md). Every interactive target is at least 44px; board cells and fields are 48px.

The admin is phone-first: an ink bottom tab bar (68px, five destinations) on phones, an ink side rail at lg, and a sticky lime save bar above the tab bar on every form.

## Elevation & Depth

Depth is painted, not lit. Surfaces are flat at rest and separated by brush-black rules (1.5px between parts, 3px at the top of a band frame) and by colour fields. Drawn shapes get a brush contour from an SVG filter: the shape is dilated, nudged down-right and flooded with ink, so the outline reads thin at upper-left and swells at lower-right like a loaded brush. Shadows exist only as a soft ambient lift for things that float above the wall, always ink-tinted with a strongly negative spread so they read as a pool beneath, never a halo.

### Shadow Vocabulary
- **Register lift** (`box-shadow: 0 8px 16px -14px rgba(28,19,14,0.9)`): sticky register heads as content scrolls beneath.
- **Float** (`box-shadow: 0 10px 30px -10px rgba(28,19,14,0.7)`): the bag bar, the admin save bar, the open mobile menu, the hero inscription strip.
- **Tile hover** (`box-shadow: 0 18px 30px -18px rgba(28,19,14,0.55)` with a 4px rise): product tiles on hover.
- **Button lip** (`box-shadow: 0 1px 0 <deep tone>, 0 6px 16px -8px <deep tone at 60-70%>`): primary and ochre buttons; a 1px under-edge in the button's own deep tone plus a soft pool.

### Named Rules
**The Flat Wall Rule.** Anything painted on the wall (fields, niches, pack faces, rows) has no shadow. Only elements that stick, float or respond to hover lift.

## Shapes

Corners are nearly square: a 2px hairline radius on buttons, fields, price cells, size options, badges and nav items, so edges read as cut plaster rather than soft UI. Full circles are reserved for counts (bag count, order badge, numbered checkout stations) and the admin toggle.

The signature silhouette is the pointed arch (a 100 by 120 niche, sides rising to a gently pointed crown). It masks every product drawing and the portrait; inside a pack face it carries a faint half-opacity ink inner contour, and where it stands in a register (the hero, the story) it adds a heavy 3px ink outer contour and a 5px ink sill. Pack faces add a 1px inner frame in a mix of the pigment and its text colour, inset 6 to 8px.

Ornament bands are repeating SVG tiles: liyawela vine (26px tall in RegisterRule), pala-peti petals (16px, story register), bead-chain diamonds (10px, under register heads). Lines are brush-black at 1.1 to 1.6px; fills are vermilion or ochre.

## Components

### Buttons
Painted signboard plaques: square-cut, heavy-weight, decisive.
- **Shape:** hairline corners (2px), min height 48px, padding 11px by 22px, weight 650, 9px icon gap.
- **Primary:** vermilion with lime text and the vermilion-deep lip; the default action (add to bag, place order, save).
- **Ochre:** ochre with ink text, a 1.5px ink border and an ochre-deep lip; reserved for the hero's route into the price list.
- **Line:** transparent with a 1.5px border in the current text colour; hover tints 10% of that colour. Used for secondary actions on any ground (WhatsApp on the hero, cancel in admin).
- **Ink:** ink with lime text for heavy secondary actions on plaster.
- **States:** active presses down 1px; disabled drops to 55% opacity with a not-allowed cursor; transitions 160ms with the settle easing.

### Price Cell (signature)
One cell of Amma's board: tapping the price puts that size in the bag.
- **Plaster tone:** lime cell with a 1px ink ring at 15%, hover to ochre-pale with the ring at 40%.
- **Strip tone:** square lime cells divided by shared 1.5px ink rules inside the hero inscription strip (ink-outlined box, ochre-pale title band holding the product name and hint).
- **Added:** flashes ochre with a check and "Added" for 1.6s, while the bag count bumps.
- **Out of stock:** no button; small ink-soft text, shaded plaster in the strip.

### Size Ladder
Product-page size choice as a row of 72px tiles with size and tabular price. Active tile: ochre fill, 1.5px ink border. Idle: lime, ink border at 20%, 60% on hover. Unavailable: dashed border, transparent. Beside it, a 1.5px-bordered lime quantity stepper and a full-width primary add button showing the running total.

### Register Head
Sticky vermilion bar: category name in display bold lime, the other script in ochre-pale, size column labels right-aligned in ochre-pale tabular, and a bead-chain band (ochre diamonds on vermilion-deep) beneath. Uses the register lift.

### Pack Face
The product's own composition: its pigment field, an arched plaster niche, the spice drawn in flat fills with a brush contour (or Amma's photo once uploaded). On scroll the pigment rises into the pack from the bottom (clip-path, view timeline, entry 15% to cover 40%) where supported and motion is allowed; the resting state is the pigment mixed 72% toward plaster.

### Inputs / Fields
- **Style:** lime fill, 1.5px ink border at 28%, hairline corners, 48px min height, 16px text.
- **Hover / Focus:** border to 50% ink on hover; on focus the border goes full ink with a 3px ochre glow at 55%.
- **Error:** vermilion border plus a semibold vermilion message below; hints sit below in 0.88rem ink-soft. Selects carry an ink chevron.

### Navigation
- **Storefront header:** sticky 64px plaster bar with a 1.5px ink bottom rule; Sinhala wordmark in vermilion over the English name in ink-soft. Desktop links in 0.95rem medium ink-soft, ink and underlined on hover. Phones get a menu button opening a plaster panel of 48px display-bold links.
- **Bag:** bag icon with an ochre pill count that bumps (scale 1.18, 420ms settle) on each add; a floating ink bag bar follows the shopper with count, last item, subtotal and an ochre "View bag".
- **Admin:** ink rail at lg (active item vermilion fill, others lime at 75%); ink bottom tab bar on phones (active item ochre with a 3px ochre top bar).

### Checkout Stations
The checkout is numbered stations: each opens with a 1.5px ink top rule and a display title led by an ink circle holding a tabular lime numeral.

### Admin Panels and Status
Panels are sections under a 1.5px ink top rule with a display title. Status badges are hairline-cornered labels: new in ochre, confirmed in leaf on leaf-pale, dispatched in ink, delivered in shaded plaster, cancelled as struck-through vermilion text. Destructive actions confirm inline. Toggles are real checkboxes styled as a pill switch that turns leaf when on.

## Do's and Don'ts

### Do:
- **Do** build every catalogue category as a register: vermilion head, bead band, then rows on plaster.
- **Do** frame registers with a RegisterRule (3px ink, 26px ochre vine band with vermilion leaves, 1.5px ink) or a petal band, and keep ornament inside those bands.
- **Do** seat spices and the portrait in the pointed arch niche; add the heavy contour and sill only where the arch stands in a register.
- **Do** keep prices as tappable 48px cells with tabular figures in fixed size columns.
- **Do** use ochre fill for the active, selected or just-added state.
- **Do** swap the focus ring to lime with an ink halo on vermilion and ink grounds.
- **Do** set names in both scripts, tagged with `lang`, with Sinhala at line-height 1.7.
- **Do** honour reduced motion: the pigment rise only runs under no-preference and view-timeline support.

### Don't:
- **Don't** build a dark-roast-and-gold hero over a photo grid.
- **Don't** put ornament bands, vines or petals inside a field, a card or a pack face.
- **Don't** use a spice's pigment as a UI colour, or tint a pack face from the UI palette.
- **Don't** round corners beyond the 2px hairline except for counts and toggles.
- **Don't** add shadows to anything painted on the wall; lift is for sticky, floating and hovered elements only.
- **Don't** show a price in proportional figures or out of its size column.
