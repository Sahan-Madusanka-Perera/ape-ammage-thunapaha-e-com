# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router, TypeScript) + Prisma + PostgreSQL, chosen by the user on 2026-10-15. Hosting not decided yet; keep it deploy-agnostic (Vercel + Neon or any VPS with Postgres).

## Users

- **Shoppers:** Sri Lankan home cooks, mostly arriving on a phone from the brand's TikTok (~94K) and Facebook (~179K) videos. Many are Sinhala speakers. They already trust the owner personally and want her spices delivered home.
- **Owner (admin):** the mother who makes the spices. She runs the admin day to day **on her phone**: taking orders, confirming payments, changing prices and delivery charges. The admin must be phone-first, very simple, and readable in Sinhala.

## Product Purpose

An online shop for අපෙ අම්මගේ තුනපහ (Ape Ammage Thunapaha) that replaces taking every order by WhatsApp message. Shoppers browse the full price list, pick sizes, and check out with delivery to their door. The owner manages orders, products, prices, delivery charges and payment settings herself. Success: orders arrive complete (address, phone, items, payment method) without back-and-forth chat, and the owner can keep the catalogue current without a developer.

## Positioning

Spices hand-made by one named mother in Madampe, sold under her own face and name. A village-market (pola) seller who grew through social media. The product is her recipes and her personal trust with followers, not a factory brand.

## Operating Context

- Orders today come by WhatsApp; island-wide delivery by courier (Koombiyo seen in her videos).
- Payment methods to support: **Cash on Delivery**, **Bank Transfer** (customer uploads a slip; owner verifies), and **Order via WhatsApp** (cart sent as a WhatsApp message).
- Delivery charges must be editable by the owner in the admin.
- **Overseas shipping is out of scope for now.**

## Capabilities and Constraints

- Catalogue: 21 products in 5 categories. Most come in 50g / 100g / 250g / 500g / 1kg; cardamom and cloves come in 20g only. Prices are per size and **not** linear (larger sizes carry a small discount), so every variant stores its own price. Seed data: `data/products.json`, from `reference/price-list-2026-10.png`.
- Currency: LKR only.
- Storefront language: **English first, with a Sinhala toggle.** Product names are always available in both.
- Admin language: Sinhala-readable (bilingual), phone-first.
- Open decisions: delivery fee amounts, bank account details, the current WhatsApp number (new: 071 275 3307; old 071 433 6739 still on printed labels). Card payments (e.g. PayHere) are not in scope yet.

## Brand Commitments

- Name: **අපෙ අම්මගේ තුනපහ – Ape Ammage Thunapaha** ("Our Mother's Curry Powder").
- Existing identity: circular badge logo with an illustrated portrait of the owner ringed by chillies and spices, Sinhala wordmark in yellow/red; gold stand-up pouches with a yellow label carrying her portrait.
- Voice: warm and familial; she is "අම්මා" (Amma) to her followers.

## Evidence on Hand

- Official price list image: `reference/price-list-2026-10.png`.
- Public proof (verifiable): Nilame YouTube interview (111K views); Ada Derana "To The Point" TV appearance (Oct 2026); Facebook 100% recommend (6 reviews).
- **Absent:** product photography, logo files and testimonials in the repo. Do not fabricate reviews, ratings, customer quotes, certifications or "organic" claims.

## Product Principles

1. **Her trust is the product.** Keep the owner and Madampe visible; never dress the brand as a faceless factory.
2. **Phone-first, both sides.** Shoppers arrive from social video on a phone, and the owner administers on a phone.
3. **No chat needed to order.** Checkout captures everything an order needs; WhatsApp stays available as a choice.
4. **Owner-editable everything.** Prices, stock, delivery charges and payment details change in the admin, not in code.
5. **Honest claims only.** Show only proof that exists.

## Accessibility & Inclusion

Sinhala script must render well (proper Sinhala web font, adequate size and line height). The admin targets a non-technical user on a phone: large tap targets, plain-language labels, no dense tables on mobile.
