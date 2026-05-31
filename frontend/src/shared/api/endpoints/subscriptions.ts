import { apiClient } from "../client";
import type { SubscriptionPlanResponse, SubscriptionPlanCreate, SubscriptionPlanUpdate, SubscriptionResponse } from "../types";

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

export const subscriptionsApi = {
  create: (planId: string) =>
    apiClient.post<SubscriptionResponse>(`/subscriptions/?plan_id=${planId}`).then((r) => r.data),

  listMy: () =>
    apiClient.get<SubscriptionResponse[]>("/subscriptions/").then((r) => r.data),
};
