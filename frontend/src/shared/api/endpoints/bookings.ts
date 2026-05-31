import { apiClient } from "../client";
import type { BookingResponse } from "../types";

export const bookingsApi = {
  list: () =>
    apiClient.get<BookingResponse[]>("/bookings").then((r) => r.data),

  create: (sessionId: string) =>
    apiClient.post<BookingResponse>(`/bookings/?session_id=${sessionId}`).then((r) => r.data),
};
