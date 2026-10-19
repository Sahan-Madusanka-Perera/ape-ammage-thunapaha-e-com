"use client";

import { useActionState, useEffect } from "react";
import { LoaderCircle, Upload } from "lucide-react";
import { uploadSlip, type SlipState } from "@/app/[lang]/order/[token]/actions";
import { getDict } from "@/lib/i18n";
import type { Lang } from "@/lib/format";
import { useStore } from "./store-provider";

/** Empties the bag once, right after an order is placed, then tidies the URL. */
export function ClearBagOnce() {
  const { clear, hydrated } = useStore();
  useEffect(() => {
    if (!hydrated) return;
    clear();
    window.history.replaceState(null, "", window.location.pathname);
  }, [hydrated, clear]);
  return null;
}

export function SlipUpload({ token, lang }: { token: string; lang: Lang }) {
  const d = getDict(lang);
  const [state, action, pending] = useActionState<SlipState, FormData>(uploadSlip.bind(null, token), null);
  const error = state?.error
    ? (d.checkout.errors[state.error as keyof typeof d.checkout.errors] ?? d.checkout.errors.generic)
    : null;

  return (
    <form action={action} className="mt-5">
      <label htmlFor="slip" className="mb-1.5 block font-semibold">
        {d.checkout.slip}
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <input
          id="slip"
          name="slip"
          type="file"
          required
          accept="image/*,application/pdf"
          className="block min-w-0 flex-1 text-[0.95rem] file:mr-4 file:min-h-11 file:cursor-pointer file:rounded-[2px] file:border-[1.5px] file:border-ink file:bg-lime file:px-4 file:font-semibold"
          aria-describedby={error ? "slip-error" : "slip-hint"}
        />
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : <Upload className="size-5" strokeWidth={2} aria-hidden="true" />}
          {pending ? d.order.uploading : d.order.uploadSlip}
        </button>
      </div>
      {error ? (
        <p id="slip-error" role="alert" className="mt-2 text-[0.9rem] font-semibold text-vermilion">
          {error}
        </p>
      ) : (
        <p id="slip-hint" className="mt-2 text-[0.88rem] text-ink-soft">
          {d.checkout.slipHint}
        </p>
      )}
    </form>
  );
}
