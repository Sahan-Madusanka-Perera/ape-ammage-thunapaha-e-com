import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { Band, RegisterRule, WhatsAppIcon } from "@/components/art";
import { PriceCell } from "@/components/store/add-controls";
import { PortraitNiche, PriceRegister, ProductTile } from "@/components/store/catalog-views";
import { getCatalog, getStoreSettings } from "@/lib/server/catalog";
import { getLang } from "@/lib/server/lang";
import { getDict } from "@/lib/i18n";
import { formatRs, localHref, pick } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";

export default async function HomePage() {
  const lang = await getLang();
  const d = getDict(lang);
  const [catalog, settings] = await Promise.all([getCatalog(), getStoreSettings()]);
  const products = catalog.flatMap((c) => c.products);
  const featured = products.filter((p) => p.isFeatured).slice(0, 4);
  const lead = products.find((p) => p.slug === "roasted-curry-powder") ?? featured[0] ?? products[0];
  const greeting = lang === "si" ? "ආයුබෝවන් අම්මේ, මට ඇණවුමක් කරන්න ඕන." : "Hello Amma, I'd like to place an order.";

  return (
    <>
      {/* Register one: the shop's name, and the board's most-ordered blend ready to tap. */}
      <section className="bg-vermilion text-lime">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-10 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-10 lg:px-8 lg:pb-0 lg:pt-8">
          <div className="min-w-0 lg:pb-10">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 lang="si" className="font-display text-[clamp(3rem,10.5vw,5.5rem)] font-bold leading-[0.98]">
                  අපෙ අම්මගේ
                  <br />
                  තුනපහ
                </h1>
                <p className="mt-2 font-display text-[1.3rem] font-medium text-ochre-pale sm:text-[1.55rem]">
                  Ape Ammage Thunapaha
                </p>
              </div>
              <PortraitNiche
                portraitId={settings.portraitId}
                alt={d.hero.portraitAlt}
                outline
                className="w-24 shrink-0 sm:w-32 lg:hidden"
              />
            </div>

            <p className="mt-6 max-w-xl text-[1.3rem] font-semibold leading-snug sm:text-[1.65rem] lg:mt-5">{d.hero.title}</p>
            <p className="mt-3 max-w-xl text-[1.02rem] leading-relaxed text-lime/85">{d.hero.lead}</p>

            {lead && (
              <div className="mt-7 max-w-xl border-[1.5px] border-ink bg-lime lg:mt-6 text-ink shadow-[0_12px_28px_-18px_rgba(28,19,14,0.9)]">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b-[1.5px] border-ink bg-ochre-pale px-3 py-2">
                  <Link
                    href={localHref(lang, `/p/${lead.slug}`)}
                    className="font-display text-[1.25rem] font-bold leading-tight decoration-vermilion decoration-2 hover:underline"
                  >
                    {pick(lang, lead.nameEn, lead.nameSi)}
                  </Link>
                  <span className="text-[0.85rem] text-ink-soft">{d.hero.ladderHint}</span>
                </div>
                <div className="grid grid-cols-5 divide-x-[1.5px] divide-ink">
                  {lead.variants.map((v) => (
                    <PriceCell key={v.id} product={lead} variant={v} tone="strip" showSize />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-wrap gap-3 lg:mt-6">
              <a href="#price-list" className="btn btn-ochre">
                {d.hero.shop}
                <ArrowDown className="size-4" strokeWidth={2.4} aria-hidden="true" />
              </a>
              {settings.payments.whatsapp.enabled && (
                <a href={waLink(settings.whatsappNumber, greeting)} className="btn btn-line text-lime">
                  <WhatsAppIcon className="size-5" />
                  {d.hero.whatsapp}
                </a>
              )}
            </div>
          </div>

          {/* The niche stands in the register itself, seated on the band below. */}
          <div className="hidden items-end justify-center lg:flex">
            <PortraitNiche
              portraitId={settings.portraitId}
              alt={d.hero.portraitAlt}
              outline
              className="w-[min(28rem,calc((100svh_-_8rem)/1.2))]"
            />
          </div>
        </div>
        <RegisterRule />
      </section>

      {featured.length > 0 && (
        <section aria-labelledby="favourites" className="mx-auto max-w-7xl px-4 pb-6 pt-14 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <h2 id="favourites" className="font-display text-[2.4rem] font-bold leading-none sm:text-[3rem]">
              {d.favourites.title}
            </h2>
            <p className="text-[1rem] text-ink-soft">{d.favourites.lead}</p>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {featured.map((p) => (
              <li key={p.id}>
                <ProductTile product={p} lang={lang} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="price-list" aria-labelledby="price-list-title" className="pb-20 pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="price-list-title" className="font-display text-[2.4rem] font-bold leading-none sm:text-[3rem]">
            {d.priceList.title}
          </h2>
          <p className="mt-3 max-w-2xl text-[1.05rem] text-ink-soft">{d.priceList.lead}</p>
        </div>
        {catalog.map((category) => (
          <PriceRegister key={category.id} category={category} lang={lang} />
        ))}
      </section>

      <section id="story" aria-labelledby="story-title" className="bg-ochre text-ink">
        <div aria-hidden="true">
          <div className="h-[3px] bg-ink" />
          <Band kind="petals" line="#1c130e" fill="#a3291b" ground="#d9a21b" height={16} />
          <div className="h-[1.5px] bg-ink" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-20 lg:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-[19rem] border-[1.5px] border-ink bg-vermilion p-3 md:max-w-sm">
            <PortraitNiche portraitId={settings.portraitId} alt={d.hero.portraitAlt} fill="#eeebe3" />
          </div>
          <div>
            <h2 id="story-title" className="font-display text-[2.4rem] font-bold leading-[1.02] sm:text-[3.2rem]">
              {d.story.title}
            </h2>
            <div className="mt-6 max-w-[62ch] space-y-4 text-[1.08rem] leading-relaxed">
              {d.story.paragraphs.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>
            <p className="mt-8 border-t-[1.5px] border-ink pt-4 text-[0.95rem]">
              <span className="font-semibold">{d.story.seenOn}:</span>{" "}
              {d.story.press.map((item, i) => (
                <span key={item}>
                  {i > 0 && <span aria-hidden="true" className="mx-2.5 inline-block size-1.5 rotate-45 bg-vermilion-deep align-middle" />}
                  {item}
                </span>
              ))}
            </p>
          </div>
        </div>
      </section>

      <section id="how-to-order" aria-labelledby="how-title" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <h2 id="how-title" className="font-display text-[2.4rem] font-bold leading-none sm:text-[3rem]">
          {d.howTo.title}
        </h2>
        <ol className="mt-10 grid divide-y-[1.5px] divide-ink border-y-[1.5px] border-ink md:grid-cols-3 md:divide-x-[1.5px] md:divide-y-0">
          {d.howTo.steps.map((step, i) => (
            <li key={step.title} className="flex gap-5 py-7 md:block md:px-7 md:first:pl-0">
              <span className="font-display text-[3.2rem] font-bold leading-none text-vermilion">{i + 1}</span>
              <div>
                <h3 className="mt-0 font-display text-[1.5rem] font-bold leading-tight md:mt-4">{step.title}</h3>
                <p className="mt-2 max-w-[34ch] text-[1rem] leading-relaxed text-ink-soft">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-[62ch] text-[1.02rem]">
          {d.howTo.delivery(formatRs(settings.delivery.baseFee), formatRs(settings.delivery.perExtraKg))}{" "}
          {settings.delivery.freeOver !== null && d.howTo.freeOver(formatRs(settings.delivery.freeOver))}
        </p>
      </section>
    </>
  );
}
