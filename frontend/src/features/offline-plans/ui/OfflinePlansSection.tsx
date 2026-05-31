"use client";

import { useCallback, useEffect, useState } from "react";
import Box              from "@mui/material/Box";
import Typography       from "@mui/material/Typography";
import Button           from "@mui/material/Button";
import Chip             from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import { alpha }        from "@mui/material/styles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { brand }        from "@/shared/theme";
import { subscriptionPlansApi, subscriptionsApi } from "@/shared/api";
import type { SubscriptionPlanResponse } from "@/shared/api";
import { userStorage } from "@/shared/lib/userStorage";
import { MonthCalendar } from "@/entities/calendar";
import { useCalendarDays } from "@/features/calendar-days";
import { DayBookingModal } from "@/features/book-session";

// ─── Утилиты ─────────────────────────────────────────────────────────────────

function fmtPrice(price: number) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "KZT", maximumFractionDigits: 0 }).format(price);
}

function fmtDate(date: Date) {
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

interface PlanDates {
  start:            Date;
  end:              Date;
  proratedPrice?:   number; // только для is_calendar_month
  proratedSessions?: number; // только для is_calendar_month с sessions_limit
}

function calcDates(plan: SubscriptionPlanResponse): PlanDates {
  const now = new Date();

  if (plan.is_calendar_month) {
    const start = new Date(now);
    const totalDays = daysInMonth(now.getFullYear(), now.getMonth());
    const remainingDays = totalDays - now.getDate() + 1;
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0); // последний день месяца
    const proratedSessions = plan.sessions_limit != null
      ? Math.ceil((plan.sessions_limit / totalDays) * remainingDays)
      : undefined;
    // Цена пропорционально оставшимся занятиям, если лимит задан; иначе — по дням
    const proratedPrice = plan.sessions_limit != null && proratedSessions != null
      ? Math.ceil((plan.price / plan.sessions_limit) * proratedSessions)
      : Math.ceil((plan.price / totalDays) * remainingDays);
    return { start, end, proratedPrice, proratedSessions };
  }

  // Начало — 1-е следующего месяца
  const startMonth = now.getMonth() === 11 ? 0 : now.getMonth() + 1;
  const startYear  = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
  const start = new Date(startYear, startMonth, 1);

  // Конец — последний день N-го месяца
  const months   = Math.max(1, Math.round(plan.duration_days / 30));
  const endMonthRaw = startMonth + months;
  const endYear  = startYear + Math.floor(endMonthRaw / 12);
  const endMonth = endMonthRaw % 12;
  const end = new Date(endYear, endMonth, 0); // день 0 = последний день предыдущего месяца

  return { start, end };
}

// ─── PlanCard ─────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan:    SubscriptionPlanResponse;
  onJoin:  (planId: string) => void;
  joining: boolean;
  joined:  boolean;
}

function PlanCard({ plan, onJoin, joining, joined }: PlanCardProps) {
  const dates = calcDates(plan);
  const displayPrice = dates.proratedPrice ?? plan.price;
  const isProratedDifferent = dates.proratedPrice != null && dates.proratedPrice !== plan.price;

  return (
    <Box sx={{
      borderRadius: "16px",
      border: `1px solid ${joined ? alpha(brand.sage, 0.5) : alpha(brand.line, 0.7)}`,
      p: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "14px",
      backgroundColor: joined ? alpha(brand.sage, 0.04) : brand.ivory,
      transition: "box-shadow 0.2s ease, border-color 0.2s ease",
      "&:hover": { boxShadow: `0 4px 20px -6px ${alpha(brand.cocoa, 0.12)}` },
    }}>
      {/* Шапка */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{
            fontFamily: "var(--font-display)", fontSize: "18px",
            fontWeight: 400, color: brand.cocoa, lineHeight: 1.2, mb: "4px",
          }}>
            {plan.name}
          </Typography>
          {plan.description && (
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.cocoaSoft, lineHeight: 1.5 }}>
              {plan.description}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: "4px", flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {plan.is_unlimited && (
            <Chip label="Безлимит" size="small" sx={{ height: 20, fontFamily: "var(--font-body)", fontSize: "10px", backgroundColor: alpha(brand.sage, 0.15), color: brand.sage }} />
          )}
          {plan.is_calendar_month && (
            <Chip label="До конца месяца" size="small" sx={{ height: 20, fontFamily: "var(--font-body)", fontSize: "10px", backgroundColor: alpha(brand.gold, 0.15), color: brand.gold }} />
          )}
        </Box>
      </Box>

      {/* Параметры + кнопка */}
      <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <Box sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>

          {/* Цена */}
          <Box>
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: brand.mute, mb: "2px" }}>
              Цена
            </Typography>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
              <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 400, color: brand.cocoa }}>
                {fmtPrice(displayPrice)}
              </Typography>
              {isProratedDifferent && (
                <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "11px", color: brand.mute, textDecoration: "line-through" }}>
                  {fmtPrice(plan.price)}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Период действия */}
          <Box>
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: brand.mute, mb: "2px" }}>
              Период
            </Typography>
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 500, color: brand.cocoa }}>
              {fmtDate(dates.start)} — {fmtDate(dates.end)}
            </Typography>
          </Box>

          {!plan.is_unlimited && plan.sessions_limit != null && (
            <Box>
              <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: brand.mute, mb: "2px" }}>
                Занятий
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: 600, color: brand.cocoa }}>
                  {dates.proratedSessions ?? plan.sessions_limit}
                </Typography>
                {dates.proratedSessions != null && dates.proratedSessions !== plan.sessions_limit && (
                  <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "11px", color: brand.mute, textDecoration: "line-through" }}>
                    {plan.sessions_limit}
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {plan.freeze_days_limit != null && (
            <Box>
              <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: brand.mute, mb: "2px" }}>
                Заморозка
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: 600, color: brand.cocoa }}>
                {plan.freeze_days_limit} дн.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Кнопка */}
        {joined ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 18, color: brand.sage }} />
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: brand.sage }}>
              Подключено
            </Typography>
          </Box>
        ) : (
          <Button
            variant="contained"
            disabled={joining}
            onClick={() => onJoin(plan.id)}
            startIcon={joining ? <CircularProgress size={14} color="inherit" /> : undefined}
            sx={{
              backgroundColor: brand.cocoa, color: brand.ivory,
              borderRadius: "100px", fontFamily: "var(--font-body)",
              fontWeight: 600, fontSize: "13px", textTransform: "none",
              px: "20px", py: "9px", boxShadow: "none", flexShrink: 0,
              "&:hover": { backgroundColor: brand.cocoaSoft, boxShadow: "none", transform: "translateY(-1px)" },
            }}
          >
            {joining ? "Подключаем..." : "Присоединиться"}
          </Button>
        )}
      </Box>
    </Box>
  );
}

