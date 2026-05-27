// Обрабатывается middleware next-intl (редирект на /[locale]/).
// Этот файл нужен только как fallback для Next.js routing.
import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/shared/config";

export default function RootPage() {
  redirect(`/${DEFAULT_LOCALE}/main`);
}
