"use client";

import { useEffect, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { getDict } from "@/lib/i18n";
import { formatNumber, formatRs, pick, sizeLabel } from "@/lib/format";
import type { CatalogProduct, CatalogVariant } from "@/lib/types";
import { useStore } from "./store-provider";

function useFlash(ms = 1600) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!on) return;
    const t = setTimeout(() => setOn(false), ms);
    return () => clearTimeout(t);
  }, [on, ms]);
  return [on, () => setOn(true)] as const;
}

/**
 * One cell of the price board: tapping the price puts that size in the bag.
 * tone "lime" sits on vermilion (the hero ladder); "plaster" sits in the price list.
 */
export function PriceCell({
  product,
  variant,
  tone = "plaster",
  showSize = false,
}: {
  product: CatalogProduct;
  variant: CatalogVariant;
  tone?: "plaster" | "lime" | "strip";
  /** "mobile" shows the size inside the cell only where the column header is hidden. */
  showSize?: boolean | "mobile";
}) {
  const { lang, add } = useStore();
  const d = getDict(lang);
  const [flash, trigger] = useFlash();
  const name = pick(lang, product.nameEn, product.nameSi);
  const size = sizeLabel(variant.grams);

  if (!variant.inStock) {
    return (
      <span
        className={`flex min-h-12 flex-col items-center justify-center px-1 text-center text-[0.75rem] leading-tight ${tone === "lime" ? "text-lime/70" : "text-ink-soft/80"} ${tone === "strip" ? "bg-plaster-deep" : ""}`}
      >
        {showSize && <span className={`font-semibold ${showSize === "mobile" ? "sm:hidden" : ""}`}>{size}</span>}
        <span>{d.product.outOfStock}</span>
      </span>
    );
  }

  const base =
    tone === "strip"
      ? "rounded-none bg-lime text-ink hover:bg-ochre-pale"
      : tone === "lime"
        ? "bg-lime text-ink hover:bg-ochre-pale"
        : "bg-lime text-ink ring-1 ring-ink/15 hover:bg-ochre-pale hover:ring-ink/40";

  return (
    <button
      type="button"
      onClick={() => {
        add(variant.id);
        trigger();
      }}
      aria-label={`${d.product.add}: ${name} ${size}, ${formatRs(variant.price)}`}
      className={`group relative flex min-h-12 w-full flex-col items-center justify-center rounded-[2px] px-1 py-1.5 text-center transition-[background-color,box-shadow,transform] duration-150 active:translate-y-px ${flash ? "bg-ochre! text-ink ring-ink/60" : base}`}
    >
      {showSize && (
        <span
          className={`text-[0.72rem] font-semibold leading-none text-ink-soft group-hover:text-ink ${showSize === "mobile" ? "sm:hidden" : ""}`}
        >
          {size}
        </span>
      )}
      <span className="tabular mt-0.5 flex items-center gap-1 text-[0.98rem] font-bold leading-tight">
        {flash ? (
          <>
            <Check className="size-4" strokeWidth={3} aria-hidden="true" />
            <span className="text-[0.85rem]">{d.product.added}</span>
          </>
        ) : (
          formatNumber(variant.price)
        )}
      </span>
    </button>
  );
}

/** Product page: choose a size, choose how many, add. */
export function SizeLadder({ product }: { product: CatalogProduct }) {
  const { lang, add } = useStore();
  const d = getDict(lang);
  const firstInStock = product.variants.find((v) => v.inStock) ?? product.variants[0];
  const [selected, setSelected] = useState(firstInStock?.id);
  const [quantity, setQuantity] = useState(1);
  const [flash, trigger] = useFlash(2000);

  const variant = product.variants.find((v) => v.id === selected) ?? firstInStock;
  if (!variant) return null;

  // Honest saving: what this size costs against two of the next size down.
  const index = product.variants.findIndex((v) => v.id === variant.id);
  const smaller = index > 0 ? product.variants[index - 1] : null;
  const saving =
    smaller && smaller.grams * 2 === variant.grams ? smaller.price * 2 - variant.price : 0;

  return (
    <div>
      <fieldset>
        <legend className="mb-3 text-[0.95rem] font-semibold">{d.product.chooseSize}</legend>
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${Math.min(product.variants.length, 5)}, minmax(0, 1fr))` }}
        >
          {product.variants.map((v) => {
            const active = v.id === variant.id;
            return (
              <label
                key={v.id}
                className={`relative flex min-h-[4.5rem] cursor-pointer flex-col items-center justify-center rounded-[2px] border-[1.5px] px-1 text-center transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ochre-deep ${
                  active
                    ? "border-ink bg-ochre text-ink"
                    : v.inStock
                      ? "border-ink/20 bg-lime hover:border-ink/60"
                      : "cursor-not-allowed border-dashed border-ink/20 bg-transparent text-ink-soft/70"
                }`}
              >
                <input
                  type="radio"
                  name="size"
                  value={v.id}
                  checked={active}
                  disabled={!v.inStock}
                  onChange={() => setSelected(v.id)}
                  className="sr-only"
                />
                <span className="text-[0.85rem] font-semibold">{sizeLabel(v.grams)}</span>
                <span className="tabular text-[1.02rem] font-bold">
                  {v.inStock ? formatNumber(v.price) : d.product.outOfStock}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <p className="mt-3 min-h-6 text-[0.9rem] text-leaf">
        {saving > 0 && smaller ? d.product.saving(formatRs(saving), sizeLabel(smaller.grams)) : ""}
      </p>

      <div className="mt-4 flex items-stretch gap-2.5 sm:gap-3">
        <div className="flex shrink-0 items-stretch rounded-[2px] border-[1.5px] border-ink/25 bg-lime">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="grid w-11 place-items-center hover:bg-plaster-deep disabled:opacity-40"
            disabled={quantity <= 1}
            aria-label={d.product.decrease}
          >
            <Minus className="size-4" strokeWidth={2.4} />
          </button>
          <output aria-label={d.product.quantity} className="tabular grid w-10 place-items-center text-[1.05rem] font-bold">
            {quantity}
          </output>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(50, q + 1))}
            className="grid w-11 place-items-center hover:bg-plaster-deep"
            aria-label={d.product.increase}
          >
            <Plus className="size-4" strokeWidth={2.4} />
          </button>
        </div>
        <button
          type="button"
          disabled={!variant.inStock}
          onClick={() => {
            add(variant.id, quantity);
            trigger();
          }}
          className="btn btn-primary min-w-0 flex-1 px-3 text-[1.02rem]"
        >
          {flash ? (
            <>
              <Check className="size-5" strokeWidth={2.6} aria-hidden="true" /> {d.product.added}
            </>
          ) : (
            <>
              {d.product.add} <span className="tabular opacity-90">· {formatRs(variant.price * quantity)}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
