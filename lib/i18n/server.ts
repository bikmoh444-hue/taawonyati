import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type AppLocale } from "@/lib/constants";
import { tt, type TKey } from "./dict";

export function getLocale(): AppLocale {
  const cookieStore = cookies();
  const val = cookieStore.get(LOCALE_COOKIE)?.value;
  if (val === "ar" || val === "fr") return val;
  return DEFAULT_LOCALE;
}

export function getT(locale: AppLocale) {
  return (key: TKey) => tt(locale, key);
}

export { tt };