"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { getDict } from "@/lib/i18n";
import { localHref, unlocalisedPath } from "@/lib/format";
import { useStore } from "./store-provider";

export function LangSwitch({ className = "" }: { className?: string }) {
  const { lang } = useStore();
  const pathname = usePathname();
  const d = getDict(lang);
  const target = localHref(lang === "en" ? "si" : "en", unlocalisedPath(pathname));

  return (
    <Link
      href={target}
      hrefLang={lang === "en" ? "si" : "en"}
      aria-label={d.nav.switchLabel}
      className={`inline-flex min-h-11 items-center px-3 text-[0.95rem] font-semibold underline-offset-4 hover:underline ${className}`}
    >
      {d.nav.switchTo}
    </Link>
  );
}

export function BagButton() {
  const { lang, count, hydrated, pulse } = useStore();
  const d = getDict(lang);

  return (
    <Link
      href={localHref(lang, "/bag")}
      aria-label={`${d.nav.openBag}${hydrated && count ? ` (${count})` : ""}`}
      className="relative inline-flex min-h-11 min-w-11 items-center justify-center gap-2 px-2.5 hover:text-vermilion"
    >
      <ShoppingBag className="size-6" strokeWidth={1.8} />
      <span className="hidden text-[0.95rem] font-semibold sm:inline">{d.nav.bag}</span>
      {hydrated && count > 0 && (
        <span
          key={pulse}
          className="tabular absolute -top-0.5 right-0 grid min-w-5 animate-bump place-items-center rounded-full bg-ochre px-1 text-[0.72rem] font-bold leading-5 text-ink ring-2 ring-plaster sm:static sm:ring-0"
        >
          {count}
        </span>
      )}
    </Link>
  );
}

/** Phones get the same four destinations as the desktop nav, behind one button. */
export function MobileMenu({ links }: { links: { href: string; label: string }[] }) {
  const { lang } = useStore();
  const d = getDict(lang);
  const [open, setOpen] = useState(false);
  const panel = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panel}
        aria-label={d.nav.menu}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center"
      >
        {open ? <X className="size-6" strokeWidth={1.9} /> : <Menu className="size-6" strokeWidth={1.9} />}
      </button>
      <nav
        id={panel}
        aria-label={d.nav.menu}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b-[1.5px] border-ink bg-plaster shadow-[0_16px_24px_-18px_rgba(28,19,14,0.7)]"
      >
        <ul className="mx-auto max-w-7xl divide-y divide-ink/10 px-4 py-1 sm:px-6">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center font-display text-[1.25rem] font-bold hover:text-vermilion"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
