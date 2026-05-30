"use client";

import { useEffect, useRef, useState } from "react";
import Box        from "@mui/material/Box";
import Typography  from "@mui/material/Typography";
import { alpha }   from "@mui/material/styles";
import { brand }   from "@/shared/theme";
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { DayCellMountArg } from "@fullcalendar/core";

// ─── Данные дней ─────────────────────────────────────────────────────────────

type SessionBar = "practice" | "mobility" | "live";

interface DayData {
  isDone?: boolean;
  isLive?: boolean;
  bars: SessionBar[];
}

const BAR_COLOR: Record<SessionBar, string> = {
  practice: brand.terracotta,
  mobility: brand.sage,
  live:     brand.gold,
};

const DAY_MAP: Record<string, DayData> = {
  "2026-11-02": { isDone: true, bars: ["practice", "mobility"] },
  "2026-11-03": { isDone: true, bars: ["practice", "mobility"] },
  "2026-11-05": { isDone: true, bars: ["practice", "mobility"] },
  "2026-11-06": { isDone: true, isLive: true, bars: ["practice"] },
  "2026-11-07": { isDone: true, bars: ["practice"] },
  "2026-11-09": { isDone: true, bars: ["practice", "mobility"] },
  "2026-11-10": { isDone: true, bars: ["practice", "mobility"] },
  "2026-11-11": { bars: ["practice"] },
  "2026-11-12": { bars: ["practice"] },
  "2026-11-13": { isLive: true, bars: ["live"] },
  "2026-11-17": { bars: ["mobility"] },
  "2026-11-20": { isLive: true, bars: ["live"] },
  "2026-11-27": { isLive: true, bars: ["live"] },
};

function toKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─── CSS-переопределения FullCalendar ──────────────────────────────────────────

const FC_STYLES = `
  .fc-osanka .fc-theme-standard td,
  .fc-osanka .fc-theme-standard th,
  .fc-osanka .fc-theme-standard .fc-scrollgrid {
    border: none !important;
  }
  .fc-osanka .fc-scrollgrid { border: none !important; }
  .fc-osanka .fc-col-header-cell-cushion {
    font-family: var(--font-body);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    color: ${brand.mute};
    text-decoration: none;
    text-transform: uppercase;
    padding: 4px 0;
    cursor: default;
    pointer-events: none;
  }
  .fc-osanka .fc-daygrid-day {
    background: transparent !important;
  }
  .fc-osanka .fc-daygrid-day-frame {
    min-height: 64px !important;
    padding: 8px 6px 6px !important;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: background-color 0.15s ease;
    cursor: pointer;
  }
  .fc-osanka .fc-daygrid-day:not(.fc-day-other) .fc-daygrid-day-frame:hover {
    background-color: ${alpha(brand.line, 0.4)} !important;
  }
  .fc-osanka .fc-day-today .fc-daygrid-day-frame {
    background-color: ${brand.cocoa} !important;
  }
  .fc-osanka .fc-day-today .fc-daygrid-day-frame:hover {
    background-color: ${brand.cocoa} !important;
  }
  .fc-osanka .fc-daygrid-day-top { display: none; }
  .fc-osanka .fc-daygrid-day-events { display: none; }
  .fc-osanka .fc-daygrid-day-bg { display: none; }
  .fc-osanka .fc-day-other .fc-daygrid-day-frame {
    cursor: default;
    opacity: 0.35;
  }
  .fc-osanka table { border-collapse: separate; border-spacing: 4px !important; }
  .fc-osanka .fc-scrollgrid-sync-table { border-spacing: 4px !important; }
  .fc-osanka .fc-col-header { margin-bottom: 8px; }
  .fc-osanka .fc-daygrid-body { width: 100% !important; }
  .fc-osanka .fc-scrollgrid-section > * { border: none !important; }
  .fc-osanka .fc-day-custom-inner {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }
`;

// ─── MonthCalendar ────────────────────────────────────────────────────────────

