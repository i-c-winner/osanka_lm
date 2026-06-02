import { apiClient } from "../client";
import type { AuthResponse, TelegramLoginRequest } from "../types";

export const authApi = {
  login: (data: TelegramLoginRequest) =>
    apiClient.post<AuthResponse>("/auth/login/", data).then((r) => r.data),
};
