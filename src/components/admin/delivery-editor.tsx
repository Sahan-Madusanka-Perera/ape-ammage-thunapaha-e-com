"use client";

import { useState } from "react";
import { saveDelivery } from "@/app/admin/actions";
import { AdminForm } from "./controls";
import { FieldLabel, Panel } from "./ui";
import { getAdminDict } from "@/lib/admin-i18n";
import { DISTRICTS, deliveryFee, type DeliveryRates } from "@/lib/delivery";
import { formatRs, sizeLabel, type Lang } from "@/lib/format";

const num = (v: string) => {
  const n = Number(v.replace(/[,\s]/g, ""));
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
};

export function DeliveryEditor({ lang, rates }: { lang: Lang; rates: DeliveryRates }) {
  const t = getAdminDict(lang).delivery;
  const [base, setBase] = useState(String(rates.baseFee));
  const [extra, setExtra] = useState(String(rates.perExtraKg));
  const [free, setFree] = useState(rates.freeOver === null ? "" : String(rates.freeOver));
  const [custom, setCustom] = useState<Record<string, { on: boolean; base: string; extra: string }>>(() =>
    Object.fromEntries(
      DISTRICTS.map((d) => {
        const o = rates.overrides[d.key];
        return [d.key, { on: Boolean(o), base: String(o?.baseFee ?? rates.baseFee), extra: String(o?.perExtraKg ?? rates.perExtraKg) }];
      }),
    ),
  );

  const live: DeliveryRates = {
    baseFee: num(base),
    perExtraKg: num(extra),
    freeOver: free.trim() ? num(free) : null,
    overrides: Object.fromEntries(
      Object.entries(custom)
        .filter(([, v]) => v.on)
        .map(([k, v]) => [k, { baseFee: num(v.base), perExtraKg: num(v.extra) }]),
    ),
  };
  const example = deliveryFee({ ...live, freeOver: null }, "Colombo", 1500, 0);

  return (
    <AdminForm action={saveDelivery} lang={lang} className="mt-6">
      <div className="space-y-10">
        <Panel title={t.title} lead={t.lead}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="baseFee">{t.base}</FieldLabel>
              <input id="baseFee" name="baseFee" inputMode="numeric" value={base} onChange={(e) => setBase(e.target.value)} className="field tabular" />
            </div>
            <div>
              <FieldLabel htmlFor="perExtraKg">{t.extra}</FieldLabel>
              <input id="perExtraKg" name="perExtraKg" inputMode="numeric" value={extra} onChange={(e) => setExtra(e.target.value)} className="field tabular" />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="freeOver" hint={t.freeOverHint}>
                {t.freeOver}
              </FieldLabel>
              <input id="freeOver" name="freeOver" inputMode="numeric" value={free} onChange={(e) => setFree(e.target.value)} className="field tabular sm:max-w-xs" />
            </div>
          </div>
          <p className="mt-4 bg-ochre-pale px-4 py-3 font-semibold">
            {t.example(sizeLabel(1500), lang === "si" ? "කොළඹ" : "Colombo", formatRs(example))}
          </p>
        </Panel>

        <Panel title={t.districts} lead={t.districtsLead}>
          <ul className="divide-y divide-ink/10 border-y border-ink/15">
            {DISTRICTS.map((d) => {
              const row = custom[d.key];
              const set = (patch: Partial<typeof row>) => setCustom((c) => ({ ...c, [d.key]: { ...c[d.key], ...patch } }));
              return (
                <li key={d.key} className="py-2.5">
                  <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3">
                    <span>
                      <span lang="si" className="font-semibold">{d.si}</span>{" "}
                      <span className="text-[0.9rem] text-ink-soft">{d.key}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-[0.85rem] text-ink-soft">{row.on ? t.custom : t.usesDefault}</span>
                      <input
                        type="checkbox"
                        role="switch"
                        name={`custom:${d.key}`}
                        checked={row.on}
                        onChange={(e) => set({ on: e.target.checked })}
                        className="relative h-8 w-14 shrink-0 cursor-pointer appearance-none rounded-full border-[1.5px] border-ink/40 bg-plaster-deep transition-colors before:absolute before:left-1 before:top-1/2 before:size-5.5 before:-translate-y-1/2 before:rounded-full before:bg-lime before:shadow-[0_1px_2px_rgba(28,19,14,0.4)] before:transition-transform checked:border-ink checked:bg-leaf checked:before:translate-x-6"
                      />
                    </span>
                  </label>
                  {row.on && (
                    <div className="mt-2 grid grid-cols-2 gap-3 pb-1">
                      <div>
                        <FieldLabel htmlFor={`base:${d.key}`}>{t.base}</FieldLabel>
                        <input
                          id={`base:${d.key}`}
                          name={`base:${d.key}`}
                          inputMode="numeric"
                          value={row.base}
                          onChange={(e) => set({ base: e.target.value })}
                          className="field tabular"
                        />
                      </div>
                      <div>
                        <FieldLabel htmlFor={`extra:${d.key}`}>{t.extra}</FieldLabel>
                        <input
                          id={`extra:${d.key}`}
                          name={`extra:${d.key}`}
                          inputMode="numeric"
                          value={row.extra}
                          onChange={(e) => set({ extra: e.target.value })}
                          className="field tabular"
                        />
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </AdminForm>
  );
}
