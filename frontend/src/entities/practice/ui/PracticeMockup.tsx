"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { useTranslations } from "next-intl";
import { brand } from "@/shared/theme";

// ─── Мини бар-чарт пульса ─────────────────────────────────────────────────────
const BARS = [3, 5, 4, 6, 5, 7, 6, 8, 7, 6, 8, 9];

function PulseChart() {
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "28px" }}>
      {BARS.map((h, i) => (
        <Box
          key={i}
          sx={{
            width:           "4px",
            height:          `${(h / 9) * 100}%`,
            borderRadius:    "2px",
            backgroundColor: i >= BARS.length - 3
              ? theme.palette.primary.main
              : alpha(theme.palette.primary.main, 0.35),
          }}
        />
      ))}
    </Box>
  );
}

// ─── PracticeMockup ───────────────────────────────────────────────────────────
export function PracticeMockup() {
  const t     = useTranslations("practice");
  const theme = useTheme();

  return (
    <Box
      sx={{
        position:     "relative",
        width:        "100%",
        maxWidth:     "360px",
        mx:           "auto",
      }}
    >
      {/* Телефон-карточка */}
      <Box
        sx={{
          borderRadius: "32px",
          overflow:     "hidden",
          aspectRatio:  "9/16",
          background:   `linear-gradient(160deg, ${brand.blush} 0%, ${theme.palette.primary.main} 55%, ${brand.terracottaDeep} 100%)`,
          position:     "relative",
          boxShadow:    `0 32px 64px -20px ${alpha(theme.palette.primary.main, 0.40)}`,
        }}
      >
        {/* Верхние бейджи */}
        <Box sx={{ position: "absolute", top: "20px", left: "20px", display: "flex", gap: "8px", zIndex: 2 }}>
          {/* В эфире */}
          <Box
            sx={{
              display:         "flex",
              alignItems:      "center",
              gap:             "6px",
              backgroundColor: theme.palette.primary.main,
              borderRadius:    "100px",
              px:              "12px",
              py:              "6px",
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: brand.ivory }} />
            <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: brand.ivory }}>
              {t("badgeLive")}
            </Typography>
          </Box>
          {/* Уровень */}
          <Box
            sx={{
              backgroundColor: alpha(brand.ivory, 0.90),
              backdropFilter:  "blur(8px)",
              borderRadius:    "100px",
              px:              "12px",
              py:              "6px",
            }}
          >
            <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: brand.cocoa }}>
              {t("badgeLevel")}
            </Typography>
          </Box>
        </Box>

        {/* Плей-кнопка по центру */}
        <Box
          sx={{
            position:        "absolute",
            top:             "50%",
            left:            "50%",
            transform:       "translate(-50%, -60%)",
            width:           "56px",
            height:          "56px",
            borderRadius:    "50%",
            backgroundColor: alpha(brand.ivory, 0.92),
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            boxShadow:       `0 8px 24px -8px ${alpha(brand.cocoa, 0.25)}`,
            zIndex:          2,
          }}
        >
          <Box
            component="span"
            sx={{
              width: 0, height: 0,
              borderTop:    "9px solid transparent",
              borderBottom: "9px solid transparent",
              borderLeft:   `14px solid ${theme.palette.primary.main}`,
              ml:           "3px",
              display:      "block",
            }}
          />
        </Box>

        {/* Нижняя тёмная панель */}
        <Box
          sx={{
            position:        "absolute",
            bottom:          0,
            left:            0,
            right:           0,
            background:      `linear-gradient(to top, ${alpha(brand.cocoa, 0.92)} 0%, transparent 100%)`,
            px:              "20px",
            pt:              "48px",
            pb:              "20px",
            zIndex:          2,
          }}
        >
          <Typography
            sx={{
              fontFamily:  "var(--font-display)",
              fontWeight:  400,
              fontSize:    "22px",
              lineHeight:  1.2,
              color:       brand.ivory,
              mb:          "14px",
            }}
          >
            {t("mockupTitle")}
          </Typography>

          {/* Прогресс-бар */}
          <Box sx={{ position: "relative", height: "3px", backgroundColor: alpha(brand.ivory, 0.25), borderRadius: "2px", mb: "10px" }}>
            <Box sx={{ position: "absolute", left: 0, top: 0, height: "100%", width: "42%", backgroundColor: brand.ivory, borderRadius: "2px" }} />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "11px", color: alpha(brand.ivory, 0.65) }}>
              {t("mockupTime")}
            </Typography>
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "11px", color: alpha(brand.ivory, 0.65) }}>
              {t("mockupStep")}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Floating пульс-карточка */}
      <Box
        sx={{
          position:        "absolute",
          bottom:          "80px",
          right:           "-24px",
          backgroundColor: alpha(brand.ivory, 0.95),
          backdropFilter:  "blur(12px)",
          borderRadius:    "18px",
          p:               "14px 16px",
          boxShadow:       `0 12px 32px -8px ${alpha(brand.cocoa, 0.18)}`,
          border:          `1px solid ${alpha(brand.line, 0.6)}`,
          minWidth:        "160px",
          zIndex:          3,
        }}
      >
        <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase", color: brand.mute, mb: "6px" }}>
          {t("pulseLabel")}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: "4px", mb: "8px" }}>
          <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic", fontSize: "28px", lineHeight: 1, color: brand.cocoa, letterSpacing: "-0.02em" }}>
            {t("pulseValue")}
          </Typography>
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "11px", color: brand.mute }}>
            {t("pulseUnit")}
          </Typography>
          <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "11px", color: theme.palette.primary.main, ml: "auto" }}>
            {t("pulseState")}
          </Typography>
        </Box>
        <PulseChart />
      </Box>
    </Box>
  );
}
