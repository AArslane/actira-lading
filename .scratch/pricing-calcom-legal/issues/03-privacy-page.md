# 03: Privacy page

Status: ready-for-agent
Type: task

## What

`privacy.html` at the repo root. `vercel.json` has `cleanUrls: true`, so it is served at
`/privacy`. English only.

Layout: the same `<header class="nav">` and `<footer class="footer">` as `index.html`, then one
plain reading column. No WebGL chrome field and no `site.js` on this page. Add a small `.legal`
block to `style.css` for headings, paragraphs and lists (max width ~680px, `--dim` body text).
Set `<link rel="canonical" href="https://getactira.com/privacy">`.

## Sections

1. **Who we are.** Actira, 123 rue de la pomme, Paris, France. hello@getactira.com.
   (SIRET to be added later; leave no empty field.)
2. **What this site collects.** No cookies, no analytics, no tracking pixels. The site itself
   stores nothing about visitors.
3. **Services that see your data.**
   - Vercel Inc. (hosting): standard server logs, including IP address and browser
   - Google Fonts: your IP address when the font loads
   - Cal.com: the details you give when booking (name, email, any answers), under Cal.com's
     own privacy policy, linked
   - Stripe: payment and billing details when a client subscribes, under Stripe's own privacy
     policy, linked. Card details go to Stripe only; Actira never sees them
   - Email: what you send to hello@getactira.com
4. **Why, and on what basis.** To answer you and run the call you booked: steps taken at your
   request before a contract, and legitimate interest (GDPR art. 6(1)(b) and (f)).
5. **How long.** Booking and email data deleted 12 months after the last contact if no client
   relationship follows. (Proposed default; confirm.)
6. **Client data.** Data about a client's leads and patients, processed to deliver the service,
   is covered by the client agreement, where Actira acts as a processor. One sentence; no detail here.
7. **Your rights.** Access, correction, deletion, objection, portability: email
   hello@getactira.com. Right to complain to the CNIL (cnil.fr).
8. **Changes.** "Last updated: <date>" at the top.

## Done when

- `/privacy` loads on the local server and on a Vercel preview, at desktop and 375px
- Every service the page loads is listed in section 3. Check by opening the Network tab on
  `index.html` and matching each outside domain to a line
- The page reads fully with JavaScript disabled
