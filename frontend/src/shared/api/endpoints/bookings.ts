import { apiClient } from "../client";
import type { BookingResponse } from "../types";

export const bookingsApi = {
  list: () =>
    apiClient.get<BookingResponse[]>("/bookings/").then((r) => r.data),

  listMy: () =>
    apiClient.get<BookingResponse[]>("/bookings/").then((r) => r.data),

  create: (sessionId: string, subscriptionId?: string) =>
    apiClient
      .post<BookingResponse>(
        `/bookings/?session_id=${sessionId}${subscriptionId ? `&subscription_id=${subscriptionId}` : ""}`,
      )
      .then((r) => r.data),

  cancel: (bookingId: string) =>
    apiClient.post<BookingResponse>(`/bookings/${bookingId}/cancel/`).then((r) => r.data),
};
