import Link from "next/link";
import { Phone } from "lucide-react";
import { Band, WhatsAppIcon } from "@/components/art";
import { getDict } from "@/lib/i18n";
import { displayPhone, localHref, pick, type Lang } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";
import type { StoreSettings } from "@/lib/types";
import { Wordmark } from "./site-header";

export function SiteFooter({ lang, settings }: { lang: Lang; settings: StoreSettings }) {
  const d = getDict(lang);
  const home = localHref(lang, "/");
  const base = home === "/" ? "" : home;

  return (
    <footer className="bg-ink text-lime">
      <div aria-hidden="true">
        <div className="h-[3px] bg-ink" />
        <Band kind="petals" line="#1c130e" fill="#a3291b" ground="#d9a21b" height={16} />
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div>
          <Wordmark lang={lang} tone="lime" />
          <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-lime/80">
            {pick(lang, settings.addressEn, settings.addressSi)}
          </p>
          <p className="mt-2 text-[0.95rem] text-ochre-pale">{d.footer.island}</p>
        </div>
        <ul className="space-y-1 text-[0.95rem]">
          {settings.phone && (
            <li>
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="inline-flex min-h-11 items-center gap-3 hover:text-ochre">
                <Phone className="size-5" strokeWidth={1.8} aria-hidden="true" />
                <span>
                  {d.footer.call} <span className="tabular">{displayPhone(settings.phone)}</span>
                </span>
              </a>
            </li>
          )}
          {settings.whatsappNumber && (
            <li>
              <a href={waLink(settings.whatsappNumber)} className="inline-flex min-h-11 items-center gap-3 hover:text-ochre">
                <WhatsAppIcon className="size-5" />
                <span>
                  {d.footer.whatsapp} <span className="tabular">{displayPhone(settings.whatsappNumber)}</span>
                </span>
              </a>
            </li>
          )}
        </ul>
        <nav aria-label="Footer">
          <ul className="space-y-1 text-[0.95rem]">
            <li>
              <Link href={`${base}/#price-list`} className="inline-flex min-h-11 items-center hover:text-ochre">
                {d.nav.priceList}
              </Link>
            </li>
            <li>
              <Link href={`${base}/#story`} className="inline-flex min-h-11 items-center hover:text-ochre">
                {d.nav.story}
              </Link>
            </li>
            <li>
              <Link href={localHref(lang, "/track")} className="inline-flex min-h-11 items-center hover:text-ochre">
                {d.nav.track}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-lime/15">
        <p className="mx-auto max-w-7xl px-4 py-5 text-[0.8rem] text-lime/60 sm:px-6 lg:px-8">
          © 2026 {d.footer.rights}
        </p>
      </div>
    </footer>
  );
}
