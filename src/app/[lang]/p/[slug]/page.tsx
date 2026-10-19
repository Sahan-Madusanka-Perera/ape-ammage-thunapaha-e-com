import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, Truck } from "lucide-react";
import { RegisterRule } from "@/components/art";
import { PackFace } from "@/components/pack-face";
import { SizeLadder } from "@/components/store/add-controls";
import { ProductTile } from "@/components/store/catalog-views";
import { getCatalog, getProduct } from "@/lib/server/catalog";
import { getLang } from "@/lib/server/lang";
import { getDict } from "@/lib/i18n";
import { localHref, pick } from "@/lib/format";

export async function generateStaticParams() {
  const catalog = await getCatalog();
  return catalog.flatMap((c) => c.products.map((p) => ({ slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/p/[slug]">): Promise<Metadata> {
  const lang = await getLang();
  const { slug } = await params;
  const hit = await getProduct(slug);
  if (!hit) return {};
  return {
    title: pick(lang, hit.product.nameEn, hit.product.nameSi),
    description: pick(lang, hit.product.descriptionEn, hit.product.descriptionSi),
  };
}

export default function ProductPage(props: PageProps<"/[lang]/p/[slug]">) {
  return (
    <Suspense fallback={<div className="mx-auto h-[80vh] max-w-7xl animate-pulse bg-plaster-deep/50" />}>
      <ProductView {...props} />
    </Suspense>
  );
}

async function ProductView({ params }: PageProps<"/[lang]/p/[slug]">) {
  const lang = await getLang();
  const d = getDict(lang);
  const { slug } = await params;
  const hit = await getProduct(slug);
  if (!hit) notFound();
  const { product, category } = hit;
  const siblings = category.products.filter((p) => p.id !== product.id).slice(0, 4);
  const primary = pick(lang, product.nameEn, product.nameSi);
  const secondary = lang === "si" ? product.nameEn : product.nameSi;
  const listHref = `${localHref(lang, "/") === "/" ? "" : localHref(lang, "/")}/#register-${category.slug}`;

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Link
          href={listHref}
          className="inline-flex min-h-11 items-center gap-2 text-[0.95rem] font-medium text-ink-soft hover:text-ink"
        >
          <ArrowLeft className="size-4" strokeWidth={2.2} aria-hidden="true" />
          {d.product.backToList}
          <span aria-hidden="true" className="text-ink/30">/</span>
          <span>{pick(lang, category.nameEn, category.nameSi)}</span>
        </Link>
      </div>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 pt-4 sm:px-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-12 lg:gap-20 lg:px-8">
        <div className="md:sticky md:top-24 md:self-start">
          <div className="mx-auto max-w-[15rem] sm:max-w-sm md:max-w-none">
            <PackFace product={product} size="lg" alt={primary} priority />
          </div>
        </div>

        <div className="min-w-0 md:pt-4">
          <h1 lang={lang} className="font-display text-[2.6rem] font-bold leading-[1.02] sm:text-[3.4rem]">
            {primary}
          </h1>
          <p lang={lang === "si" ? "en" : "si"} className="mt-2 font-display text-[1.4rem] text-vermilion">
            {secondary}
          </p>
          <p className="mt-5 max-w-[56ch] text-[1.08rem] leading-relaxed text-ink-soft">
            {pick(lang, product.descriptionEn, product.descriptionSi)}
          </p>

          <div className="mt-8 border-t-[1.5px] border-ink pt-6">
            <SizeLadder product={product} />
          </div>

          <p className="mt-8 flex max-w-[52ch] gap-3 border-t border-ink/15 pt-5 text-[0.95rem] text-ink-soft">
            <Truck className="mt-0.5 size-5 shrink-0 text-vermilion" strokeWidth={1.8} aria-hidden="true" />
            {d.product.deliveryNote}
          </p>
        </div>
      </section>

      {siblings.length > 0 && (
        <section aria-labelledby="more" className="bg-plaster-deep/60">
          <RegisterRule />
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <h2 id="more" className="font-display text-[2rem] font-bold leading-none sm:text-[2.5rem]">
              {d.product.more(pick(lang, category.nameEn, category.nameSi))}
            </h2>
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
              {siblings.map((p) => (
                <li key={p.id}>
                  <ProductTile product={p} lang={lang} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
