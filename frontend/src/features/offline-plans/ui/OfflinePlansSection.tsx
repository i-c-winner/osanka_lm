"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { alpha } from "@mui/material/styles";
import { useTranslations } from "next-intl";
import { brand } from "@/shared/theme";
import { subscriptionsApi, bookingsApi } from "@/shared/api";
import type { BookingResponse } from "@/shared/api";
import { userStorage } from "@/shared/lib/userStorage";
import { MonthCalendar } from "@/entities/calendar";
import { useCalendarDays } from "@/features/calendar-days";
import { DayBookingModal } from "@/features/book-session";
import { useMySpace } from "@/features/my-space";
import { PlanCard } from "./PlanCard";
import { SubscriptionStatus } from "./SubscriptionStatus";

// ─── OfflinePlansSection ──────────────────────────────────────────────────────

export function OfflinePlansSection() {
  const t = useTranslations("offlinePlans");

  // ── Контекст подписок ──────────────────────────────────────────────────────
  const {
    subscriptions,
    plans: contextPlans,
    activeSubscription: activeSub,
    activePlan,
    setActiveSubscriptionId,
    loading: ctxLoading,
    reload: reloadContext,
  } = useMySpace();

  const plansById = useMemo(
    () => Object.fromEntries(contextPlans.map((p) => [p.id, p])),
    [contextPlans],
  );

  // Ids купленных планов для подсветки кнопки "Подключено"
  const purchasedPlanIds = useMemo(
    () => new Set(subscriptions.filter((s) => s.status === "active").map((s) => s.plan_id)),
    [subscriptions],
  );

  // ── Календарь ─────────────────────────────────────────────────────────────
  const {
    getDayData,
    sessionsByDate,
    optimisticBook,
    optimisticCancel,
    unbookedLastMonth,
  } = useCalendarDays();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // ── Брони ─────────────────────────────────────────────────────────────────
  const [activeBookings, setActiveBookings] = useState(0);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const list = await bookingsApi.listMy().catch(() => [] as BookingResponse[]);
      setActiveBookings(list.filter((b) => b.status === "booked").length);
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  // ── Покупка плана ─────────────────────────────────────────────────────────
  const [joining, setJoining] = useState<string | null>(null);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [joinError, setJoinError] = useState<string | null>(null);

  async function handleJoin(planId: string) {
    setJoining(planId);
    setJoinError(null);
    try {
      await subscriptionsApi.create(planId);
      setJoinedIds((prev) => new Set(prev).add(planId));

      const stored = userStorage.get();
      if (stored && !stored.roles.includes("client")) {
        userStorage.set({ ...stored, roles: ["client"] });
      }

      await reloadContext();
    } catch (err: unknown) {
      const res = (err as { response?: { status?: number; data?: { detail?: string } } })?.response;
      const msg = res?.data?.detail;
      setJoinError(typeof msg === "string" ? msg : t("joinError"));
    } finally {
      setJoining(null);
    }
  }

  // ── Рендер ────────────────────────────────────────────────────────────────

  if (ctxLoading || bookingsLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: "48px" }}>
        <CircularProgress size={28} sx={{ color: brand.terracotta }} />
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
      <Typography className="eyebrow" sx={{ display: "block", mb: "12px" }}>
        {t("eyebrow")}
      </Typography>
      <Typography
        sx={{
          fontFamily: "var(--font-display)", fontWeight: 400,
          fontSize: "clamp(28px, 3vw, 40px)", lineHeight: 1.05,
          color: brand.cocoa, mb: "28px",
        }}
      >
        {t("title")}{" "}
        <Box component="em" sx={{ fontStyle: "italic", color: brand.terracottaDeep }}>
          {t("titleItalic")}
        </Box>
      </Typography>

      {/* Переключатель и статус подписки */}
      <SubscriptionStatus
        subscriptions={subscriptions}
        activeSub={activeSub}
        activePlan={activePlan}
        plansById={plansById}
        activeBookings={activeBookings}
        onSwitch={setActiveSubscriptionId}
      />

      {/* Пропущенные занятия за прошлый месяц */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        mb: "16px", px: "20px", py: "12px", borderRadius: "14px",
        backgroundColor: alpha(brand.terracotta, 0.06),
        border: `1px solid ${alpha(brand.terracotta, 0.2)}`,
      }}>
        <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.cocoaSoft }}>
          {t("missedLastMonth")}
        </Typography>
        <Typography sx={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "22px", fontWeight: 400, color: brand.terracotta, lineHeight: 1 }}>
          {unbookedLastMonth}
        </Typography>
      </Box>

      {/* Ошибка покупки */}
      {joinError && (
        <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.terracotta, mb: "16px" }}>
          {joinError}
        </Typography>
      )}

      {/* Каталог планов (только если нет активной подписки) */}
      {!activeSub && contextPlans.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", mb: "32px" }}>
          {contextPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onJoin={handleJoin}
              joining={joining === plan.id}
              joined={purchasedPlanIds.has(plan.id) || joinedIds.has(plan.id)}
            />
          ))}
        </Box>
      )}

      {/* Календарь сессий */}
      <Box sx={{ mb: "32px" }}>
        <MonthCalendar
          getDayData={getDayData}
          onDayClick={(dateKey) => setSelectedDate(dateKey)}
        />
      </Box>

      <DayBookingModal
        open={!!selectedDate}
        dateKey={selectedDate}
        sessions={selectedDate ? (sessionsByDate[selectedDate] ?? []) : []}
        onClose={() => setSelectedDate(null)}
        onBooked={(sessionId) => {
          setActiveBookings((prev) => prev + 1);
          if (selectedDate) optimisticBook(selectedDate, sessionId);
        }}
        onCancelled={(sessionId) => {
          setActiveBookings((prev) => Math.max(0, prev - 1));
          if (selectedDate) optimisticCancel(selectedDate, sessionId);
        }}
      />
    </Box>
  );
}
