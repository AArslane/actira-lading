# Spec: pricing, Cal.com booking, privacy and terms

Status: ready-for-agent
Date: 2026-10-06

## Goal

A med spa owner reading getactira.com on a phone can see the price, book an audit without
leaving the page, and find a privacy policy and terms. Read `PRODUCT.md` first: the brand rules,
the banned list and "readable with JavaScript disabled" all still apply.

## Decisions (made by Arslane, 2026-10-06)

| Topic | Decision |
|---|---|
| Standard price | $1,000/month, from the third client on |
| Founding price | $500/month **for life** for the first 2 clients |
| Spots shown | "2 spots remaining", updated by hand when a client signs |
| Setup fee | None |
| Contract | Month to month, no contract |
| Booking | Cal.com `getactira/30min` replaces Calendly on all three CTAs, as a pop-up. Copy stays "15-minute audit" (30 min is a buffer) |
| Payment | A Stripe Payment Link button on the pricing card; `getactira.com/#pricing` is the link sent to clients |
| Legal pages | `/privacy` and `/terms`, in English only. No French version |
| Publisher address | `123 rue de la pomme, Paris, France` (placeholder, see Open items) |
| SIRET | Left out for now |

## Out of scope

- Merging the Flow section into Included (suggested, not decided)
- A founder section with name and photo (suggested, not decided)
- Self-hosting the Geist font (see Later)

## Tickets

| # | Ticket | Blocked by |
|---|---|---|
| 01 | [Cal.com pop-up on the three CTAs](issues/01-calcom-popup.md) | none |
| 02 | [Pricing section](issues/02-pricing-section.md) | none (Stripe link added once 06 is done) |
| 03 | [Privacy page](issues/03-privacy-page.md) | none |
| 04 | [Terms page](issues/04-terms-page.md) | 02 |
| 05 | [Footer links, PRODUCT.md, cache bump, final check](issues/05-wire-up-and-verify.md) | 01, 02, 03, 04, 06 |
| 06 | [Create the Stripe Payment Link](issues/06-stripe-payment-link.md) (Arslane, in Stripe) | none |

## Open items

Defaults below go into `/terms` as written; Arslane revisits them after the first two clients.

1. **For life:** the $500 holds while the subscription stays active without a break.
2. **SMS and phone-number fees:** terms say "billed at cost if any"; confirm later.
3. **Cancellation:** anytime by email, effective at the end of the billing month.
4. **Address:** `123 rue de la pomme` is a placeholder; replace when ready.

## Later

- Self-host Geist instead of loading it from Google Fonts (trigger: next time the privacy page
  is edited). Removes Google from the list of services that see a visitor's IP.
- Add the SIRET to `/terms` and `/privacy` (trigger: when you have it).
