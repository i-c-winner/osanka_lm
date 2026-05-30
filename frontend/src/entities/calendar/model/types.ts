export type SessionBar = "practice" | "mobility" | "live";

export interface DayData {
  isDone?: boolean;
  isLive?: boolean;
  bars: SessionBar[];
}

export type GetDayData = (dateKey: string) => DayData | undefined;
