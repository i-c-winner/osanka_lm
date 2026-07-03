"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { alpha } from "@mui/material/styles";
import { useTranslations } from "next-intl";
import { brand } from "@/shared/theme";
import { bookingsApi } from "@/shared/api";
import type { BookingResponse, SessionResponse } from "@/shared/api";
import { MonthCalendar } from "@/entities/calendar";
import { useCalendarDays } from "@/features/calendar-days";
import { DayBookingModal } from "@/features/book-session";
import { useMySpace } from "@/features/my-space";
import { SubscriptionStatus } from "./SubscriptionStatus";

// ─── OfflinePlansSection ──────────────────────────────────────────────────────

export function OfflinePlansSection() {
  const t = useTranslations("offlinePlans");

  // ── Контекст подписок ──────────────────────────────────────────────────────
  const {
    currentSubscriptions,
    plans: contextPlans,
    activeSubscription: activeSub,
    activePlan,
    setActiveSubscriptionId,
    loading: ctxLoading,
  } = useMySpace();

  const plansById = useMemo(
    () => Object.fromEntries(contextPlans.map((p) => [p.id, p])),
    [contextPlans],
  );


  // ── Календарь ─────────────────────────────────────────────────────────────
  const {
    getDayData,
    sessionsByDate,
    optimisticBook,
    optimisticCancel,
    unbookedLastMonth,
  } = useCalendarDays(activeSub?.id);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // ── Брони ─────────────────────────────────────────────────────────────────
  const [myBookings, setMyBookings] = useState<BookingResponse[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  // Оптимистичная дельта: +1 при бронировании, -1 при отмене (сбрасывается при reload)
  const [activeBookingsDelta, setActiveBookingsDelta] = useState(0);

  // Считаем брони текущей подписки.
  // Брони без subscription_id (до миграции) тоже учитываем как принадлежащие текущей.
  const activeBookings = useMemo(() => {
    const base = myBookings.filter(
      (b) =>
        b.status === "booked" &&
        (!b.subscription_id || b.subscription_id === activeSub?.id),
    ).length;
    return Math.max(0, base + activeBookingsDelta);
  }, [myBookings, activeSub?.id, activeBookingsDelta]);

  const loadBookings = useCallback(async () => {
    setBookingsLoading(true);
    setActiveBookingsDelta(0);
    try {
      const list = await bookingsApi
        .listMy()
        .catch(() => [] as BookingResponse[]);
      setMyBookings(list);
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Остаток занятий по активной подписке (null = безлимит или нет лимита)
  const sessionsRemaining = useMemo(() => {
    if (!activeSub || !activePlan) return null;
    if (activePlan.is_unlimited || activePlan.sessions_limit == null) return null;
    return Math.max(0, activePlan.sessions_limit - activeSub.sessions_used - activeBookings);
  }, [activeSub, activePlan, activeBookings]);

  // ── Стат-карточки под календарём ──────────────────────────────────────────
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // Дни до конца подписки
  const daysRemaining = useMemo(() => {
    if (!activeSub?.expires_at) return null;
    const diff = Math.ceil(
      (new Date(activeSub.expires_at).getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return Math.max(0, diff);
  }, [activeSub]);

  // Множество session_id пользователя (не отменённых) — обновляется оптимистично
  const [bookedSessionIds, setBookedSessionIds] = useState<Set<string>>(
    new Set(),
  );
  useEffect(() => {
    setBookedSessionIds(
      new Set(
        myBookings
          .filter((b) => b.status !== "cancelled")
          .map((b) => b.session_id),
      ),
    );
  }, [myBookings]);

  // Минуты занятий в этом месяце (только прошедшие — до сегодня включительно)
  const minutesThisMonth = useMemo(() => {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    let total = 0;
    for (const [date, sessions] of Object.entries(sessionsByDate)) {
      if (date < monthStart || date > todayStr) continue;
      for (const s of sessions) {
        if (!bookedSessionIds.has(s.id)) continue;
        total +=
          (new Date(s.ends_at).getTime() - new Date(s.starts_at).getTime()) /
          60_000;
      }
    }
    return Math.round(total);
  }, [sessionsByDate, bookedSessionIds, todayStr]);

  // Следующее занятие
  const nextLesson = useMemo<{
    session: SessionResponse;
    date: string;
  } | null>(() => {
    let best: { session: SessionResponse; date: string } | null = null;
    for (const [date, sessions] of Object.entries(sessionsByDate)) {
      if (date < todayStr) continue;
      for (const s of sessions) {
        if (!bookedSessionIds.has(s.id)) continue;
        if (
          !best ||
          date < best.date ||
          (date === best.date && s.starts_at < best.session.starts_at)
        ) {
          best = { session: s, date };
        }
      }
    }
    return best;
  }, [sessionsByDate, bookedSessionIds, todayStr]);

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
          fontFamily: "var(--font-display)",
          fontWeight: 400,
          fontSize: "clamp(28px, 3vw, 40px)",
          lineHeight: 1.05,
          color: brand.cocoa,
          mb: "28px",
        }}
      >
        {t("title")}{" "}
        <Box
          component="em"
          sx={{ fontStyle: "italic", color: brand.terracottaDeep }}
        >
          {t("titleItalic")}
        </Box>
      </Typography>

      {/* Переключатель и статус подписки */}
      <SubscriptionStatus
        subscriptions={currentSubscriptions}
        activeSub={activeSub}
        activePlan={activePlan}
        plansById={plansById}
        activeBookings={activeBookings}
        onSwitch={setActiveSubscriptionId}
      />

      {/* Пропущенные занятия за прошлый месяц */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: "16px",
          px: "20px",
          py: "12px",
          borderRadius: "14px",
          backgroundColor: alpha(brand.terracotta, 0.06),
          border: `1px solid ${alpha(brand.terracotta, 0.2)}`,
        }}
      >
        <Typography
          sx={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: brand.cocoaSoft,
          }}
        >
          {t("missedLastMonth")}
        </Typography>
        <Typography
          sx={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "22px",
            fontWeight: 400,
            color: brand.terracotta,
            lineHeight: 1,
          }}
        >
          {unbookedLastMonth}
        </Typography>
      </Box>

      {/* Календарь сессий */}
      <Box sx={{ mb: "20px" }}>
        <MonthCalendar
          getDayData={getDayData}
          onDayClick={(dateKey) => setSelectedDate(dateKey)}
        />
      </Box>

      {/* Стат-карточки под календарём */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
          gap: "12px",
          mb: "32px",
        }}
      >
        {/* Подписка */}
        <Box sx={{ px: "20px", py: "16px", borderRadius: "14px", backgroundColor: alpha(brand.sage, 0.07), border: `1px solid ${alpha(brand.sage, 0.25)}` }}>
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: brand.mute, mb: "6px" }}>
            Подписка
          </Typography>
          {activeSub ? (
            <>
              <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.cocoaSoft, lineHeight: 1.5 }}>
                {new Date(activeSub.started_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                {" – "}
                {activeSub.expires_at
                  ? new Date(activeSub.expires_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })
                  : "∞"}
              </Typography>
              {daysRemaining !== null && (
                <Box sx={{ display: "flex", alignItems: "baseline", gap: "4px", mt: "4px" }}>
                  <Typography sx={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "26px", fontWeight: 400, color: brand.sage, lineHeight: 1 }}>
                    {daysRemaining}
                  </Typography>
                  <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: brand.mute }}>
                    {daysRemaining === 1 ? "день" : daysRemaining < 5 ? "дня" : "дней"}
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.mute, mt: "4px" }}>
              Нет подписки
            </Typography>
          )}
        </Box>

        {/* Минуты в этом месяце */}
        <Box sx={{ px: "20px", py: "16px", borderRadius: "14px", backgroundColor: alpha(brand.gold, 0.07), border: `1px solid ${alpha(brand.gold, 0.25)}` }}>
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: brand.mute, mb: "6px" }}>
            В этом месяце вы занимались
          </Typography>
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.cocoaSoft, lineHeight: 1.5 }}>
            {new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString("ru-RU", { month: "long" })}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: "4px", mt: "4px" }}>
            <Typography sx={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "26px", fontWeight: 400, color: brand.gold, lineHeight: 1 }}>
              {minutesThisMonth}
            </Typography>
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: brand.mute }}>
              мин
            </Typography>
          </Box>
        </Box>

        {/* Следующее занятие */}
        <Box sx={{ px: "20px", py: "16px", borderRadius: "14px", backgroundColor: alpha(brand.terracotta, 0.06), border: `1px solid ${alpha(brand.terracotta, 0.2)}` }}>
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: brand.mute, mb: "6px" }}>
            Следующее занятие
          </Typography>
          {nextLesson ? (
            <>
              <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.cocoaSoft, lineHeight: 1.5 }}>
                {new Date(nextLesson.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "short" })}
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "26px", fontWeight: 400, color: brand.terracotta, lineHeight: 1, mt: "4px" }}>
                {new Date(nextLesson.session.starts_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
              </Typography>
            </>
          ) : (
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.mute, mt: "4px" }}>
              Нет записей
            </Typography>
          )}
        </Box>
      </Box>

      <DayBookingModal
        open={!!selectedDate}
        dateKey={selectedDate}
        sessions={selectedDate ? (sessionsByDate[selectedDate] ?? []) : []}
        onClose={() => setSelectedDate(null)}
        subscriptionId={activeSub?.id}
        sessionsRemaining={sessionsRemaining}
        onBooked={(sessionId) => {
          setActiveBookingsDelta((prev) => prev + 1);
          setBookedSessionIds((prev) => new Set(prev).add(sessionId));
          if (selectedDate) optimisticBook(selectedDate, sessionId);
        }}
        onCancelled={(sessionId) => {
          setActiveBookingsDelta((prev) => prev - 1);
          setBookedSessionIds((prev) => {
            const next = new Set(prev);
            next.delete(sessionId);
            return next;
          });
          if (selectedDate) optimisticCancel(selectedDate, sessionId);
        }}
      />
    </Box>
  );
}
