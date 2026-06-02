"use client";

import { useState, useEffect, useCallback } from "react";
import Box              from "@mui/material/Box";
import Typography       from "@mui/material/Typography";
import Tabs             from "@mui/material/Tabs";
import Tab              from "@mui/material/Tab";
import Button           from "@mui/material/Button";
import { alpha }        from "@mui/material/styles";
import { brand }        from "@/shared/theme";
import { useCurrency }  from "@/app/providers/CurrencyProvider";
import { TrainerPlansSelector } from "@/features/offline-plans";
import { useCalendarDays } from "@/features/calendar-days";
import { subscriptionsApi, subscriptionPlansApi } from "@/shared/api";
import type { SubscriptionPlanResponse } from "@/shared/api";
import CircularProgress from "@mui/material/CircularProgress";

// ─── Утилиты дат ──────────────────────────────────────────────────────────────

function lastDayOf(year: number, month: number) {
  return new Date(year, month + 1, 0);
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

interface CalcResult {
  start:             Date;
  end:               Date;
  perMonth:          number;
  displaySessions?:  number; // пропорциональное кол-во занятий для текущего месяца
  displayPrice?:     number; // пропорциональная цена для текущего месяца
}

function calcDates(plan: SubscriptionPlanResponse): CalcResult {
  const now   = new Date();
  const y     = now.getFullYear();
  const m     = now.getMonth();
  const nextM = m === 11 ? 0 : m + 1;
  const nextY = m === 11 ? y + 1 : y;

  if (plan.is_calendar_month) {
    const totalDays     = lastDayOf(y, m).getDate();
    const remainingDays = totalDays - now.getDate() + 1;
    const displaySessions = plan.sessions_limit != null
      ? Math.ceil((plan.sessions_limit / totalDays) * remainingDays)
      : undefined;
    const displayPrice = displaySessions != null && plan.sessions_limit != null
      ? Math.ceil((plan.price / plan.sessions_limit) * displaySessions)
      : Math.ceil((plan.price / totalDays) * remainingDays);
    return { start: now, end: lastDayOf(y, m), perMonth: displayPrice, displaySessions, displayPrice };
  }

  const start    = new Date(nextY, nextM, 1);
  const months   = Math.max(1, Math.round(plan.duration_days / 30));
  const endRaw   = nextM + months;
  const endYear  = nextY + Math.floor(endRaw / 12);
  const endMonth = endRaw % 12;
  const end      = lastDayOf(endYear, endMonth === 0 ? 11 : endMonth - 1);
  const perMonth = months > 1 ? Math.ceil(plan.price / months) : plan.price;

  return { start, end, perMonth };
}

// ─── PlanPoster ───────────────────────────────────────────────────────────────

interface PlanPosterProps {
  plan:         SubscriptionPlanResponse;
  featured:     boolean;
  discountDays: number;
  onSelect:     (planId: string, discountDays: number) => void;
  purchasing:   boolean;
}

function PlanPoster({ plan, featured, discountDays, onSelect, purchasing }: PlanPosterProps) {
  const { formatPrice } = useCurrency();
  const { start, end, perMonth, displaySessions, displayPrice } = calcDates(plan);
  const months = Math.max(1, Math.round(plan.duration_days / 30));

  // Скидка за пропущенные дни
  const duration = plan.duration_days || lastDayOf(new Date().getFullYear(), new Date().getMonth()).getDate();
  const discountAmount = discountDays > 0 ? Math.round((perMonth / duration) * discountDays) : 0;
  const finalPrice = perMonth - discountAmount;
  const hasDiscount = discountAmount > 0;

  const isDark    = featured;
  const bg        = isDark ? brand.cocoa : brand.ivory;
  const fg        = isDark ? brand.ivory : brand.cocoa;
  const fgMute    = isDark ? alpha(brand.ivory, 0.55) : brand.mute;
  const fgLine    = isDark ? alpha(brand.ivory, 0.12) : alpha(brand.line, 0.8);
  const btnBorder = isDark ? "none" : `1px solid ${alpha(brand.cocoa, 0.4)}`;

  // Метка периода
  const periodLabel = plan.is_calendar_month
    ? "Текущий месяц"
    : months === 1 ? "1 месяц"
    : `${months} месяца`;

  // Занятий в неделю
  const totalDays = plan.is_calendar_month
    ? lastDayOf(new Date().getFullYear(), new Date().getMonth()).getDate()
    : plan.duration_days;
  const sessionsPerWeek = plan.sessions_limit != null && !plan.is_unlimited
    ? Math.round(plan.sessions_limit / (totalDays / 7))
    : null;

  return (
    <Box sx={{
      borderRadius: "20px",
      backgroundColor: bg,
      border: isDark ? "none" : `1px solid ${alpha(brand.line, 0.8)}`,
      p: "28px",
      display: "flex", flexDirection: "column",
      position: "relative",
      transition: "box-shadow 0.2s ease, transform 0.2s ease",
      boxShadow: isDark ? `0 12px 40px -12px ${alpha(brand.cocoa, 0.35)}` : "none",
      "&:hover": {
        transform: "translateY(-3px)",
        boxShadow: isDark
          ? `0 20px 48px -12px ${alpha(brand.cocoa, 0.45)}`
          : `0 8px 28px -8px ${alpha(brand.cocoa, 0.12)}`,
      },
    }}>
      {/* Круг с занятиями в неделю */}
      {sessionsPerWeek != null && sessionsPerWeek > 0 && (
        <Box sx={{
          position: "absolute", top: "20px", right: "20px",
          width: 72, height: 72, borderRadius: "50%",
          backgroundColor: isDark ? brand.ivory : brand.cocoa,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Typography sx={{
            fontFamily: "var(--font-display)", fontStyle: "italic",
            fontSize: "20px", fontWeight: 400, lineHeight: 1,
            color: isDark ? brand.cocoa : brand.ivory,
            whiteSpace: "nowrap",
          }}>
            {sessionsPerWeek}
            <Box component="span" sx={{
              fontFamily: "var(--font-body)", fontStyle: "normal",
              fontSize: "11px", fontWeight: 600,
              color: isDark ? alpha(brand.cocoa, 0.55) : alpha(brand.ivory, 0.65),
            }}>
              /нед
            </Box>
          </Typography>
        </Box>
      )}

      {/* Метка */}
      <Typography sx={{
        fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: brand.terracotta, mb: "20px",
        pr: sessionsPerWeek != null ? "72px" : 0,
      }}>
        {periodLabel}
      </Typography>

      {/* Цена за месяц */}
      <Box sx={{ mb: "4px" }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
          <Typography sx={{
            fontFamily: "var(--font-display)", fontStyle: "italic",
            fontSize: "48px", fontWeight: 400, color: fg, lineHeight: 1,
          }}>
            {formatPrice(finalPrice)}
          </Typography>
          {hasDiscount && (
            <Typography sx={{
              fontFamily: "var(--font-body)", fontSize: "18px",
              color: isDark ? alpha(brand.ivory, 0.45) : brand.mute,
              textDecoration: "line-through", lineHeight: 1,
            }}>
              {formatPrice(perMonth)}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mt: "4px", flexWrap: "wrap" }}>
          <Typography sx={{
            fontFamily: "var(--font-body)", fontSize: "13px",
            color: fgMute, fontStyle: "italic",
          }}>
            / мес
          </Typography>
          {hasDiscount && (
            <Typography sx={{
              fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700,
              color: isDark ? brand.blush : brand.sage,
              backgroundColor: isDark ? alpha(brand.blush, 0.15) : alpha(brand.sage, 0.12),
              px: "8px", py: "2px", borderRadius: "100px",
            }}>
              −{discountDays} {discountDays === 1 ? "день" : "дня"} в подарок
            </Typography>
          )}
        </Box>
      </Box>

      {/* Описание */}
      <Typography sx={{
        fontFamily: "var(--font-body)", fontSize: "13px",
        color: fgMute, lineHeight: 1.6, mb: "24px",
      }}>
        {plan.description || plan.name}.{" "}
        Период: {fmtDate(start)} — {fmtDate(end)}.
        {displayPrice != null && displayPrice !== plan.price && (
          <> Полная стоимость {formatPrice(plan.price)}.</>
        )}
        {months > 1 && !plan.is_calendar_month && <> Единый платёж {formatPrice(plan.price)}.</>}
      </Typography>

      {/* Разделитель */}
      <Box sx={{ borderTop: `1px solid ${fgLine}`, mb: "20px" }} />

      {/* Параметры */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", mb: "28px", flex: 1 }}>
        {!plan.is_unlimited && plan.sessions_limit != null && (
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, backgroundColor: isDark ? brand.terracotta : brand.cocoa }} />
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: fg }}>
              {displaySessions != null && displaySessions !== plan.sessions_limit
                ? <>{displaySessions} занятий <Box component="span" sx={{ textDecoration: "line-through", opacity: 0.45 }}>из {plan.sessions_limit}</Box></>
                : <>{plan.sessions_limit} занятий</>
              }
            </Typography>
          </Box>
        )}
        {plan.is_unlimited && (
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, backgroundColor: isDark ? brand.terracotta : brand.cocoa }} />
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: fg }}>
              Безлимитные занятия
            </Typography>
          </Box>
        )}
        {plan.freeze_days_limit != null && (
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, backgroundColor: isDark ? brand.terracotta : brand.cocoa }} />
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: fg }}>
              Заморозка до {plan.freeze_days_limit} дней
            </Typography>
          </Box>
        )}
      </Box>

      {/* Кнопка */}
      <Button
        variant={isDark ? "contained" : "outlined"}
        fullWidth
        disabled={purchasing}
        onClick={() => onSelect(plan.id, discountDays)}
        sx={{
          backgroundColor: isDark ? brand.terracotta : "transparent",
          color: isDark ? brand.ivory : brand.cocoa,
          border: btnBorder,
          borderRadius: "100px",
          fontFamily: "var(--font-body)",
          fontWeight: 700, fontSize: "12px",
          letterSpacing: "0.12em", textTransform: "uppercase",
          py: "11px", boxShadow: "none",
          "&:hover": {
            backgroundColor: isDark ? brand.terracottaDeep : alpha(brand.cocoa, 0.06),
            boxShadow: "none", border: btnBorder,
          },
        }}
      >
        {purchasing ? "Оформляем..." : "Выбрать"}
      </Button>
    </Box>
  );
}

