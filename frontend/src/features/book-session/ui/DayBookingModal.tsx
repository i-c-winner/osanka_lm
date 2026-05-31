"use client";

import { useEffect, useState } from "react";
import Modal            from "@mui/material/Modal";
import Fade             from "@mui/material/Fade";
import Box              from "@mui/material/Box";
import Typography       from "@mui/material/Typography";
import Button           from "@mui/material/Button";
import IconButton       from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon              from "@mui/icons-material/Close";
import AccessTimeIcon         from "@mui/icons-material/AccessTime";
import PeopleOutlineIcon      from "@mui/icons-material/PeopleOutline";
import CheckCircleIcon        from "@mui/icons-material/CheckCircle";
import { alpha } from "@mui/material/styles";
import { brand } from "@/shared/theme";
import { bookingsApi } from "@/shared/api";
import type { SessionResponse, BookingResponse } from "@/shared/api";

// ─── Утилиты ─────────────────────────────────────────────────────────────────

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(dateKey: string) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("ru-RU", {
    weekday: "long", day: "numeric", month: "long",
  });
}

// ─── SessionRow ───────────────────────────────────────────────────────────────

interface SessionRowProps {
  session:    SessionResponse;
  bookingId:  string | null; // id брони если записан
  onBook:     (sessionId: string) => void;
  onCancel:   (bookingId: string, sessionId: string) => void;
  processing: boolean;
}

function SessionRow({ session, bookingId, onBook, onCancel, processing }: SessionRowProps) {
  const isBooked  = bookingId != null;
  const available = session.capacity - session.booked_count;
  const isFull    = available <= 0 && !isBooked;

  return (
    <Box sx={{
      borderRadius: "14px",
      border: `1px solid ${isBooked ? alpha(brand.sage, 0.5) : alpha(brand.line, 0.7)}`,
      p: "16px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
      backgroundColor: isBooked ? alpha(brand.sage, 0.04) : brand.ivory,
      opacity: processing ? 0.6 : 1,
      transition: "opacity 0.2s",
    }}>
      {/* Время + места */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <AccessTimeIcon sx={{ fontSize: 15, color: brand.cocoaSoft }} />
          <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "15px", color: brand.cocoa }}>
            {fmtTime(session.starts_at)} — {fmtTime(session.ends_at)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <PeopleOutlineIcon sx={{ fontSize: 14, color: brand.cocoaSoft }} />
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: isFull ? brand.terracotta : brand.cocoaSoft }}>
            {isFull ? "Мест нет" : `Свободно ${available} из ${session.capacity}`}
          </Typography>
        </Box>
      </Box>

      {/* Галочка + кнопка */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        {isBooked && (
          <CheckCircleIcon sx={{ fontSize: 20, color: brand.sage }} />
        )}

        {isBooked ? (
          <Button
            variant="outlined"
            size="small"
            disabled={processing}
            onClick={() => onCancel(bookingId!, session.id)}
            startIcon={processing ? <CircularProgress size={12} color="inherit" /> : undefined}
            sx={{
              borderColor: alpha(brand.terracotta, 0.5),
              color: brand.terracotta,
              borderRadius: "100px",
              fontFamily: "var(--font-body)", fontWeight: 600,
              fontSize: "12px", textTransform: "none",
              px: "14px", boxShadow: "none",
              "&:hover": { borderColor: brand.terracotta, backgroundColor: alpha(brand.terracotta, 0.06), boxShadow: "none" },
            }}
          >
            {processing ? "..." : "Отменить"}
          </Button>
        ) : (
          <Button
            variant="contained"
            size="small"
            disabled={isFull || processing}
            onClick={() => onBook(session.id)}
            startIcon={processing ? <CircularProgress size={12} color="inherit" /> : undefined}
            sx={{
              backgroundColor: isFull ? alpha(brand.mute, 0.15) : brand.cocoa,
              color: isFull ? brand.mute : brand.ivory,
              borderRadius: "100px",
              fontFamily: "var(--font-body)", fontWeight: 600,
              fontSize: "12px", textTransform: "none",
              px: "16px", boxShadow: "none",
              "&:hover": { backgroundColor: isFull ? alpha(brand.mute, 0.15) : brand.cocoaSoft, boxShadow: "none" },
              "&.Mui-disabled": { backgroundColor: alpha(brand.mute, 0.12), color: brand.mute },
            }}
          >
            {isFull ? "Мест нет" : "Забронировать"}
          </Button>
        )}
      </Box>
    </Box>
  );
}

