"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import CheckIcon from "@mui/icons-material/Check";
import { alpha } from "@mui/material/styles";
import { brand } from "@/shared/theme";
import {
  locationsApi,
  subscriptionPlansApi,
  subscriptionsApi,
} from "@/shared/api";
import type { LocationResponse, SubscriptionPlanResponse } from "@/shared/api";
import { useCurrency } from "@/app/providers/CurrencyProvider";
import { userStorage } from "@/shared/lib/userStorage";

// ─── Утилиты ─────────────────────────────────────────────────────────────────

function lastDayOf(year: number, month: number) {
  return new Date(year, month + 1, 0);
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

function parseSessionsPerWeek(plan: SubscriptionPlanResponse): number | null {
  // Сначала пробуем из description — берём первое число
  if (plan.description) {
    const match = plan.description.match(/\d+/);
    if (match) return parseInt(match[0], 10);
  }
  // Fallback — считаем из sessions_limit / duration_days
  if (plan.sessions_limit != null && plan.duration_days > 0) {
    return Math.round(plan.sessions_limit / (plan.duration_days / 7));
  }
  return null;
}

interface CalcResult {
  start: Date;
  end: Date;
  displaySessions: number | null;
  displayPrice: number;
}

function calcPlanDates(plan: SubscriptionPlanResponse): CalcResult {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const nextM = m === 11 ? 0 : m + 1;
  const nextY = m === 11 ? y + 1 : y;

  if (plan.is_calendar_month) {
    const totalDays = lastDayOf(y, m).getDate();
    const remainingDays = totalDays - now.getDate() + 1;
    const displaySessions =
      plan.sessions_limit != null
        ? Math.ceil((plan.sessions_limit / totalDays) * remainingDays)
        : null;
    const displayPrice =
      displaySessions != null && plan.sessions_limit != null
        ? Math.ceil((plan.price / plan.sessions_limit) * displaySessions)
        : Math.ceil((plan.price / totalDays) * remainingDays);
    return { start: now, end: lastDayOf(y, m), displaySessions, displayPrice };
  }

  const months = Math.max(1, Math.round(plan.duration_days / 30));
  const start = new Date(nextY, nextM, 1);
  const endRaw = nextM + months;
  const endYear = nextY + Math.floor(endRaw / 12);
  const endMonth = endRaw % 12;
  const end = lastDayOf(endYear, endMonth === 0 ? 11 : endMonth - 1);
  return {
    start,
    end,
    displaySessions: plan.sessions_limit ?? null,
    displayPrice: plan.price,
  };
}

// ─── Блок 1: Выбор локации ────────────────────────────────────────────────────

interface LocationSelectorProps {
  locations: LocationResponse[];
  selected: string | null;
  onSelect: (id: string) => void;
}

function LocationSelector({
  locations,
  selected,
  onSelect,
}: LocationSelectorProps) {
  return (
    <Box>
      <Typography
        sx={{
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: "11px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: brand.mute,
          mb: "12px",
        }}
      >
        Выберите локацию
      </Typography>
      <Box sx={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {locations.map((loc) => {
          const isActive = selected === loc.id;
          return (
            <Box
              key={loc.id}
              onClick={() => onSelect(loc.id)}
              sx={{
                px: "20px",
                py: "12px",
                borderRadius: "14px",
                cursor: "pointer",
                border: `1px solid ${isActive ? brand.cocoa : alpha(brand.line, 0.8)}`,
                backgroundColor: isActive ? brand.cocoa : "transparent",
                transition: "all 0.15s ease",
                "&:hover": {
                  borderColor: brand.cocoa,
                  backgroundColor: isActive
                    ? brand.cocoa
                    : alpha(brand.line, 0.3),
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: "14px",
                  color: isActive ? brand.ivory : brand.cocoa,
                }}
              >
                {loc.name}
              </Typography>
              {loc.address && (
                <Typography
                  sx={{
                    fontFamily: "var(--font-body)",
                    fontSize: "12px",
                    color: isActive ? alpha(brand.ivory, 0.65) : brand.mute,
                    mt: "2px",
                  }}
                >
                  {loc.address}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ─── Блок 2: Выбор занятий в неделю ──────────────────────────────────────────

interface FrequencySelectorProps {
  options: number[];
  selected: number | null;
  onSelect: (v: number) => void;
}

function FrequencySelector({
  options,
  selected,
  onSelect,
}: FrequencySelectorProps) {
  return (
    <Box>
      <Typography
        sx={{
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: "11px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: brand.mute,
          mb: "12px",
        }}
      >
        Количество занятий в неделю
      </Typography>
      <Box sx={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {options.map((n) => {
          const isActive = selected === n;
          return (
            <Box
              key={n}
              onClick={() => onSelect(n)}
              sx={{
                width: 150,
                height: 150,
                borderRadius: "50%",
                cursor: "pointer",
                border: `1px solid ${isActive ? brand.cocoa : alpha(brand.line, 0.8)}`,
                backgroundColor: isActive ? brand.cocoa : "transparent",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
                "&:hover": {
                  borderColor: brand.cocoa,
                  backgroundColor: isActive
                    ? brand.cocoa
                    : alpha(brand.line, 0.3),
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontSize: "28px",
                  fontWeight: 400,
                  lineHeight: 1,
                  color: isActive ? brand.ivory : brand.cocoa,
                }}
              >
                {n}
              </Typography>
              <Typography
                sx={{
                  pt: "10px",
                  fontFamily: "var(--font-body)",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: isActive ? alpha(brand.ivory, 0.65) : brand.mute,
                }}
              >
                занятия/нед
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ─── Блок 3: Карточка плана ───────────────────────────────────────────────────

interface PlanResultCardProps {
  plan: SubscriptionPlanResponse;
  index: number;
  total: number;
  onJoin: (planId: string) => void;
  joining: boolean;
  joined: boolean;
}

function PlanResultCard({
  plan,
  index,
  total,
  onJoin,
  joining,
  joined,
}: PlanResultCardProps) {
  const { formatPrice } = useCurrency();
  const { start, end, displaySessions, displayPrice } = calcPlanDates(plan);
  const months = Math.max(1, Math.round(plan.duration_days / 30));
  const isDark = index === Math.floor(total / 2);
  const bg = isDark ? brand.cocoa : brand.ivory;
  const fg = isDark ? brand.ivory : brand.cocoa;
  const fgMute = isDark ? alpha(brand.ivory, 0.55) : brand.mute;
  const fgLine = isDark ? alpha(brand.ivory, 0.12) : alpha(brand.line, 0.8);

  const periodLabel = plan.is_calendar_month
    ? "Текущий месяц"
    : months === 1
      ? "1 месяц"
      : `${months} месяца`;

  const perMonth = plan.is_calendar_month
    ? displayPrice
    : months > 1
      ? Math.ceil(plan.price / months)
      : plan.price;

  return (
    <Box
      sx={{
        borderRadius: "20px",
        backgroundColor: bg,
        border: isDark ? "none" : `1px solid ${alpha(brand.line, 0.8)}`,
        p: "28px",
        display: "flex",
        flexDirection: "column",
        boxShadow: isDark
          ? `0 12px 40px -12px ${alpha(brand.cocoa, 0.35)}`
          : "none",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: isDark
            ? `0 20px 48px -12px ${alpha(brand.cocoa, 0.45)}`
            : `0 8px 28px -8px ${alpha(brand.cocoa, 0.12)}`,
        },
      }}
    >
      <Typography
        sx={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: brand.terracotta,
          mb: "16px",
        }}
      >
        {periodLabel}
      </Typography>

      {/* Цена */}
      <Box sx={{ mb: "4px" }}>
        <Typography
          sx={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "40px",
            fontWeight: 400,
            color: fg,
            lineHeight: 1,
          }}
        >
          {formatPrice(perMonth)}
        </Typography>
        <Typography
          sx={{
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            color: fgMute,
            mt: "4px",
            fontStyle: "italic",
          }}
        >
          / мес
        </Typography>
      </Box>

      {/* Описание */}
      <Typography
        sx={{
          fontFamily: "var(--font-body)",
          fontSize: "13px",
          color: fgMute,
          lineHeight: 1.6,
          mb: "20px",
        }}
      >
        Период: {fmtDate(start)} — {fmtDate(end)}.
        {plan.is_calendar_month &&
          displaySessions != null &&
          plan.sessions_limit != null &&
          displaySessions !== plan.sessions_limit && (
            <>
              {" "}
              Занятий в этом месяце: {displaySessions} из {plan.sessions_limit}.
            </>
          )}
        {months > 1 && !plan.is_calendar_month && (
          <> Единый платёж {formatPrice(plan.price)}.</>
        )}
      </Typography>

      <Box sx={{ borderTop: `1px solid ${fgLine}`, mb: "16px" }} />

      {/* Параметры */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          mb: "24px",
          flex: 1,
        }}
      >
        {displaySessions != null && (
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                flexShrink: 0,
                backgroundColor: isDark ? brand.terracotta : brand.cocoa,
              }}
            />
            <Typography
              sx={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: fg,
              }}
            >
              {displaySessions} занятий
              {plan.is_calendar_month &&
                plan.sessions_limit != null &&
                displaySessions !== plan.sessions_limit && (
                  <Box
                    component="span"
                    sx={{
                      color: fgMute,
                      ml: "4px",
                      textDecoration: "line-through",
                      fontSize: "12px",
                    }}
                  >
                    {plan.sessions_limit}
                  </Box>
                )}
            </Typography>
          </Box>
        )}
        {plan.freeze_days_limit != null && (
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                flexShrink: 0,
                backgroundColor: isDark ? brand.terracotta : brand.cocoa,
              }}
            />
            <Typography
              sx={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: fg,
              }}
            >
              Заморозка до {plan.freeze_days_limit} дней
            </Typography>
          </Box>
        )}
      </Box>

      {/* Кнопка */}
      {joined ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            py: "10px",
          }}
        >
          <CheckIcon sx={{ fontSize: 18, color: brand.sage }} />
          <Typography
            sx={{
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "13px",
              color: brand.sage,
            }}
          >
            Подключено
          </Typography>
        </Box>
      ) : (
        <Button
          variant={isDark ? "contained" : "outlined"}
          fullWidth
          disabled={joining}
          onClick={() => onJoin(plan.id)}
          startIcon={
            joining ? <CircularProgress size={13} color="inherit" /> : undefined
          }
          sx={{
            backgroundColor: isDark ? brand.terracotta : "transparent",
            color: isDark ? brand.ivory : brand.cocoa,
            border: isDark ? "none" : `1px solid ${alpha(brand.cocoa, 0.4)}`,
            borderRadius: "100px",
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: "12px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            py: "11px",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: isDark
                ? brand.terracottaDeep
                : alpha(brand.cocoa, 0.06),
              boxShadow: "none",
            },
          }}
        >
          {joining ? "Подключаем..." : "Подписаться"}
        </Button>
      )}
    </Box>
  );
}

// ─── TrainerPlansSelector ─────────────────────────────────────────────────────

export function TrainerPlansSelector() {
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoc, setSelectedLoc] = useState<string | null>(null);
  const [selectedFreq, setSelectedFreq] = useState<number | null>(null);
  const [joining, setJoining] = useState<string | null>(null);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [joinError, setJoinError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [locs, ps] = await Promise.all([
        locationsApi.list(false),
        subscriptionPlansApi.listActive(),
      ]);
      setLocations(locs);
      if (locs.length === 1) setSelectedLoc(locs[0].id);
      setPlans(ps);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
    } catch (err: unknown) {
      const res = (
        err as { response?: { status?: number; data?: { detail?: string } } }
      )?.response;
      const msg = res?.data?.detail;
      if (res?.status === 409) {
        setJoinError(
          typeof msg === "string"
            ? msg
            : "У вас уже есть активная подписка на этот период",
        );
      } else {
        setJoinError(
          typeof msg === "string" ? msg : "Не удалось подключить план",
        );
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

  // Уникальные значения занятий в неделю из планов
  const freqOptions = Array.from(
    new Set(
      plans
        .map(parseSessionsPerWeek)
        .filter((n): n is number => n != null && n > 0),
    ),
  ).sort((a, b) => a - b);

  // Планы подходящие под выбранную частоту
  const matchedPlans =
    selectedFreq != null
      ? plans.filter((p) => parseSessionsPerWeek(p) === selectedFreq)
      : [];

  const showLocationBlock = locations.length > 1;
  const canShowFreq = !showLocationBlock || selectedLoc != null;
  const canShowPlans = canShowFreq && selectedFreq != null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Блок 1: Локация */}
      {showLocationBlock && (
        <Box
          sx={{
            p: "24px",
            borderRadius: "18px",
            border: `1px solid ${alpha(brand.line, 0.7)}`,
            backgroundColor: alpha(brand.cream, 0.3),
          }}
        >
          <LocationSelector
            locations={locations}
            selected={selectedLoc}
            onSelect={setSelectedLoc}
          />
        </Box>
      )}

      {/* Блок 2: Частота */}
      {canShowFreq && freqOptions.length > 0 && (
        <Box
          sx={{
            p: "24px",
            borderRadius: "18px",
            border: `1px solid ${alpha(brand.line, 0.7)}`,
            backgroundColor: alpha(brand.cream, 0.3),
          }}
        >
          <FrequencySelector
            options={freqOptions}
            selected={selectedFreq}
            onSelect={setSelectedFreq}
          />
        </Box>
      )}

      {/* Блок 3: Планы */}
      {canShowPlans && (
        <Box>
          {joinError && (
            <Typography
              sx={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: brand.terracotta,
                mb: "16px",
              }}
            >
              {joinError}
            </Typography>
          )}
          {matchedPlans.length === 0 ? (
            <Box
              sx={{
                borderRadius: "14px",
                border: `1px dashed ${alpha(brand.line, 0.8)}`,
                p: "40px",
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  color: brand.mute,
                }}
              >
                Нет планов для выбранной частоты
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  lg: `repeat(${Math.min(matchedPlans.length, 4)}, 1fr)`,
                },
                gap: "16px",
                alignItems: "stretch",
              }}
            >
              {matchedPlans.map((plan, i) => (
                <PlanResultCard
                  key={plan.id}
                  plan={plan}
                  index={i}
                  total={matchedPlans.length}
                  onJoin={handleJoin}
                  joining={joining === plan.id}
                  joined={joinedIds.has(plan.id)}
                />
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
