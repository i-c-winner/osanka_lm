"use client";

import { useEffect, useState, useCallback } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import { sessionsApi, bookingsApi } from "@/shared/api";
import type { SessionResponse, BookingResponse } from "@/shared/api";
import { SessionCard } from "@/entities/session";
import { BookSessionButton } from "@/features/book-session";
import { PageLoader } from "@/shared/ui/PageLoader";
import { ErrorMessage } from "@/shared/ui/ErrorMessage";

export function SessionList() {
  const t = useTranslations("sessions");
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [myBookings, setMyBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessionsData, bookingsData] = await Promise.all([
        sessionsApi.list(),
        bookingsApi.list(),
      ]);
      setSessions(sessionsData);
      setMyBookings(bookingsData);
    } catch {
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageLoader />;
  if (error) return <ErrorMessage onRetry={load} />;

  const bookedSessionIds = new Set(
    myBookings
      .filter((b) => b.status !== "cancelled")
      .map((b) => b.session_id)
  );

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h5" fontWeight={600}>
          {t("title")}
        </Typography>
      </Grid>

      {sessions.map((session) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={session.id}>
          <SessionCard
            session={session}
            isBooked={bookedSessionIds.has(session.id)}
            action={
              session.status === "active" ? (
                <BookSessionButton
                  sessionId={session.id}
                  isBooked={bookedSessionIds.has(session.id)}
                  isFull={false}
                  onBooked={load}
                />
              ) : undefined
            }
          />
        </Grid>
      ))}

      {sessions.length === 0 && (
        <Grid size={12}>
          <Typography color="text.secondary">{t("title")}</Typography>
        </Grid>
      )}
    </Grid>
  );
}
