"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE } from "@/lib/constants";
import type { AppLocale } from "@/lib/constants";
import { tt, getLocaleDir } from "./dict";

export type TKey = string;

export { tt, getLocaleDir };

interface I18nContextValue {
  locale: AppLocale;
  dir: "rtl" | "ltr";
  setLocale: (locale: AppLocale) => void;
  t: (key: TKey) => string;
  isArabic: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function applyLocaleGlobally(locale: AppLocale) {
  if (typeof document === "undefined") return;
  const dir = getLocaleDir(locale);
  document.documentElement.lang = locale;
  document.documentElement.setAttribute("dir", dir);
}

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: AppLocale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale);
  const router = useRouter();

  useEffect(() => {
    applyLocaleGlobally(locale);
  }, [locale]);

  const setLocale = useCallback(
    (next: AppLocale) => {
      setLocaleState(next);
      localStorage.setItem(LOCALE_COOKIE, next);
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
      applyLocaleGlobally(next);
      router.refresh();
    },
    [router]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dir: getLocaleDir(locale),
      setLocale,
      t: (key) => tt(locale, key),
      isArabic: locale === "ar",
    }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}