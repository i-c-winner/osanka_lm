function resolveApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
  // Если страница открыта по HTTPS — принудительно апгрейдим http:// → https://
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    return url.replace(/^http:\/\//, "https://");
  }
  return url;
}

export const API_BASE_URL = resolveApiUrl();

export const LOCALES = ["ru", "uz", "kz"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ru";
