"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useState, type ReactNode } from "react";
import { Check, Copy, LoaderCircle } from "lucide-react";
import { placeOrder, type CheckoutState } from "@/app/[lang]/checkout/actions";
import { WhatsAppIcon } from "@/components/art";
import { DISTRICTS, deliveryFee, type DeliveryRates } from "@/lib/delivery";
import { getDict } from "@/lib/i18n";
import { formatRs, localHref, pick, sizeLabel } from "@/lib/format";
import type { PaymentOptions } from "@/lib/types";
import { useStore } from "./store-provider";

type Method = "COD" | "BANK_TRANSFER" | "WHATSAPP";
const DETAILS_KEY = "aat-details-v1";
const SAVED_FIELDS = ["customerName", "phone", "email", "addressLine", "city", "district"] as const;
type Saved = Partial<Record<(typeof SAVED_FIELDS)[number], string>>;

function Station({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`station-${n}`} className="border-t-[1.5px] border-ink pt-5">
      <h2 id={`station-${n}`} className="flex items-center gap-3 font-display text-[1.6rem] font-bold leading-none">
        <span className="tabular grid size-9 shrink-0 place-items-center rounded-full bg-ink font-sans text-[0.95rem] text-lime">
          {n}
        </span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[0.95rem] font-semibold">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-[0.88rem] text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[0.9rem] font-semibold text-vermilion">
          {error}
        </p>
      )}
    </div>
  );
}

