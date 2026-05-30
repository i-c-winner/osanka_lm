import { apiClient } from "../client";
import type { SessionResponse } from "../types";

interface SessionCreatePayload {
  day_id: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  status: string;
  location_id?: string;
  trainer_id?: string;
}

export const sessionsApi = {
  list: () =>
    apiClient.get<SessionResponse[]>("/sessions").then((r) => r.data),

  create: (data: SessionCreatePayload) =>
    apiClient.post<SessionResponse>("/sessions", data).then((r) => r.data),

  update: (id: string, data: Partial<{ status: string; capacity: number; location_id: string; trainer_id: string }>) =>
    apiClient.patch<SessionResponse>(`/sessions/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/sessions/${id}`),
};
