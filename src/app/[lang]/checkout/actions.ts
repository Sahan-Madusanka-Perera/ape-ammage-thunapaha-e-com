"use server";

import { redirect } from "next/navigation";
import { checkoutSchema, createOrder, CheckoutError } from "@/lib/server/orders";
import { hasFile, storeUpload, UploadError } from "@/lib/server/uploads";

export type CheckoutState = {
  error?: string;
  fieldErrors?: Record<string, string>;
} | null;

const FIELD_CODES = new Set(["name", "phone", "email", "address", "city", "district", "payment", "bag"]);

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  let bag: unknown = [];
  try {
    bag = JSON.parse(String(formData.get("bag") ?? "[]"));
  } catch {
    bag = [];
  }

  const text = (key: string) => {
    const v = formData.get(key);
    return typeof v === "string" ? v : undefined;
  };

  const parsed = checkoutSchema.safeParse({
    customerName: text("customerName") ?? "",
    phone: text("phone") ?? "",
    email: text("email"),
    addressLine: text("addressLine") ?? "",
    city: text("city") ?? "",
    district: text("district") ?? "",
    notes: text("notes"),
    paymentMethod: text("paymentMethod"),
    lang: text("lang"),
    bag,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = FIELD_CODES.has(issue.message) ? issue.message : "generic";
    }
    if (fieldErrors.bag) return { error: "bag" };
    return { fieldErrors };
  }

  let slipId: string | undefined;
  const slip = formData.get("slip");
  if (parsed.data.paymentMethod === "BANK_TRANSFER" && hasFile(slip)) {
    try {
      slipId = (await storeUpload(slip, "SLIP")).id;
    } catch (error) {
      if (error instanceof UploadError) return { fieldErrors: { slip: error.code } };
      throw error;
    }
  }

  let token: string;
  try {
    token = (await createOrder(parsed.data, slipId)).publicToken;
  } catch (error) {
    if (error instanceof CheckoutError) return { error: error.code };
    console.error("placeOrder failed", error);
    return { error: "generic" };
  }

  redirect(`${parsed.data.lang === "si" ? "/si" : ""}/order/${token}?placed=1`);
}
