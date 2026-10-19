import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { isLang, type Lang } from "@/lib/format";

/** The storefront language from the /[lang] root segment. */
export async function getLang(): Promise<Lang> {
  const value = await lang();
  if (!isLang(value)) notFound();
  return value;
}
