"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { saveProduct } from "@/app/admin/actions";
import { PackFace } from "@/components/pack-face";
import { AdminForm } from "./controls";
import { FieldLabel, Panel, Toggle } from "./ui";
import { getAdminDict } from "@/lib/admin-i18n";
import { MOTIFS } from "@/lib/motifs";
import type { Lang } from "@/lib/format";
import type { Motif } from "@/lib/types";

type VariantRow = { key: string; id?: string; grams: string; price: string; inStock: boolean };

export type EditableProduct = {
  id?: string;
  nameSi: string;
  nameEn: string;
  descriptionSi: string;
  descriptionEn: string;
  categoryId: string;
  pigment: string;
  motif: Motif;
  imageId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  variants: { id?: string; grams: number; price: number; inStock: boolean }[];
};

let rowSeq = 0;
const rowKey = () => `row-${++rowSeq}`;

export function ProductEditor({
  lang,
  product,
  categories,
}: {
  lang: Lang;
  product: EditableProduct;
  categories: { id: string; name: string }[];
}) {
  const t = getAdminDict(lang).products;
  const [pigment, setPigment] = useState(product.pigment);
  const [motif, setMotif] = useState<Motif>(product.motif);
  const [rows, setRows] = useState<VariantRow[]>(() =>
    product.variants.map((v) => ({ key: rowKey(), id: v.id, grams: String(v.grams), price: String(v.price), inStock: v.inStock })),
  );

  const variantsJson = JSON.stringify(
    rows
      .filter((r) => r.grams.trim() && r.price.trim())
      .map((r) => ({ id: r.id, grams: Number(r.grams), price: Number(r.price.replace(/[,\s]/g, "")), inStock: r.inStock })),
  );
  const update = (key: string, patch: Partial<VariantRow>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  return (
    <AdminForm
      action={saveProduct}
      lang={lang}
      errors={{ name: t.errors.name, sizes: t.errors.sizes, pigment: t.errors.pigment, photo: t.errors.photo }}
      className="mt-6"
    >
      {product.id && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="variants" value={variantsJson} />

      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_12rem]">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="nameSi">{t.nameSi}</FieldLabel>
              <input id="nameSi" name="nameSi" lang="si" defaultValue={product.nameSi} className="field" required />
            </div>
            <div>
              <FieldLabel htmlFor="nameEn">{t.nameEn}</FieldLabel>
              <input id="nameEn" name="nameEn" lang="en" defaultValue={product.nameEn} className="field" required />
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="descriptionSi">{t.descSi}</FieldLabel>
            <textarea id="descriptionSi" name="descriptionSi" lang="si" rows={2} defaultValue={product.descriptionSi} className="field" />
          </div>
          <div>
            <FieldLabel htmlFor="descriptionEn">{t.descEn}</FieldLabel>
            <textarea id="descriptionEn" name="descriptionEn" lang="en" rows={2} defaultValue={product.descriptionEn} className="field" />
          </div>
          <div>
            <FieldLabel htmlFor="categoryId">{t.category}</FieldLabel>
            <select id="categoryId" name="categoryId" defaultValue={product.categoryId} className="field">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <p className="mb-1.5 font-semibold">{t.preview}</p>
          <div className="mx-auto max-w-48">
            <PackFace product={{ pigment, motif, imageId: product.imageId, nameEn: product.nameEn }} size="md" />
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <FieldLabel htmlFor="pigment">{t.pigment}</FieldLabel>
              <div className="flex gap-2">
                <input
                  type="color"
                  aria-label={t.pigment}
                  value={/^#[0-9a-fA-F]{6}$/.test(pigment) ? pigment : "#000000"}
                  onChange={(e) => setPigment(e.target.value.toUpperCase())}
                  className="h-12 w-14 shrink-0 cursor-pointer rounded-[2px] border-[1.5px] border-ink/30 bg-lime p-1"
                />
                <input
                  id="pigment"
                  name="pigment"
                  value={pigment}
                  onChange={(e) => setPigment(e.target.value)}
                  className="field tabular min-w-0 uppercase"
                  maxLength={7}
                />
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="motif">{t.motif}</FieldLabel>
              <select id="motif" name="motif" value={motif} onChange={(e) => setMotif(e.target.value as Motif)} className="field">
                {MOTIFS.map((m) => (
                  <option key={m} value={m}>
                    {getAdminDict(lang).motifs[m]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 space-y-10">
        <Panel title={t.sizes}>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto_auto] items-center gap-x-2 gap-y-2">
            <span className="text-[0.85rem] font-semibold text-ink-soft">{t.grams}</span>
            <span className="text-[0.85rem] font-semibold text-ink-soft">{t.price}</span>
            <span className="text-[0.85rem] font-semibold text-ink-soft">{t.inStock}</span>
            <span />
            {rows.map((r) => (
              <div key={r.key} className="contents">
                <input
                  aria-label={t.grams}
                  inputMode="numeric"
                  value={r.grams}
                  onChange={(e) => update(r.key, { grams: e.target.value.replace(/\D/g, "") })}
                  className="field tabular"
                />
                <input
                  aria-label={t.price}
                  inputMode="numeric"
                  value={r.price}
                  onChange={(e) => update(r.key, { price: e.target.value.replace(/[^\d,]/g, "") })}
                  className="field tabular"
                />
                <input
                  type="checkbox"
                  role="switch"
                  aria-label={t.inStock}
                  checked={r.inStock}
                  onChange={(e) => update(r.key, { inStock: e.target.checked })}
                  className="relative h-8 w-14 cursor-pointer appearance-none rounded-full border-[1.5px] border-ink/40 bg-plaster-deep transition-colors before:absolute before:left-1 before:top-1/2 before:size-5.5 before:-translate-y-1/2 before:rounded-full before:bg-lime before:shadow-[0_1px_2px_rgba(28,19,14,0.4)] before:transition-transform checked:border-ink checked:bg-leaf checked:before:translate-x-6"
                />
                <button
                  type="button"
                  onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                  aria-label={t.removeSize}
                  className="grid size-11 place-items-center text-ink-soft hover:text-vermilion"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setRows((rs) => [...rs, { key: rowKey(), grams: "", price: "", inStock: true }])}
            className="btn btn-line mt-3"
          >
            <Plus className="size-5" aria-hidden="true" /> {t.addSize}
          </button>
        </Panel>

        <Panel title={t.photo} lead={t.photoHint}>
          <input
            type="file"
            name="photo"
            accept="image/*"
            className="block w-full text-[0.95rem] file:mr-4 file:min-h-11 file:cursor-pointer file:rounded-[2px] file:border-[1.5px] file:border-ink file:bg-lime file:px-4 file:font-semibold"
          />
          {product.imageId && (
            <label className="mt-3 flex min-h-11 items-center gap-3">
              <input type="checkbox" name="removePhoto" className="size-5 accent-vermilion" />
              {t.removePhoto}
            </label>
          )}
        </Panel>

        <Panel title={t.active}>
          <div className="divide-y divide-ink/10">
            <Toggle name="isActive" defaultChecked={product.isActive} label={t.active} />
            <Toggle name="isFeatured" defaultChecked={product.isFeatured} label={t.featured} />
          </div>
        </Panel>
      </div>
    </AdminForm>
  );
}
