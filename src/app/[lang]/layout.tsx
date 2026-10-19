import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { lang as rootLang } from "next/root-params";
import "../globals.css";
import { fontVariables } from "../fonts";
import { getCatalog, getStoreSettings } from "@/lib/server/catalog";
import { getDict } from "@/lib/i18n";
import { isLang, pick, type Lang } from "@/lib/format";
import { StoreProvider } from "@/components/store/store-provider";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { BagBar } from "@/components/store/bag-bar";

const CONTRACT = `<!--
THESIS: Amma's price board painted as a Kandyan mural. Every category is a horizontal register, every spice its own pigment field. Refuses the dark-roast-and-gold hero over a photo grid.
OWN-WORLD: lime-plaster ground; vermilion owns the hero, register heads and buttons; yellow ochre marks the active size; brush-black outlines; liyawela vine and pala-peti petal bands only between registers; Gemunu Libre display, Hanken Grotesk + Yaldevi text; tabular prices.
STORY: The visitor sees Amma's shop by name, finds every spice and size priced like her board, taps a price to bag it, and checks out by cash on delivery, bank slip or WhatsApp.
FIRST VIEWPORT: full-bleed vermilion register. Sinhala name huge, English line, arched niche at right, Roasted Curry Powder size ladder as five tap targets, ochre "See the price list" button.
FORM: Kandyan Mural Registers, #4 of 7, seed 5938556e.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "si" }];
}

async function currentLang(): Promise<Lang> {
  const value = await rootLang();
  if (!isLang(value)) notFound();
  return value;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await currentLang();
  const d = getDict(lang);
  return {
    title: { default: d.meta.title, template: `%s · ${pick(lang, d.brandEn, d.brandSi)}` },
    description: d.meta.description,
    alternates: { languages: { en: "/", si: "/si" } },
    openGraph: { title: d.meta.title, description: d.meta.description, locale: lang === "si" ? "si_LK" : "en_LK" },
  };
}

export const viewport: Viewport = {
  themeColor: "#a3291b",
};

export default async function StoreLayout({ children }: LayoutProps<"/[lang]">) {
  const lang = await currentLang();
  const [catalog, settings] = await Promise.all([getCatalog(), getStoreSettings()]);
  const announcement = pick(lang, settings.announcementEn, settings.announcementSi);

  return (
    <html lang={lang} className={fontVariables}>
      <body className="flex min-h-dvh flex-col antialiased">
        <div hidden dangerouslySetInnerHTML={{ __html: CONTRACT }} />
        <StoreProvider lang={lang} catalog={catalog}>
          {announcement && (
            <p className="bg-ochre px-4 py-2 text-center text-[0.9rem] font-semibold text-ink">{announcement}</p>
          )}
          <SiteHeader lang={lang} />
          <main className="flex-1">{children}</main>
          <SiteFooter lang={lang} settings={settings} />
          <Suspense fallback={null}>
            <BagBar />
          </Suspense>
        </StoreProvider>
      </body>
    </html>
  );
}
