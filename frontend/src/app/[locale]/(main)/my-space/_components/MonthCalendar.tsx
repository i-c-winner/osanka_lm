"use client";

import { useState } from "react";
import Box       from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha }  from "@mui/material/styles";
import { brand }  from "@/shared/theme";

// ─── Типы ─────────────────────────────────────────────────────────────────────

type SessionBar = "practice" | "mobility" | "live";

interface DayCell {
  day: number;
  inMonth: boolean;
  isToday?: boolean;
  isDone?: boolean;
  isLive?: boolean;
  bars: SessionBar[];
}

// ─── Данные ноября 2026 ───────────────────────────────────────────────────────
// 1 ноября 2026 = воскресенье → первая строка: 26пн…31сб oct | 1вс nov

const WEEKS: DayCell[][] = [
  [
    { day: 26, inMonth: false, bars: [] },
    { day: 27, inMonth: false, bars: [] },
    { day: 28, inMonth: false, bars: [] },
    { day: 29, inMonth: false, bars: [] },
    { day: 30, inMonth: false, bars: [] },
    { day: 31, inMonth: false, bars: [] },
    { day: 1,  inMonth: true,  bars: [] },
  ],
  [
    { day: 2,  inMonth: true, isDone: true, bars: ["practice", "mobility"] },
    { day: 3,  inMonth: true, isDone: true, bars: ["practice", "mobility"] },
    { day: 4,  inMonth: true, bars: [] },
    { day: 5,  inMonth: true, isDone: true, bars: ["practice", "mobility"] },
    { day: 6,  inMonth: true, isDone: true, isLive: true, bars: ["practice"] },
    { day: 7,  inMonth: true, isDone: true, bars: ["practice"] },
    { day: 8,  inMonth: true, bars: [] },
  ],
  [
    { day: 9,  inMonth: true, isDone: true, bars: ["practice", "mobility"] },
    { day: 10, inMonth: true, isDone: true, bars: ["practice", "mobility"] },
    { day: 11, inMonth: true, isToday: true, bars: ["practice"] },
    { day: 12, inMonth: true, bars: ["practice"] },
    { day: 13, inMonth: true, isLive: true, bars: ["live"] },
    { day: 14, inMonth: true, bars: [] },
    { day: 15, inMonth: true, bars: [] },
  ],
  [
    { day: 16, inMonth: true, bars: [] },
    { day: 17, inMonth: true, bars: ["mobility"] },
    { day: 18, inMonth: true, bars: [] },
    { day: 19, inMonth: true, bars: [] },
    { day: 20, inMonth: true, isLive: true, bars: ["live"] },
    { day: 21, inMonth: true, bars: [] },
    { day: 22, inMonth: true, bars: [] },
  ],
  [
    { day: 23, inMonth: true, bars: [] },
    { day: 24, inMonth: true, bars: [] },
    { day: 25, inMonth: true, bars: [] },
    { day: 26, inMonth: true, bars: [] },
    { day: 27, inMonth: true, isLive: true, bars: ["live"] },
    { day: 28, inMonth: true, bars: [] },
    { day: 29, inMonth: true, bars: [] },
  ],
  [
    { day: 30, inMonth: true, bars: [] },
    { day: 0, inMonth: false, bars: [] },
    { day: 0, inMonth: false, bars: [] },
    { day: 0, inMonth: false, bars: [] },
    { day: 0, inMonth: false, bars: [] },
    { day: 0, inMonth: false, bars: [] },
    { day: 0, inMonth: false, bars: [] },
  ],
];

const DAYS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

const BAR_COLOR: Record<SessionBar, string> = {
  practice: brand.terracotta,
  mobility: brand.sage,
  live:     brand.gold,
};

// ─── Ячейка дня ──────────────────────────────────────────────────────────────

