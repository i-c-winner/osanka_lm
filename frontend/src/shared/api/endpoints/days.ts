import { apiClient } from "../client";
import type { DayResponse, DayCreate } from "../types";

export const daysApi = {
  list: () =>
    apiClient.get<DayResponse[]>("/days").then((r) => r.data),

  create: (data: DayCreate) =>
    apiClient.post<DayResponse>("/days", data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/days/${id}`),
};
