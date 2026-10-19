import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { ADMIN_LANG_COOKIE, type AdminDict } from "@/lib/admin-i18n";
import type { Lang } from "@/lib/format";

/** The owner reads Sinhala first; English is a switch away. */
export async function getAdminLang(): Promise<Lang> {
  return (await cookies()).get(ADMIN_LANG_COOKIE)?.value === "en" ? "en" : "si";
}

/** The time of this request, for "5 min ago" labels. */
export async function requestNow(): Promise<number> {
  await connection();
  return Date.now();
}

export function timeAgo(date: Date, t: AdminDict, now: number): string {
  const minutes = Math.floor((now - date.getTime()) / 60_000);
  if (minutes < 1) return t.ago.now;
  if (minutes < 60) return t.ago.minutes(minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t.ago.hours(hours);
  return t.ago.days(Math.floor(hours / 24));
}

export function formatDateTime(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "si" ? "si-LK" : "en-LK", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Colombo",
  }).format(date);
}
