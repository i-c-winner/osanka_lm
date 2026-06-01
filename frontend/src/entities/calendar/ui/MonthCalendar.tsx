"use client";

import { useEffect, useRef, useState } from "react";
import Box        from "@mui/material/Box";
import Typography  from "@mui/material/Typography";
import { alpha }   from "@mui/material/styles";
import { brand }   from "@/shared/theme";
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { DayCellMountArg } from "@fullcalendar/core";
import type { GetDayData } from "@/entities/calendar/model/types";
import { BAR_COLOR } from "@/entities/calendar/model/barColors";

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
  .fc-osanka table { border-collapse: separate; border-spacing: 0 !important; }
  .fc-osanka .fc-daygrid-body td,
  .fc-osanka .fc-col-header th { padding: 2px !important; }
  .fc-osanka .fc-col-header { margin-bottom: 4px; }
  .fc-osanka .fc-daygrid-body,
  .fc-osanka .fc-daygrid-body table,
  .fc-osanka .fc-col-header,
  .fc-osanka .fc-col-header table { width: 100% !important; }
  .fc-osanka .fc-scrollgrid-section > * { border: none !important; }
  .fc-osanka .fc-view-harness { overflow: hidden !important; }
  .fc-osanka .fc-day-custom-inner {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }
`;

// ─── Утилиты ──────────────────────────────────────────────────────────────────

function toKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const MONTH_NAMES_RU = [
  "Январь","Февраль","Март","Апрель","Май","Июнь",
  "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь",
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface MonthCalendarProps {
  getDayData:   GetDayData;
  onDayClick?:  (dateKey: string) => void;
}

// ─── MonthCalendar ────────────────────────────────────────────────────────────

export function MonthCalendar({ getDayData, onDayClick }: MonthCalendarProps) {
  const calRef        = useRef<HTMLDivElement>(null);
  const calInstance   = useRef<Calendar | null>(null);
  const getDayDataRef = useRef<GetDayData>(getDayData);
  const onDayClickRef = useRef(onDayClick);
  // dateKey → { frame, date, isOther } для ручного перерендера
  const cellsRef      = useRef<Map<string, { frame: HTMLElement; date: Date; isOther: boolean }>>(new Map());
  // предыдущий вид — чтобы view effect не срабатывал на маунте
  const prevViewRef = useRef<"week" | "month">("month");
  const [view, setView]   = useState<"week" | "month">("month");
  const today = new Date();
  const [title, setTitle] = useState<{ month: string; year: string }>({
    month: MONTH_NAMES_RU[today.getMonth()],
    year:  String(today.getFullYear()),
  });

  // Всегда держим refs актуальными
  getDayDataRef.current = getDayData;
  onDayClickRef.current = onDayClick;

  function updateTitle(cal: Calendar) {
    const d = cal.getDate();
    setTitle({ month: MONTH_NAMES_RU[d.getMonth()], year: String(d.getFullYear()) });
  }

  function makeBookingDot(isToday: boolean): HTMLElement {
    const dot = document.createElement("div");
    dot.style.cssText = `
      width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
      background-color: ${isToday ? brand.ivory : brand.terracotta};
      margin-top: 4px; align-self: flex-start;
    `;
    return dot;
  }

  function fillFrame(frame: HTMLElement, date: Date, isOther: boolean) {
    const key     = toKey(date);
    const isToday = frame.closest(".fc-day-today") !== null;
    const data    = getDayDataRef.current(key);

    frame.innerHTML = "";

    const inner = document.createElement("div");
    inner.className = "fc-day-custom-inner";
    inner.style.cssText = "display:flex;flex-direction:column;justify-content:space-between;height:100%;";

    const top = document.createElement("div");
    top.style.cssText = "display:flex;align-items:flex-start;justify-content:space-between;";

    const num = document.createElement("span");
    num.textContent = String(date.getDate());
    num.style.cssText = `
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: ${isToday ? 700 : 400};
      color: ${isToday ? brand.ivory : isOther ? alpha(brand.cocoa, 0.25) : brand.cocoa};
      line-height: 1;
    `;
    top.appendChild(num);

    // Маркер наличия сессий (admin-вид)
    if (data?.hasSessions && !isOther) {
      const dot = document.createElement("div");
      dot.style.cssText = `
        width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
        background-color: ${isToday ? brand.ivory : brand.terracotta};
        margin-top: 1px;
      `;
      top.appendChild(dot);
    }

    inner.appendChild(top);

    if (data?.slots && data.slots.length > 0) {
      const slotsEl = document.createElement("div");
      slotsEl.style.cssText = "display:flex;flex-direction:column;gap:3px;margin-top:6px;";

      data.slots.forEach((slot) => {
        const row = document.createElement("div");
        row.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:4px;";

        const timeEl = document.createElement("span");
        timeEl.textContent = slot.time;
        timeEl.style.cssText = `
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 500;
          color: ${isToday ? alpha(brand.ivory, 0.85) : brand.cocoaSoft};
          line-height: 1;
        `;
        row.appendChild(timeEl);

        if (slot.booked) {
          const dot = document.createElement("div");
          dot.style.cssText = `
            width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
            background-color: ${isToday ? brand.ivory : brand.terracotta};
          `;
          row.appendChild(dot);
        }

        slotsEl.appendChild(row);
      });

      inner.appendChild(slotsEl);
    }

    frame.appendChild(inner);
  }

  function renderDayCell(arg: DayCellMountArg) {
    const key     = toKey(arg.date);
    const isOther = arg.el.closest(".fc-day-other") !== null;

    const frame = arg.el.querySelector(".fc-daygrid-day-frame") as HTMLElement | null;
    if (!frame) return;

    // Сохраняем ссылку на ячейку для последующего обновления
    cellsRef.current.set(key, { frame, date: arg.date, isOther });

    if (!isOther && onDayClickRef.current) {
      frame.style.cursor = "pointer";
      frame.onclick = () => onDayClickRef.current?.(key);
    }

    fillFrame(frame, arg.date, isOther);
  }

  useEffect(() => {
    if (!calRef.current) return;

    const cal = new Calendar(calRef.current, {
      plugins:         [dayGridPlugin],
      initialView:     "dayGridMonth",
      initialDate:     new Date(),
      locale:          "ru",
      firstDay:        1,
      headerToolbar:   false,
      fixedWeekCount:  false,
      height:          "auto",
      dayCellDidMount: renderDayCell,
    });

    cal.render();
    calInstance.current = cal;
    updateTitle(cal);

    return () => { cal.destroy(); calInstance.current = null; cellsRef.current.clear(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Пропускаем если вид не изменился (включая первый запуск)
    if (prevViewRef.current === view) return;
    prevViewRef.current = view;
    const cal = calInstance.current;
    if (!cal) return;
    cellsRef.current.clear(); // ячейки пересоздадутся через dayCellDidMount
    cal.changeView(view === "month" ? "dayGridMonth" : "dayGridWeek");
    updateTitle(cal);
  }, [view]);

  // Перерисовываем все сохранённые ячейки напрямую через DOM
  useEffect(() => {
    cellsRef.current.forEach(({ frame, date, isOther }) => {
      fillFrame(frame, date, isOther);
    });
  }, [getDayData]); // eslint-disable-line react-hooks/exhaustive-deps

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
      p: { xs: "16px", md: "28px" },
      overflow: "hidden",
      boxShadow: `0 2px 12px -4px ${alpha(brand.cocoa, 0.07)}`,
    }}>
      <style>{FC_STYLES}</style>

      <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", mb: "24px", flexWrap: "wrap", gap: "12px" }}>
        <Box>
          <Typography className="eyebrow" sx={{ display: "block", mb: "4px" }}>Календарь</Typography>
          <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 400, color: brand.cocoa, lineHeight: 1 }}>
            {title.month}{" "}
            <Box component="span" sx={{ color: brand.terracottaDeep }}>{title.year}</Box>
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
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

      <Box className="fc-osanka" ref={calRef} />
    </Box>
  );
}
