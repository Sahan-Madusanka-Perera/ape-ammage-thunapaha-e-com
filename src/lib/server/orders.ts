import "server-only";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "./db";
import { getStoreSettings } from "./catalog";
import { deliveryFee, isDistrict } from "@/lib/delivery";
import { normalisePhone } from "@/lib/format";
import type { PaymentMethod } from "@/generated/prisma/enums";

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "name").max(80, "name"),
  phone: z
    .string()
    .trim()
    .transform((v, ctx) => {
      const phone = normalisePhone(v);
      if (!phone) {
        ctx.addIssue({ code: "custom", message: "phone" });
        return z.NEVER;
      }
      return phone;
    }),
  email: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v ? v : undefined))
    .pipe(z.email("email").optional()),
  addressLine: z.string().trim().min(5, "address").max(200, "address"),
  city: z.string().trim().min(2, "city").max(60, "city"),
  district: z.string().refine(isDistrict, "district"),
  notes: z.string().trim().max(500).optional().transform((v) => v || undefined),
  paymentMethod: z.enum(["COD", "BANK_TRANSFER", "WHATSAPP"], "payment"),
  lang: z.enum(["en", "si"]).default("en"),
  bag: z
    .array(z.object({ variantId: z.string().min(1), quantity: z.number().int().min(1).max(50) }))
    .min(1, "bag")
    .max(60, "bag"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export class CheckoutError extends Error {
  constructor(public code: "unavailable" | "payment_disabled") {
    super(code);
  }
}

function newToken() {
  return randomBytes(18).toString("base64url");
}

/** Re-prices the bag from the database (never trusting the browser) and records the order. */
export async function createOrder(input: CheckoutInput, slipId?: string) {
  const settings = await getStoreSettings();
  const method: PaymentMethod = input.paymentMethod;
  const enabled =
    (method === "COD" && settings.payments.cod.enabled) ||
    (method === "BANK_TRANSFER" && settings.payments.bank.enabled) ||
    (method === "WHATSAPP" && settings.payments.whatsapp.enabled);
  if (!enabled) throw new CheckoutError("payment_disabled");

  // Merge duplicate lines for the same size.
  const quantities = new Map<string, number>();
  for (const line of input.bag) {
    quantities.set(line.variantId, (quantities.get(line.variantId) ?? 0) + line.quantity);
  }

  const variants = await db.variant.findMany({
    where: { id: { in: [...quantities.keys()] }, inStock: true, product: { isActive: true } },
    include: { product: { select: { id: true, nameEn: true, nameSi: true } } },
  });
  if (variants.length !== quantities.size) throw new CheckoutError("unavailable");

  const items = variants.map((v) => {
    const quantity = quantities.get(v.id)!;
    return {
      productId: v.product.id,
      variantId: v.id,
      nameEn: v.product.nameEn,
      nameSi: v.product.nameSi,
      grams: v.grams,
      unitPrice: v.price,
      quantity,
      lineTotal: v.price * quantity,
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const totalGrams = items.reduce((sum, i) => sum + i.grams * i.quantity, 0);
  const delivery = deliveryFee(settings.delivery, input.district, totalGrams, subtotal);
  const codFee = method === "COD" ? settings.payments.cod.fee : 0;

  return db.order.create({
    data: {
      publicToken: newToken(),
      paymentMethod: method,
      paymentStatus: slipId ? "SLIP_UPLOADED" : "UNPAID",
      customerName: input.customerName,
      phone: input.phone,
      email: input.email,
      addressLine: input.addressLine,
      city: input.city,
      district: input.district,
      notes: input.notes,
      locale: input.lang,
      subtotal,
      deliveryFee: delivery,
      codFee,
      total: subtotal + delivery + codFee,
      totalGrams,
      slipId,
      items: { create: items },
      events: { create: { status: "NEW" } },
    },
    select: { publicToken: true, number: true },
  });
}
