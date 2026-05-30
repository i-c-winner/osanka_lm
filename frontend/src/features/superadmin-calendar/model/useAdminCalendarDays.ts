import { useCallback, useEffect, useState } from "react";
import { sessionsApi, daysApi } from "@/shared/api";
import type { SessionResponse, DayResponse } from "@/shared/api";
import type { DayData, GetDayData } from "@/entities/calendar/model/types";

// ─── Маппинг сессий дня → DayData ────────────────────────────────────────────

function buildDayData(sessions: SessionResponse[]): DayData {
  const active    = sessions.filter((s) => s.status === "active");
  const completed = sessions.filter((s) => s.status === "completed");
  const visible   = [...active, ...completed];

  if (visible.length === 0) return { bars: [] };

  const isDone = visible.length > 0 && active.length === 0;

  // Каждая сессия → бар типа "practice"; ограничиваем до 3
  const bars = visible
    .slice(0, 3)
    .map((): DayData["bars"][number] => "practice");

  return { isDone, bars };
}

// ─── Хук ─────────────────────────────────────────────────────────────────────

interface AdminCalendarState {
  getDayData: GetDayData;
  sessionsByDate: Record<string, SessionResponse[]>;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useAdminCalendarDays(): AdminCalendarState {
  const [dayMap,          setDayMap]          = useState<Record<string, DayData>>({});
  const [sessionsByDate,  setSessionsByDate]  = useState<Record<string, SessionResponse[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Загружаем дни и сессии параллельно
      const [days, sessions]: [DayResponse[], SessionResponse[]] = await Promise.all([
        daysApi.list(),
        sessionsApi.list(),
      ]);

      // day_id → дата (ISO строка "YYYY-MM-DD")
      const idToDate: Record<string, string> = {};
      for (const day of days) {
        idToDate[day.id] = day.date;
      }

      // Группируем сессии по дате
      const sessionsByDate: Record<string, SessionResponse[]> = {};
      for (const session of sessions) {
        const date = idToDate[session.day_id];
        if (!date) continue;
        if (!sessionsByDate[date]) sessionsByDate[date] = [];
        sessionsByDate[date].push(session);
      }

      // Строим DayData для каждой даты
      const result: Record<string, DayData> = {};
      for (const [date, daySessions] of Object.entries(sessionsByDate)) {
        const data = buildDayData(daySessions);
        if (data.bars.length > 0) result[date] = data;
      }

      setDayMap(result);
      setSessionsByDate(sessionsByDate);
    } catch (e) {
      setError("Не удалось загрузить данные календаря");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const getDayData: GetDayData = useCallback(
    (dateKey: string) => dayMap[dateKey],
    [dayMap],
  );

  return { getDayData, sessionsByDate, loading, error, reload: load };
}
