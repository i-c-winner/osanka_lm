import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/shared/config";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = (await requestLocale) as Locale;
  if (!locale || !LOCALES.includes(locale)) {
    locale = DEFAULT_LOCALE;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
