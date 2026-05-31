export type SessionBar = "practice" | "mobility" | "live";

export interface SessionSlot {
  time:   string;   // "09:00"
  booked: boolean;
}

export interface DayData {
  isDone?:     boolean;
  isLive?:     boolean;
  hasBooking?: boolean;
  bars:        SessionBar[];
  slots?:      SessionSlot[];
}

export type GetDayData = (dateKey: string) => DayData | undefined;
