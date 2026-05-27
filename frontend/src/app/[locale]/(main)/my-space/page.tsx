"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { brand } from "@/shared/theme";

// ─── Секция-заголовок страницы ────────────────────────────────────────────────

function PageHero() {
  return (
    <Box
      sx={{
        background:   `linear-gradient(160deg, ${brand.cream} 0%, ${brand.cream2} 100%)`,
        borderBottom: `1px solid ${alpha(brand.line, 0.6)}`,
        py:           { xs: "48px", md: "64px" },
        px:           { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
        {/* Eyebrow */}
        <Typography
          className="eyebrow"
          sx={{ mb: "16px", display: "block" }}
        >
          Личный кабинет
        </Typography>

        {/* Заголовок */}
        <Typography
          variant="h2"
          sx={{
            fontSize:  { xs: "36px", md: "52px" },
            lineHeight: 1.0,
          }}
        >
          Моё{" "}
          <Box component="em" sx={{ fontStyle: "italic", color: brand.terracottaDeep }}>
            пространство
          </Box>
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mt:       "16px",
            color:    brand.cocoaSoft,
            maxWidth: "480px",
            fontSize: "15px",
          }}
        >
          Расписание, абонемент и прогресс — всё в одном месте.
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Карточка-заглушка ────────────────────────────────────────────────────────

interface PlaceholderCardProps {
  title: string;
  subtitle: string;
  accent?: boolean;
}

function PlaceholderCard({ title, subtitle, accent = false }: PlaceholderCardProps) {
  return (
    <Box
      sx={{
        background:   accent ? `linear-gradient(135deg, ${brand.terracotta} 0%, ${brand.terracottaDeep} 100%)` : brand.ivory,
        border:       accent ? "none" : `1px solid ${alpha(brand.line, 0.7)}`,
        borderRadius: "24px",
        p:            "28px",
        display:      "flex",
        flexDirection:"column",
        gap:          "8px",
        boxShadow:    accent
          ? `0 10px 30px -10px ${alpha(brand.terracotta, 0.45)}`
          : `0 2px 12px -4px ${alpha(brand.cocoa, 0.07)}`,
      }}
    >
      <Typography
        sx={{
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize:   "12px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color:      accent ? alpha("#fff", 0.7) : brand.terracottaDeep,
          mb:         "4px",
        }}
      >
        {subtitle}
      </Typography>
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontWeight: 400,
          fontSize:   "22px",
          lineHeight: 1.1,
          color:      accent ? "#fff" : brand.cocoa,
        }}
      >
        {title}
      </Typography>
    </Box>
  );
}

// ─── Основной контент ─────────────────────────────────────────────────────────

function MySpaceContent() {
  return (
    <Box
      sx={{
        maxWidth: "1200px",
        mx:       "auto",
        px:       { xs: 2, sm: 3, md: 4 },
        py:       { xs: "40px", md: "56px" },
      }}
    >
      {/* Верхняя сетка: абонемент + ближайшее занятие */}
      <Box
        sx={{
          display:             "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "2fr 1fr 1fr" },
          gap:                 "16px",
          mb:                  "32px",
        }}
      >
        <PlaceholderCard
          accent
          subtitle="Мой абонемент"
          title="Годовая подписка · активна"
        />
        <PlaceholderCard
          subtitle="Ближайшее занятие"
          title="Сегодня · 18:00"
        />
        <PlaceholderCard
          subtitle="Занятий пройдено"
          title="24 из 48"
        />
      </Box>

      {/* Нижняя сетка: мои записи + прогресс */}
      <Box
        sx={{
          display:             "grid",
          gridTemplateColumns: { xs: "1fr", md: "3fr 2fr" },
          gap:                 "16px",
        }}
      >
        {/* Мои записи */}
        <Box
          sx={{
            background:   brand.ivory,
            border:       `1px solid ${alpha(brand.line, 0.7)}`,
            borderRadius: "24px",
            p:            "28px",
            boxShadow:    `0 2px 12px -4px ${alpha(brand.cocoa, 0.07)}`,
          }}
        >
          <Typography
            sx={{
              fontFamily:    "var(--font-body)",
              fontWeight:    600,
              fontSize:      "12px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color:         brand.terracottaDeep,
              mb:            "20px",
            }}
          >
            Мои записи
          </Typography>

          {/* Список заглушек */}
          {[
            { day: "Сегодня",  time: "18:00", name: "Раскрытие спины",     status: "Ожидает"  },
            { day: "Пятница",  time: "10:00", name: "Подвижность суставов", status: "Ожидает"  },
            { day: "Суббота",  time: "09:30", name: "Дыхательная практика", status: "Ожидает"  },
          ].map((item, i) => (
            <Box
              key={i}
              sx={{
                display:      "flex",
                alignItems:   "center",
                gap:          "16px",
                py:           "14px",
                borderBottom: i < 2 ? `1px solid ${alpha(brand.line, 0.5)}` : "none",
              }}
            >
              {/* Дата */}
              <Box
                sx={{
                  minWidth:     "56px",
                  textAlign:    "center",
                  background:   brand.cream2,
                  borderRadius: "12px",
                  py:           "6px",
                  px:           "8px",
                }}
              >
                <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 600, color: brand.cocoaSoft, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {item.day}
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 700, color: brand.cocoa }}>
                  {item.time}
                </Typography>
              </Box>

              {/* Название */}
              <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 500, color: brand.cocoa, flex: 1 }}>
                {item.name}
              </Typography>

              {/* Статус */}
              <Box
                sx={{
                  background:   alpha(brand.sage, 0.15),
                  borderRadius: "100px",
                  px:           "10px",
                  py:           "4px",
                }}
              >
                <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 600, color: brand.sage, letterSpacing: "0.08em" }}>
                  {item.status}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Прогресс */}
        <Box
          sx={{
            background:   brand.ivory,
            border:       `1px solid ${alpha(brand.line, 0.7)}`,
            borderRadius: "24px",
            p:            "28px",
            boxShadow:    `0 2px 12px -4px ${alpha(brand.cocoa, 0.07)}`,
          }}
        >
          <Typography
            sx={{
              fontFamily:    "var(--font-body)",
              fontWeight:    600,
              fontSize:      "12px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color:         brand.terracottaDeep,
              mb:            "20px",
            }}
          >
            Прогресс
          </Typography>

          {[
            { label: "Подвижность",   value: 72 },
            { label: "Дыхание",       value: 58 },
            { label: "Баланс",        value: 45 },
          ].map((item, i) => (
            <Box key={i} sx={{ mb: i < 2 ? "20px" : 0 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: "6px" }}>
                <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 500, color: brand.cocoa }}>
                  {item.label}
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: brand.terracottaDeep }}>
                  {item.value}%
                </Typography>
              </Box>
              <Box sx={{ height: "6px", borderRadius: "100px", background: alpha(brand.line, 0.8), overflow: "hidden" }}>
                <Box
                  sx={{
                    height:       "100%",
                    width:        `${item.value}%`,
                    borderRadius: "100px",
                    background:   `linear-gradient(90deg, ${brand.terracotta}, ${brand.blush})`,
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

// ─── Страница ─────────────────────────────────────────────────────────────────

export default function MySpacePage() {
  return (
    <>
      <PageHero />
      <MySpaceContent />
    </>
  );
}
