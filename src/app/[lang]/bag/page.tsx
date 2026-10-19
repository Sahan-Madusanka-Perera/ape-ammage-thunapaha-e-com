import type { Metadata } from "next";
import { BagView } from "@/components/store/bag-view";
import { getLang } from "@/lib/server/lang";
import { getDict } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const d = getDict(await getLang());
  return { title: d.bag.title, robots: { index: false } };
}

export default async function BagPage() {
  const d = getDict(await getLang());
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-[2.6rem] font-bold leading-none sm:text-[3.2rem]">{d.bag.title}</h1>
      <BagView />
    </div>
  );
}
