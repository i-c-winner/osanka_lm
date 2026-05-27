"use client";

import Image from "next/image";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { alpha, useTheme } from "@mui/material/styles";
import { useTranslations } from "next-intl";
import { brand } from "@/shared/theme";
import { HelloMarquee } from "./HelloMarquee";
import helloPng from "@/shared/images/hello.png";

// ─── FloatingBadge ────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  sx?: object;
}

function FloatingBadge({ children, sx }: BadgeProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        position:           "absolute",
        backgroundColor:    alpha(theme.palette.background.paper, 0.92),
        backdropFilter:     "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius:       "100px",
        border:             `1px solid ${alpha(brand.line, 0.7)}`,
        boxShadow:          `0 8px 24px -8px ${alpha(theme.palette.text.primary, 0.14)}`,
        px: "14px", py: "10px",
        display: "flex", alignItems: "center", gap: "10px",
        whiteSpace: "nowrap",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

// ─── Stat ─────────────────────────────────────────────────────────────────────
interface StatProps { value: string; label: string }

function Stat({ value, label }: StatProps) {
  return (
    <Box>
      <Typography variant="h3" sx={{ fontStyle: "italic", lineHeight: 1, letterSpacing: "-0.02em" }}>
        {value}
      </Typography>
      <Typography
        sx={{
          fontFamily:    "var(--font-body)",
          fontWeight:    500,
          fontSize:      "10px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color:         "text.disabled",
          mt:            "6px",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

// ─── HelloSection ─────────────────────────────────────────────────────────────
export function HelloSection() {
  const t     = useTranslations("hello");
  const theme = useTheme();

  return (
    <>
      <Box
        component="section"
        sx={{
          position:        "relative",
          backgroundColor: "background.default",
          overflow:        "hidden",
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 8, md: 10 },
          pb: { xs: 8, md: 10 },
        }}
      >
        {/* Декоративный круг */}
        <Box
          aria-hidden
          sx={{
            position:      "absolute",
            top: "-160px", right: "-140px",
            width:         { xs: "320px", md: "480px" },
            height:        { xs: "320px", md: "480px" },
            borderRadius:  "50%",
            background:    `radial-gradient(circle at 38% 38%, ${alpha(brand.blush, 0.55)}, ${alpha(theme.palette.primary.main, 0.15)} 55%, transparent 72%)`,
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position:            "relative",
            zIndex:              1,
            maxWidth:            "1200px",
            mx:                  "auto",
            display:             "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            gap:                 { xs: "60px", lg: "48px" },
            alignItems:          "center",
          }}
        >
          {/* ── Левая колонка ─────────────────────────────────────────── */}
          <Box sx={{ display: "flex", flexDirection: "column" }}>

            {/* Eyebrow */}
            <Typography
              sx={{
                fontFamily:    "var(--font-body)",
                fontWeight:    500,
                fontSize:      "11px",
                letterSpacing: "0.20em",
                textTransform: "uppercase",
                color:         "text.disabled",
                mb:            "28px",
              }}
            >
              {t("eyebrow")}
            </Typography>

            {/* H1 */}
            <Box component="h1" sx={{ m: 0, mb: "24px" }}>
              {(["titleLine1", "titleLine2", "titleLine3"] as const).map((key) => (
                <Typography
                  key={key}
                  component="span"
                  sx={{
                    display:       "block",
                    fontFamily:    "var(--font-display)",
                    fontStyle:     key === "titleLine2" ? "italic" : "normal",
                    fontWeight:    400,
                    fontSize:      "clamp(52px, 6.5vw, 96px)",
                    lineHeight:    key === "titleLine2" ? 1.0 : 1.05,
                    color:         key === "titleLine2" ? "primary.main" : "text.primary",
                    letterSpacing: "-0.02em",
                    mb:            key === "titleLine2" ? "4px" : 0,
                  }}
                >
                  {t(key)}
                </Typography>
              ))}

              {/* Последняя строка с подчёркиванием */}
              <Box sx={{ position: "relative", display: "inline-block" }}>
                <Typography
                  component="span"
                  sx={{
                    display:       "block",
                    fontFamily:    "var(--font-display)",
                    fontWeight:    400,
                    fontSize:      "clamp(52px, 6.5vw, 96px)",
                    lineHeight:    1.05,
                    color:         "text.primary",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {t("titleLine4")}
                </Typography>
                <Box
                  sx={{
                    position:        "absolute",
                    bottom:          "6px",
                    left:            0,
                    width:           "100%",
                    height:          "3px",
                    borderRadius:    "2px",
                    backgroundColor: "primary.main",
                    opacity:         0.75,
                  }}
                />
              </Box>
            </Box>

            {/* Описание */}
            <Typography
              sx={{
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize:   "clamp(14px, 1.3vw, 16px)",
                lineHeight: 1.75,
                color:      "text.secondary",
                maxWidth:   "420px",
                mb:         "36px",
              }}
            >
              {t("description")}
            </Typography>

            {/* CTA */}
            <Box sx={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", mb: "56px" }}>
              <Button
                variant="contained"
                color="primary"
                sx={{
                  fontFamily:    "var(--font-body)",
                  fontWeight:    600,
                  fontSize:      "11px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  borderRadius:  "100px",
                  px:            "28px",
                  py:            "14px",
                  boxShadow:     `0 8px 24px -8px ${alpha(theme.palette.primary.main, 0.55)}`,
                  "&:hover": {
                    boxShadow: `0 10px 28px -8px ${alpha(theme.palette.primary.main, 0.65)}`,
                    transform: "translateY(-1px)",
                  },
                  "&:active": { transform: "translateY(0)" },
                }}
              >
                {t("ctaPrimary")}&nbsp;&nbsp;→
              </Button>

              <Button
                variant="text"
                startIcon={
                  <Box
                    sx={{
                      width:           "28px",
                      height:          "28px",
                      borderRadius:    "50%",
                      backgroundColor: "text.primary",
                      display:         "flex",
                      alignItems:      "center",
                      justifyContent:  "center",
                      flexShrink:      0,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        width: 0, height: 0,
                        borderTop:    "5px solid transparent",
                        borderBottom: "5px solid transparent",
                        borderLeft:   `8px solid ${theme.palette.background.paper}`,
                        ml: "2px", display: "block",
                      }}
                    />
                  </Box>
                }
                sx={{
                  fontFamily:    "var(--font-body)",
                  fontWeight:    400,
                  fontSize:      "14px",
                  color:         "text.secondary",
                  textTransform: "none",
                  letterSpacing: 0,
                  px:            0,
                  gap:           "10px",
                  "&:hover": { backgroundColor: "transparent", color: "text.primary" },
                }}
              >
                {t("ctaSecondary")}
              </Button>
            </Box>

            {/* Статистика */}
            <Box
              sx={{
                display: "flex",
                gap:     { xs: "32px", sm: "48px" },
                pt:      "28px",
                borderTop: `1px solid ${alpha(brand.line, 0.8)}`,
              }}
            >
              <Stat value={t("stat1Value")} label={t("stat1Label")} />
              <Stat value={t("stat2Value")} label={t("stat2Label")} />
              <Stat value={t("stat3Value")} label={t("stat3Label")} />
            </Box>
          </Box>

          {/* ── Правая колонка — арка с фото ──────────────────────────── */}
          <Box
            sx={{
              display:        { xs: "none", lg: "flex" },
              justifyContent: "center",
              alignItems:     "center",
              position:       "relative",
            }}
          >
            <Box
              sx={{
                position:     "relative",
                width:        "100%",
                maxWidth:     "380px",
                aspectRatio:  "4/5",
                overflow:     "visible",
                boxShadow:    `0 32px 64px -24px ${alpha(theme.palette.primary.main, 0.35)}`,
                borderRadius: "200px 200px 28px 28px",
              }}
            >
              {/* Клип-контейнер */}
              <Box
                sx={{
                  position:     "absolute",
                  inset:        0,
                  borderRadius: "inherit",
                  overflow:     "hidden",
                  background:   `linear-gradient(160deg, ${brand.blush} 0%, ${theme.palette.primary.main} 60%, ${brand.terracottaDeep} 100%)`,
                }}
              >
                <Image
                  src={helloPng}
                  alt={t("imgAlt")}
                  fill
                  style={{ objectFit: "cover", objectPosition: "center top" }}
                  sizes="(max-width: 1200px) 50vw, 380px"
                  priority
                />
              </Box>

              {/* Бейдж — «Сегодня в эфире» */}
              <FloatingBadge sx={{ top: "-18px", right: "-24px" }}>
                <Box sx={{ display: "flex", "& > *:not(:first-child)": { ml: "-8px" } }}>
                  {[theme.palette.primary.main, brand.rose, brand.blush].map((c, i) => (
                    <Box
                      key={i}
                      sx={{
                        width:           "24px",
                        height:          "24px",
                        borderRadius:    "50%",
                        backgroundColor: c,
                        border:          `2px solid ${theme.palette.background.paper}`,
                        flexShrink:      0,
                      }}
                    />
                  ))}
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "12px", color: "text.primary", lineHeight: 1.2 }}>
                    {t("badgeLiveTitle")}
                  </Typography>
                  <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "11px", color: "text.disabled", lineHeight: 1.3 }}>
                    {t("badgeLiveDesc")}
                  </Typography>
                </Box>
              </FloatingBadge>

              {/* Бейдж — «Бережно к суставам» */}
              <FloatingBadge sx={{ bottom: "32px", left: "-32px" }}>
                <Box
                  sx={{
                    width:           "32px",
                    height:          "32px",
                    borderRadius:    "50%",
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    display:         "flex",
                    alignItems:      "center",
                    justifyContent:  "center",
                    flexShrink:      0,
                  }}
                >
                  <Box component="svg" viewBox="0 0 20 20" sx={{ width: "16px", height: "16px", fill: "primary.main" }}>
                    <path d="M10 17s-7-4.35-7-9a4 4 0 0 1 7-2.646A4 4 0 0 1 17 8c0 4.65-7 9-7 9z" />
                  </Box>
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "12px", color: "text.primary", lineHeight: 1.2 }}>
                    {t("badgeJointTitle")}
                  </Typography>
                  <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "11px", color: "text.disabled", lineHeight: 1.3 }}>
                    {t("badgeJointDesc")}
                  </Typography>
                </Box>
              </FloatingBadge>
            </Box>
          </Box>
        </Box>
      </Box>

      <HelloMarquee />
    </>
  );
}
