"use client";

import { useEffect, useState } from "react";
import { usersApi } from "@/shared/api";
import type { MeResponse } from "@/shared/api";

export function useMe() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    usersApi
      .getMe()
      .then(setMe)
      .catch(() => setError("Не удалось загрузить профиль"))
      .finally(() => setLoading(false));
  }, []);

  const hasRole = (...roles: string[]) =>
    roles.some((r) => me?.roles.includes(r));

  return { me, loading, error, hasRole };
}
