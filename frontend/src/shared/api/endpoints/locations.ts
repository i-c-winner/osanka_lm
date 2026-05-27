import { apiClient } from "../client";
import type { LocationCreate, LocationResponse, LocationUpdate } from "../types";

export const locationsApi = {
  list: () =>
    apiClient.get<LocationResponse[]>("/locations").then((r) => r.data),

  get: (id: string) =>
    apiClient.get<LocationResponse>(`/locations/${id}`).then((r) => r.data),

  create: (data: LocationCreate) =>
    apiClient.post<LocationResponse>("/locations", data).then((r) => r.data),

  update: (id: string, data: LocationUpdate) =>
    apiClient.patch<LocationResponse>(`/locations/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/locations/${id}`),
};
