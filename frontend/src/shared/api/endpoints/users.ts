import { apiClient } from "../client";
import type { MeResponse } from "../types";

export interface TrainerPublic {
  id:         string;
  first_name: string | null;
  last_name:  string | null;
}

export const usersApi = {
  getMe: () =>
    apiClient.get<MeResponse>("/users/me").then((r) => r.data),

  getAll: () =>
    apiClient.get<MeResponse[]>("/users/").then((r) => r.data),

  getTrainers: () =>
    apiClient.get<TrainerPublic[]>("/users/trainers").then((r) => r.data),

  setActive: (userId: string, is_active: boolean) =>
    apiClient.patch<MeResponse>(`/users/${userId}/active`, { is_active }).then((r) => r.data),

  changeRole: (userId: string, role: string) =>
    apiClient.put<MeResponse>(`/users/${userId}/role`, { role }).then((r) => r.data),
};
