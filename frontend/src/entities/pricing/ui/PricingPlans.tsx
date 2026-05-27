"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { alpha, useTheme } from "@mui/material/styles";
import { useTranslations } from "next-intl";
import { brand } from "@/shared/theme";

// ─── Одна фича в списке ───────────────────────────────────────────────────────
function Feature({ text, featured }: { text: string; featured?: boolean }) {
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
      <Box
        component="span"
        sx={{
          mt:              "7px",
          width:           "5px",
          height:          "5px",
          borderRadius:    "50%",
          flexShrink:      0,
          backgroundColor: featured
            ? alpha(brand.ivory, 0.6)
            : theme.palette.primary.main,
        }}
      />
      <Typography
        sx={{
          fontFamily: "var(--font-body)",
          fontWeight: 400,
          fontSize:   "14px",
          lineHeight: 1.5,
          color:      featured ? alpha(brand.ivory, 0.80) : "text.secondary",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}

// ─── Карточка тарифа ──────────────────────────────────────────────────────────
interface PlanCardProps {
  label:    string;
  price:    string;
  per:      string;
  note?:    string;
  features: string[];
  featured?: boolean;
  btnLabel: string;
}

function PlanCard({ label, price, per, note, features, featured, btnLabel }: PlanCardProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display:         "flex",
        flexDirection:   "column",
        borderRadius:    "28px",
        p:               { xs: "28px", md: "36px" },
        backgroundColor: featured ? brand.cocoa : "background.paper",
        border:          featured ? "none" : `1px solid ${alpha(brand.line, 0.7)}`,
        boxShadow:       featured
          ? `0 24px 60px -16px ${alpha(brand.cocoa, 0.45)}`
          : `0 4px 24px -8px ${alpha(brand.cocoa, 0.07)}`,
        transform:       featured ? "scale(1.03)" : "none",
        zIndex:          featured ? 1 : 0,
        transition:      "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: featured ? "scale(1.04)" : "translateY(-3px)",
          boxShadow: featured
            ? `0 28px 68px -16px ${alpha(brand.cocoa, 0.55)}`
            : `0 12px 36px -8px ${alpha(brand.cocoa, 0.12)}`,
        },
      }}
    >
      {/* Лейбл */}
      <Typography
        sx={{
          fontFamily:    "var(--font-body)",
          fontWeight:    600,
          fontSize:      "10px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color:         featured ? theme.palette.primary.light : theme.palette.primary.main,
          mb:            "16px",
        }}
      >
        {label}
      </Typography>

      {/* Цена */}
      <Box sx={{ display: "flex", alignItems: "baseline", gap: "4px", mb: "4px" }}>
        <Typography
          sx={{
            fontFamily:    "var(--font-display)",
            fontWeight:    400,
            fontSize:      "clamp(36px, 4vw, 52px)",
            lineHeight:    1,
            letterSpacing: "-0.02em",
            color:         featured ? brand.ivory : "text.primary",
          }}
        >
          {price}
        </Typography>
        <Typography
          sx={{
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            fontSize:   "15px",
            color:      featured ? alpha(brand.ivory, 0.6) : "text.secondary",
            mb:         "2px",
          }}
        >
          {per}
        </Typography>
      </Box>

      {/* Примечание */}
      {note && (
        <Typography
          sx={{
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            fontSize:   "12px",
            lineHeight: 1.6,
            color:      featured ? alpha(brand.ivory, 0.55) : "text.disabled",
            mb:         "24px",
            mt:         "8px",
          }}
        >
          {note}
        </Typography>
      )}

      {/* Разделитель */}
      <Box
        sx={{
          height:          "1px",
          backgroundColor: featured ? alpha(brand.ivory, 0.12) : alpha(brand.line, 0.7),
          my:              note ? 0 : "24px",
          mb:              "20px",
        }}
      />

      {/* Список фич */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, mb: "28px" }}>
        {features.map((f) => (
          <Feature key={f} text={f} featured={featured} />
        ))}
      </Box>

      {/* Кнопка */}
      <Button
        variant={featured ? "contained" : "outlined"}
        fullWidth
        sx={{
          fontFamily:      "var(--font-body)",
          fontWeight:      500,
          fontSize:        "13px",
          letterSpacing:   "0.04em",
          borderRadius:    "100px",
          py:              "12px",
          textTransform:   "none",
          ...(featured ? {
            backgroundColor: theme.palette.primary.main,
            color:           brand.ivory,
            boxShadow:       "none",
            "&:hover": { backgroundColor: brand.terracottaDeep, boxShadow: "none" },
          } : {
            borderColor: alpha(brand.line, 1),
            color:       "text.secondary",
            "&:hover": { borderColor: theme.palette.primary.main, color: theme.palette.primary.main, backgroundColor: "transparent" },
          }),
        }}
      >
        {btnLabel}
      </Button>
    </Box>
  );
}

// ─── PricingPlans ─────────────────────────────────────────────────────────────
export function PricingPlans() {
  const t = useTranslations("pricing");

  const plans = [
    {
      label:    t("monthLabel"),
      price:    t("monthPrice"),
      per:      t("monthPer"),
      features: t("monthFeatures").split("|"),
      btnLabel: t("selectBtn"),
    },
    {
      label:    t("yearLabel"),
      price:    t("yearPrice"),
      per:      t("yearPer"),
      note:     t("yearNote"),
      features: t("yearFeatures").split("|"),
      featured: true,
      btnLabel: t("selectBtnFeat"),
    },
    {
      label:    t("halfLabel"),
      price:    t("halfPrice"),
      per:      t("halfPer"),
      note:     t("halfNote"),
      features: t("halfFeatures").split("|"),
      btnLabel: t("selectBtn"),
    },
  ];

  return (
    <Box
      component="section"
      sx={{
        backgroundColor: "background.default",
        px:              { xs: 2, sm: 3, md: 4 },
        pt:              { xs: 6, md: 8 },
        pb:              { xs: 8, md: 12 },
      }}
    >
      <Box sx={{ maxWidth: "1000px", mx: "auto" }}>
        {/* Шапка секции */}
        <Box sx={{ textAlign: "center", mb: { xs: 5, md: 7 } }}>
          <Typography
            sx={{
              fontFamily:    "var(--font-body)",
              fontWeight:    500,
              fontSize:      "11px",
              letterSpacing: "0.20em",
              textTransform: "uppercase",
              color:         "text.disabled",
              mb:            "16px",
            }}
          >
            {t("eyebrow")}
          </Typography>
          <Typography
            component="h2"
            sx={{
              fontFamily:    "var(--font-display)",
              fontWeight:    400,
              fontSize:      "clamp(36px, 4.5vw, 60px)",
              lineHeight:    1.1,
              letterSpacing: "-0.02em",
              color:         "text.primary",
              mb:            "16px",
            }}
          >
            {t("heading")}{" "}
            <Box component="em" sx={{ fontStyle: "italic", color: "primary.main" }}>
              {t("headingItalic")}
            </Box>
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize:   "clamp(14px, 1.2vw, 16px)",
              lineHeight: 1.7,
              color:      "text.secondary",
              maxWidth:   "480px",
              mx:         "auto",
            }}
          >
            {t("subheading")}
          </Typography>
        </Box>

        {/* Сетка тарифов */}
        <Box
          sx={{
            display:             "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
            gap:                 { xs: "16px", md: "0" },
            alignItems:          "stretch",
          }}
        >
          {plans.map((plan) => (
            <PlanCard key={plan.label} {...plan} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
