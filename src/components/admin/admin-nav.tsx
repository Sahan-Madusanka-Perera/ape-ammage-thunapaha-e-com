"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Landmark, Package, Settings, Truck } from "lucide-react";
import { getAdminDict } from "@/lib/admin-i18n";
import type { Lang } from "@/lib/format";

const ITEMS = [
  { href: "/admin", key: "orders", Icon: ClipboardList },
  { href: "/admin/products", key: "products", Icon: Package },
  { href: "/admin/delivery", key: "delivery", Icon: Truck },
  { href: "/admin/payments", key: "payments", Icon: Landmark },
  { href: "/admin/settings", key: "settings", Icon: Settings },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" || pathname.startsWith("/admin/orders") : pathname.startsWith(href);
}

export function AdminNav({ lang, badge, variant }: { lang: Lang; badge: number; variant: "rail" | "tabs" }) {
  const pathname = usePathname();
  const t = getAdminDict(lang);

  if (variant === "rail") {
    return (
      <nav aria-label={t.panel}>
        <ul className="space-y-1">
          {ITEMS.map(({ href, key, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-12 items-center gap-3 rounded-[2px] px-3 font-semibold transition-colors ${active ? "bg-vermilion text-lime" : "text-lime/75 hover:bg-lime/10 hover:text-lime"}`}
                >
                  <Icon className="size-5" strokeWidth={1.9} aria-hidden="true" />
                  <span className="flex-1">{t.nav[key]}</span>
                  {key === "orders" && badge > 0 && (
                    <span className="tabular grid min-w-6 place-items-center rounded-full bg-ochre px-1.5 text-[0.8rem] font-bold text-ink">
                      {badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
      <nav
        aria-label={t.panel}
        className="fixed inset-x-0 bottom-0 z-30 border-t-[1.5px] border-ink bg-ink pb-[env(safe-area-inset-bottom)] text-lime lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {ITEMS.map(({ href, key, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex h-[4.25rem] flex-col items-center justify-center gap-1 text-[0.72rem] font-semibold leading-tight ${active ? "text-ochre" : "text-lime/70"}`}
                >
                  {active && <span aria-hidden="true" className="absolute inset-x-3 top-0 h-[3px] bg-ochre" />}
                  <span className="relative">
                    <Icon className="size-6" strokeWidth={1.9} aria-hidden="true" />
                    {key === "orders" && badge > 0 && (
                      <span className="tabular absolute -right-3 -top-1.5 grid min-w-5 place-items-center rounded-full bg-ochre px-1 text-[0.7rem] font-bold leading-5 text-ink">
                        {badge}
                      </span>
                    )}
                  </span>
                  <span lang={lang}>{t.nav[key]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
  );
}
