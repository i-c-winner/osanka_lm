"use client";

import { useState } from "react";
import { authApi, usersApi } from "@/shared/api";
import { tokenStorage } from "@/shared/lib/token";
import { userStorage } from "@/shared/lib/userStorage";
import type { TelegramLoginRequest } from "@/shared/api";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: TelegramLoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login(data);
      tokenStorage.set(response.access_token);

      // Сразу загружаем и кешируем профиль
      const profile = await usersApi.getMe();
      userStorage.set(profile);

      return response;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ошибка входа";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    tokenStorage.remove();
    userStorage.remove();
  };

  const isAuthenticated = () => tokenStorage.get() !== null;

  return { login, logout, isAuthenticated, loading, error };
}
