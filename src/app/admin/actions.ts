"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/server/db";
import { createSession, destroySession, requireAdmin } from "@/lib/server/auth";
import { CATALOG_TAG, SETTINGS_TAG } from "@/lib/server/catalog";
import { hasFile, storeUpload, UploadError } from "@/lib/server/uploads";
import { DISTRICTS } from "@/lib/delivery";
import { ADMIN_LANG_COOKIE } from "@/lib/admin-i18n";
import { MOTIFS } from "@/lib/motifs";
import type { OrderStatus } from "@/generated/prisma/enums";

export type FormState = { ok?: boolean; error?: string; at?: number } | null;

function text(fd: FormData, key: string, max = 500): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function int(value: FormDataEntryValue | null, max = 10_000_000): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const n = Number(value.replace(/[,\s]/g, ""));
  return Number.isInteger(n) && n >= 0 && n <= max ? n : null;
}

const checked = (fd: FormData, key: string) => fd.get(key) === "on";

/* ── Session ─────────────────────────────────────────── */

export async function login(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = text(fd, "email", 120).toLowerCase();
  const password = typeof fd.get("password") === "string" ? String(fd.get("password")) : "";
  const admin = email ? await db.adminUser.findUnique({ where: { email } }) : null;
  const valid = admin ? await bcrypt.compare(password, admin.passwordHash) : false;
  if (!admin || !valid) {
    await new Promise((r) => setTimeout(r, 500));
    return { error: "wrong" };
  }
  await createSession(admin.id);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function setAdminLang(fd: FormData) {
  const lang = fd.get("lang") === "en" ? "en" : "si";
  (await cookies()).set(ADMIN_LANG_COOKIE, lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  refresh();
}

/* ── Orders ──────────────────────────────────────────── */

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  NEW: "CONFIRMED",
  CONFIRMED: "DISPATCHED",
  DISPATCHED: "DELIVERED",
};

export async function advanceOrder(fd: FormData) {
  await requireAdmin();
  const id = text(fd, "id", 40);
  const order = await db.order.findUnique({ where: { id }, select: { status: true, paymentMethod: true } });
  const next = order ? NEXT_STATUS[order.status] : undefined;
  if (!order || !next) return;

  const tracking = text(fd, "trackingNumber", 60);
  // Cash on delivery is collected by the courier, so a delivered COD order counts as paid.
  const codPaid = next === "DELIVERED" && order.paymentMethod === "COD";

  await db.order.update({
    where: { id },
    data: {
      status: next,
      ...(tracking ? { trackingNumber: tracking } : {}),
      ...(codPaid ? { paymentStatus: "PAID" } : {}),
      events: { create: { status: next, note: tracking ? `Tracking ${tracking}` : null } },
    },
  });
  refresh();
}

export async function setOrderPaid(fd: FormData) {
  await requireAdmin();
  const id = text(fd, "id", 40);
  const paid = fd.get("paid") === "1";
  const order = await db.order.findUnique({ where: { id }, select: { slipId: true } });
  if (!order) return;
  await db.order.update({
    where: { id },
    data: {
      paymentStatus: paid ? "PAID" : order.slipId ? "SLIP_UPLOADED" : "UNPAID",
      events: { create: { note: paid ? "Payment received" : "Payment marked as not received" } },
    },
  });
  refresh();
}

export async function cancelOrder(fd: FormData) {
  await requireAdmin();
  const id = text(fd, "id", 40);
  await db.order.update({
    where: { id },
    data: { status: "CANCELLED", events: { create: { status: "CANCELLED" } } },
  });
  refresh();
}

export async function reopenOrder(fd: FormData) {
  await requireAdmin();
  const id = text(fd, "id", 40);
  await db.order.update({
    where: { id },
    data: { status: "NEW", events: { create: { status: "NEW", note: "Reopened" } } },
  });
  refresh();
}

export async function saveOrderNote(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  await db.order.update({
    where: { id: text(fd, "id", 40) },
    data: { adminNote: text(fd, "adminNote", 1000) || null },
  });
  return { ok: true, at: Date.now() };
}

/* ── Products ────────────────────────────────────────── */

const variantSchema = z.object({
  id: z.string().optional(),
  grams: z.number().int().min(1).max(100_000),
  price: z.number().int().min(0).max(10_000_000),
  inStock: z.boolean(),
});

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "spice"
  );
}

