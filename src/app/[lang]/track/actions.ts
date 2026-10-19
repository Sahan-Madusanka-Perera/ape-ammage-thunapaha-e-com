"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/server/db";
import { normalisePhone } from "@/lib/format";

export async function findOrder(_prev: { notFound?: boolean } | null, formData: FormData) {
  const number = Number(String(formData.get("number") ?? "").replace(/\D/g, ""));
  const phone = normalisePhone(String(formData.get("phone") ?? ""));
  const lang = formData.get("lang") === "si" ? "si" : "en";
  if (!number || !phone) return { notFound: true };

  const order = await db.order.findFirst({ where: { number, phone }, select: { publicToken: true } });
  if (!order) return { notFound: true };

  redirect(`${lang === "si" ? "/si" : ""}/order/${order.publicToken}`);
}
