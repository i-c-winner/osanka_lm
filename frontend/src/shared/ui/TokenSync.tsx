"use client";

import { useEffect } from "react";

/**
 * Синхронизирует токен из localStorage в cookie при первой загрузке.
 * Нужно для пользователей, залогиненных до введения cookie-механизма.
 */
export function TokenSync() {
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const cookieHasToken = document.cookie.split(";").some((c) => c.trim().startsWith("access_token="));

    if (token && !cookieHasToken) {
      document.cookie = `access_token=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    }
  }, []);

  return null;
}
