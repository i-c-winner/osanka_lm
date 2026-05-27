"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { alpha, useTheme } from "@mui/material/styles";
import { useTranslations } from "next-intl";

export function PricingCta() {
  const t     = useTranslations("pricing");
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        backgroundColor: "background.default",
        textAlign:       "center",
        px:              { xs: 2, sm: 4, md: 6 },
        pt:              { xs: 8, md: 12 },
        pb:              { xs: 6, md: 8 },
      }}
    >
      <Box sx={{ maxWidth: "800px", mx: "auto" }}>
        {/* Большой заголовок */}
        <Typography
          component="h2"
          sx={{
            fontFamily:    "var(--font-display)",
            fontWeight:    400,
            fontSize:      "clamp(44px, 6.5vw, 96px)",
            lineHeight:    1.05,
            letterSpacing: "-0.025em",
            color:         "text.primary",
            mb:            "20px",
          }}
        >
          {t("ctaTitleNormal")}{" "}
          <Box component="em" sx={{ fontStyle: "italic", color: "primary.main" }}>
            {t("ctaTitleItalic")}
          </Box>
          <br />
          {t("ctaTitleEnd")}
        </Typography>

        {/* Подзаголовок */}
        <Typography
          sx={{
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            fontSize:   "clamp(14px, 1.2vw, 16px)",
            lineHeight: 1.6,
            color:      "text.secondary",
            mb:         "36px",
          }}
        >
          {t("ctaSubtitle")}
        </Typography>

        {/* CTA кнопка */}
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{
            fontFamily:    "var(--font-body)",
            fontWeight:    600,
            fontSize:      "12px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            borderRadius:  "100px",
            px:            "36px",
            py:            "16px",
            boxShadow:     `0 10px 32px -8px ${alpha(theme.palette.primary.main, 0.55)}`,
            transition:    "transform 0.15s ease, box-shadow 0.2s ease",
            "&:hover": {
              transform:  "translateY(-1px)",
              boxShadow:  `0 14px 36px -8px ${alpha(theme.palette.primary.main, 0.65)}`,
            },
            "&:active": { transform: "translateY(0)" },
          }}
        >
          {t("ctaButton")}&nbsp;&nbsp;→
        </Button>
      </Box>
    </Box>
  );
}
