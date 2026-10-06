# 01: Cal.com pop-up on the three CTAs

Status: done
Type: task

## Event

`https://cal.com/getactira/30min`, so `<user>/<event>` below is `getactira/30min`. The page
keeps saying "15-minute audit": the 30-minute slot is a deliberate buffer. Don't change the copy.

## What

Replace `https://calendly.com/actira` with the Cal.com event on all three CTAs, and open the
booking as a pop-up over the page.

The three CTAs in `index.html`:
- the nav link "Book a call" (line ~58)
- the hero button "Book a 15-minute audit" (line ~78)
- the closing button "Book a 15-minute audit" (line ~261)
- the pricing card button "Book a 15-minute audit" (`.plan-actions`, added by ticket 02): it already
  has the Cal.com `href`, `data-cal-link` and `data-cal-config`; it still needs `data-cal-namespace`

## How

1. In Cal.com: Event Types → the 15-min event → Embed → **Element click** → HTML. Copy the
   generated loader script and note the `calLink` (e.g. `username/15min`) and the namespace.
2. Paste the loader script into `index.html`, before `</body>`.
3. On each CTA:
   - keep a real `href` to the full Cal.com URL (`https://cal.com/<user>/<event>`), so the link
     still works with JavaScript off
   - add `data-cal-link="<user>/<event>"`, `data-cal-namespace="<namespace>"` and
     `data-cal-config='{"layout":"month_view","theme":"dark"}'`
4. In the loader's `ui` call, set the dark theme and a neutral brand color that matches the
   page (silver or white on near-black). No blue, no purple (see `PRODUCT.md`, banned list).

## Done when

- Clicking any of the three CTAs opens the Cal.com pop-up, on desktop and at 375px wide
- With JavaScript disabled, each CTA opens the Cal.com page in the same tab
- No `calendly` left anywhere: `grep -ri calendly .` returns only this `.scratch/` folder
- The test booking shows up in your Cal.com bookings (then cancel it)

## Comments

2026-10-06: done. Namespace `30min`, loader from Cal.com's own snippet source. Cal's
element-click handler opens the pop-up but does not cancel an `<a>`'s navigation, so a small
click listener in `index.html` cancels it once `Cal.instance` exists; before that (or if embed.js
is blocked) the plain link books. All four CTAs checked: pop-up opens, page stays.
