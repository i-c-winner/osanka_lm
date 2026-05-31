import { useCallback, useEffect, useState } from "react";
import { sessionsApi, daysApi } from "@/shared/api";
import type { SessionResponse, DayResponse } from "@/shared/api";
import type { DayData, GetDayData } from "@/entities/calendar/model/types";

// ─── Маппинг сессий дня → DayData ────────────────────────────────────────────

function buildDayData(sessions: SessionResponse[], date: string): DayData {
  const today = new Date().toISOString().slice(0, 10);
  const isPast = date < today;

  const active    = sessions.filter((s) => s.status === "active");
  const completed = sessions.filter((s) => s.status === "completed");
  const visible   = isPast ? completed : active;

  if (visible.length === 0 && !isPast) {
    // Если дата в будущем — показываем активные
    if (active.length === 0) return { bars: [] };
    return { bars: active.slice(0, 3).map(() => "practice" as const) };
  }

  if (visible.length === 0) return { bars: [] };

  const isDone = isPast && completed.length > 0;
  const bars = visible.slice(0, 3).map((): DayData["bars"][number] => "practice");

  return { isDone, bars };
}

// ─── Хук ─────────────────────────────────────────────────────────────────────

interface CalendarDaysState {
  getDayData:     GetDayData;
  sessionsByDate: Record<string, SessionResponse[]>;
  loading:        boolean;
}

export function useCalendarDays(): CalendarDaysState {
  const [dayMap,         setDayMap]         = useState<Record<string, DayData>>({});
  const [sessionsByDate, setSessionsByDate] = useState<Record<string, SessionResponse[]>>({});
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([daysApi.list(), sessionsApi.list()])
      .then(([days, sessions]: [DayResponse[], SessionResponse[]]) => {
        if (cancelled) return;

        const idToDate: Record<string, string> = {};
        for (const day of days) idToDate[day.id] = day.date;

        const sessionsByDate: Record<string, SessionResponse[]> = {};
        for (const s of sessions) {
          const date = idToDate[s.day_id];
          if (!date) continue;
          if (!sessionsByDate[date]) sessionsByDate[date] = [];
          sessionsByDate[date].push(s);
        }

        const result: Record<string, DayData> = {};
        for (const [date, daySessions] of Object.entries(sessionsByDate)) {
          const data = buildDayData(daySessions, date);
          if (data.bars.length > 0) result[date] = data;
        }

        setDayMap(result);
        setSessionsByDate(sessionsByDate);
      })
      .catch(() => {/* не блокируем UI при ошибке */})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const getDayData: GetDayData = useCallback(
    (dateKey: string) => dayMap[dateKey],
    [dayMap],
  );

  return { getDayData, sessionsByDate, loading };
}
