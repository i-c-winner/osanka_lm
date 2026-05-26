const TOKEN_KEY = "access_token";

export const tokenStorage = {
  get: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,

  set: (token: string): void => {
    if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
  },

  remove: (): void => {
    if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
  },
};
