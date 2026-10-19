import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { logout, setAdminLang } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/server/auth";
import { getAdminLang } from "@/lib/server/admin";
import { db } from "@/lib/server/db";
import { getAdminDict } from "@/lib/admin-i18n";

// Every admin screen depends on the signed-in session, so it renders per request.
export const instant = false;

function LangToggle({ lang, label, className }: { lang: "si" | "en"; label: string; className: string }) {
  return (
    <form action={setAdminLang}>
      <input type="hidden" name="lang" value={lang === "si" ? "en" : "si"} />
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  const lang = await getAdminLang();
  const t = getAdminDict(lang);
  const todo = await db.order.count({
    where: { OR: [{ status: "NEW" }, { paymentStatus: "SLIP_UPLOADED", status: { not: "CANCELLED" } }] },
  });

  return (
    <div lang={lang} className="min-h-dvh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="hidden bg-ink text-lime lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:p-4">
        <Link href="/admin" className="mb-8 block px-3 pt-2">
          <span lang="si" className="block font-display text-[1.5rem] font-bold leading-none text-lime">
            අපෙ අම්මගේ තුනපහ
          </span>
          <span className="mt-1 block text-[0.8rem] font-semibold text-ochre-pale">{t.panel}</span>
        </Link>
        <AdminNav lang={lang} badge={todo} variant="rail" />
        <div className="mt-auto space-y-1 border-t border-lime/15 pt-4">
          <LangToggle
            lang={lang}
            label={t.switchTo}
            className="flex min-h-11 w-full items-center px-3 font-semibold text-lime/80 hover:text-lime"
          />
          <a href="/" target="_blank" className="flex min-h-11 items-center gap-2 px-3 font-semibold text-lime/80 hover:text-lime">
            <ExternalLink className="size-4" aria-hidden="true" /> {t.viewShop}
          </a>
          <form action={logout}>
            <button type="submit" className="flex min-h-11 w-full items-center gap-2 px-3 font-semibold text-lime/80 hover:text-lime">
              <LogOut className="size-4" aria-hidden="true" /> {t.logout}
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 pb-24 lg:pb-10">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b-[1.5px] border-ink bg-plaster px-4 lg:hidden">
          <Link href="/admin" className="flex items-baseline gap-2">
            <span lang="si" className="font-display text-[1.3rem] font-bold text-vermilion">
              අපෙ අම්මගේ තුනපහ
            </span>
            <span className="text-[0.8rem] font-semibold text-ink-soft">{t.panel}</span>
          </Link>
          <LangToggle lang={lang} label={t.switchTo} className="min-h-11 px-2 font-semibold" />
        </header>
        <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
      <AdminNav lang={lang} badge={todo} variant="tabs" />
    </div>
  );
}
