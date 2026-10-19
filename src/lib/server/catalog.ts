import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";
import type { CatalogCategory, CatalogProduct, StoreSettings } from "@/lib/types";

export const CATALOG_TAG = "catalog";
export const SETTINGS_TAG = "settings";

/** Every active product, grouped by category, as the storefront shows it. */
export async function getCatalog(): Promise<CatalogCategory[]> {
  "use cache";
  cacheLife("days");
  cacheTag(CATALOG_TAG);

  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: { variants: { orderBy: { grams: "asc" } } },
      },
    },
  });

  return categories
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      nameEn: c.nameEn,
      nameSi: c.nameSi,
      blurbEn: c.blurbEn,
      blurbSi: c.blurbSi,
      products: c.products.map(
        (p): CatalogProduct => ({
          id: p.id,
          slug: p.slug,
          nameEn: p.nameEn,
          nameSi: p.nameSi,
          descriptionEn: p.descriptionEn,
          descriptionSi: p.descriptionSi,
          pigment: p.pigment,
          motif: p.motif,
          imageId: p.imageId,
          isFeatured: p.isFeatured,
          categorySlug: c.slug,
          variants: p.variants.map((v) => ({
            id: v.id,
            grams: v.grams,
            price: v.price,
            inStock: v.inStock,
          })),
        }),
      ),
    }))
    .filter((c) => c.products.length > 0);
}

export async function getProduct(slug: string) {
  const catalog = await getCatalog();
  for (const category of catalog) {
    const product = category.products.find((p) => p.slug === slug);
    if (product) return { product, category };
  }
  return null;
}

export async function getStoreSettings(): Promise<StoreSettings> {
  "use cache";
  cacheLife("days");
  cacheTag(SETTINGS_TAG);

  const [s, overrides] = await Promise.all([
    db.settings.findUnique({ where: { id: 1 } }),
    db.districtFee.findMany(),
  ]);
  if (!s) throw new Error("Store settings are missing. Run `npm run db:seed`.");

  const bankReady = Boolean(s.bankAccountNumber.trim() && s.bankAccountName.trim());

  return {
    whatsappNumber: s.whatsappNumber,
    phone: s.phone,
    email: s.email,
    addressEn: s.addressEn,
    addressSi: s.addressSi,
    announcementEn: s.announcementEn,
    announcementSi: s.announcementSi,
    portraitId: s.portraitId,
    delivery: {
      baseFee: s.deliveryBaseFee,
      perExtraKg: s.deliveryPerExtraKg,
      freeOver: s.freeDeliveryOver,
      overrides: Object.fromEntries(
        overrides.map((o) => [o.district, { baseFee: o.baseFee, perExtraKg: o.perExtraKg }]),
      ),
    },
    payments: {
      cod: { enabled: s.codEnabled, fee: s.codFee },
      bank: {
        enabled: s.bankEnabled && bankReady,
        bankName: s.bankName,
        branch: s.bankBranch,
        accountName: s.bankAccountName,
        accountNumber: s.bankAccountNumber,
      },
      whatsapp: { enabled: s.whatsappOrderEnabled && Boolean(s.whatsappNumber) },
    },
  };
}