function DayCellView({ cell }: { cell: DayCell }) {
  if (!cell.inMonth && cell.day === 0) return <Box />;

  return (
    <Box sx={{
      borderRadius: "12px",
      backgroundColor: cell.isToday ? brand.cocoa : "transparent",
      border: cell.isToday ? "none" : `1px solid transparent`,
      p: "8px 6px 6px",
      position: "relative",
      cursor: cell.inMonth ? "pointer" : "default",
      transition: "background-color 0.15s ease",
      "&:hover": cell.inMonth && !cell.isToday
        ? { backgroundColor: alpha(brand.line, 0.4) }
        : {},
      minHeight: "64px",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
    }}>
      {/* Верхняя строка: число + иконки */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Typography sx={{
          fontFamily: "var(--font-body)",
          fontSize: "13px",
          fontWeight: cell.isToday ? 700 : 400,
          color: cell.isToday
            ? brand.ivory
            : cell.inMonth ? brand.cocoa : alpha(brand.cocoa, 0.25),
          lineHeight: 1,
        }}>
          {cell.day || ""}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: "2px" }}>
          {/* Галочка */}
          {cell.isDone && (
            <Box sx={{
              width: 14, height: 14, borderRadius: "50%",
              backgroundColor: alpha(brand.sage, 0.2),
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Box component="svg" sx={{ width: 8, height: 8 }} viewBox="0 0 8 8">
                <polyline points="1,4 3,6.5 7,1.5" fill="none" stroke={brand.sage} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </Box>
            </Box>
          )}
          {/* LIVE бейдж */}
          {cell.isLive && (
            <Box sx={{
              borderRadius: "4px",
              backgroundColor: cell.isDone ? brand.terracotta : alpha(brand.terracotta, 0.12),
              px: "3px", py: "1px",
              display: "flex", alignItems: "center",
            }}>
              <Typography sx={{
                fontFamily: "var(--font-body)", fontWeight: 700,
                fontSize: "8px", letterSpacing: "0.05em",
                color: cell.isDone ? "#fff" : brand.terracottaDeep,
                lineHeight: 1.2,
              }}>
                LIVE
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Бары внизу */}
      {cell.bars.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", mt: "6px" }}>
          {cell.bars.map((type, i) => (
            <Box key={i} sx={{
              height: "2.5px", borderRadius: "2px",
              width: type === "practice" ? "70%" : "45%",
              backgroundColor: cell.isToday ? alpha(brand.ivory, 0.4) : BAR_COLOR[type],
            }} />
          ))}
        </Box>
      )}
    </Box>
  );
}

// ─── MonthCalendar ────────────────────────────────────────────────────────────

export function MonthCalendar() {
  const [view, setView] = useState<"week" | "month">("month");

  return (
    <Box sx={{
      borderRadius: "22px", backgroundColor: brand.ivory,
      border: `1px solid ${alpha(brand.line, 0.7)}`,
      p: { xs: "20px", md: "28px" },
      boxShadow: `0 2px 12px -4px ${alpha(brand.cocoa, 0.07)}`,
    }}>
      {/* Шапка */}
      <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", mb: "24px", flexWrap: "wrap", gap: "12px" }}>
        <Box>
          <Typography className="eyebrow" sx={{ display: "block", mb: "4px" }}>Календарь</Typography>
          <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 400, color: brand.cocoa, lineHeight: 1 }}>
            Ноябрь{" "}
            <Box component="span" sx={{ color: brand.terracottaDeep }}>2026</Box>
          </Typography>
        </Box>

        {/* Контролы */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Box sx={{
            borderRadius: "100px", border: `1px solid ${alpha(brand.line, 0.8)}`,
            px: "14px", py: "7px", cursor: "pointer",
            "&:hover": { backgroundColor: alpha(brand.line, 0.4) },
          }}>
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, color: brand.cocoa, letterSpacing: "0.04em" }}>
              Сегодня
            </Typography>
          </Box>
          {["‹", "›"].map((ch) => (
            <Box key={ch} sx={{
              width: 32, height: 32, borderRadius: "50%",
              border: `1px solid ${alpha(brand.line, 0.8)}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", "&:hover": { backgroundColor: alpha(brand.line, 0.4) },
            }}>
              <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "16px", color: brand.cocoa, lineHeight: 1 }}>{ch}</Typography>
            </Box>
          ))}
          {(["week", "month"] as const).map((v) => (
            <Box key={v} onClick={() => setView(v)} sx={{
              borderRadius: "100px", px: "14px", py: "7px", cursor: "pointer",
              backgroundColor: view === v ? brand.cocoa : "transparent",
              border: `1px solid ${view === v ? brand.cocoa : alpha(brand.line, 0.8)}`,
              transition: "all 0.15s ease",
            }}>
              <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: view === v ? brand.ivory : brand.cocoa }}>
                {v === "week" ? "Неделя" : "Месяц"}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Дни недели */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: "8px" }}>
        {DAYS.map((d) => (
          <Typography key={d} sx={{
            fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "11px",
            letterSpacing: "0.12em", color: brand.mute, textAlign: "center", py: "4px",
          }}>
            {d}
          </Typography>
        ))}
      </Box>

      {/* Сетка дней */}
      {WEEKS.map((week, wi) => (
        <Box key={wi} sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", mb: "4px" }}>
          {week.map((cell, di) => <DayCellView key={di} cell={cell} />)}
        </Box>
      ))}
    </Box>
  );
}