export function MonthCalendar() {
  const calRef     = useRef<HTMLDivElement>(null);
  const calInstance = useRef<Calendar | null>(null);
  const [view, setView]   = useState<"week" | "month">("month");
  const [title, setTitle] = useState<{ month: string; year: string }>({ month: "Ноябрь", year: "2026" });

  const MONTH_NAMES_RU = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];

  function updateTitle(cal: Calendar) {
    const d = cal.getDate();
    setTitle({ month: MONTH_NAMES_RU[d.getMonth()], year: String(d.getFullYear()) });
  }

  // Рендер содержимого ячейки через DOM
  function renderDayCell(arg: DayCellMountArg) {
    const key      = toKey(arg.date);
    const data     = DAY_MAP[key];
    const isToday  = arg.el.closest(".fc-day-today") !== null;
    const isOther  = arg.el.closest(".fc-day-other") !== null;

    const frame = arg.el.querySelector(".fc-daygrid-day-frame") as HTMLElement | null;
    if (!frame) return;

    // очищаем стандартный контент FC
    frame.innerHTML = "";

    const inner = document.createElement("div");
    inner.className = "fc-day-custom-inner";
    inner.style.cssText = "display:flex;flex-direction:column;justify-content:space-between;height:100%;";

    // Верхняя строка: число + бейджи
    const top = document.createElement("div");
    top.style.cssText = "display:flex;align-items:flex-start;justify-content:space-between;";

    const num = document.createElement("span");
    num.textContent = String(arg.date.getDate());
    num.style.cssText = `
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: ${isToday ? 700 : 400};
      color: ${isToday ? brand.ivory : isOther ? alpha(brand.cocoa, 0.25) : brand.cocoa};
      line-height: 1;
    `;
    top.appendChild(num);

    if (data) {
      const badges = document.createElement("div");
      badges.style.cssText = "display:flex;align-items:center;gap:2px;";

      if (data.isDone) {
        const check = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        check.setAttribute("viewBox", "0 0 14 14");
        check.setAttribute("width", "14");
        check.setAttribute("height", "14");
        check.style.cssText = `
          background:${alpha(brand.sage, 0.2)};
          border-radius:50%;
          padding:3px;
          box-sizing:border-box;
        `;
        const poly = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        poly.setAttribute("points", "2,7 5,11 12,3");
        poly.setAttribute("fill", "none");
        poly.setAttribute("stroke", brand.sage);
        poly.setAttribute("stroke-width", "2");
        poly.setAttribute("stroke-linecap", "round");
        poly.setAttribute("stroke-linejoin", "round");
        check.appendChild(poly);
        badges.appendChild(check);
      }

      if (data.isLive) {
        const live = document.createElement("span");
        live.textContent = "LIVE";
        live.style.cssText = `
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 8px;
          letter-spacing: 0.05em;
          line-height: 1.2;
          padding: 1px 3px;
          border-radius: 4px;
          background: ${data.isDone ? brand.terracotta : alpha(brand.terracotta, 0.12)};
          color: ${data.isDone ? "#fff" : brand.terracottaDeep};
        `;
        badges.appendChild(live);
      }

      top.appendChild(badges);

      // Бары внизу
      if (data.bars.length > 0) {
        const bars = document.createElement("div");
        bars.style.cssText = "display:flex;flex-direction:column;gap:2px;margin-top:6px;";
        data.bars.forEach((type) => {
          const bar = document.createElement("div");
          bar.style.cssText = `
            height: 2.5px;
            border-radius: 2px;
            width: ${type === "practice" ? "70%" : "45%"};
            background-color: ${isToday ? alpha(brand.ivory, 0.4) : BAR_COLOR[type]};
          `;
          bars.appendChild(bar);
        });
        inner.appendChild(top);
        inner.appendChild(bars);
        frame.appendChild(inner);
        return;
      }
    }

    inner.appendChild(top);
    frame.appendChild(inner);
  }

  useEffect(() => {
    if (!calRef.current) return;

    const cal = new Calendar(calRef.current, {
      plugins:        [dayGridPlugin],
      initialView:    "dayGridMonth",
      initialDate:    "2026-11-01",
      locale:         "ru",
      firstDay:       1,
      headerToolbar:  false,
      fixedWeekCount: false,
      height:         "auto",
      dayCellDidMount: renderDayCell,
    });

    cal.render();
    calInstance.current = cal;
    updateTitle(cal);

    return () => { cal.destroy(); calInstance.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Смена вида
  useEffect(() => {
    const cal = calInstance.current;
    if (!cal) return;
    cal.changeView(view === "month" ? "dayGridMonth" : "dayGridWeek");
    updateTitle(cal);
  }, [view]);

  function goToday() {
    calInstance.current?.today();
    if (calInstance.current) updateTitle(calInstance.current);
  }
  function goPrev() {
    calInstance.current?.prev();
    if (calInstance.current) updateTitle(calInstance.current);
  }
  function goNext() {
    calInstance.current?.next();
    if (calInstance.current) updateTitle(calInstance.current);
  }

  return (
    <Box sx={{
      borderRadius: "22px", backgroundColor: brand.ivory,
      border: `1px solid ${alpha(brand.line, 0.7)}`,
      p: { xs: "20px", md: "28px" },
      boxShadow: `0 2px 12px -4px ${alpha(brand.cocoa, 0.07)}`,
    }}>
      {/* Инжект CSS */}
      <style>{FC_STYLES}</style>

      {/* Шапка */}
      <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", mb: "24px", flexWrap: "wrap", gap: "12px" }}>
        <Box>
          <Typography className="eyebrow" sx={{ display: "block", mb: "4px" }}>Календарь</Typography>
          <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 400, color: brand.cocoa, lineHeight: 1 }}>
            {title.month}{" "}
            <Box component="span" sx={{ color: brand.terracottaDeep }}>{title.year}</Box>
          </Typography>
        </Box>

        {/* Контролы */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Box onClick={goToday} sx={{
            borderRadius: "100px", border: `1px solid ${alpha(brand.line, 0.8)}`,
            px: "14px", py: "7px", cursor: "pointer",
            "&:hover": { backgroundColor: alpha(brand.line, 0.4) },
          }}>
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, color: brand.cocoa, letterSpacing: "0.04em" }}>
              Сегодня
            </Typography>
          </Box>
          {([["‹", goPrev], ["›", goNext]] as const).map(([ch, fn]) => (
            <Box key={ch} onClick={fn} sx={{
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

      {/* FullCalendar */}
      <Box className="fc-osanka" ref={calRef} />
    </Box>
  );
}
