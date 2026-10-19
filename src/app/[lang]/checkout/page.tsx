import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/checkout-form";
import { getStoreSettings } from "@/lib/server/catalog";
import { getLang } from "@/lib/server/lang";
import { getDict } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const d = getDict(await getLang());
  return { title: d.checkout.title, robots: { index: false } };
}

export default async function CheckoutPage() {
  const lang = await getLang();
  const d = getDict(lang);
  const settings = await getStoreSettings();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-[2.6rem] font-bold leading-none sm:text-[3.2rem]">{d.checkout.title}</h1>
      <CheckoutForm delivery={settings.delivery} payments={settings.payments} />
    </div>
  );
}
