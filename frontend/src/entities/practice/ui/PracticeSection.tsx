"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { useTranslations } from "next-intl";
import { brand } from "@/shared/theme";
import { PracticeMockup } from "./PracticeMockup";

// ─── Иконки ───────────────────────────────────────────────────────────────────
function ClockIcon() {
  return (
    <Box component="svg" viewBox="0 0 20 20" sx={{ width: "18px", height: "18px", fill: "none", stroke: "currentColor", strokeWidth: 1.5 }}>
      <circle cx="10" cy="10" r="8" />
      <path d="M10 6v4l2.5 2.5" strokeLinecap="round" />
    </Box>
  );
}

function ArrowsIcon() {
  return (
    <Box component="svg" viewBox="0 0 20 20" sx={{ width: "18px", height: "18px", fill: "none", stroke: "currentColor", strokeWidth: 1.5 }}>
      <path d="M10 3v14M10 3l-3 3M10 3l3 3M10 17l-3-3M10 17l3-3" strokeLinecap="round" strokeLinejoin="round" />
    </Box>
  );
}

// ─── FeatureCard ──────────────────────────────────────────────────────────────
interface FeatureCardProps {
  icon:   React.ReactNode;
  title:  string;
  desc:   string;
}

function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  const theme = useTheme();
  return (
    <Box>
      <Box
        sx={{
          width:           "36px",
          height:          "36px",
          borderRadius:    "50%",
          border:          `1px solid ${alpha(brand.line, 0.9)}`,
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          color:           theme.palette.primary.main,
          mb:              "14px",
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontFamily:  "var(--font-display)",
          fontStyle:   "italic",
          fontWeight:  400,
          fontSize:    "20px",
          lineHeight:  1.2,
          color:       "text.primary",
          mb:          "10px",
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontFamily: "var(--font-body)",
          fontWeight: 400,
          fontSize:   "14px",
          lineHeight: 1.7,
          color:      "text.secondary",
        }}
      >
        {desc}
      </Typography>
    </Box>
  );
}

// ─── PracticeSection ──────────────────────────────────────────────────────────
export function PracticeSection() {
  const t     = useTranslations("practice");
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        backgroundColor: "background.default",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 8, md: 12 },
      }}
    >
      <Box
        sx={{
          maxWidth:            "1200px",
          mx:                  "auto",
          display:             "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap:                 { xs: "60px", lg: "80px" },
          alignItems:          "center",
        }}
      >
        {/* ── Левая колонка ──────────────────────────────────────────── */}
        <Box>
          {/* Eyebrow */}
          <Typography
            sx={{
              fontFamily:    "var(--font-body)",
              fontWeight:    500,
              fontSize:      "11px",
              letterSpacing: "0.20em",
              textTransform: "uppercase",
              color:         "text.disabled",
              mb:            "24px",
            }}
          >
            {t("eyebrow")}
          </Typography>

          {/* Заголовок */}
          <Box component="h2" sx={{ m: 0, mb: "24px" }}>
            <Typography
              component="span"
              sx={{
                display:       "block",
                fontFamily:    "var(--font-display)",
                fontWeight:    400,
                fontSize:      "clamp(40px, 5vw, 72px)",
                lineHeight:    1.05,
                color:         "text.primary",
                letterSpacing: "-0.02em",
              }}
            >
              {t("titleNormal")} <Box
                component="em"
                sx={{ fontStyle: "italic", color: theme.palette.primary.main }}
              >
                {t("titleItalic")}
              </Box>
            </Typography>
          </Box>

          {/* Описание */}
          <Typography
            sx={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize:   "clamp(14px, 1.3vw, 16px)",
              lineHeight: 1.75,
              color:      "text.secondary",
              maxWidth:   "440px",
              mb:         "36px",
            }}
          >
            {t("description")}
          </Typography>

          {/* Разделитель */}
          <Box sx={{ height: "1px", backgroundColor: alpha(brand.line, 0.8), mb: "36px", maxWidth: "440px" }} />

          {/* Feature-карточки */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", maxWidth: "440px" }}>
            <FeatureCard
              icon={<ClockIcon />}
              title={t("feature1Title")}
              desc={t("feature1Desc")}
            />
            <FeatureCard
              icon={<ArrowsIcon />}
              title={t("feature2Title")}
              desc={t("feature2Desc")}
            />
          </Box>
        </Box>

        {/* ── Правая колонка — мокап ─────────────────────────────────── */}
        <Box
          sx={{
            display:        { xs: "none", lg: "flex" },
            justifyContent: "center",
            pr:             "40px",
          }}
        >
          <PracticeMockup />
        </Box>
      </Box>
    </Box>
  );
}
