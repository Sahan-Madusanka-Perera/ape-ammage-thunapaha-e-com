"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, X } from "lucide-react";
import { PackFace } from "@/components/pack-face";
import { getDict } from "@/lib/i18n";
import { formatRs, localHref, pick, sizeLabel } from "@/lib/format";
import { useStore, type PricedLine } from "./store-provider";

export function QuantityStepper({ line, compact = false }: { line: PricedLine; compact?: boolean }) {
  const { lang, setQuantity } = useStore();
  const d = getDict(lang);
  const h = compact ? "h-10" : "h-11";
  return (
    <div className={`inline-flex ${h} items-stretch rounded-[2px] border-[1.5px] border-ink/25 bg-lime`}>
      <button
        type="button"
        onClick={() => setQuantity(line.variantId, line.quantity - 1)}
        disabled={line.quantity <= 1}
        className="grid w-10 place-items-center hover:bg-plaster-deep disabled:opacity-35"
        aria-label={d.product.decrease}
      >
        <Minus className="size-4" strokeWidth={2.4} />
      </button>
      <output className="tabular grid w-8 place-items-center font-bold" aria-label={d.product.quantity}>
        {line.quantity}
      </output>
      <button
        type="button"
        onClick={() => setQuantity(line.variantId, line.quantity + 1)}
        disabled={line.quantity >= 50}
        className="grid w-10 place-items-center hover:bg-plaster-deep disabled:opacity-35"
        aria-label={d.product.increase}
      >
        <Plus className="size-4" strokeWidth={2.4} />
      </button>
    </div>
  );
}

export function BagLines({ editable = true }: { editable?: boolean }) {
  const { lang, lines, remove } = useStore();
  const d = getDict(lang);

  return (
    <ul className="divide-y divide-ink/15 border-y-[1.5px] border-ink">
      {lines.map((line) => {
        const p = line.product;
        const name = p ? pick(lang, p.nameEn, p.nameSi) : "—";
        return (
          <li key={line.variantId} className="flex gap-4 py-4">
            <div className="w-16 shrink-0 sm:w-20">
              {p ? (
                <Link href={localHref(lang, `/p/${p.slug}`)} tabIndex={-1} aria-hidden="true">
                  <PackFace product={p} size="sm" />
                </Link>
              ) : (
                <div className="aspect-[5/6] bg-plaster-deep" />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
              <div className="min-w-0 flex-1">
                <p className="font-display text-[1.3rem] font-bold leading-tight">{name}</p>
                <p className="tabular text-[0.95rem] text-ink-soft">
                  {line.variant ? sizeLabel(line.variant.grams) : ""}
                  {line.variant && line.available ? ` · ${formatRs(line.variant.price)}` : ""}
                </p>
                {!line.available && (
                  <p className="mt-1 text-[0.9rem] font-semibold text-vermilion">{d.bag.unavailableLine}</p>
                )}
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                {editable && line.available ? (
                  <QuantityStepper line={line} compact />
                ) : (
                  <span className="tabular text-[0.95rem] text-ink-soft">× {line.quantity}</span>
                )}
                <span className="tabular min-w-[5.5rem] text-right text-[1.05rem] font-bold">
                  {line.available ? formatRs(line.lineTotal) : ""}
                </span>
              </div>
            </div>
            {editable && (
              <button
                type="button"
                onClick={() => remove(line.variantId)}
                className="-mr-2 grid size-11 shrink-0 place-items-center self-start text-ink-soft hover:text-vermilion"
                aria-label={`${d.bag.remove}: ${name}`}
              >
                <X className="size-5" strokeWidth={2.2} />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function BagView() {
  const { lang, lines, subtotal, totalGrams, hydrated, hasUnavailable } = useStore();
  const d = getDict(lang);
  const home = localHref(lang, "/");

  if (!hydrated) return <div className="mt-10 h-40 animate-pulse bg-plaster-deep/60" />;

  if (lines.length === 0) {
    return (
      <div className="mt-10 border-y-[1.5px] border-ink py-12">
        <p className="font-display text-[1.6rem] font-bold">{d.bag.empty}</p>
        <p className="mt-2 text-ink-soft">{d.bag.emptyHint}</p>
        <Link href={`${home === "/" ? "" : home}/#price-list`} className="btn btn-primary mt-6">
          {d.bag.continue}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
      <div>
        <BagLines />
        <Link
          href={`${home === "/" ? "" : home}/#price-list`}
          className="mt-4 inline-flex min-h-11 items-center text-[0.95rem] font-semibold underline decoration-vermilion decoration-2 underline-offset-4"
        >
          {d.bag.continue}
        </Link>
      </div>
      <aside className="h-fit border-[1.5px] border-ink bg-lime p-5 lg:sticky lg:top-24">
        <dl className="space-y-2 text-[1rem]">
          <div className="flex justify-between">
            <dt className="text-ink-soft">{d.bag.items}</dt>
            <dd className="tabular font-bold">{formatRs(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-soft">{d.bag.weight}</dt>
            <dd className="tabular">{sizeLabel(totalGrams)}</dd>
          </div>
        </dl>
        {hasUnavailable && <p className="mt-4 text-[0.9rem] text-vermilion">{d.bag.changed}</p>}
        <Link
          href={localHref(lang, "/checkout")}
          aria-disabled={hasUnavailable}
          className={`btn btn-primary mt-5 w-full ${hasUnavailable ? "pointer-events-none opacity-50" : ""}`}
        >
          {d.bag.checkout}
          <ArrowRight className="size-4" strokeWidth={2.4} aria-hidden="true" />
        </Link>
      </aside>
    </div>
  );
}
