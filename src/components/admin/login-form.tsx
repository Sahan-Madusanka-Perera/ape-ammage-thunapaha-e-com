"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { login } from "@/app/admin/actions";
import { getAdminDict } from "@/lib/admin-i18n";
import type { Lang } from "@/lib/format";

export function LoginForm({ lang }: { lang: Lang }) {
  const t = getAdminDict(lang);
  const [state, action, pending] = useActionState(login, null);

  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block font-semibold">
          {t.login.email}
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block font-semibold">
          {t.login.password}
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {state?.error && (
        <p role="alert" className="text-[0.95rem] font-semibold text-vermilion">
          {t.login.wrong}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending && <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />}
        {t.login.submit}
      </button>
    </form>
  );
}