// ─── DayBookingModal ──────────────────────────────────────────────────────────

interface DayBookingModalProps {
  open:       boolean;
  dateKey:    string | null;
  sessions:   SessionResponse[];
  onClose:    () => void;
  onBooked?:    (sessionId: string) => void;
  onCancelled?: (sessionId: string) => void;
}

export function DayBookingModal({ open, dateKey, sessions, onClose, onBooked, onCancelled }: DayBookingModalProps) {
  const [processing,   setProcessing]   = useState<string | null>(null);
  // sessionId → bookingId (активная бронь)
  const [bookingMap,   setBookingMap]   = useState<Record<string, string>>({});
  const [sessionList,  setSessionList]  = useState<SessionResponse[]>(sessions);
  const [error,        setError]        = useState<string | null>(null);

  // При открытии загружаем актуальные брони пользователя для этих сессий
  useEffect(() => {
    if (!open || sessions.length === 0) {
      setSessionList(sessions);
      setBookingMap({});
      setError(null);
      return;
    }
    setSessionList(sessions);
    setError(null);

    bookingsApi.listMy()
      .then((bookings: BookingResponse[]) => {
        const sessionIds = new Set(sessions.map((s) => s.id));
        const map: Record<string, string> = {};
        for (const b of bookings) {
          if (sessionIds.has(b.session_id) && b.status === "booked") {
            map[b.session_id] = b.id;
          }
        }
        setBookingMap(map);
      })
      .catch(() => {/* тихо */});
  }, [open, dateKey]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleBook(sessionId: string) {
    setProcessing(sessionId);
    setError(null);
    try {
      const booking = await bookingsApi.create(sessionId);
      setBookingMap((prev) => ({ ...prev, [sessionId]: booking.id }));
      setSessionList((prev) =>
        prev.map((s) => s.id === sessionId ? { ...s, booked_count: s.booked_count + 1 } : s),
      );
      onBooked?.(sessionId);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { detail?: string } } })?.response?.status;
      const msg    = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(status === 409 ? "Вы уже записаны или мест нет" : (typeof msg === "string" ? msg : "Не удалось забронировать"));
    } finally {
      setProcessing(null);
    }
  }

  async function handleCancel(bookingId: string, sessionId: string) {
    setProcessing(sessionId);
    setError(null);
    try {
      await bookingsApi.cancel(bookingId);
      setBookingMap((prev) => {
        const next = { ...prev };
        delete next[sessionId];
        return next;
      });
      setSessionList((prev) =>
        prev.map((s) => s.id === sessionId ? { ...s, booked_count: Math.max(0, s.booked_count - 1) } : s),
      );
      onCancelled?.(sessionId);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(typeof msg === "string" ? msg : "Не удалось отменить запись");
    } finally {
      setProcessing(null);
    }
  }

  const active = sessionList.filter((s) => s.status === "active");

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Fade in={open}>
        <Box sx={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "calc(100vw - 32px)", sm: 480 },
          maxHeight: "80vh",
          backgroundColor: brand.ivory,
          borderRadius: "20px",
          boxShadow: `0 24px 48px -12px ${alpha(brand.cocoa, 0.22)}`,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Шапка */}
          <Box sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            px: "24px", pt: "20px", pb: "16px",
            borderBottom: `1px solid ${alpha(brand.line, 0.7)}`,
            flexShrink: 0,
          }}>
            <Box>
              <Typography className="eyebrow" sx={{ display: "block", mb: "2px" }}>
                Запись на занятие
              </Typography>
              <Typography sx={{
                fontFamily: "var(--font-display)", fontSize: "18px",
                fontWeight: 400, color: brand.cocoa, lineHeight: 1.1, textTransform: "capitalize",
              }}>
                {dateKey ? fmtDate(dateKey) : ""}
              </Typography>
            </Box>
            <IconButton size="small" onClick={onClose} sx={{ color: brand.cocoaSoft, "&:hover": { backgroundColor: alpha(brand.line, 0.5) } }}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          {/* Контент */}
          <Box sx={{ overflowY: "auto", p: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {error && (
              <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.terracotta, mb: "4px" }}>
                {error}
              </Typography>
            )}

            {active.length === 0 ? (
              <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.mute, textAlign: "center", py: "24px" }}>
                В этот день нет доступных занятий
              </Typography>
            ) : (
              active.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  bookingId={bookingMap[session.id] ?? null}
                  onBook={handleBook}
                  onCancel={handleCancel}
                  processing={processing === session.id}
                />
              ))
            )}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}
