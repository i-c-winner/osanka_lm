import type { MeResponse } from "@/shared/api";

const KEY = "user_profile";

export const userStorage = {
  get: (): MeResponse | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as MeResponse) : null;
    } catch {
      return null;
    }
  },

  set: (user: MeResponse): void => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(KEY, JSON.stringify(user));
  },

  remove: (): void => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(KEY);
  },
};
