"use client";

import { useEffect, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import { useTranslations } from "next-intl";
import { bookingsApi } from "@/shared/api";
import type { BookingResponse } from "@/shared/api";
import { BookingStatusChip } from "@/entities/booking";
import { CancelBookingButton } from "@/features/cancel-booking";
import { PageLoader } from "@/shared/ui/PageLoader";
import { ErrorMessage } from "@/shared/ui/ErrorMessage";
import { formatDateTime } from "@/shared/lib/format";

export function BookingList() {
  const t = useTranslations("bookings");
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingsApi.list();
      setBookings(data);
    } catch {
      setError("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageLoader />;
  if (error) return <ErrorMessage onRetry={load} />;

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        {t("title")}
      </Typography>

      {bookings.length === 0 ? (
        <Typography color="text.secondary">{t("empty")}</Typography>
      ) : (
        <Paper variant="outlined">
          <List disablePadding>
            {bookings.map((booking, idx) => (
              <Box key={booking.id}>
                <ListItem sx={{ py: 1.5 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body1">
                          {formatDateTime(booking.booked_at)}
                        </Typography>
                        <BookingStatusChip status={booking.status} />
                      </Box>
                    }
                    secondary={`ID: ${booking.session_id}`}
                  />
                  <ListItemSecondaryAction>
                    {booking.status === "booked" && (
                      <CancelBookingButton
                        bookingId={booking.id}
                        onCancelled={load}
                      />
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
                {idx < bookings.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
