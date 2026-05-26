"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useTranslations } from "next-intl";
import { brand } from "@/shared/theme";
import type { SubscriptionPlanResponse } from "@/shared/api";

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlanResponse;
  action?: React.ReactNode;
  /** Highlight card in terracotta (max one per section) */
  featured?: boolean;
}

export function SubscriptionPlanCard({
  plan,
  action,
  featured = false,
}: SubscriptionPlanCardProps) {
  const t = useTranslations("subscriptions");

  return (
    <Card
      variant="outlined"
      sx={{
        background:  featured ? brand.cocoa    : brand.ivory,
        border:      featured ? "none"          : undefined,
        color:       featured ? brand.ivory     : brand.cocoa,
        transition:  "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform:  "translateY(-4px)",
          boxShadow:  "0 30px 60px -30px rgba(60,30,15,0.25)",
        },
      }}
    >
      <CardContent>
        {/* Eyebrow */}
        {plan.is_unlimited && (
          <Typography
            sx={{
              fontFamily:    "var(--font-body)",
              fontWeight:    600,
              fontSize:      "11px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color:         featured ? brand.blush : brand.terracottaDeep,
              mb: 1,
            }}
          >
            {t("unlimited")}
          </Typography>
        )}

        {/* Plan name */}
        <Typography
          sx={{
            fontFamily:    "var(--font-display)",
            fontWeight:    400,
            fontSize:      "28px",
            lineHeight:    1.1,
            color:         featured ? brand.ivory : brand.cocoa,
            mb: 1.5,
          }}
        >
          {plan.name}
        </Typography>

        {/* Description */}
        {plan.description && (
          <Typography
            variant="body2"
            sx={{
              color: featured ? brand.blush : brand.mute,
              mb: 2,
            }}
          >
            {plan.description}
          </Typography>
        )}

        {/* Price */}
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mb: 1.5 }}>
          <Typography
            sx={{
              fontFamily:    "var(--font-display)",
              fontStyle:     "italic",
              fontWeight:    400,
              fontSize:      "52px",
              lineHeight:    1,
              color:         featured ? brand.ivory : brand.terracotta,
              letterSpacing: "-0.02em",
            }}
          >
            {plan.price}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: featured ? brand.blush : brand.mute, fontSize: "14px" }}
          >
            {plan.currency}
          </Typography>
        </Box>

        {/* Meta */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {!plan.is_unlimited && plan.sessions_limit && (
            <Typography
              variant="body2"
              sx={{ color: featured ? brand.blush : brand.cocoaSoft }}
            >
              {plan.sessions_limit} занятий
            </Typography>
          )}
          {plan.duration_days && (
            <Typography
              variant="body2"
              sx={{ color: featured ? brand.blush : brand.mute }}
            >
              {plan.duration_days} дней
            </Typography>
          )}
        </Box>
      </CardContent>

      {action && <CardActions>{action}</CardActions>}
    </Card>
  );
}
