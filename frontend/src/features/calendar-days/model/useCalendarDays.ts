import { useCallback } from "react";
import type { DayData, GetDayData } from "@/entities/calendar/model/types";

// Временные данные — в будущем заменяются на fetch из API
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

export function useCalendarDays(): GetDayData {
  return useCallback((dateKey: string) => DAY_MAP[dateKey], []);
}
