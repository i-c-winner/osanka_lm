import { apiClient } from "../client";
import type { SessionResponse } from "../types";

export const sessionsApi = {
  list: () =>
    apiClient.get<SessionResponse[]>("/sessions").then((r) => r.data),

  update: (id: string, data: Partial<{ status: string; capacity: number; location_id: string; trainer_id: string }>) =>
    apiClient.patch<SessionResponse>(`/sessions/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/sessions/${id}`),
};
