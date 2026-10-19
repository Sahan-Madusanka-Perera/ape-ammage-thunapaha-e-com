import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductEditor, type EditableProduct } from "@/components/admin/product-editor";
import { ConfirmButton } from "@/components/admin/controls";
import { deleteProduct } from "@/app/admin/actions";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { getAdminLang } from "@/lib/server/admin";
import { getAdminDict } from "@/lib/admin-i18n";
import { pick } from "@/lib/format";

export const instant = false;

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const lang = await getAdminLang();
  const t = getAdminDict(lang);
  const { id } = await params;

  const isNew = id === "new";
  const [product, categories] = await Promise.all([
    isNew
      ? null
      : db.product.findUnique({ where: { id }, include: { variants: { orderBy: { grams: "asc" } } } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!isNew && !product) notFound();

  const editable: EditableProduct = product
    ? {
        id: product.id,
        nameSi: product.nameSi,
        nameEn: product.nameEn,
        descriptionSi: product.descriptionSi,
        descriptionEn: product.descriptionEn,
        categoryId: product.categoryId,
        pigment: product.pigment,
        motif: product.motif,
        imageId: product.imageId,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        variants: product.variants.map((v) => ({ id: v.id, grams: v.grams, price: v.price, inStock: v.inStock })),
      }
    : {
        nameSi: "",
        nameEn: "",
        descriptionSi: "",
        descriptionEn: "",
        categoryId: categories[0]?.id ?? "",
        pigment: "#A3291B",
        motif: "CURRY",
        imageId: null,
        isActive: true,
        isFeatured: false,
        variants: [50, 100, 250, 500, 1000].map((grams) => ({ grams, price: 0, inStock: true })),
      };

  return (
    <div>
      <Link href="/admin/products" className="-ml-1 inline-flex min-h-11 items-center gap-2 font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-5" aria-hidden="true" /> {t.products.title}
      </Link>
      <h1 className="mt-2 font-display text-[2.2rem] font-bold leading-tight">
        {product ? pick(lang, product.nameEn, product.nameSi) : t.products.newTitle}
      </h1>

      <ProductEditor
        lang={lang}
        product={editable}
        categories={categories.map((c) => ({ id: c.id, name: pick(lang, c.nameEn, c.nameSi) }))}
      />

      {product && (
        <form action={deleteProduct} className="mt-10 border-t border-ink/15 pt-6">
          <input type="hidden" name="id" value={product.id} />
          <ConfirmButton label={t.products.delete} confirmLabel={t.products.confirmDelete} cancelLabel={t.cancel} />
        </form>
      )}
    </div>
  );
}