// ─── Вкладки ─────────────────────────────────────────────────────────────────

function OnlineTab() {
  return (
    <Box sx={{
      borderRadius: "14px", border: `1px dashed ${alpha(brand.line, 0.8)}`,
      p: { xs: "32px", md: "48px" }, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "14px", color: brand.mute }}>
        Раздел в разработке
      </Typography>
    </Box>
  );
}

function TrainerTab() {
  return <TrainerPlansSelector />;
}

// ─── Страница ─────────────────────────────────────────────────────────────────

const TABS = ["Онлайн занятия", "Занятия с тренером"];

export default function BillingPage() {
  const [tab, setTab]       = useState(0);
  const [plans, setPlans]   = useState<SubscriptionPlanResponse[]>([]);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchased, setPurchased] = useState<Set<string>>(new Set());
  const { unbookedLastMonth } = useCalendarDays();
  const discountDays = Math.min(unbookedLastMonth, 2);

  const loadPlans = useCallback(async () => {
    try { setPlans(await subscriptionPlansApi.listActive()); } catch { /* тихо */ }
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  async function handleSelect(planId: string, discount: number) {
    setPurchasing(planId);
    setPurchaseError(null);
    try {
      await subscriptionsApi.create(planId);
      setPurchased((prev) => new Set(prev).add(planId));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setPurchaseError(typeof msg === "string" ? msg : "Не удалось оформить подписку");
    } finally {
      setPurchasing(null);
    }
  }

  return (
    <Box sx={{ maxWidth: "1200px", mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: "32px", md: "48px" }, width: "100%" }}>
      <Typography className="eyebrow" sx={{ display: "block", mb: "12px" }}>Финансы</Typography>
      <Typography sx={{
        fontFamily: "var(--font-display)", fontWeight: 400,
        fontSize: "clamp(36px, 4vw, 52px)", lineHeight: 1.0,
        color: brand.cocoa, mb: "32px",
      }}>
        Billing
      </Typography>

      <Box sx={{
        borderRadius: "22px", backgroundColor: brand.ivory,
        border: `1px solid ${alpha(brand.line, 0.7)}`,
        boxShadow: `0 2px 12px -4px ${alpha(brand.cocoa, 0.07)}`,
        overflow: "hidden",
      }}>
        <Tabs
          value={tab} onChange={(_, v) => setTab(v)}
          sx={{
            px: { xs: "16px", md: "28px" },
            borderBottom: `1px solid ${alpha(brand.line, 0.7)}`,
            "& .MuiTabs-indicator": { backgroundColor: brand.terracotta, height: "2px", borderRadius: "2px 2px 0 0" },
            "& .MuiTab-root": { fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", letterSpacing: "0.04em", color: brand.mute, textTransform: "none", minWidth: 0, px: "4px", mr: "24px", transition: "color 0.15s ease" },
            "& .MuiTab-root.Mui-selected": { color: brand.cocoa, fontWeight: 600 },
          }}
        >
          {TABS.map((label) => <Tab key={label} label={label} disableRipple />)}
        </Tabs>

        <Box sx={{ p: { xs: "20px", md: "28px" } }}>
          {tab === 0 ? <OnlineTab /> : <TrainerTab />}
        </Box>
      </Box>
    </Box>
  );
}
