// В браузере используем относительный путь — Next.js проксирует на бэкенд через rewrites
// На сервере (SSR) используем прямой URL бэкенда
export const API_BASE_URL =
  typeof window !== "undefined"
    ? "/api/v1"
    : (process.env.BACKEND_URL ?? "http://localhost:8000") + "/api/v1";

export const LOCALES = ["ru", "uz", "kz"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ru";
