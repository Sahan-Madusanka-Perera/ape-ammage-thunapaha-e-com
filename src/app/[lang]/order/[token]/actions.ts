"use server";

import { refresh } from "next/cache";
import { db } from "@/lib/server/db";
import { hasFile, storeUpload, UploadError } from "@/lib/server/uploads";

export type SlipState = { error?: string; ok?: boolean } | null;

export async function uploadSlip(token: string, _prev: SlipState, formData: FormData): Promise<SlipState> {
  const order = await db.order.findUnique({
    where: { publicToken: token },
    select: { id: true, paymentMethod: true, paymentStatus: true, slipId: true },
  });
  if (!order || order.paymentMethod !== "BANK_TRANSFER" || order.paymentStatus === "PAID") {
    return { error: "generic" };
  }

  const file = formData.get("slip");
  if (!hasFile(file)) return { error: "bad_type" };

  try {
    const upload = await storeUpload(file, "SLIP");
    await db.$transaction([
      db.order.update({
        where: { id: order.id },
        data: {
          slipId: upload.id,
          paymentStatus: "SLIP_UPLOADED",
          events: { create: { note: "Bank slip uploaded by customer" } },
        },
      }),
      ...(order.slipId ? [db.upload.delete({ where: { id: order.slipId } })] : []),
    ]);
  } catch (error) {
    if (error instanceof UploadError) return { error: error.code };
    console.error("uploadSlip failed", error);
    return { error: "generic" };
  }

  refresh();
  return { ok: true };
}
