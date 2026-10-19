import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Band } from "@/components/art";
import { LoginForm } from "@/components/admin/login-form";
import { getAdmin } from "@/lib/server/auth";
import { getAdminLang } from "@/lib/server/admin";
import { getAdminDict } from "@/lib/admin-i18n";

export const metadata: Metadata = { title: "Sign in" };
export const instant = false;

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  const lang = await getAdminLang();
  const t = getAdminDict(lang);

  return (
    <div lang={lang} className="grid min-h-dvh place-items-center bg-vermilion px-4 py-10">
      <div className="w-full max-w-sm border-[1.5px] border-ink bg-plaster">
        <div aria-hidden="true">
          <Band kind="petals" line="#1c130e" fill="#a3291b" ground="#d9a21b" height={14} />
          <div className="h-[1.5px] bg-ink" />
        </div>
        <div className="p-6">
          <p lang="si" className="font-display text-[1.8rem] font-bold leading-none text-vermilion">
            අපෙ අම්මගේ තුනපහ
          </p>
          <h1 className="mt-2 text-[1.05rem] font-semibold text-ink-soft">{t.login.title}</h1>
          <LoginForm lang={lang} />
        </div>
      </div>
    </div>
  );
}
