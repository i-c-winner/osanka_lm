import { apiClient } from "../client";
import type { SessionCreate, SessionResponse, SessionUpdate } from "../types";

export const sessionsApi = {
  list: () =>
    apiClient.get<SessionResponse[]>("/sessions").then((r) => r.data),

  get: (id: string) =>
    apiClient.get<SessionResponse>(`/sessions/${id}`).then((r) => r.data),

  create: (data: SessionCreate) =>
    apiClient.post<SessionResponse>("/sessions", data).then((r) => r.data),

  update: (id: string, data: SessionUpdate) =>
    apiClient.patch<SessionResponse>(`/sessions/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/sessions/${id}`),
};
