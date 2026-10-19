import Link from "next/link";
import { Suspense } from "react";
import { getDict } from "@/lib/i18n";
import { localHref, type Lang } from "@/lib/format";
import { BagButton, LangSwitch, MobileMenu } from "./header-parts";

export function Wordmark({ lang, tone = "ink" }: { lang: Lang; tone?: "ink" | "lime" }) {
  const d = getDict(lang);
  return (
    <span className="flex flex-col leading-none">
      <span
        lang="si"
        className={`font-display text-[1.45rem] font-bold leading-[1.05] sm:text-[1.6rem] ${tone === "ink" ? "text-vermilion" : "text-lime"}`}
      >
        {d.brandSi}
      </span>
      <span
        className={`mt-0.5 text-[0.7rem] font-semibold tracking-[0.02em] ${tone === "ink" ? "text-ink-soft" : "text-ochre-pale"}`}
      >
        {d.brandEn}
      </span>
    </span>
  );
}

export function SiteHeader({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  const home = localHref(lang, "/");
  const links = [
    { href: `${home === "/" ? "" : home}/#price-list`, label: d.nav.priceList },
    { href: `${home === "/" ? "" : home}/#story`, label: d.nav.story },
    { href: `${home === "/" ? "" : home}/#how-to-order`, label: d.nav.howTo },
    { href: localHref(lang, "/track"), label: d.nav.track },
  ];

  return (
    <header className="sticky top-0 z-40 border-b-[1.5px] border-ink bg-plaster">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href={home} className="shrink-0" aria-label={`${d.brandEn}, home`}>
          <Wordmark lang={lang} />
        </Link>
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-flex min-h-11 items-center px-3 text-[0.95rem] font-medium text-ink-soft hover:text-ink hover:underline"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="-mr-2 flex items-center">
          <Suspense
            fallback={
              <Link
                href={localHref(lang === "en" ? "si" : "en", "/")}
                className="inline-flex min-h-11 items-center px-3 text-[0.95rem] font-semibold"
              >
                {d.nav.switchTo}
              </Link>
            }
          >
            <LangSwitch />
          </Suspense>
          <BagButton />
          <MobileMenu links={links} />
        </div>
      </div>
    </header>
  );
}
