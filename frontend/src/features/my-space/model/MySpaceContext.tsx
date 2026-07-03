"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { subscriptionsApi, subscriptionPlansApi } from "@/shared/api";
import type { SubscriptionResponse, SubscriptionPlanResponse } from "@/shared/api";

// ─── Типы ─────────────────────────────────────────────────────────────────────

interface MySpaceContextValue {
  /** Все подписки пользователя */
  subscriptions: SubscriptionResponse[];
  /** Только актуальные подписки (status=active И expires_at в будущем или отсутствует) */
  currentSubscriptions: SubscriptionResponse[];
  /** Все планы (для lookup по plan_id) */
  plans: SubscriptionPlanResponse[];
  /** Активная подписка (по умолчанию первая актуальная) */
  activeSubscription: SubscriptionResponse | null;
  /** План активной подписки */
  activePlan: SubscriptionPlanResponse | null;
  /** Переключить активную подписку */
  setActiveSubscriptionId: (id: string) => void;
  loading: boolean;
  /** Перезагрузить подписки с сервера */
  reload: () => void;
}

// ─── Контекст ─────────────────────────────────────────────────────────────────

const MySpaceContext = createContext<MySpaceContextValue | null>(null);

// ─── Провайдер ────────────────────────────────────────────────────────────────

export function MySpaceProvider({ children }: { children: React.ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<SubscriptionResponse[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlanResponse[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [subs, allPlans] = await Promise.all([
        subscriptionsApi.listMy(),
        subscriptionPlansApi.listActive(),
      ]);

      setSubscriptions(subs);
      setPlans(allPlans);

      // По умолчанию — первая актуальная подписка (active + не истёкшая)
      const now = new Date();
      setActiveId((prev) => {
        if (prev && subs.some((s) => s.id === prev)) return prev;
        const firstCurrent = subs.find(
          (s) =>
            s.status === "active" &&
            (!s.expires_at || new Date(s.expires_at) > now),
        );
        return firstCurrent?.id ?? subs[0]?.id ?? null;
      });
    } catch {
      // игнорируем: пользователь без подписок — норма
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const plansById = useMemo(
    () => Object.fromEntries(plans.map((p) => [p.id, p])),
    [plans],
  );

  /** Актуальные подписки: active-статус и не истёкшие по дате */
  const currentSubscriptions = useMemo(() => {
    const now = new Date();
    return subscriptions.filter(
      (s) =>
        s.status === "active" &&
        (!s.expires_at || new Date(s.expires_at) > now),
    );
  }, [subscriptions]);

  const activeSubscription = useMemo(
    () => subscriptions.find((s) => s.id === activeId) ?? null,
    [subscriptions, activeId],
  );

  const activePlan = useMemo(
    () => (activeSubscription ? (plansById[activeSubscription.plan_id] ?? null) : null),
    [activeSubscription, plansById],
  );

  const value = useMemo<MySpaceContextValue>(
    () => ({
      subscriptions,
      currentSubscriptions,
      plans,
      activeSubscription,
      activePlan,
      setActiveSubscriptionId: setActiveId,
      loading,
      reload: load,
    }),
    [subscriptions, currentSubscriptions, plans, activeSubscription, activePlan, loading, load],
  );

  return (
    <MySpaceContext.Provider value={value}>{children}</MySpaceContext.Provider>
  );
}

// ─── Хук ──────────────────────────────────────────────────────────────────────

export function useMySpace(): MySpaceContextValue {
  const ctx = useContext(MySpaceContext);
  if (!ctx) throw new Error("useMySpace must be used inside <MySpaceProvider>");
  return ctx;
}