async function uniqueSlug(base: string) {
  let slug = base;
  for (let i = 2; await db.product.findUnique({ where: { slug }, select: { id: true } }); i++) slug = `${base}-${i}`;
  return slug;
}

export async function saveProduct(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = text(fd, "id", 40);
  const nameSi = text(fd, "nameSi", 80);
  const nameEn = text(fd, "nameEn", 80);
  const pigment = text(fd, "pigment", 7);
  const motif = text(fd, "motif", 20);
  const categoryId = text(fd, "categoryId", 40);

  if (!nameSi || !nameEn) return { error: "name" };
  if (!/^#[0-9a-fA-F]{6}$/.test(pigment)) return { error: "pigment" };
  if (!(MOTIFS as readonly string[]).includes(motif) || !categoryId) return { error: "generic" };

  let variants: z.infer<typeof variantSchema>[];
  try {
    variants = z.array(variantSchema).min(1).parse(JSON.parse(text(fd, "variants", 20_000) || "[]"));
  } catch {
    return { error: "sizes" };
  }
  if (new Set(variants.map((v) => v.grams)).size !== variants.length) return { error: "sizes" };

  let imageId: string | null | undefined;
  const photo = fd.get("photo");
  if (hasFile(photo)) {
    try {
      imageId = (await storeUpload(photo, "PRODUCT")).id;
    } catch (error) {
      if (error instanceof UploadError) return { error: "photo" };
      throw error;
    }
  } else if (checked(fd, "removePhoto")) {
    imageId = null;
  }

  const data = {
    nameSi,
    nameEn,
    descriptionSi: text(fd, "descriptionSi", 600),
    descriptionEn: text(fd, "descriptionEn", 600),
    pigment: pigment.toUpperCase(),
    motif: motif as (typeof MOTIFS)[number],
    categoryId,
    isActive: checked(fd, "isActive"),
    isFeatured: checked(fd, "isFeatured"),
    ...(imageId !== undefined ? { imageId } : {}),
  };

  const productId = await db.$transaction(async (tx) => {
    const product = id
      ? await tx.product.update({ where: { id }, data, select: { id: true } })
      : await tx.product.create({
          data: {
            ...data,
            slug: await uniqueSlug(slugify(nameEn)),
            sortOrder: (await tx.product.count({ where: { categoryId } })) + 100,
          },
          select: { id: true },
        });

    const existing = await tx.variant.findMany({ where: { productId: product.id }, select: { id: true } });
    const keep = variants.filter((v) => v.id && existing.some((e) => e.id === v.id));
    await tx.variant.deleteMany({
      where: { productId: product.id, id: { notIn: keep.map((v) => v.id!) } },
    });
    // Park kept sizes on temporary values first so swapping two sizes never collides.
    for (const [i, v] of keep.entries()) {
      await tx.variant.update({ where: { id: v.id }, data: { grams: -(i + 1) } });
    }
    for (const v of variants) {
      if (v.id && keep.includes(v)) {
        await tx.variant.update({ where: { id: v.id }, data: { grams: v.grams, price: v.price, inStock: v.inStock } });
      } else {
        await tx.variant.create({ data: { productId: product.id, grams: v.grams, price: v.price, inStock: v.inStock } });
      }
    }
    return product.id;
  });

  updateTag(CATALOG_TAG);
  if (!id) redirect(`/admin/products/${productId}`);
  return { ok: true, at: Date.now() };
}

export async function toggleProduct(fd: FormData) {
  await requireAdmin();
  const id = text(fd, "id", 40);
  const product = await db.product.findUnique({ where: { id }, select: { isActive: true } });
  if (!product) return;
  await db.product.update({ where: { id }, data: { isActive: !product.isActive } });
  updateTag(CATALOG_TAG);
  refresh();
}

export async function deleteProduct(fd: FormData) {
  await requireAdmin();
  const id = text(fd, "id", 40);
  const product = await db.product.delete({ where: { id }, select: { imageId: true } });
  if (product.imageId) {
    const stillUsed = await db.product.count({ where: { imageId: product.imageId } });
    if (!stillUsed) await db.upload.delete({ where: { id: product.imageId } }).catch(() => undefined);
  }
  updateTag(CATALOG_TAG);
  redirect("/admin/products");
}

/* ── Delivery, payments, shop ────────────────────────── */

export async function saveDelivery(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const baseFee = int(fd.get("baseFee"));
  const perExtraKg = int(fd.get("perExtraKg"));
  const freeRaw = fd.get("freeOver");
  const freeOver = int(freeRaw);
  if (baseFee === null || perExtraKg === null) return { error: "generic" };
  if (typeof freeRaw === "string" && freeRaw.trim() && freeOver === null) return { error: "generic" };

  const overrides: { district: string; baseFee: number; perExtraKg: number }[] = [];
  for (const { key } of DISTRICTS) {
    if (!checked(fd, `custom:${key}`)) continue;
    const b = int(fd.get(`base:${key}`));
    const e = int(fd.get(`extra:${key}`));
    if (b === null || e === null) return { error: "generic" };
    overrides.push({ district: key, baseFee: b, perExtraKg: e });
  }

  await db.$transaction([
    db.settings.update({
      where: { id: 1 },
      data: { deliveryBaseFee: baseFee, deliveryPerExtraKg: perExtraKg, freeDeliveryOver: freeOver },
    }),
    db.districtFee.deleteMany(),
    db.districtFee.createMany({ data: overrides }),
  ]);
  updateTag(SETTINGS_TAG);
  return { ok: true, at: Date.now() };
}

export async function savePayments(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const codFee = int(fd.get("codFee")) ?? 0;
  await db.settings.update({
    where: { id: 1 },
    data: {
      codEnabled: checked(fd, "codEnabled"),
      codFee,
      bankEnabled: checked(fd, "bankEnabled"),
      bankName: text(fd, "bankName", 80),
      bankBranch: text(fd, "bankBranch", 80),
      bankAccountName: text(fd, "bankAccountName", 120),
      bankAccountNumber: text(fd, "bankAccountNumber", 40),
      whatsappOrderEnabled: checked(fd, "whatsappOrderEnabled"),
      whatsappNumber: text(fd, "whatsappNumber", 20),
    },
  });
  updateTag(SETTINGS_TAG);
  return { ok: true, at: Date.now() };
}

export async function saveShop(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();

  let portraitId: string | null | undefined;
  const photo = fd.get("portrait");
  if (hasFile(photo)) {
    try {
      portraitId = (await storeUpload(photo, "PORTRAIT")).id;
    } catch (error) {
      if (error instanceof UploadError) return { error: "photo" };
      throw error;
    }
  } else if (checked(fd, "removePortrait")) {
    portraitId = null;
  }

  await db.settings.update({
    where: { id: 1 },
    data: {
      phone: text(fd, "phone", 20),
      email: text(fd, "email", 120),
      addressEn: text(fd, "addressEn", 200),
      addressSi: text(fd, "addressSi", 200),
      announcementEn: text(fd, "announcementEn", 200),
      announcementSi: text(fd, "announcementSi", 200),
      ...(portraitId !== undefined ? { portraitId } : {}),
    },
  });
  updateTag(SETTINGS_TAG);
  return { ok: true, at: Date.now() };
}

export async function changePassword(_prev: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("next") ?? "");
  const confirm = String(fd.get("confirm") ?? "");
  const row = await db.adminUser.findUnique({ where: { id: admin.id } });
  if (!row || !(await bcrypt.compare(current, row.passwordHash))) return { error: "wrong" };
  if (next.length < 8) return { error: "short" };
  if (next !== confirm) return { error: "mismatch" };
  await db.adminUser.update({ where: { id: admin.id }, data: { passwordHash: await bcrypt.hash(next, 12) } });
  return { ok: true, at: Date.now() };
}
