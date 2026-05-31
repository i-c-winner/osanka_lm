import { apiClient } from "../client";

export interface CurrencyInfo {
  k:        number;
  currency: string;
}

const DEFAULT: CurrencyInfo = { k: 1, currency: "UZS" };

// Маппинг локали → код валюты для поиска в таблице
const LOCALE_TO_CURRENCY: Record<string, string> = {
  kz: "KZT",
  uz: "UZS",
  ru: "RUB",
};

export const currencyApi = {
  getByLocale: async (locale: string): Promise<CurrencyInfo> => {
    const currency = LOCALE_TO_CURRENCY[locale] ?? "UZS";
    try {
      const res = await apiClient.get<CurrencyInfo>(`/currency/?currency=${currency}`);
      return res.data;
    } catch {
      return DEFAULT;
    }
  },
};