// ─── OfflinePlansSection ──────────────────────────────────────────────────────

export function OfflinePlansSection() {
  const { getDayData, sessionsByDate } = useCalendarDays();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [plans,     setPlans]     = useState<SubscriptionPlanResponse[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [joining,        setJoining]        = useState<string | null>(null);
  const [joinedIds,      setJoinedIds]      = useState<Set<string>>(new Set());
  const [purchasedPlanIds, setPurchasedPlanIds] = useState<Set<string>>(new Set());
  const [joinError,      setJoinError]      = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [plans, subscriptions] = await Promise.all([
        subscriptionPlansApi.listActive(),
        subscriptionsApi.listMy().catch(() => []), // не блокируем если нет токена
      ]);
      setPlans(plans);
      const activePlanIds = new Set(
        subscriptions
          .filter((s) => s.status === "active")
          .map((s) => s.plan_id),
      );
      setPurchasedPlanIds(activePlanIds);
    } catch {
      setError("Не удалось загрузить планы");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleJoin(planId: string) {
    setJoining(planId);
    setJoinError(null);
    try {
      await subscriptionsApi.create(planId);
      setJoinedIds((prev) => new Set(prev).add(planId));
      setPurchasedPlanIds((prev) => new Set(prev).add(planId));

      const stored = userStorage.get();
      if (stored && !stored.roles.includes("client")) {
        userStorage.set({ ...stored, roles: ["client"] });
      }
    } catch (err: unknown) {
      const res = (err as { response?: { status?: number; data?: { detail?: string } } })?.response;
      const msg = res?.data?.detail;
      if (res?.status === 409) {
        setJoinError(typeof msg === "string" ? msg : "У вас уже есть активная подписка на этот период");
      } else {
        setJoinError(typeof msg === "string" ? msg : "Не удалось подключить план");
      }
    } finally {
      setJoining(null);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: "48px" }}>
        <CircularProgress size={28} sx={{ color: brand.terracotta }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "14px", color: brand.terracotta, py: "24px" }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
      <Typography className="eyebrow" sx={{ display: "block", mb: "12px" }}>
        Абонементы
      </Typography>
      <Typography sx={{
        fontFamily: "var(--font-display)", fontWeight: 400,
        fontSize: "clamp(28px, 3vw, 40px)", lineHeight: 1.05,
        color: brand.cocoa, mb: "28px",
      }}>
        Offline{" "}
        <Box component="em" sx={{ fontStyle: "italic", color: brand.terracottaDeep }}>
          занятия
        </Box>
      </Typography>

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
      />

      <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: brand.mute, mb: "16px" }}>
        Абонементы
      </Typography>

      {joinError && (
        <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.terracotta, mb: "16px" }}>
          {joinError}
        </Typography>
      )}

      {plans.length === 0 ? (
        <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "14px", color: brand.mute }}>
          Нет доступных планов
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onJoin={handleJoin}
              joining={joining === plan.id}
              joined={joinedIds.has(plan.id) || purchasedPlanIds.has(plan.id)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
