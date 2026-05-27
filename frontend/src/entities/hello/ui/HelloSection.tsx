"use client";

import Image from "next/image";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { alpha, keyframes } from "@mui/material/styles";
import { brand } from "@/shared/theme";
import helloPng from "@/shared/images/hello.png";

// ─── Floating badge ───────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  sx?: object;
}

function FloatingBadge({ children, sx }: BadgeProps) {
  return (
    <Box
      sx={{
        position: "absolute",
        backgroundColor: alpha(brand.ivory, 0.92),
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: "100px",
        border: `1px solid ${alpha(brand.line, 0.7)}`,
        boxShadow: `0 8px 24px -8px ${alpha(brand.cocoa, 0.14)}`,
        px: "14px",
        py: "10px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        whiteSpace: "nowrap",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

// ─── Stat item ────────────────────────────────────────────────────────────────
interface StatProps {
  value: string;
  label: string;
}

function Stat({ value, label }: StatProps) {
  return (
    <Box>
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontWeight: 400,
          fontStyle: "italic",
          fontSize: "clamp(28px, 3vw, 40px)",
          lineHeight: 1,
          color: brand.cocoa,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </Typography>
      <Typography
        sx={{
          fontFamily: "var(--font-body)",
          fontWeight: 500,
          fontSize: "10px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: brand.mute,
          mt: "6px",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

// ─── Marquee ticker ───────────────────────────────────────────────────────────

const tickerScroll = keyframes`
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const TICKER_BASE: { label: string; italic?: boolean }[] = [
  { label: "Подвижность" },
  { label: "Тишина",        italic: true },
  { label: "Сила" },
  { label: "Осознанность" },
  { label: "Комфорт" },
  { label: "Баланс",        italic: true },
  { label: "Дыхание" },
  { label: "Опора" },
];

// Один «сет» = 3 повтора базы → ~3×1120 px = ~3360 px, гарантированно шире любого вьюпорта.
// Дублируем сет дважды; при translateX(-50%) = -один_сет трек зацикливается бесшовно.
const TICKER_SET  = [...TICKER_BASE, ...TICKER_BASE, ...TICKER_BASE];
const TICKER_ITEMS = [...TICKER_SET, ...TICKER_SET];

function MarqueeTicker() {
  return (
    <Box
      sx={{
        overflow:        "hidden",
        backgroundColor: brand.cream2,
        borderTop:       `1px solid ${alpha(brand.line, 0.9)}`,
        borderBottom:    `1px solid ${alpha(brand.line, 0.9)}`,
        py:              "14px",
        userSelect:      "none",
      }}
    >
      <Box
        sx={{
          display:    "flex",
          alignItems: "center",
          width:      "max-content",
          flexShrink: 0,
          flexWrap:   "nowrap",
          animation:  `${tickerScroll} 32s linear infinite`,
          willChange: "transform",
        }}
      >
        {TICKER_ITEMS.map(({ label, italic }, i) => (
          <Box
            key={i}
            sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}
          >
            <Box
              component="span"
              sx={{
                display:         "inline-block",
                width:           "5px",
                height:          "5px",
                borderRadius:    "50%",
                backgroundColor: brand.terracotta,
                mx:              "20px",
                flexShrink:      0,
                opacity:         0.75,
              }}
            />
            <Typography
              component="span"
              sx={{
                fontFamily:    italic ? "var(--font-display)" : "var(--font-body)",
                fontStyle:     italic ? "italic" : "normal",
                fontWeight:    400,
                fontSize:      italic ? "15px" : "13px",
                letterSpacing: italic ? "-0.01em" : "0.04em",
                color:         brand.cocoaSoft,
                whiteSpace:    "nowrap",
                flexShrink:    0,
              }}
            >
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ─── HelloSection ─────────────────────────────────────────────────────────────
export function HelloSection() {
  return (
    <>
    <Box
      component="section"
      sx={{
        position: "relative",
        backgroundColor: "background.default",
        overflow: "hidden",
        px: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 8, md: 10 },
        pb: { xs: 8, md: 10 },
      }}
    >
      {/* Декоративный круг — правый верхний угол */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "-160px",
          right: "-140px",
          width: { xs: "320px", md: "480px" },
          height: { xs: "320px", md: "480px" },
          borderRadius: "50%",
          background: `radial-gradient(circle at 38% 38%, ${alpha(brand.blush, 0.55)}, ${alpha(brand.terracotta, 0.15)} 55%, transparent 72%)`,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1200px",
          mx: "auto",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: { xs: "60px", lg: "48px" },
          alignItems: "center",
        }}
      >
        {/* ── Левая колонка ──────────────────────────────────────────────── */}
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {/* Eyebrow */}
          <Typography
            sx={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "11px",
              letterSpacing: "0.20em",
              textTransform: "uppercase",
              color: brand.mute,
              mb: "28px",
            }}
          >
            Метод Gym Balance · с 2021
          </Typography>

          {/* Заголовок h1 */}
          <Box component="h1" sx={{ m: 0, mb: "24px" }}>
            <Typography
              component="span"
              sx={{
                display: "block",
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: "clamp(52px, 6.5vw, 96px)",
                lineHeight: 1.0,
                color: brand.cocoa,
                letterSpacing: "-0.02em",
              }}
            >
              Мягкая
            </Typography>

            {/* Italic акцент */}
            <Typography
              component="span"
              sx={{
                display: "block",
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(52px, 6.5vw, 96px)",
                lineHeight: 1.0,
                color: brand.terracotta,
                letterSpacing: "-0.02em",
                mb: "4px",
              }}
            >
              практика
            </Typography>

            <Typography
              component="span"
              sx={{
                display: "block",
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: "clamp(52px, 6.5vw, 96px)",
                lineHeight: 1.05,
                color: brand.cocoa,
                letterSpacing: "-0.02em",
              }}
            >
              с устойчивым
            </Typography>

            {/* Последняя строка + подчёркивание */}
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Typography
                component="span"
                sx={{
                  display: "block",
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontSize: "clamp(52px, 6.5vw, 96px)",
                  lineHeight: 1.05,
                  color: brand.cocoa,
                  letterSpacing: "-0.02em",
                }}
              >
                прогрессом
              </Typography>
              {/* Терракотовая линия под словом */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: "6px",
                  left: 0,
                  width: "100%",
                  height: "3px",
                  borderRadius: "2px",
                  backgroundColor: brand.terracotta,
                  opacity: 0.75,
                }}
              />
            </Box>
          </Box>

          {/* Описание */}
          <Typography
            sx={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: "clamp(14px, 1.3vw, 16px)",
              lineHeight: 1.75,
              color: brand.cocoaSoft,
              maxWidth: "420px",
              mb: "36px",
            }}
          >
            Спокойный ритм, точная техника и понятная нагрузка. Тренировки дома,
            которые поддерживают тело — последовательно и без перегруза.
          </Typography>

          {/* CTA-кнопки */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
              mb: "56px",
            }}
          >
            <Button
              variant="text"
              startIcon={
                <Box
                  sx={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: brand.cocoa,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 0,
                      height: 0,
                      borderTop: "5px solid transparent",
                      borderBottom: "5px solid transparent",
                      borderLeft: `8px solid ${brand.ivory}`,
                      ml: "2px",
                      display: "block",
                    }}
                  />
                </Box>
              }
              sx={{
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: "14px",
                color: brand.cocoaSoft,
                textTransform: "none",
                letterSpacing: 0,
                px: 0,
                gap: "10px",
                "&:hover": {
                  backgroundColor: "transparent",
                  color: brand.cocoa,
                },
              }}
            >
              Посмотреть пробный урок
            </Button>
          </Box>

          {/* Статистика */}
          <Box
            sx={{
              display: "flex",
              gap: { xs: "32px", sm: "48px" },
              pt: "28px",
              borderTop: `1px solid ${alpha(brand.line, 0.8)}`,
            }}
          >
            <Stat value="12 000+" label="Учениц в практике" />
            <Stat value="180+" label="Уроков на платформе" />
            <Stat value="4.9/5" label="Средняя оценка" />
          </Box>
        </Box>

        {/* ── Правая колонка — карточка-арка ────────────────────────────── */}
        <Box
          sx={{
            display: { xs: "none", lg: "flex" },
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Арка — внешний контейнер для бейджей (overflow: visible) */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              maxWidth: "380px",
              aspectRatio: "4/5",
              overflow: "visible",
              boxShadow: `0 32px 64px -24px ${alpha(brand.terracotta, 0.35)}`,
              borderRadius: "200px 200px 28px 28px",
            }}
          >
            {/* Внутренний контейнер — клипает изображение по форме арки */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                borderRadius: "inherit",
                overflow: "hidden",
                background: `linear-gradient(160deg, ${brand.blush} 0%, ${brand.terracotta} 60%, ${brand.terracottaDeep} 100%)`,
              }}
            >
              <Image
                src={helloPng}
                alt="Практика Gym Balance"
                fill
                style={{ objectFit: "cover", objectPosition: "center top" }}
                sizes="(max-width: 1200px) 50vw, 380px"
                priority
              />
            </Box>

            {/* Бейдж сверху — «Сегодня в эфире» */}
            <FloatingBadge sx={{ top: "-18px", right: "-24px" }}>
              {/* Три цветных круга (аватары) */}
              <Box
                sx={{
                  display: "flex",
                  "& > *:not(:first-child)": { ml: "-8px" },
                }}
              >
                {[brand.terracotta, brand.rose, brand.blush].map((c, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: c,
                      border: `2px solid ${brand.ivory}`,
                      flexShrink: 0,
                    }}
                  />
                ))}
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    fontSize: "12px",
                    color: brand.cocoa,
                    lineHeight: 1.2,
                  }}
                >
                  Сегодня в эфире
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 400,
                    fontSize: "11px",
                    color: brand.mute,
                    lineHeight: 1.3,
                  }}
                >
                  Раскрытие спины · 25 мин
                </Typography>
              </Box>
            </FloatingBadge>

            {/* Бейдж снизу — «Бережно к суставам» */}
            <FloatingBadge sx={{ bottom: "32px", left: "-32px" }}>
              {/* Иконка сердца */}
              <Box
                sx={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: alpha(brand.terracotta, 0.12),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Box
                  component="svg"
                  viewBox="0 0 20 20"
                  sx={{ width: "16px", height: "16px", fill: brand.terracotta }}
                >
                  <path d="M10 17s-7-4.35-7-9a4 4 0 0 1 7-2.646A4 4 0 0 1 17 8c0 4.65-7 9-7 9z" />
                </Box>
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    fontSize: "12px",
                    color: brand.cocoa,
                    lineHeight: 1.2,
                  }}
                >
                  Бережно к суставам
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 400,
                    fontSize: "11px",
                    color: brand.mute,
                    lineHeight: 1.3,
                  }}
                >
                  без прыжков и перегруза
                </Typography>
              </Box>
            </FloatingBadge>
          </Box>
        </Box>
      </Box>

    </Box>
    <MarqueeTicker />
    </>
  );
}