export function CheckoutForm({ delivery, payments }: { delivery: DeliveryRates; payments: PaymentOptions }) {
  const { lang, lines, subtotal, totalGrams, hydrated, hasUnavailable } = useStore();
  const d = getDict(lang);
  const c = d.checkout;
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(placeOrder, null);

  const methods = (["COD", "BANK_TRANSFER", "WHATSAPP"] as Method[]).filter((m) =>
    m === "COD" ? payments.cod.enabled : m === "BANK_TRANSFER" ? payments.bank.enabled : payments.whatsapp.enabled,
  );

  const [saved, setSaved] = useState<Saved | null>(null);
  const [district, setDistrict] = useState("");
  const [method, setMethod] = useState<Method | "">(methods.length === 1 ? methods[0] : "");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const value = JSON.parse(localStorage.getItem(DETAILS_KEY) ?? "null") as Saved | null;
      // Restoring the shopper's own saved details after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSaved(value ?? {});
      if (value?.district) setDistrict(value.district);
    } catch {
      setSaved({});
    }
  }, []);

  const errors = state?.fieldErrors ?? {};
  const err = (key: string) => {
    const code = errors[key];
    return code ? (c.errors[code as keyof typeof c.errors] ?? c.errors.generic) : undefined;
  };

  const fee = district ? deliveryFee(delivery, district, totalGrams, subtotal) : null;
  const codFee = method === "COD" ? payments.cod.fee : 0;
  const total = subtotal + (fee ?? 0) + codFee;
  const home = localHref(lang, "/");

  if (!hydrated || saved === null) return <div className="mt-10 h-96 animate-pulse bg-plaster-deep/60" />;

  if (lines.length === 0) {
    return (
      <div className="mt-10 border-y-[1.5px] border-ink py-12">
        <p className="font-display text-[1.6rem] font-bold">{d.bag.empty}</p>
        <Link href={`${home === "/" ? "" : home}/#price-list`} className="btn btn-primary mt-6">
          {d.bag.continue}
        </Link>
      </div>
    );
  }

  const fieldProps = (name: string) => ({
    id: name,
    name,
    className: "field",
    "aria-invalid": Boolean(errors[name]) || undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        try {
          const keep: Saved = {};
          for (const k of SAVED_FIELDS) keep[k] = String(form.get(k) ?? "");
          localStorage.setItem(DETAILS_KEY, JSON.stringify(keep));
        } catch {
          // Saving details is a convenience only.
        }
        startTransition(() => formAction(form));
      }}
      className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-14"
    >
      <input type="hidden" name="lang" value={lang} />
      <input
        type="hidden"
        name="bag"
        value={JSON.stringify(lines.filter((l) => l.available).map((l) => ({ variantId: l.variantId, quantity: l.quantity })))}
      />

      <div className="space-y-12">
        <Station n={1} title={c.stations[0]}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field id="customerName" label={c.name} error={err("customerName")}>
                <input {...fieldProps("customerName")} autoComplete="name" defaultValue={saved.customerName} />
              </Field>
            </div>
            <Field id="phone" label={c.phone} error={err("phone")} hint={c.phoneHint}>
              <input
                {...fieldProps("phone")}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="07X XXX XXXX"
                defaultValue={saved.phone}
                aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
              />
            </Field>
            <Field id="email" label={c.email} error={err("email")}>
              <input {...fieldProps("email")} type="email" autoComplete="email" defaultValue={saved.email} />
            </Field>
            <div className="sm:col-span-2">
              <Field id="addressLine" label={c.address} error={err("addressLine")}>
                <input {...fieldProps("addressLine")} autoComplete="street-address" defaultValue={saved.addressLine} />
              </Field>
            </div>
            <Field id="city" label={c.city} error={err("city")}>
              <input {...fieldProps("city")} autoComplete="address-level2" defaultValue={saved.city} />
            </Field>
            <Field id="district" label={c.district} error={err("district")}>
              <select
                {...fieldProps("district")}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                <option value="">{c.chooseDistrict}</option>
                {DISTRICTS.map((x) => (
                  <option key={x.key} value={x.key}>
                    {lang === "si" ? `${x.si} · ${x.key}` : x.key}
                  </option>
                ))}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field id="notes" label={c.notes}>
                <textarea id="notes" name="notes" rows={2} className="field resize-y" maxLength={500} />
              </Field>
            </div>
          </div>
        </Station>

        <Station n={2} title={c.stations[1]}>
          <fieldset aria-describedby={errors.paymentMethod ? "payment-error" : undefined}>
            <legend className="sr-only">{c.stations[1]}</legend>
            <div className="grid gap-3">
              {methods.map((m) => {
                const active = method === m;
                return (
                  <label
                    key={m}
                    className={`flex cursor-pointer gap-4 rounded-[2px] border-[1.5px] p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ochre-deep ${
                      active ? "border-ink bg-ochre-pale" : "border-ink/20 bg-lime hover:border-ink/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={m}
                      checked={active}
                      onChange={() => setMethod(m)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={`mt-1 grid size-5 shrink-0 place-items-center rounded-full border-2 ${active ? "border-ink bg-ink" : "border-ink/40"}`}
                    >
                      {active && <span className="size-2 rounded-full bg-ochre" />}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 font-semibold">
                        {m === "WHATSAPP" && <WhatsAppIcon className="size-5 text-leaf" />}
                        {c.methods[m].title}
                        {m === "COD" && payments.cod.fee > 0 && (
                          <span className="tabular font-normal text-ink-soft">+{formatRs(payments.cod.fee)}</span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-[0.92rem] text-ink-soft">{c.methods[m].body}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.paymentMethod && (
              <p id="payment-error" className="mt-2 text-[0.9rem] font-semibold text-vermilion">
                {c.errors.payment}
              </p>
            )}
          </fieldset>

          {method === "BANK_TRANSFER" && (
            <div className="mt-5 border-[1.5px] border-ink bg-lime p-5">
              <p className="font-semibold">{c.bankDetails}</p>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-[0.98rem]">
                <dt className="text-ink-soft">{c.bank}</dt>
                <dd>{payments.bank.bankName}</dd>
                {payments.bank.branch && (
                  <>
                    <dt className="text-ink-soft">{c.branch}</dt>
                    <dd>{payments.bank.branch}</dd>
                  </>
                )}
                <dt className="text-ink-soft">{c.accountName}</dt>
                <dd>{payments.bank.accountName}</dd>
                <dt className="text-ink-soft">{c.accountNumber}</dt>
                <dd className="flex flex-wrap items-center gap-2">
                  <span className="tabular text-[1.1rem] font-bold">{payments.bank.accountNumber}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(payments.bank.accountNumber).then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1800);
                      });
                    }}
                    className="inline-flex min-h-9 items-center gap-1.5 px-2 text-[0.88rem] font-semibold text-vermilion hover:underline"
                  >
                    {copied ? <Check className="size-4" strokeWidth={2.6} /> : <Copy className="size-4" strokeWidth={2} />}
                    {copied ? (lang === "si" ? "පිටපත් කළා" : "Copied") : lang === "si" ? "පිටපත් කරන්න" : "Copy"}
                  </button>
                </dd>
              </dl>
              <div className="mt-5">
                <Field id="slip" label={c.slip} error={err("slip")} hint={c.slipHint}>
                  <input
                    id="slip"
                    name="slip"
                    type="file"
                    accept="image/*,application/pdf"
                    className="block w-full text-[0.95rem] file:mr-4 file:min-h-11 file:cursor-pointer file:rounded-[2px] file:border-0 file:bg-ink file:px-4 file:font-semibold file:text-lime hover:file:bg-ink-soft"
                    aria-describedby={errors.slip ? "slip-error" : "slip-hint"}
                  />
                </Field>
              </div>
            </div>
          )}
        </Station>
      </div>

      <aside className="h-fit lg:sticky lg:top-24">
        <Station n={3} title={c.stations[2]}>
          <div className="border-[1.5px] border-ink bg-lime">
            <ul className="divide-y divide-ink/10 px-4">
              {lines
                .filter((l) => l.available && l.product && l.variant)
                .map((l) => (
                  <li key={l.variantId} className="flex items-baseline justify-between gap-3 py-2.5 text-[0.95rem]">
                    <span className="min-w-0">
                      <span className="font-semibold">{pick(lang, l.product!.nameEn, l.product!.nameSi)}</span>{" "}
                      <span className="tabular text-ink-soft">
                        {sizeLabel(l.variant!.grams)} × {l.quantity}
                      </span>
                    </span>
                    <span className="tabular shrink-0">{formatRs(l.lineTotal)}</span>
                  </li>
                ))}
            </ul>
            <dl className="space-y-1.5 border-t-[1.5px] border-ink px-4 py-3 text-[0.98rem]">
              <div className="flex justify-between">
                <dt className="text-ink-soft">{c.subtotal}</dt>
                <dd className="tabular">{formatRs(subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">
                  {c.delivery} <span className="tabular">({sizeLabel(totalGrams)})</span>
                </dt>
                <dd className="tabular text-right">
                  {fee === null ? <span className="text-ink-soft">{c.deliveryPending}</span> : fee === 0 ? c.free : formatRs(fee)}
                </dd>
              </div>
              {codFee > 0 && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-soft">{c.codFee}</dt>
                  <dd className="tabular">{formatRs(codFee)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-ink/15 pt-2 text-[1.15rem] font-bold">
                <dt>{c.total}</dt>
                <dd className="tabular">{formatRs(total)}</dd>
              </div>
            </dl>
          </div>

          {(state?.error || Object.keys(errors).length > 0) && (
            <p role="alert" className="mt-4 bg-vermilion px-4 py-3 text-[0.95rem] font-semibold text-lime">
              {state?.error
                ? (c.errors[state.error as keyof typeof c.errors] ?? c.errors.generic)
                : lang === "si"
                  ? "කරුණාකර ඉහත සලකුණු කළ කොටස් පරීක්ෂා කරන්න."
                  : "Please check the highlighted details above."}
            </p>
          )}

          <button type="submit" disabled={pending || hasUnavailable} className="btn btn-primary mt-4 w-full text-[1.05rem]">
            {pending ? (
              <>
                <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> {c.placing}
              </>
            ) : (
              <>
                {c.place} <span className="tabular">· {formatRs(total)}</span>
              </>
            )}
          </button>
          <Link
            href={localHref(lang, "/bag")}
            className="mt-3 inline-flex min-h-11 items-center text-[0.95rem] font-semibold underline decoration-vermilion decoration-2 underline-offset-4"
          >
            {c.editBag}
          </Link>
        </Station>
      </aside>
    </form>
  );
}
