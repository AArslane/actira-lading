# 05: Footer links, PRODUCT.md, cache bump, final check

Status: ready-for-agent
Type: task
Blocked by: 01, 02, 03, 04, 06

## What

1. **Footer.** On `index.html`, `privacy.html` and `terms.html`, add "Privacy" and "Terms"
   links next to the email, using the existing `.footer-link` class.
2. **Cache bump.** Change `style.css?v=7` and `site.js?v=7` to `?v=8` everywhere they appear.
   `vercel.json` caches assets, and the version number is what makes browsers fetch the new file.
3. **PRODUCT.md.** Update:
   - Product Purpose: "Target: 3 clients at ~$350/month" becomes the $1,000 standard /
     $500-for-life founding price for 2 clients
   - Capabilities and Constraints: "Primary CTA: Calendly `calendly.com/actira`" becomes the
     Cal.com link, opened as a pop-up with a plain-link fallback
   - Add: legal pages live at `/privacy` and `/terms`, English only
4. **JSON-LD** in `index.html`: leave the Organization block as it is. No price markup.

## Final check (run locally, then on the Vercel preview)

Serve the folder with clean URLs (`npx serve .`; a plain file open won't resolve `/privacy`).

- [ ] `/`, `/privacy`, `/terms` load at desktop and 375px, no horizontal scroll
- [ ] All CTAs open the Cal.com pop-up; with JS off they open the Cal.com page
- [ ] `grep -ri calendly . --exclude-dir=.scratch` returns nothing
- [ ] Prices match in the pricing section, `/terms`, `PRODUCT.md` and the Stripe checkout
- [ ] `/#pricing` lands on the card and the Stripe button opens the $500/month checkout
- [ ] Network tab: every outside domain is listed on `/privacy`
- [ ] `prefers-reduced-motion` still respected; contrast ≥ 4.5:1 on the new text
- [ ] `.vercelignore` still keeps `.scratch/` off the live site: after deploy,
      `getactira.com/.scratch/pricing-calcom-legal/spec.md` returns 404
