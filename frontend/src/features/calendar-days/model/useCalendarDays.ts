import { useCallback, useEffect, useRef, useState } from "react";
import { sessionsApi, daysApi, bookingsApi } from "@/shared/api";
import type { SessionResponse, DayResponse, BookingResponse } from "@/shared/api";
import type { DayData, GetDayData, SessionSlot } from "@/entities/calendar/model/types";

// ─── Маппинг сессий дня → DayData ────────────────────────────────────────────

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function buildDayData(
  sessions: SessionResponse[],
  date: string,
  bookedSessionIds: Set<string>,
): DayData {
  const today = new Date().toISOString().slice(0, 10);
  const isPast = date < today;

  const active    = sessions.filter((s) => s.status === "active");
  const completed = sessions.filter((s) => s.status === "completed");
  const visible   = isPast ? completed : active;

  if (visible.length === 0) return { bars: [] };

  const isDone = isPast && completed.length > 0;

  const slots: SessionSlot[] = visible.slice(0, 3).map((s) => ({
    time:   fmtTime(s.starts_at),
    booked: bookedSessionIds.has(s.id),
  }));

  return { isDone, bars: [], slots };
}

// ─── Хук ─────────────────────────────────────────────────────────────────────

interface CalendarDaysState {
  getDayData:       GetDayData;
  sessionsByDate:   Record<string, SessionResponse[]>;
  loading:          boolean;
  refresh:          () => void;
  optimisticBook:   (dateKey: string, sessionId: string) => void;
  optimisticCancel: (dateKey: string, sessionId: string) => void;
}

export function useCalendarDays(): CalendarDaysState {
  const [dayMap,         setDayMap]         = useState<Record<string, DayData>>({});
  const [sessionsByDate, setSessionsByDate] = useState<Record<string, SessionResponse[]>>({});
  const [loading,        setLoading]        = useState(true);
  const [tick,           setTick]           = useState(0);

  // Храним актуальные данные в рефах для оптимистичных обновлений
  const sessionsByDateRef  = useRef<Record<string, SessionResponse[]>>({});
  const bookedSessionIdsRef = useRef<Set<string>>(new Set());

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      daysApi.list(),
      sessionsApi.list(),
      bookingsApi.listMy().catch(() => [] as BookingResponse[]),
    ])
      .then(([days, sessions, myBookings]: [DayResponse[], SessionResponse[], BookingResponse[]]) => {
        if (cancelled) return;

        const idToDate: Record<string, string> = {};
        for (const day of days) idToDate[day.id] = day.date;

        // Сессии где пользователь записан (не отменён)
        const bookedSessionIds = new Set(
          myBookings.filter((b) => b.status !== "cancelled").map((b) => b.session_id),
        );

        const byDate: Record<string, SessionResponse[]> = {};
        for (const s of sessions) {
          const date = idToDate[s.day_id];
          if (!date) continue;
          if (!byDate[date]) byDate[date] = [];
          byDate[date].push(s);
        }

        const result: Record<string, DayData> = {};
        for (const [date, daySessions] of Object.entries(byDate)) {
          const data = buildDayData(daySessions, date, bookedSessionIds);
          const hasBooking = daySessions.some((s) => bookedSessionIds.has(s.id));
          if ((data.slots && data.slots.length > 0) || hasBooking) {
            result[date] = { ...data, hasBooking };
          }
        }

        // Обновляем рефы для оптимистичных обновлений
        sessionsByDateRef.current   = byDate;
        bookedSessionIdsRef.current = bookedSessionIds;

        setDayMap(result);
        setSessionsByDate(byDate);
      })
      .catch(() => {/* не блокируем UI при ошибке */})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  /** Мгновенно показать маркер брони для сессии без запроса к серверу */
  const optimisticBook = useCallback((dateKey: string, sessionId: string) => {
    bookedSessionIdsRef.current = new Set(bookedSessionIdsRef.current).add(sessionId);
    const daySessions = sessionsByDateRef.current[dateKey];
    if (!daySessions) return;
    const data = buildDayData(daySessions, dateKey, bookedSessionIdsRef.current);
    setDayMap((prev) => ({ ...prev, [dateKey]: { ...data, hasBooking: true } }));
  }, []);

  /** Мгновенно убрать маркер брони для сессии без запроса к серверу */
  const optimisticCancel = useCallback((dateKey: string, sessionId: string) => {
    const next = new Set(bookedSessionIdsRef.current);
    next.delete(sessionId);
    bookedSessionIdsRef.current = next;
    const daySessions = sessionsByDateRef.current[dateKey];
    if (!daySessions) return;
    const data = buildDayData(daySessions, dateKey, bookedSessionIdsRef.current);
    const hasBooking = daySessions.some((s) => bookedSessionIdsRef.current.has(s.id));
    setDayMap((prev) => ({ ...prev, [dateKey]: { ...data, hasBooking } }));
  }, []);

  const getDayData: GetDayData = useCallback(
    (dateKey: string) => dayMap[dateKey],
    [dayMap],
  );

  return { getDayData, sessionsByDate, loading, refresh, optimisticBook, optimisticCancel };
}
