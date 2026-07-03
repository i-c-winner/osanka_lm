import { apiClient } from "../client";
import type { OnlineContentResponse, OnlineContentCreate, OnlineContentUpdate } from "../types";

export const onlineContentApi = {
  list: () =>
    apiClient.get<OnlineContentResponse[]>("/online/").then((r) => r.data),

  get: (id: string) =>
    apiClient.get<OnlineContentResponse>(`/online/${id}`).then((r) => r.data),

  create: (data: OnlineContentCreate) =>
    apiClient.post<OnlineContentResponse>("/online/", data).then((r) => r.data),

  update: (id: string, data: OnlineContentUpdate) =>
    apiClient.patch<OnlineContentResponse>(`/online/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/online/${id}`),
};
