import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { I18nProvider } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { LOCALE_COOKIE } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  let logoUrl: string | null = null;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "logo_url")
      .maybeSingle();
    logoUrl = data?.value || null;
  } catch {
    // SSR / build fallback — keep default favicon
  }

  const base: Metadata = {
    title: "taawoniati— Coopératives",
    description: "Système de gestion des coopératives agricoles",
  };

  if (logoUrl) {
    const ts = Date.now();
    const iconUrl = `${logoUrl}?v=${ts}`;
    base.icons = {
      icon: [
        { url: iconUrl, type: "image/png" },
      ],
      apple: [
        { url: iconUrl, type: "image/png" },
      ],
    };
  }

  return base;
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

function getLocalePreScript() {
  return `(function(){try{var l=localStorage.getItem('${LOCALE_COOKIE}');var d=document.documentElement;if(l==='ar'||l==='fr'){d.lang=l;d.setAttribute('dir',l==='ar'?'rtl':'ltr');}}catch(e){}})();`;
}

const LOCALE_PRE_SCRIPT = getLocalePreScript();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = getLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LOCALE_PRE_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
        />
      </head>
      <body>
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
        <Toaster position="bottom-center" richColors closeButton />
      </body>
    </html>
  );
}