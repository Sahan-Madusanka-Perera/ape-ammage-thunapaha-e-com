"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { getDict } from "@/lib/i18n";
import { formatRs, localHref, pick, sizeLabel, unlocalisedPath } from "@/lib/format";
import { useStore } from "./store-provider";

/** Follows the shopper down the page once the bag has something in it. */
export function BagBar() {
  const { lang, count, subtotal, hydrated, lastAdded, pulse } = useStore();
  const pathname = usePathname();
  const d = getDict(lang);
  const path = unlocalisedPath(pathname);

  if (!hydrated || count === 0 || path === "/bag" || path === "/checkout" || path.startsWith("/order")) {
    return (
      <p aria-live="polite" className="sr-only">
        {lastAdded ? d.product.addedToBag(pick(lang, lastAdded.product.nameEn, lastAdded.product.nameSi), sizeLabel(lastAdded.variant.grams)) : ""}
      </p>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 p-3 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:p-0">
      <Link
        key={pulse}
        href={localHref(lang, "/bag")}
        className="pointer-events-auto flex min-h-14 w-full animate-bump items-center gap-3 rounded-[3px] bg-ink px-4 py-2.5 text-lime shadow-[0_10px_30px_-10px_rgba(28,19,14,0.7)] sm:w-[22rem]"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ochre text-[0.85rem] font-bold text-ink tabular">
          {count}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          {lastAdded ? (
            <span className="flex items-center gap-1.5 truncate text-[0.9rem]">
              <Check className="size-4 shrink-0 text-ochre" strokeWidth={2.5} aria-hidden="true" />
              <span className="truncate">
                {pick(lang, lastAdded.product.nameEn, lastAdded.product.nameSi)} {sizeLabel(lastAdded.variant.grams)}
              </span>
            </span>
          ) : (
            <span className="text-[0.9rem] text-lime/80">{d.bag.items}</span>
          )}
          <span className="tabular block text-[1.02rem] font-bold">{formatRs(subtotal)}</span>
        </span>
        <span className="flex items-center gap-1.5 text-[0.95rem] font-semibold text-ochre">
          {d.bag.viewBag}
          <ArrowRight className="size-4" strokeWidth={2.4} aria-hidden="true" />
        </span>
      </Link>
      <p aria-live="polite" className="sr-only">
        {lastAdded ? d.product.addedToBag(pick(lang, lastAdded.product.nameEn, lastAdded.product.nameSi), sizeLabel(lastAdded.variant.grams)) : ""}
      </p>
    </div>
  );
}
