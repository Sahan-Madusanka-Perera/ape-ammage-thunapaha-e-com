import Link from "next/link";
import { Band, ArchNiche, HeroStillLife } from "@/components/art";
import { PackFace } from "@/components/pack-face";
import { getDict } from "@/lib/i18n";
import { formatRs, localHref, pick, type Lang } from "@/lib/format";
import type { CatalogCategory, CatalogProduct } from "@/lib/types";
import { PriceCell } from "./add-controls";

export const BOARD_SIZES = [50, 100, 250, 500, 1000];

function names(lang: Lang, p: { nameEn: string; nameSi: string }) {
  return lang === "si"
    ? { primary: p.nameSi, primaryLang: "si", secondary: p.nameEn, secondaryLang: "en" }
    : { primary: p.nameEn, primaryLang: "en", secondary: p.nameSi, secondaryLang: "si" };
}

/** A pack face with its names and starting price, linking to the product. */
export function ProductTile({ product, lang }: { product: CatalogProduct; lang: Lang }) {
  const d = getDict(lang);
  const n = names(lang, product);
  const from = product.variants.find((v) => v.inStock) ?? product.variants[0];

  return (
    <Link href={localHref(lang, `/p/${product.slug}`)} className="group block">
      <div className="transition-[transform,box-shadow] duration-300 ease-[var(--ease-settle)] group-hover:-translate-y-1 group-hover:shadow-[0_18px_30px_-18px_rgba(28,19,14,0.55)]">
        <PackFace product={product} size="md" rise />
      </div>
      <div className="mt-3">
        <p lang={n.primaryLang} className="font-display text-[1.45rem] font-bold leading-tight group-hover:text-vermilion">
          {n.primary}
        </p>
        <p lang={n.secondaryLang} className="text-[0.92rem] text-ink-soft">
          {n.secondary}
        </p>
        {from && (
          <p className="mt-1.5 text-[0.95rem]">
            <span className="text-ink-soft">{d.product.from}</span>{" "}
            <span className="tabular font-bold">{formatRs(from.price)}</span>
          </p>
        )}
      </div>
    </Link>
  );
}

/** One category as a mural register: vermilion head, then each spice as a row of tappable prices. */
export function PriceRegister({ category, lang }: { category: CatalogCategory; lang: Lang }) {
  const d = getDict(lang);
  const n = names(lang, category);

  return (
    <section aria-labelledby={`register-${category.slug}`} className="mx-auto mt-12 max-w-7xl sm:px-6 lg:px-8">
      <div className="sticky top-16 z-20 text-lime shadow-[0_8px_16px_-14px_rgba(28,19,14,0.9)]">
        <div className="bg-vermilion">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
            <h3 id={`register-${category.slug}`} className="flex min-w-0 flex-wrap items-baseline gap-x-3">
              <span lang={n.primaryLang} className="font-display text-[1.7rem] font-bold leading-none sm:text-[2rem]">
                {n.primary}
              </span>
              <span lang={n.secondaryLang} className="text-[0.95rem] font-semibold text-ochre-pale">
                {n.secondary}
              </span>
            </h3>
            <div
              aria-hidden="true"
              className="tabular hidden w-[min(30rem,46%)] shrink-0 grid-cols-5 gap-1.5 text-center text-[0.85rem] font-semibold text-ochre-pale sm:grid"
            >
              <span>50g</span>
              <span>100g</span>
              <span>250g</span>
              <span>500g</span>
              <span>1kg</span>
            </div>
          </div>
        </div>
        <Band kind="diamonds" line="#1c130e" fill="#d9a21b" ground="#7a1d12" height={10} />
      </div>
      <p className="px-4 pt-4 text-[0.98rem] text-ink-soft sm:px-5">{pick(lang, category.blurbEn, category.blurbSi)}</p>
      <ul className="mt-2 border-b border-ink/15">
        {category.products.map((p) => {
          const pn = names(lang, p);
          const onBoard = p.variants.every((v) => BOARD_SIZES.includes(v.grams));
          return (
            <li
              key={p.id}
              className="grid gap-3 border-t border-ink/15 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_min(30rem,46%)] sm:items-center sm:gap-6 sm:px-5"
            >
              <div className="flex min-w-0 items-center gap-4">
                <Link href={localHref(lang, `/p/${p.slug}`)} className="w-14 shrink-0" tabIndex={-1} aria-hidden="true">
                  <PackFace product={p} size="sm" rise />
                </Link>
                <div className="min-w-0">
                  <Link
                    href={localHref(lang, `/p/${p.slug}`)}
                    lang={pn.primaryLang}
                    className="font-display text-[1.35rem] font-bold leading-tight decoration-vermilion decoration-2 hover:underline"
                  >
                    {pn.primary}
                  </Link>
                  <p lang={pn.secondaryLang} className="truncate text-[0.9rem] text-ink-soft">
                    {pn.secondary}
                  </p>
                </div>
              </div>
              {onBoard ? (
                <div className="grid grid-cols-5 gap-1.5">
                  {BOARD_SIZES.map((g) => {
                    const v = p.variants.find((x) => x.grams === g);
                    return v ? (
                      <PriceCell key={g} product={p} variant={v} showSize="mobile" />
                    ) : (
                      <span key={g} aria-hidden="true" className="min-h-12 border border-dashed border-ink/10" />
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-1.5">
                  {p.variants.map((v) => (
                    <div key={v.id} className="col-span-2 sm:col-span-1">
                      <PriceCell product={p} variant={v} showSize />
                    </div>
                  ))}
                  <p className="col-span-3 self-center text-[0.85rem] text-ink-soft sm:col-span-4">
                    {d.product.from} {formatRs(Math.min(...p.variants.map((v) => v.price)))}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** The hero niche: Amma's photo once she uploads one, otherwise a still life of her spices. */
export function PortraitNiche({
  portraitId,
  alt,
  fill = "#f1dc9a",
  outline = false,
  className,
}: {
  portraitId: string | null;
  alt: string;
  fill?: string;
  outline?: boolean;
  className?: string;
}) {
  return (
    <ArchNiche fill={fill} outline={outline} className={className}>
      {portraitId ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/files/${portraitId}`} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <HeroStillLife className="absolute inset-x-[4%] bottom-[2%] top-[9%] h-[89%] w-[92%]" />
      )}
    </ArchNiche>
  );
}
