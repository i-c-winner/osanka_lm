import { apiClient } from "../client";
import type { BookingResponse } from "../types";

export const bookingsApi = {
  list: () =>
    apiClient.get<BookingResponse[]>("/bookings").then((r) => r.data),

  get: (id: string) =>
    apiClient.get<BookingResponse>(`/bookings/${id}`).then((r) => r.data),

  create: (sessionId: string) =>
    apiClient
      .post<BookingResponse>("/bookings", null, { params: { session_id: sessionId } })
      .then((r) => r.data),

  cancel: (id: string) =>
    apiClient.post<BookingResponse>(`/bookings/${id}/cancel`).then((r) => r.data),
};
