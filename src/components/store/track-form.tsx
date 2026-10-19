"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { findOrder } from "@/app/[lang]/track/actions";
import { getDict } from "@/lib/i18n";
import type { Lang } from "@/lib/format";

export function TrackForm({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  const [state, action, pending] = useActionState(findOrder, null);

  return (
    <form action={action} className="mt-8 space-y-5 border-t-[1.5px] border-ink pt-6">
      <input type="hidden" name="lang" value={lang} />
      <div>
        <label htmlFor="number" className="mb-1.5 block font-semibold">
          {d.track.number}
        </label>
        <input id="number" name="number" inputMode="numeric" placeholder="1001" required className="field tabular" />
      </div>
      <div>
        <label htmlFor="phone" className="mb-1.5 block font-semibold">
          {d.track.phone}
        </label>
        <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="07X XXX XXXX" required className="field" />
      </div>
      {state?.notFound && (
        <p role="alert" className="text-[0.95rem] font-semibold text-vermilion">
          {d.track.notFound}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full sm:w-auto">
        {pending && <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />}
        {d.track.find}
      </button>
    </form>
  );
}
