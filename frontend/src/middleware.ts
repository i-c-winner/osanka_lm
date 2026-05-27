import createMiddleware from "next-intl/middleware";
import { LOCALES, DEFAULT_LOCALE } from "@/shared/config";

export default createMiddleware({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
