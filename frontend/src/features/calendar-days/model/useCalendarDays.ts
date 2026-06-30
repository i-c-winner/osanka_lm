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

/** Фильтруем брони по подписке.
 * Брони без subscription_id (до миграции) считаются принадлежащими любой подписке.
 */
function filterBookedIds(bookings: BookingResponse[], subscriptionId?: string): Set<string> {
  return new Set(
    bookings
      .filter(
        (b) =>
          b.status !== "cancelled" &&
          (!subscriptionId || !b.subscription_id || b.subscription_id === subscriptionId),
      )
      .map((b) => b.session_id),
  );
}

function computeDayMap(
  byDate: Record<string, SessionResponse[]>,
  bookedSessionIds: Set<string>,
): Record<string, DayData> {
  const result: Record<string, DayData> = {};
  for (const [date, daySessions] of Object.entries(byDate)) {
    const data = buildDayData(daySessions, date, bookedSessionIds);
    const hasBooking = daySessions.some((s) => bookedSessionIds.has(s.id));
    if ((data.slots && data.slots.length > 0) || hasBooking) {
      result[date] = { ...data, hasBooking };
    }
  }
  return result;
}

// ─── Хук ─────────────────────────────────────────────────────────────────────

interface CalendarDaysState {
  getDayData:          GetDayData;
  sessionsByDate:      Record<string, SessionResponse[]>;
  loading:             boolean;
  refresh:             () => void;
  optimisticBook:      (dateKey: string, sessionId: string) => void;
  optimisticCancel:    (dateKey: string, sessionId: string) => void;
  unbookedLastMonth:   number;
}

export function useCalendarDays(subscriptionId?: string): CalendarDaysState {
  const [dayMap,            setDayMap]            = useState<Record<string, DayData>>({});
  const [sessionsByDate,    setSessionsByDate]    = useState<Record<string, SessionResponse[]>>({});
  const [unbookedLastMonth, setUnbookedLastMonth] = useState(0);
  const [loading,           setLoading]           = useState(true);
  const [tick,              setTick]              = useState(0);

  // Сырые данные в рефах — для пересчёта без повторного запроса
  const sessionsByDateRef  = useRef<Record<string, SessionResponse[]>>({});
  const allBookingsRef     = useRef<BookingResponse[]>([]);
  const bookedSessionIdsRef = useRef<Set<string>>(new Set());

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // Загрузка данных
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      daysApi.list(),
      sessionsApi.list(),
      bookingsApi.listMy().catch(() => [] as BookingResponse[]),
    ])
      .then(([days, sessions, myBookings]: [DayResponse[], SessionResponse[], BookingResponse[]]) => {
        if (cancelled) return;

        const idToDate: Record<string, string> = {};
        for (const day of days) idToDate[day.id] = day.date;

        const byDate: Record<string, SessionResponse[]> = {};
        for (const s of sessions) {
          const date = idToDate[s.day_id];
          if (!date) continue;
          if (!byDate[date]) byDate[date] = [];
          byDate[date].push(s);
        }

        const bookedSessionIds = filterBookedIds(myBookings, subscriptionId);

        // Обновляем рефы
        sessionsByDateRef.current   = byDate;
        allBookingsRef.current      = myBookings;
        bookedSessionIdsRef.current = bookedSessionIds;

        // Пропущенные в прошлом месяце (по всем броням пользователя, без фильтра по подписке)
        const allBookedIds = filterBookedIds(myBookings);
        const now = new Date();
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
        const prevMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);
        let unbookedCount = 0;
        for (const [date, daySessions] of Object.entries(byDate)) {
          if (date < prevMonthStart || date > prevMonthEnd) continue;
          const hasActiveSessions = daySessions.some((s) => s.status === "active" || s.status === "completed");
          const hasUserBooking    = daySessions.some((s) => allBookedIds.has(s.id));
          if (hasActiveSessions && !hasUserBooking) unbookedCount++;
        }
        setUnbookedLastMonth(unbookedCount);

        setDayMap(computeDayMap(byDate, bookedSessionIds));
        setSessionsByDate(byDate);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tick]); // eslint-disable-line react-hooks/exhaustive-deps

  // Пересчитываем отображение броней при смене подписки (без нового запроса)
  useEffect(() => {
    if (Object.keys(sessionsByDateRef.current).length === 0) return;
    const bookedSessionIds = filterBookedIds(allBookingsRef.current, subscriptionId);
    bookedSessionIdsRef.current = bookedSessionIds;
    setDayMap(computeDayMap(sessionsByDateRef.current, bookedSessionIds));
  }, [subscriptionId]);

  /** Мгновенно показать маркер брони */
  const optimisticBook = useCallback((dateKey: string, sessionId: string) => {
    bookedSessionIdsRef.current = new Set(bookedSessionIdsRef.current).add(sessionId);
    const daySessions = sessionsByDateRef.current[dateKey];
    if (!daySessions) return;
    const data = buildDayData(daySessions, dateKey, bookedSessionIdsRef.current);
    setDayMap((prev) => ({ ...prev, [dateKey]: { ...data, hasBooking: true } }));
  }, []);

  /** Мгновенно убрать маркер брони */
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

  return { getDayData, sessionsByDate, loading, refresh, optimisticBook, optimisticCancel, unbookedLastMonth };
}
