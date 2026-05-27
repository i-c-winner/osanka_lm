import { createNavigation } from "next-intl/navigation";
import { LOCALES, DEFAULT_LOCALE } from "@/shared/config";

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
});
