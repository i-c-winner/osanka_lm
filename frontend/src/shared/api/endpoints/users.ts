import { apiClient } from "../client";
import type { MeResponse } from "../types";

export const usersApi = {
  getMe: () => apiClient.get<MeResponse>("/users/me").then((r) => r.data),
};
