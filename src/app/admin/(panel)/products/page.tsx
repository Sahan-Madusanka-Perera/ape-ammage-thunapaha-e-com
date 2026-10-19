import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { PackFace } from "@/components/pack-face";
import { PageTitle } from "@/components/admin/ui";
import { toggleProduct } from "@/app/admin/actions";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { getAdminLang } from "@/lib/server/admin";
import { getAdminDict } from "@/lib/admin-i18n";
import { formatRs, pick, sizeLabel } from "@/lib/format";

export const instant = false;

export default async function ProductsPage() {
  await requireAdmin();
  const lang = await getAdminLang();
  const t = getAdminDict(lang);

  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      products: { orderBy: { sortOrder: "asc" }, include: { variants: { orderBy: { grams: "asc" } } } },
    },
  });

  return (
    <div>
      <PageTitle
        action={
          <Link href="/admin/products/new" className="btn btn-primary">
            <Plus className="size-5" strokeWidth={2.4} aria-hidden="true" /> {t.products.add}
          </Link>
        }
      >
        {t.products.title}
      </PageTitle>

      {categories.map((c) => (
        <section key={c.id} className="mt-8">
          <h2 className="bg-vermilion px-3 py-2 font-display text-[1.35rem] font-bold text-lime">
            {pick(lang, c.nameEn, c.nameSi)}
          </h2>
          <ul className="divide-y divide-ink/15 border-b border-ink/15">
            {c.products.map((p) => {
              const prices = p.variants.map((v) => v.price);
              const outOfStock = p.variants.filter((v) => !v.inStock).map((v) => sizeLabel(v.grams));
              return (
                <li key={p.id} className={`flex items-center gap-3 py-3 ${p.isActive ? "" : "opacity-60"}`}>
                  <Link href={`/admin/products/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="w-12 shrink-0">
                      <PackFace product={p} size="sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{pick(lang, p.nameEn, p.nameSi)}</p>
                      <p className="tabular truncate text-[0.88rem] text-ink-soft">
                        {p.variants.map((v) => sizeLabel(v.grams)).join(" · ")}
                        {prices.length > 0 && ` · ${formatRs(Math.min(...prices))}–${formatRs(Math.max(...prices))}`}
                      </p>
                      {outOfStock.length > 0 && (
                        <p className="text-[0.85rem] font-semibold text-vermilion">
                          {t.products.outOfStock}: {outOfStock.join(", ")}
                        </p>
                      )}
                    </div>
                  </Link>
                  <form action={toggleProduct}>
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      role="switch"
                      aria-checked={p.isActive}
                      aria-label={`${pick(lang, p.nameEn, p.nameSi)}: ${t.products.onSale}`}
                      className={`inline-flex min-h-11 items-center gap-2 rounded-[2px] border-[1.5px] px-2.5 text-[0.85rem] font-bold ${p.isActive ? "border-leaf bg-leaf-pale text-leaf" : "border-ink/30 text-ink-soft"}`}
                    >
                      <span className={`size-2.5 rounded-full ${p.isActive ? "bg-leaf" : "bg-ink/30"}`} />
                      {p.isActive ? t.products.onSale : t.products.hidden}
                    </button>
                  </form>
                  <Link href={`/admin/products/${p.id}`} aria-label={t.products.edit} className="grid size-11 place-items-center text-ink-soft">
                    <ChevronRight className="size-5" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
