import { apiClient } from "../client";
import type { SessionResponse } from "../types";

export const sessionsApi = {
  list: () =>
    apiClient.get<SessionResponse[]>("/sessions").then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/sessions/${id}`),
};
