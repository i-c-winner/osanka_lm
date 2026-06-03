"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "@/shared/i18n/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { alpha } from "@mui/material/styles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { brand } from "@/shared/theme";
import {
  subscriptionsApi,
  bookingsApi,
} from "@/shared/api";
import type {
  SubscriptionPlanResponse,
  SubscriptionResponse,
  BookingResponse,
} from "@/shared/api";
import { userStorage } from "@/shared/lib/userStorage";
import { MonthCalendar } from "@/entities/calendar";
import { useCalendarDays } from "@/features/calendar-days";
import { DayBookingModal } from "@/features/book-session";
import { useMySpace } from "@/features/my-space";

// ─── Утилиты ─────────────────────────────────────────────────────────────────

function fmtPrice(price: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(price);
}

function fmtDate(date: Date) {
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

interface PlanDates {
  start: Date;
  end: Date;
  proratedPrice?: number; // только для is_calendar_month
  proratedSessions?: number; // только для is_calendar_month с sessions_limit
}

function calcDates(plan: SubscriptionPlanResponse): PlanDates {
  const now = new Date();

  if (plan.is_calendar_month) {
    const start = new Date(now);
    const totalDays = daysInMonth(now.getFullYear(), now.getMonth());
    const remainingDays = totalDays - now.getDate() + 1;
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0); // последний день месяца
    const proratedSessions =
      plan.sessions_limit != null
        ? Math.ceil((plan.sessions_limit / totalDays) * remainingDays)
        : undefined;
    // Цена пропорционально оставшимся занятиям, если лимит задан; иначе — по дням
    const proratedPrice =
      plan.sessions_limit != null && proratedSessions != null
        ? Math.ceil((plan.price / plan.sessions_limit) * proratedSessions)
        : Math.ceil((plan.price / totalDays) * remainingDays);
    return { start, end, proratedPrice, proratedSessions };
  }

  // Начало — 1-е следующего месяца
  const startMonth = now.getMonth() === 11 ? 0 : now.getMonth() + 1;
  const startYear =
    now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
  const start = new Date(startYear, startMonth, 1);

  // Конец — последний день N-го месяца
  const months = Math.max(1, Math.round(plan.duration_days / 30));
  const endMonthRaw = startMonth + months;
  const endYear = startYear + Math.floor(endMonthRaw / 12);
  const endMonth = endMonthRaw % 12;
  const end = new Date(endYear, endMonth, 0); // день 0 = последний день предыдущего месяца

  return { start, end };
}

// ─── PlanCard ─────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: SubscriptionPlanResponse;
  onJoin: (planId: string) => void;
  joining: boolean;
  joined: boolean;
}

