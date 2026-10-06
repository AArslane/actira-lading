# 02: Pricing section

Status: done
Type: task

## What

A new section between **Included** and the closing CTA. It follows the existing section shape:
`<section class="band pricing">` with a `.beam`, a `.field` chrome layer, a `.col`, a
`.section-head`, and one `.glass` card, like the other bands.

## Copy (draft, keep it this short)

- Headline: **One plan.**
- Body: Everything in Included. No setup fee. Month to month.
- Card:
  - Tag: **Founding client** · **2 spots remaining**
  - Price: ~~$1,000~~ **$500** /month
  - Line: Locked for life for the first two clients.
  - Line: From the third client: $1,000/month.
  - Primary button: the same chrome CTA as the hero, "Book a 15-minute audit", pointing at
    Cal.com (same attributes as ticket 01)
  - Second button: "Start your subscription" → `STRIPE_FOUNDING_LINK` (ticket 06). A plain
    outlined button, visibly a real button, next to or under the audit button.
  - Give the pricing section `id="pricing"`, so Arslane can send clients
    `getactira.com/#pricing` and they land on the pay button.

## Rules

- The struck price must read correctly to screen readers: wrap it as
  `<s><span class="sr-only">Regular price </span>$1,000</s>` and label the new price
  ("Founding price $500 per month"). `<s>` alone is not announced.
- "2 spots remaining" is a claim. Put it in one place in the HTML with a comment above it:
  `<!-- Update by hand when a founding client signs. At 0, switch to the $1,000 plan and link. -->`
- If ticket 06 isn't done yet, ship without the Stripe button rather than with a placeholder `href`.
- No countdown, no timer, no "only today". Brand voice is low-hype (`PRODUCT.md`).
- The flat look of the lead temperature chart is the reference: the price needs no chrome effect.
- Contrast ≥ 4.5:1 on all text, including the struck price.
- Readable with JavaScript off: no part of the price may depend on `site.js`.

## Done when

- The section appears between Included and the close at desktop and 375px, with no horizontal scroll
- The price, "2 spots remaining" and "for life" are readable with JavaScript disabled
- A screen reader (or the accessibility tree) reads "Regular price $1,000, Founding price $500 per month"
- `getactira.com/#pricing` scrolls to the card; the Stripe button opens the $500/month checkout

## Progress (2026-10-06)

Done: section, copy, `id="pricing"`, screen-reader price, spots comment, `.btn-line` style,
`style.css?v=8`. Checked at 375px (JS on and off) and 1280px: no horizontal scroll; the price
reads "Regular price $1,000, Founding price $500 per month".

Left open, waiting on ticket 06: in `index.html`, replace the HTML comment under the audit
button in `.plan-actions` with
`<a class="btn-line" href="STRIPE_FOUNDING_LINK">Start your subscription</a>`.
The style is already in `style.css`.

Stripe button added with the live link from ticket 06; it opens a $500.00 USD/month
subscription checkout ("Actira Lead Recovery — Founder").
