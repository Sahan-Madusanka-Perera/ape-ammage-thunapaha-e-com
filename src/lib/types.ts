import type { Motif } from "@/generated/prisma/enums";
import type { DeliveryRates } from "./delivery";

export type { Motif };

export type CatalogVariant = {
  id: string;
  grams: number;
  price: number;
  inStock: boolean;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  nameEn: string;
  nameSi: string;
  descriptionEn: string;
  descriptionSi: string;
  pigment: string;
  motif: Motif;
  imageId: string | null;
  isFeatured: boolean;
  categorySlug: string;
  variants: CatalogVariant[];
};

export type CatalogCategory = {
  id: string;
  slug: string;
  nameEn: string;
  nameSi: string;
  blurbEn: string;
  blurbSi: string;
  products: CatalogProduct[];
};

export type PaymentOptions = {
  cod: { enabled: boolean; fee: number };
  bank: {
    enabled: boolean;
    bankName: string;
    branch: string;
    accountName: string;
    accountNumber: string;
  };
  whatsapp: { enabled: boolean };
};

export type StoreSettings = {
  whatsappNumber: string;
  phone: string;
  email: string;
  addressEn: string;
  addressSi: string;
  announcementEn: string;
  announcementSi: string;
  portraitId: string | null;
  delivery: DeliveryRates;
  payments: PaymentOptions;
};

/** What the browser keeps in the bag: just enough to re-price against the live catalogue. */
export type BagLine = { variantId: string; quantity: number };