function PlanCard({ plan, onJoin, joining, joined }: PlanCardProps) {
  const dates = calcDates(plan);
  const displayPrice = dates.proratedPrice ?? plan.price;
  const isProratedDifferent =
    dates.proratedPrice != null && dates.proratedPrice !== plan.price;

  return (
    <Box
      sx={{
        borderRadius: "16px",
        border: `1px solid ${joined ? alpha(brand.sage, 0.5) : alpha(brand.line, 0.7)}`,
        p: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        backgroundColor: joined ? alpha(brand.sage, 0.04) : brand.ivory,
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": { boxShadow: `0 4px 20px -6px ${alpha(brand.cocoa, 0.12)}` },
      }}
    >
      {/* Шапка */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: "18px",
              fontWeight: 400,
              color: brand.cocoa,
              lineHeight: 1.2,
              mb: "4px",
            }}
          >
            {plan.name}
          </Typography>
          {plan.description && (
            <Typography
              sx={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: brand.cocoaSoft,
                lineHeight: 1.5,
              }}
            >
              {plan.description}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: "4px",
            flexShrink: 0,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {plan.is_unlimited && (
            <Chip
              label="Безлимит"
              size="small"
              sx={{
                height: 20,
                fontFamily: "var(--font-body)",
                fontSize: "10px",
                backgroundColor: alpha(brand.sage, 0.15),
                color: brand.sage,
              }}
            />
          )}
          {plan.is_calendar_month && (
            <Chip
              label="До конца месяца"
              size="small"
              sx={{
                height: 20,
                fontFamily: "var(--font-body)",
                fontSize: "10px",
                backgroundColor: alpha(brand.gold, 0.15),
                color: brand.gold,
              }}
            />
          )}
        </Box>
      </Box>

      {/* Параметры + кнопка */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <Box sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {/* Цена */}
          <Box>
            <Typography
              sx={{
                fontFamily: "var(--font-body)",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: brand.mute,
                mb: "2px",
              }}
            >
              Цена
            </Typography>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
              <Typography
                sx={{
                  fontFamily: "var(--font-display)",
                  fontSize: "20px",
                  fontWeight: 400,
                  color: brand.cocoa,
                }}
              >
                {fmtPrice(displayPrice)}
              </Typography>
              {isProratedDifferent && (
                <Typography
                  sx={{
                    fontFamily: "var(--font-body)",
                    fontSize: "11px",
                    color: brand.mute,
                    textDecoration: "line-through",
                  }}
                >
                  {fmtPrice(plan.price)}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Период действия */}
          <Box>
            <Typography
              sx={{
                fontFamily: "var(--font-body)",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: brand.mute,
                mb: "2px",
              }}
            >
              Период
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                fontWeight: 500,
                color: brand.cocoa,
              }}
            >
              {fmtDate(dates.start)} — {fmtDate(dates.end)}
            </Typography>
          </Box>

          {!plan.is_unlimited && plan.sessions_limit != null && (
            <Box>
              <Typography
                sx={{
                  fontFamily: "var(--font-body)",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: brand.mute,
                  mb: "2px",
                }}
              >
                Занятий
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <Typography
                  sx={{
                    fontFamily: "var(--font-body)",
                    fontSize: "15px",
                    fontWeight: 600,
                    color: brand.cocoa,
                  }}
                >
                  {dates.proratedSessions ?? plan.sessions_limit}
                </Typography>
                {dates.proratedSessions != null &&
                  dates.proratedSessions !== plan.sessions_limit && (
                    <Typography
                      sx={{
                        fontFamily: "var(--font-body)",
                        fontSize: "11px",
                        color: brand.mute,
                        textDecoration: "line-through",
                      }}
                    >
                      {plan.sessions_limit}
                    </Typography>
                  )}
              </Box>
            </Box>
          )}

          {plan.freeze_days_limit != null && (
            <Box>
              <Typography
                sx={{
                  fontFamily: "var(--font-body)",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: brand.mute,
                  mb: "2px",
                }}
              >
                Заморозка
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-body)",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: brand.cocoa,
                }}
              >
                {plan.freeze_days_limit} дн.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Кнопка */}
        {joined ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 18, color: brand.sage }} />
            <Typography
              sx={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                fontWeight: 600,
                color: brand.sage,
              }}
            >
              Подключено
            </Typography>
          </Box>
        ) : (
          <Button
            variant="contained"
            disabled={joining}
            onClick={() => onJoin(plan.id)}
            startIcon={
              joining ? (
                <CircularProgress size={14} color="inherit" />
              ) : undefined
            }
            sx={{
              backgroundColor: brand.cocoa,
              color: brand.ivory,
              borderRadius: "100px",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "13px",
              textTransform: "none",
              px: "20px",
              py: "9px",
              boxShadow: "none",
              flexShrink: 0,
              "&:hover": {
                backgroundColor: brand.cocoaSoft,
                boxShadow: "none",
                transform: "translateY(-1px)",
              },
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

// ─── Вспомогательная функция: метка подписки для Select ──────────────────────

function subLabel(
  sub: SubscriptionResponse,
  plansById: Record<string, SubscriptionPlanResponse>,
): string {
  const plan = plansById[sub.plan_id];
  const name = plan?.name ?? "Подписка";
  const from = new Date(sub.started_at).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
  const to = sub.expires_at
    ? new Date(sub.expires_at).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      })
    : "∞";
  return `${name} · ${from} – ${to}`;
}

// ─── OfflinePlansSection ──────────────────────────────────────────────────────

export function OfflinePlansSection() {
  const router = useRouter();

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

  // ── Локальное состояние (только для этого экрана) ──────────────────────────
  const {
    getDayData,
    sessionsByDate,
    optimisticBook,
    optimisticCancel,
    unbookedLastMonth,
  } = useCalendarDays();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeBookings, setActiveBookings] = useState(0);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [joinError, setJoinError] = useState<string | null>(null);

  // Считаем активные брони (только загрузка, не дублируем подписки)
  const loadBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const myBookings = await bookingsApi.listMy().catch(() => [] as BookingResponse[]);
      setActiveBookings(myBookings.filter((b) => b.status === "booked").length);
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Ids уже купленных планов (для подсветки кнопки "Подключено")
  const purchasedPlanIds = useMemo(
    () => new Set(subscriptions.filter((s) => s.status === "active").map((s) => s.plan_id)),
    [subscriptions],
  );

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

      // Обновляем контекст — новая подписка появится в списке
      await reloadContext();
    } catch (err: unknown) {
      const res = (
        err as { response?: { status?: number; data?: { detail?: string } } }
      )?.response;
      const msg = res?.data?.detail;
      setJoinError(
        typeof msg === "string" ? msg : "Не удалось подключить план",
      );
    } finally {
      setJoining(null);
    }
  }

  const loading = ctxLoading || bookingsLoading;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: "48px" }}>
        <CircularProgress size={28} sx={{ color: brand.terracotta }} />
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
      <Typography className="eyebrow" sx={{ display: "block", mb: "12px" }}>
        Абонементы
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
        Offline{" "}
        <Box component="em" sx={{ fontStyle: "italic", color: brand.terracottaDeep }}>
          занятия
        </Box>
      </Typography>

      {/* ── Переключатель подписок ─────────────────────────────────────────── */}
      {subscriptions.length > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            mb: "20px",
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px", color: brand.mute }}>
            <SwapHorizIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Абонемент
            </Typography>
          </Box>
          <Select
            value={activeSub?.id ?? ""}
            onChange={(e) => setActiveSubscriptionId(e.target.value)}
            size="small"
            variant="outlined"
            disabled={subscriptions.length <= 1}
            sx={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: brand.cocoa,
              minWidth: 240,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: alpha(brand.line, 0.8) },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: brand.cocoa },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: brand.terracotta },
              "& .MuiSelect-select": { py: "7px", px: "12px" },
            }}
          >
            {subscriptions.map((sub) => (
              <MenuItem
                key={sub.id}
                value={sub.id}
                sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}
              >
                {subLabel(sub, plansById)}
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}

      {/* ── Статус активной подписки ───────────────────────────────────────── */}
      {activeSub && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            mb: "20px",
            px: "20px",
            py: "14px",
            borderRadius: "14px",
            backgroundColor: alpha(brand.sage, 0.08),
            border: `1px solid ${alpha(brand.sage, 0.3)}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: brand.sage, flexShrink: 0 }} />
            <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "13px", color: brand.cocoa }}>
              {activePlan?.name ?? "Активная подписка"}
            </Typography>
          </Box>

          {activePlan && activePlan.sessions_limit != null && (
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.cocoaSoft }}>
                Осталось занятий:
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "13px", color: brand.cocoa }}>
                {activePlan.sessions_limit - activeSub.sessions_used - activeBookings}
                <Box component="span" sx={{ fontWeight: 400, color: brand.mute }}>
                  {" "}/ {activePlan.sessions_limit}
                </Box>
              </Typography>
            </Box>
          )}

          {activeSub.expires_at && (
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.cocoaSoft }}>
                Действует до:
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "13px", color: brand.cocoa }}>
                {new Date(activeSub.expires_at).toLocaleDateString("ru-RU", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </Typography>
            </Box>
          )}
          <Button onClick={() => router.push("/billing")}>Продлить подписку</Button>
        </Box>
      )}

      {/* ── Остаток занятий ────────────────────────────────────────────────── */}
      {activePlan && activePlan.sessions_limit != null && activeSub && (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "12px", px: "4px" }}>
          <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: brand.mute }}>
            Осталось занятий
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
            <Typography sx={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "22px", fontWeight: 400, color: brand.cocoa, lineHeight: 1 }}>
              {Math.max(0, activePlan.sessions_limit - activeSub.sessions_used - activeBookings)}
            </Typography>
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.mute }}>
              / {activePlan.sessions_limit}
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Пропущенные занятия за прошлый месяц ──────────────────────────── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "16px", px: "20px", py: "12px", borderRadius: "14px", backgroundColor: alpha(brand.terracotta, 0.06), border: `1px solid ${alpha(brand.terracotta, 0.2)}` }}>
        <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.cocoaSoft }}>
          Пропущено занятий в прошлом месяце
        </Typography>
        <Typography sx={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "22px", fontWeight: 400, color: brand.terracotta, lineHeight: 1 }}>
          {unbookedLastMonth}
        </Typography>
      </Box>

      {/* ── Календарь сессий ───────────────────────────────────────────────── */}
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
