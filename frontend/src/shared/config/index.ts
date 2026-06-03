// Все запросы идут через /api/proxy/... — Next.js сам следует редиректам
export const API_BASE_URL =
  typeof window !== "undefined"
    ? "/api/proxy"
    : (process.env.BACKEND_URL ?? "http://localhost:8000") + "/api/v1";

export const LOCALES = ["ru", "uz", "kz"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ru";
