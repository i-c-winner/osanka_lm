import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { MuiProvider } from "@/app/providers/MuiProvider";
import { EmotionRegistry } from "@/app/providers/EmotionRegistry";
import { LOCALES, type Locale } from "@/shared/config";
import "@/app/globals.css";

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600"],
  style:  ["normal", "italic"],
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-display",
});

const manrope = Manrope({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Osanka LM",
  description: "Fitness studio management",
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!LOCALES.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${cormorant.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <EmotionRegistry>
            <MuiProvider>
              {children}
            </MuiProvider>
          </EmotionRegistry>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
