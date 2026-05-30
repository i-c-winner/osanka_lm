"use client";

import Box        from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button     from "@mui/material/Button";
import { alpha }  from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddIcon               from "@mui/icons-material/Add";
import { brand }        from "@/shared/theme";
import { StatsCards }   from "@/entities/stats/ui/StatsCards";
import { MonthCalendar } from "@/entities/calendar/ui/MonthCalendar";
import { TodayPanel }   from "@/entities/today/ui/TodayPanel";
import type { GetDayData } from "@/entities/calendar/model/types";

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <Box sx={{ mb: "36px" }}>
      {/* Eyebrow + заголовок */}
      <Typography className="eyebrow" sx={{ display: "block", mb: "12px" }}>
        Моё пространство
      </Typography>

      <Typography sx={{
        fontFamily: "var(--font-display)", fontWeight: 400,
        fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 1.0,
        color: brand.cocoa, mb: "20px",
      }}>
        Ваша{" "}
        <Box component="em" sx={{ fontStyle: "italic", color: brand.terracottaDeep }}>
          неделя
        </Box>
        <br />в практике
      </Typography>

      {/* Описание + кнопки */}
      <Box sx={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", gap: "24px",
        flexWrap: "wrap",
      }}>
        <Typography sx={{
          fontFamily: "var(--font-body)", fontSize: "14px", lineHeight: 1.6,
          color: brand.cocoaSoft, maxWidth: "420px",
        }}>
          Календарь занятий, текущая программа и сегодняшний урок.
          Возвращайтесь сюда каждый день — мы напомним, с чего лучше начать.
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          {/* Месяц-селектор */}
          <Box sx={{
            display: "flex", alignItems: "center", gap: "6px",
            border: `1px solid ${alpha(brand.line, 0.9)}`,
            borderRadius: "100px", px: "16px", py: "9px",
            cursor: "pointer", backgroundColor: brand.ivory,
            "&:hover": { borderColor: brand.cocoa },
            transition: "border-color 0.15s ease",
          }}>
            <KeyboardArrowDownIcon sx={{ fontSize: 16, color: brand.cocoaSoft }} />
            <Typography sx={{
              fontFamily: "var(--font-body)", fontWeight: 500,
              fontSize: "13px", color: brand.cocoa,
            }}>
              Ноябрь 2026
            </Typography>
          </Box>

          {/* Запланировать */}
          <Button variant="contained" startIcon={<AddIcon sx={{ fontSize: 16 }} />} sx={{
            backgroundColor: brand.cocoa, color: brand.ivory,
            borderRadius: "100px", fontFamily: "var(--font-body)",
            fontWeight: 600, fontSize: "13px", letterSpacing: "0.02em",
            textTransform: "none", px: "20px", py: "9px", boxShadow: "none",
            "&:hover": {
              backgroundColor: brand.cocoaSoft, boxShadow: "none",
              transform: "translateY(-1px)",
            },
          }}>
            Запланировать урок
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

// ─── CalendarView ─────────────────────────────────────────────────────────────

interface CalendarViewProps {
  getDayData: GetDayData;
}

export function CalendarView({ getDayData }: CalendarViewProps) {
  return (
    <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
      <Hero />
      <StatsCards />

      {/* Двухколоночная сетка: календарь + правая панель */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1fr 380px" },
        gap: "20px",
        alignItems: "flex-start",
      }}>
        <MonthCalendar getDayData={getDayData} />
        <TodayPanel />
      </Box>
    </Box>
  );
}
