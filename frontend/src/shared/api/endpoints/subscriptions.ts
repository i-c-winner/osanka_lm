import { apiClient } from "../client";
import type { SubscriptionPlanResponse, SubscriptionResponse } from "../types";

export const subscriptionPlansApi = {
  list: () =>
    apiClient.get<SubscriptionPlanResponse[]>("/subscription-plans").then((r) => r.data),

  get: (id: string) =>
    apiClient.get<SubscriptionPlanResponse>(`/subscription-plans/${id}`).then((r) => r.data),
};

export const subscriptionsApi = {
  list: () =>
    apiClient.get<SubscriptionResponse[]>("/subscriptions").then((r) => r.data),

  get: (id: string) =>
    apiClient.get<SubscriptionResponse>(`/subscriptions/${id}`).then((r) => r.data),

  create: (planId: string) =>
    apiClient
      .post<SubscriptionResponse>("/subscriptions", null, { params: { plan_id: planId } })
      .then((r) => r.data),
};
