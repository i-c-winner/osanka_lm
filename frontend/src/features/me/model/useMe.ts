"use client";

import { useEffect, useState } from "react";
import { usersApi } from "@/shared/api";
import { userStorage } from "@/shared/lib/userStorage";
import type { MeResponse } from "@/shared/api";

export function useMe() {
  const [me, setMe] = useState<MeResponse | null>(() => userStorage.get());
  const [loading, setLoading] = useState(() => userStorage.get() === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    usersApi
      .getMe()
      .then((fresh) => {
        userStorage.set(fresh);
        setMe(fresh);
      })
      .catch(() => setError("Не удалось загрузить профиль"))
      .finally(() => setLoading(false));
  }, []);

  const hasRole = (...roles: string[]) =>
    roles.some((r) => me?.roles.includes(r));

  return { me, loading, error, hasRole };
}
