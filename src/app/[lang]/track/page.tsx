import type { Metadata } from "next";
import { TrackForm } from "@/components/store/track-form";
import { getLang } from "@/lib/server/lang";
import { getDict } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const d = getDict(await getLang());
  return { title: d.track.title };
}

export default async function TrackPage() {
  const lang = await getLang();
  const d = getDict(lang);
  return (
    <div className="mx-auto max-w-xl px-4 pb-24 pt-12 sm:px-6">
      <h1 className="font-display text-[2.6rem] font-bold leading-none sm:text-[3.2rem]">{d.track.title}</h1>
      <p className="mt-3 text-[1.05rem] text-ink-soft">{d.track.lead}</p>
      <TrackForm lang={lang} />
    </div>
  );
}
