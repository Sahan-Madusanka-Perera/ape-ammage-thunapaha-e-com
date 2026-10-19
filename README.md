# අපෙ අම්මගේ තුනපහ · Ape Ammage Thunapaha

Online shop and admin panel for Amma's homemade spices from Madampe.

- **Storefront**: English at `/`, Sinhala at `/si`. Price list with one-tap sizes, bag, checkout (cash on delivery, bank transfer with slip upload, or order on WhatsApp), order status pages, and order tracking.
- **Admin** (`/admin`): phone-first and Sinhala by default. The owner manages orders, products and prices, delivery charges, payment methods, and shop details.

Stack: Next.js 16 (App Router, Cache Components), Prisma 7, PostgreSQL, Tailwind CSS 4.

## Run it locally

You need Node 20+ and PostgreSQL.

```bash
cp .env.example .env        # then fill in DATABASE_URL, SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run db:migrate          # creates the tables
npm run db:seed             # loads the 21 products from data/products.json, settings, and the admin account
npm run dev                 # http://localhost:3000, admin at http://localhost:3000/admin
```

The seed is safe to re-run. It updates the catalogue from `data/products.json`, but it never overwrites settings or passwords the owner has already changed.

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck`, `npm run lint` | Checks |
| `npm run db:migrate` | Create or apply migrations in development |
| `npm run db:deploy` | Apply migrations in production |
| `npm run db:seed` | Seed catalogue, settings and the first admin |
| `npm run db:studio` | Browse the database |

## How it fits together

| Area | Where |
|---|---|
| Storefront pages | `src/app/[lang]/…`. The proxy (`src/proxy.ts`) serves English at the root and Sinhala under `/si`. |
| Admin pages and actions | `src/app/admin/…`. Every action re-checks the session. |
| Catalogue and settings reads | `src/lib/server/catalog.ts`. Cached with `"use cache"` and refreshed instantly when the admin saves (`updateTag`). |
| Orders | `src/lib/server/orders.ts`. Prices and delivery are recalculated on the server; the browser's bag is never trusted. |
| Delivery pricing | `src/lib/delivery.ts`: first kilo + each extra kilo, optional free-delivery threshold, optional per-district rates. |
| Uploads (product photos, bank slips, Amma's portrait) | Stored in Postgres (`Upload` table) and served from `/files/[id]`, so the shop needs no separate file storage. Bank slips are visible only to the admin or the customer's order link. |
| Copy | `src/lib/i18n.ts` (shop) and `src/lib/admin-i18n.ts` (admin), English and Sinhala side by side. |
| Look and feel | `src/app/globals.css` (tokens), `src/components/art.tsx` (border bands, arch niche, spice drawings), `src/components/pack-face.tsx`. See `PRODUCT.md`. |

## Admin, day to day

1. **Orders** (`ඇණවුම්`): new orders and uploaded bank slips appear under *To do*. Open an order, call or WhatsApp the customer, then use the one big button to move it along: Confirm → Dispatched (add the courier tracking number) → Delivered. A delivered cash-on-delivery order is marked paid automatically.
2. **Products** (`භාණ්ඩ`): tap the green *On sale* switch to hide or show a spice. Open a product to change names, prices per size, stock per size, pack colour, drawing or photo.
3. **Delivery** (`බෙදාහැරීම`): first-kilo charge, each extra kilo, free delivery threshold, and optional district rates.
4. **Payments** (`ගෙවීම්`): turn cash on delivery, bank transfer and WhatsApp ordering on or off. Bank transfer only appears at checkout once the account name and number are filled in.
5. **Settings** (`සැකසුම්`): phone, address, a banner announcement, Amma's photo, and the admin password.

## Before going live

- [ ] **Bank details**: add them in Admin → Payments, or bank transfer stays hidden.
- [ ] **Delivery charges**: the seeded Rs 400 first kilo / Rs 100 per extra kilo are placeholders.
- [ ] **Phone numbers**: WhatsApp is set to 071 275 3307 (new) and calls to 071 433 6739. Check both in Admin → Payments and Settings.
- [ ] **Amma's photo**: upload a portrait in Admin → Settings. Until then the home page shows a drawn spice still-life.
- [ ] **Product photos** (optional): each product shows its drawn pack face until a photo is uploaded.
- [ ] **Sinhala copy**: have a native speaker read `src/lib/i18n.ts`, `src/lib/admin-i18n.ts` and the product descriptions in `prisma/seed.ts`.
- [ ] **Sinhala address**: currently the same as the English address.
- [ ] **Translations to confirm with Amma**: ගම්මිරිස් (seeded as pepper *powder*), කළු කුඩු ("Black Curry Powder"), cardamom and cloves as separate 20g products, and whether roasted fenugreek is whole or ground.
- [ ] **Admin password**: change it after the first sign-in (Admin → Settings).

## Deploying

The app needs a Node host and a PostgreSQL database reachable at both build time (the catalogue is prerendered) and run time.

- **Vercel + Neon** (free tiers): set `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Use the build command `npm run db:deploy && npm run build`, then run `npm run db:seed` once against the production database.
- **Any VPS**: `npm ci && npm run db:deploy && npm run build && npm start` behind a reverse proxy with HTTPS. The admin session cookie is `Secure` in production.

Uploads are capped at 8 MB (`serverActions.bodySizeLimit` in `next.config.ts`).
