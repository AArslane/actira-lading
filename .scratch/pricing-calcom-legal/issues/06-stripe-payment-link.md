# 06: Create the Stripe Payment Link

Status: done
Type: task

Done in the Stripe dashboard by Arslane. The page only needs the resulting URL (ticket 02).

## Steps

1. Product: "Actira follow-up system, founding client". Price: $500, recurring, monthly, USD.
2. Create a Payment Link for that price. Collect business name and phone at checkout.
3. Optional: in Stripe settings → Public details, set the terms URL to
   `https://getactira.com/terms` and tick "require customers to accept your terms".
4. Paste the live URL into ticket 02 as `STRIPE_FOUNDING_LINK`.

When both founding spots are taken: make a $1,000/month link and swap it in.

## Done when

- The live link opens a $500/month checkout

Done 2026-10-06: `https://buy.stripe.com/28EfZg90ReT516Y71e1Fe00`, $500.00 USD/month.
The checkout header shows the Stripe public business name "Arslane.A", not "Actira".
