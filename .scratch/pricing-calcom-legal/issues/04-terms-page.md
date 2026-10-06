# 04: Terms page

Status: done
Type: task
Blocked by: 02

## What

`terms.html` at the repo root, served at `/terms`. Same layout and `.legal` styles as ticket 03.
English only. Canonical `https://getactira.com/terms`.

## Sections

1. **Provider.** Actira, 123 rue de la pomme, Paris, France. hello@getactira.com.
   Hosted by Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA (check against vercel.com/legal before publishing).
2. **The service.** The lead-to-booking follow-up system described on the home page: instant
   reply, follow-up sequences, missed-call recovery, consultation booking, reminders, no-show
   and dormant-lead reactivation.
3. **Price.** $1,000/month. The first two clients pay $500/month for life: the price holds
   while the subscription stays active without a break. No setup fee. Prices exclude taxes.
   **Must match ticket 02 word for word on the numbers.**
4. **Billing and cancellation.** Billed monthly in advance through Stripe; subscribing through
   the Stripe checkout means accepting these terms. No minimum term. Cancel anytime by
   email; cancellation takes effect at the end of the current billing month. (Default,
   spec open item 3.)
5. **Third-party costs.** SMS, phone number and carrier fees, if any, are billed at cost.
6. **Client responsibilities.** The client confirms it has consent to contact its leads by
   SMS and email, as required by US law (TCPA, CAN-SPAM), and provides accurate business
   hours, services and booking rules.
7. **No guaranteed results.** Actira handles follow-up; it does not guarantee a number of
   bookings, consultations or revenue.
8. **Liability.** Capped at the fees paid in the last 3 months.
9. **Law.** French law; courts of Paris.
10. **Changes.** Notice by email 30 days before a change applies. "Last updated: <date>".

## Done when

- `/terms` loads at desktop and 375px, readable with JavaScript off
- The prices in `/terms` and in the pricing section on `/` are identical


## Comments

2026-10-06: done. Vercel address checked against vercel.com/legal/privacy-policy. Prices match
the pricing section ($1,000/month, $500/month).
