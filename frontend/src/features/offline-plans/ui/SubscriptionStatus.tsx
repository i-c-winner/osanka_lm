"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { alpha } from "@mui/material/styles";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/i18n/navigation";
import { brand } from "@/shared/theme";
import type { SubscriptionResponse, SubscriptionPlanResponse } from "@/shared/api";

// ─── Утилита: метка подписки ──────────────────────────────────────────────────

export function subLabel(
  sub: SubscriptionResponse,
  plansById: Record<string, SubscriptionPlanResponse>,
  noEndSymbol: string,
): string {
  const plan = plansById[sub.plan_id];
  const name = plan?.name ?? "—";
  const from = new Date(sub.started_at).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
  const to = sub.expires_at
    ? new Date(sub.expires_at).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      })
    : noEndSymbol;
  return `${name} · ${from} – ${to}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SubscriptionStatusProps {
  subscriptions: SubscriptionResponse[];
  activeSub: SubscriptionResponse | null;
  activePlan: SubscriptionPlanResponse | null;
  plansById: Record<string, SubscriptionPlanResponse>;
  activeBookings: number;
  onSwitch: (id: string) => void;
}

// ─── Компонент ────────────────────────────────────────────────────────────────

export function SubscriptionStatus({
  subscriptions,
  activeSub,
  activePlan,
  plansById,
  activeBookings,
  onSwitch,
}: SubscriptionStatusProps) {
  const t = useTranslations("offlinePlans");
  const router = useRouter();

  return (
    <>
      {/* Переключатель подписок — всегда виден */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "20px", flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px", color: brand.mute }}>
          <SwapHorizIcon sx={{ fontSize: 16 }} />
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {t("selectorLabel")}
          </Typography>
        </Box>
        {subscriptions.length > 0 ? (
          <Select
            value={activeSub?.id ?? ""}
            onChange={(e) => onSwitch(e.target.value)}
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
              <MenuItem key={sub.id} value={sub.id} sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>
                {subLabel(sub, plansById, t("noEnd"))}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.mute }}>
            {t("noActiveSubscription")}
          </Typography>
        )}
      </Box>

      {/* Статус подписки — всегда виден */}
      <Box
        sx={{
          display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap",
          mb: "20px", px: "20px", py: "14px", borderRadius: "14px",
          backgroundColor: activeSub ? alpha(brand.sage, 0.08) : alpha(brand.line, 0.06),
          border: `1px solid ${activeSub ? alpha(brand.sage, 0.3) : alpha(brand.line, 0.4)}`,
        }}
      >
        {activeSub ? (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: brand.sage, flexShrink: 0 }} />
              <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "13px", color: brand.cocoa }}>
                {activePlan?.name ?? t("statusActivePlan")}
              </Typography>
            </Box>

            {activePlan?.sessions_limit != null && (
              <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.cocoaSoft }}>
                  {t("sessionsLeft")}
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "13px", color: brand.cocoa }}>
                  {Math.max(0, activePlan.sessions_limit - activeSub.sessions_used - activeBookings)}
                  <Box component="span" sx={{ fontWeight: 400, color: brand.mute }}>
                    {" "}{t("sessionsOf", { limit: activePlan.sessions_limit })}
                  </Box>
                </Typography>
              </Box>
            )}

            {activeSub.expires_at && (
              <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.cocoaSoft }}>
                  {t("expiresAt")}
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "13px", color: brand.cocoa }}>
                  {new Date(activeSub.expires_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.mute }}>
            {t("noActiveSubscription")}
          </Typography>
        )}

        <Button onClick={() => router.push("/billing")} sx={{ fontFamily: "var(--font-body)", fontSize: "13px", ml: "auto" }}>
          {t("renewBtn")}
        </Button>
      </Box>

      {/* Строка с остатком занятий */}
      {activePlan?.sessions_limit != null && activeSub && (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "12px", px: "4px" }}>
          <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: brand.mute }}>
            {t("sessionsLeftLabel")}
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
    </>
  );
}
