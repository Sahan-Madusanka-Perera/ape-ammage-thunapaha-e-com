export const LANGS = ["en", "si"] as const;
export type Lang = (typeof LANGS)[number];

export function isLang(value: string | undefined): value is Lang {
  return value !== undefined && (LANGS as readonly string[]).includes(value);
}

/** English lives at the root, Sinhala under /si. */
export function localHref(lang: Lang, path: string): string {
  if (lang === "en") return path;
  return path === "/" ? "/si" : `/si${path}`;
}

/** Strips the language prefix so a path can be re-localised. */
export function unlocalisedPath(pathname: string): string {
  if (pathname === "/si" || pathname === "/en") return "/";
  if (pathname.startsWith("/si/") || pathname.startsWith("/en/")) return pathname.slice(3);
  return pathname;
}

export function pick(lang: Lang, en: string, si: string): string {
  return lang === "si" && si.trim() ? si : en;
}

const rupees = new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 });

export function formatRs(amount: number): string {
  return `Rs ${rupees.format(amount)}`;
}

export function formatNumber(amount: number): string {
  return rupees.format(amount);
}

export function sizeLabel(grams: number): string {
  if (grams >= 1000 && grams % 1000 === 0) return `${grams / 1000}kg`;
  if (grams >= 1000) return `${(grams / 1000).toFixed(1)}kg`;
  return `${grams}g`;
}

export function orderCode(number: number): string {
  return `#${number}`;
}

/** Normalises Sri Lankan phone input (07x…, +94 7x…, 947x…) to 0XXXXXXXXX, or null. */
export function normalisePhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("94") && digits.length === 11) digits = `0${digits.slice(2)}`;
  if (digits.length === 9 && !digits.startsWith("0")) digits = `0${digits}`;
  return /^0\d{9}$/.test(digits) ? digits : null;
}

/** 0712753307 → 94712753307, the form wa.me expects. */
export function waNumber(phone: string): string {
  const local = normalisePhone(phone);
  return local ? `94${local.slice(1)}` : phone.replace(/\D/g, "");
}

export function displayPhone(phone: string): string {
  const local = normalisePhone(phone);
  if (!local) return phone;
  return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
}
