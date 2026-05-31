"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { currencyApi, type CurrencyInfo } from "@/shared/api";

// ─── Контекст ─────────────────────────────────────────────────────────────────

interface CurrencyContextValue {
  currency:    string;
  coefficient: number;
  /** Форматирует базовую цену (в KZT) с учётом коэффициента и валюты */
  formatPrice: (basePrice: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency:    "UZS",
  coefficient: 1,
  formatPrice: (p) => p.toLocaleString("ru-RU"),
});

export function useCurrency() {
  return useContext(CurrencyContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const locale = (params?.locale as string) ?? "uz";

  const [info, setInfo] = useState<CurrencyInfo>({ k: 1, currency: "UZS" });

  useEffect(() => {
    currencyApi.getByLocale(locale).then(setInfo);
  }, [locale]);

  function formatPrice(basePrice: number): string {
    const converted = Math.ceil(basePrice * info.k);
    return new Intl.NumberFormat("ru-RU", {
      style:                 "currency",
      currency:              info.currency,
      maximumFractionDigits: 0,
    }).format(converted);
  }

  return (
    <CurrencyContext.Provider value={{ currency: info.currency, coefficient: info.k, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}
