/**
 * Seeds the catalogue from data/products.json (the October 2026 price list), the store settings,
 * and the first admin account. Safe to re-run: it updates the catalogue but never overwrites
 * settings or passwords the owner has already changed.
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { Motif } from "../src/generated/prisma/enums";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

type PriceList = {
  categories: { slug: string; name_en: string; name_si: string }[];
  products: {
    slug: string;
    name_si: string;
    name_en: string;
    category: string;
    prices: Record<string, number>;
  }[];
};

const priceList: PriceList = JSON.parse(
  readFileSync(join(process.cwd(), "data/products.json"), "utf8"),
);

const categoryCopy: Record<string, { blurbEn: string; blurbSi: string }> = {
  "curry-powders": {
    blurbEn: "Amma's own blends, ground at home in Madampe.",
    blurbSi: "මාදම්පේ ගෙදරදීම අම්මා අඹරන තුනපහ වර්ග.",
  },
  chilli: {
    blurbEn: "Flakes, powder and roasted powder, for colour and heat.",
    blurbSi: "කැලි මිරිස්, මිරිස් කුඩු සහ බැදපු මිරිස් කුඩු.",
  },
  "ground-spices": {
    blurbEn: "Single spices, finely ground.",
    blurbSi: "තනි කුළුබඩු, සියුම්ව අඹරා.",
  },
  "whole-spices": {
    blurbEn: "Seeds, pods and bark for tempering, or for grinding fresh.",
    blurbSi: "තෙම්පරාදුවට හෝ අලුතින් අඹරා ගැනීමට.",
  },
  specialty: {
    blurbEn: "Goraka for sour fish curries, and coriander for a warm drink.",
    blurbSi: "මාළු ඇඹුලට ගොරකා, සහ උණු කොත්තමල්ලි පානය.",
  },
};

const productCopy: Record<
  string,
  { pigment: string; motif: Motif; featured?: boolean; en: string; si: string }
> = {
  "roasted-curry-powder": {
    pigment: "#5B2E1A",
    motif: "CURRY",
    featured: true,
    en: "Dark-roasted thunapaha for meat, fish and dhal. Roasting deepens the colour and brings out a toasted aroma.",
    si: "මස්, මාළු සහ පරිප්පුවට බැදපු තුනපහ. බැදීමෙන් පාට තද වී සුවඳ වැඩි වේ.",
  },
  "raw-curry-powder": {
    pigment: "#9C8446",
    motif: "CURRY",
    en: "Unroasted thunapaha, the everyday blend for vegetable curries.",
    si: "එළවළු ව්‍යංජනවලට දිනපතා භාවිතයට අමු තුනපහ.",
  },
  "meat-curry-powder": {
    pigment: "#7A2C1B",
    motif: "CURRY",
    featured: true,
    en: "A richer blend made for chicken, mutton and pork curries.",
    si: "කුකුල්, එළු සහ ඌරු මස් ව්‍යංජන සඳහාම සකස් කළ තුනපහ.",
  },
  "black-curry-powder": {
    pigment: "#2B1B13",
    motif: "CURRY",
    en: "Kalu kudu: curry powder roasted very dark, for black curries.",
    si: "කළු කරි සඳහා හොඳින් බැදපු කළු කුඩු.",
  },
  "chilli-pieces": {
    pigment: "#C3361F",
    motif: "FLAKES",
    featured: true,
    en: "Crushed dried chillies for tempering, sambols and pickles.",
    si: "තෙම්පරාදුවට, සම්බෝලවලට සහ අච්චාරුවලට කැලි මිරිස්.",
  },
  "chilli-powder": {
    pigment: "#B02717",
    motif: "CHILLI",
    en: "Ground dried chillies for colour and heat.",
    si: "පාටට සහ සැරට මිරිස් කුඩු.",
  },
  "roasted-chilli-powder": {
    pigment: "#771C12",
    motif: "CHILLI",
    en: "Chillies roasted before grinding, for a deeper, smoky heat.",
    si: "අඹරන්න පෙර බැදපු, තද රසැති මිරිස් කුඩු.",
  },
  "turmeric-powder": {
    pigment: "#DFA012",
    motif: "TURMERIC",
    featured: true,
    en: "Ground turmeric for curries, yellow rice and marinades.",
    si: "ව්‍යංජන, කහ බත් සහ මස් පෙඟවීමට කහ කුඩු.",
  },
  "black-pepper-powder": {
    pigment: "#3A322B",
    motif: "PEPPER",
    en: "Ground black pepper for pepper curries and soups.",
    si: "ගම්මිරිස් කරි සහ සුප් සඳහා ගම්මිරිස් කුඩු.",
  },
  "mustard-powder": {
    pigment: "#BE9A43",
    motif: "SEED",
    en: "Ground mustard for pickles and achcharu.",
    si: "අච්චාරු සඳහා අබ කුඩු.",
  },
  "roasted-fenugreek": {
    pigment: "#A4672C",
    motif: "SEED",
    en: "Roasted fenugreek for fish curries and kiri hodi.",
    si: "මාළු ව්‍යංජන සහ කිරි හොදි සඳහා බැදපු උළුහාල්.",
  },
  "mustard-seeds": {
    pigment: "#5A3826",
    motif: "SEED",
    en: "Whole mustard seeds for tempering.",
    si: "තෙම්පරාදුවට අබ ඇට.",
  },
  "cinnamon-quills": {
    pigment: "#B0723C",
    motif: "CINNAMON",
    en: "Ceylon cinnamon bark for curries, rice and tea.",
    si: "ව්‍යංජන, බත් සහ තේ සඳහා කුරුඳු පොතු.",
  },
  "black-peppercorns": {
    pigment: "#2D2723",
    motif: "PEPPER",
    en: "Whole black pepper for grinding fresh.",
    si: "අලුතින් අඹරා ගැනීමට ගම්මිරිස් ඇට.",
  },
  "cumin-seeds": {
    pigment: "#8A6C44",
    motif: "SEED",
    en: "Cumin seeds for tempering and grinding.",
    si: "තෙම්පරාදුවට සහ අඹරා ගැනීමට සුදුරු.",
  },
  "fennel-seeds": {
    pigment: "#7E8C4E",
    motif: "SEED",
    en: "Sweet, aromatic fennel seeds for curries.",
    si: "ව්‍යංජනවලට සුවඳ දෙන මහදුරු.",
  },
  "coriander-seeds": {
    pigment: "#B39457",
    motif: "SEED",
    en: "Coriander seeds to grind into curry powder, or boil for a drink.",
    si: "තුනපහට අඹරා ගැනීමට හෝ තම්බා බීමට කොත්තමල්ලි ඇට.",
  },
  cardamom: {
    pigment: "#73905A",
    motif: "POD",
    en: "Green cardamom pods for rice, sweets and tea.",
    si: "බත්, රසකැවිලි සහ තේ සඳහා එනසාල්.",
  },
  cloves: {
    pigment: "#4A2B1F",
    motif: "POD",
    en: "Whole cloves for rice, meat curries and sweets.",
    si: "බත්, මස් ව්‍යංජන සහ රසකැවිලි සඳහා කරාබුනැටි.",
  },
  goraka: {
    pigment: "#3B2721",
    motif: "FRUIT",
    en: "Dried goraka for sour fish curries such as ambul thiyal.",
    si: "ඇඹුල් තියල් වැනි මාළු ව්‍යංජන සඳහා වියළි ගොරකා.",
  },
  "coriander-drink": {
    pigment: "#97773F",
    motif: "LEAF",
    en: "A coriander blend to boil into a warm drink.",
    si: "තම්බා බීමට කොත්තමල්ලි පානය.",
  },
};

function grams(label: string): number {
  return label.endsWith("kg") ? Number(label.slice(0, -2)) * 1000 : Number(label.slice(0, -1));
}

async function main() {
  const categoryIds = new Map<string, string>();
  for (const [index, c] of priceList.categories.entries()) {
    const copy = categoryCopy[c.slug] ?? { blurbEn: "", blurbSi: "" };
    const row = await db.category.upsert({
      where: { slug: c.slug },
      create: { slug: c.slug, nameEn: c.name_en, nameSi: c.name_si, sortOrder: index, ...copy },
      update: { nameEn: c.name_en, nameSi: c.name_si, sortOrder: index, ...copy },
    });
    categoryIds.set(c.slug, row.id);
  }

  for (const [index, p] of priceList.products.entries()) {
    const copy = productCopy[p.slug];
    if (!copy) throw new Error(`No copy for ${p.slug}`);
    const data = {
      nameEn: p.name_en,
      nameSi: p.name_si,
      descriptionEn: copy.en,
      descriptionSi: copy.si,
      pigment: copy.pigment,
      motif: copy.motif,
      isFeatured: copy.featured ?? false,
      sortOrder: index,
      categoryId: categoryIds.get(p.category)!,
    };
    const product = await db.product.upsert({
      where: { slug: p.slug },
      create: { slug: p.slug, ...data },
      update: data,
    });
    for (const [label, price] of Object.entries(p.prices)) {
      const g = grams(label);
      await db.variant.upsert({
        where: { productId_grams: { productId: product.id, grams: g } },
        create: { productId: product.id, grams: g, price },
        update: { price },
      });
    }
  }

  await db.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      whatsappNumber: "0712753307",
      phone: "0714336739",
      addressEn: "No 42 A, Sahana Mawatha, Uraliya Panirendawa, Madampe 61234",
      addressSi: "No 42 A, Sahana Mawatha, Uraliya Panirendawa, Madampe 61234",
      // Placeholder rates until the owner sets her own in Admin → Delivery.
      deliveryBaseFee: 400,
      deliveryPerExtraKg: 100,
    },
  });

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    await db.adminUser.upsert({
      where: { email },
      update: {},
      create: { name: "Amma", email, passwordHash: await bcrypt.hash(password, 12) },
    });
  }

  // Customer-facing order numbers start at 1001.
  await db.$executeRawUnsafe(
    `SELECT setval('"Order_number_seq"', GREATEST(1000, (SELECT COALESCE(MAX(number), 0) FROM "Order")))`,
  );

  const counts = await Promise.all([db.product.count(), db.variant.count()]);
  console.log(`Seeded ${counts[0]} products, ${counts[1]} sizes.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
