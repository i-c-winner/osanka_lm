import { apiClient } from "../client";
import type { SubscriptionPlanResponse, SubscriptionPlanCreate, SubscriptionPlanUpdate } from "../types";

export const subscriptionPlansApi = {
  listActive: () =>
    apiClient.get<SubscriptionPlanResponse[]>("/subscription-plans/").then((r) => r.data),

  listAll: () =>
    apiClient.get<SubscriptionPlanResponse[]>("/subscription-plans/all").then((r) => r.data),

  create: (data: SubscriptionPlanCreate) =>
    apiClient.post<SubscriptionPlanResponse>("/subscription-plans/", data).then((r) => r.data),

  update: (id: string, data: SubscriptionPlanUpdate) =>
    apiClient.patch<SubscriptionPlanResponse>(`/subscription-plans/${id}`, data).then((r) => r.data),
};
