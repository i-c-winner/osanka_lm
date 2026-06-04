"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import { alpha } from "@mui/material/styles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useTranslations } from "next-intl";
import { brand } from "@/shared/theme";
import type { SubscriptionPlanResponse } from "@/shared/api";

// ─── Утилиты ─────────────────────────────────────────────────────────────────

export function fmtPrice(price: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(price);
}

export function fmtDate(date: Date) {
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export interface PlanDates {
  start: Date;
  end: Date;
  proratedPrice?: number;
  proratedSessions?: number;
}

export function calcDates(plan: SubscriptionPlanResponse): PlanDates {
  const now = new Date();

  if (plan.is_calendar_month) {
    const start = new Date(now);
    const totalDays = daysInMonth(now.getFullYear(), now.getMonth());
    const remainingDays = totalDays - now.getDate() + 1;
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const proratedSessions =
      plan.sessions_limit != null
        ? Math.ceil((plan.sessions_limit / totalDays) * remainingDays)
        : undefined;
    const proratedPrice =
      plan.sessions_limit != null && proratedSessions != null
        ? Math.ceil((plan.price / plan.sessions_limit) * proratedSessions)
        : Math.ceil((plan.price / totalDays) * remainingDays);
    return { start, end, proratedPrice, proratedSessions };
  }

  const startMonth = now.getMonth() === 11 ? 0 : now.getMonth() + 1;
  const startYear =
    now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
  const start = new Date(startYear, startMonth, 1);

  const months = Math.max(1, Math.round(plan.duration_days / 30));
  const endMonthRaw = startMonth + months;
  const endYear = startYear + Math.floor(endMonthRaw / 12);
  const endMonth = endMonthRaw % 12;
  const end = new Date(endYear, endMonth, 0);

  return { start, end };
}

// ─── Компонент ────────────────────────────────────────────────────────────────

export interface PlanCardProps {
  plan: SubscriptionPlanResponse;
  onJoin: (planId: string) => void;
  joining: boolean;
  joined: boolean;
}

export function PlanCard({ plan, onJoin, joining, joined }: PlanCardProps) {
  const t = useTranslations("offlinePlans");
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
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 400, color: brand.cocoa, lineHeight: 1.2, mb: "4px" }}>
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
            <Chip label={t("chipUnlimited")} size="small" sx={{ height: 20, fontFamily: "var(--font-body)", fontSize: "10px", backgroundColor: alpha(brand.sage, 0.15), color: brand.sage }} />
          )}
          {plan.is_calendar_month && (
            <Chip label={t("chipCalendarMonth")} size="small" sx={{ height: 20, fontFamily: "var(--font-body)", fontSize: "10px", backgroundColor: alpha(brand.gold, 0.15), color: brand.gold }} />
          )}
        </Box>
      </Box>

      {/* Параметры + кнопка */}
      <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <Box sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>

          {/* Цена */}
          <Box>
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: brand.mute, mb: "2px" }}>
              {t("priceLabel")}
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

          {/* Период */}
          <Box>
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: brand.mute, mb: "2px" }}>
              {t("periodLabel")}
            </Typography>
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 500, color: brand.cocoa }}>
              {fmtDate(dates.start)} — {fmtDate(dates.end)}
            </Typography>
          </Box>

          {/* Занятий */}
          {!plan.is_unlimited && plan.sessions_limit != null && (
            <Box>
              <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: brand.mute, mb: "2px" }}>
                {t("sessionsLabel")}
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

          {/* Заморозка */}
          {plan.freeze_days_limit != null && (
            <Box>
              <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: brand.mute, mb: "2px" }}>
                {t("freezeLabel")}
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: 600, color: brand.cocoa }}>
                {t("freezeDays", { days: plan.freeze_days_limit })}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Кнопка */}
        {joined ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 18, color: brand.sage }} />
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: brand.sage }}>
              {t("joinedLabel")}
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
            {joining ? t("joiningBtn") : t("joinBtn")}
          </Button>
        )}
      </Box>
    </Box>
  );
}
