"use client";

import { startTransition, useActionState, useEffect, useState, type ReactNode } from "react";
import { Check, LoaderCircle } from "lucide-react";
import type { FormState } from "@/app/admin/actions";
import { getAdminDict } from "@/lib/admin-i18n";
import type { Lang } from "@/lib/format";

/**
 * A settings form with a save bar that follows the owner down long pages.
 * Submits without resetting the fields, and confirms the save in words.
 */
export function AdminForm({
  action,
  lang,
  children,
  errors,
  saveLabel,
  className = "",
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  lang: Lang;
  children: ReactNode;
  errors?: Record<string, string>;
  saveLabel?: string;
  className?: string;
}) {
  const t = getAdminDict(lang);
  const [state, formAction, pending] = useActionState(action, null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!state?.ok || !state.at) return;
    // Show the confirmation for the save that just finished.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSavedAt(state.at);
    const timer = setTimeout(() => setSavedAt(null), 3500);
    return () => clearTimeout(timer);
  }, [state]);

  const message = state?.error ? (errors?.[state.error] ?? t.error) : null;

  return (
    <form
      noValidate
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
    >
      {children}
      <div className="sticky bottom-[4.75rem] z-10 mt-8 flex min-h-16 flex-wrap items-center gap-x-4 gap-y-2 border-[1.5px] border-ink bg-lime px-3 py-2.5 shadow-[0_10px_24px_-14px_rgba(28,19,14,0.6)] lg:bottom-4">
        <button type="submit" disabled={pending} className="btn btn-primary min-w-36">
          {pending ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : null}
          {pending ? t.saving : (saveLabel ?? t.save)}
        </button>
        <p aria-live="polite" className="text-[0.95rem] font-semibold">
          {message ? (
            <span className="text-vermilion">{message}</span>
          ) : savedAt ? (
            <span className="flex items-center gap-1.5 text-leaf">
              <Check className="size-5" strokeWidth={2.6} aria-hidden="true" />
              {t.saved}
            </span>
          ) : null}
        </p>
      </div>
    </form>
  );
}

/** A two-step button for things that are hard to undo: the first tap asks, the second does it. */
export function ConfirmButton({
  label,
  confirmLabel,
  cancelLabel,
  className = "btn btn-line text-vermilion",
}: {
  label: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  className?: string;
}) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button type="button" onClick={() => setAsking(true)} className={className}>
        {label}
      </button>
    );
  }
  return (
    <span className="flex flex-wrap gap-2">
      <button type="submit" className="btn bg-vermilion text-lime hover:bg-vermilion-bright">
        {confirmLabel}
      </button>
      <button type="button" onClick={() => setAsking(false)} className="btn btn-line">
        {cancelLabel}
      </button>
    </span>
  );
}

export function SubmitButton({ children, className = "btn btn-primary" }: { children: ReactNode; className?: string }) {
  return (
    <button type="submit" className={className}>
      {children}
    </button>
  );
}
