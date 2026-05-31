"use client";

import { useState } from "react";
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
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { alpha } from "@mui/material/styles";
import { brand } from "@/shared/theme";
import { bookingsApi } from "@/shared/api";
import type { SessionResponse } from "@/shared/api";

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
  session:  SessionResponse;
  onBook:   (sessionId: string) => void;
  booking:  boolean;
  booked:   boolean;
}

function SessionRow({ session, onBook, booking, booked }: SessionRowProps) {
  const available = session.capacity - session.booked_count;
  const isFull    = available <= 0;

  return (
    <Box sx={{
      borderRadius: "14px",
      border: `1px solid ${booked ? alpha(brand.sage, 0.5) : alpha(brand.line, 0.7)}`,
      p: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      backgroundColor: booked ? alpha(brand.sage, 0.04) : brand.ivory,
      opacity: booking ? 0.6 : 1,
      transition: "opacity 0.2s",
    }}>
      {/* Время + места */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <AccessTimeIcon sx={{ fontSize: 15, color: brand.cocoaSoft }} />
          <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "15px", color: brand.cocoa }}>
            {fmtTime(session.starts_at)} — {fmtTime(session.ends_at)}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <PeopleOutlineIcon sx={{ fontSize: 14, color: brand.cocoaSoft }} />
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: isFull ? brand.terracotta : brand.cocoaSoft }}>
            {isFull
              ? "Мест нет"
              : `Свободно ${available} из ${session.capacity}`}
          </Typography>
        </Box>
      </Box>

      {/* Кнопка */}
      {booked ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 18, color: brand.sage }} />
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: brand.sage }}>
            Записан
          </Typography>
        </Box>
      ) : (
        <Button
          variant="contained"
          size="small"
          disabled={isFull || booking}
          onClick={() => onBook(session.id)}
          startIcon={booking ? <CircularProgress size={12} color="inherit" /> : undefined}
          sx={{
            backgroundColor: isFull ? alpha(brand.mute, 0.15) : brand.cocoa,
            color: isFull ? brand.mute : brand.ivory,
            borderRadius: "100px",
            fontFamily: "var(--font-body)", fontWeight: 600,
            fontSize: "12px", textTransform: "none",
            px: "16px", boxShadow: "none", flexShrink: 0,
            "&:hover": { backgroundColor: isFull ? alpha(brand.mute, 0.15) : brand.cocoaSoft, boxShadow: "none" },
            "&.Mui-disabled": { backgroundColor: alpha(brand.mute, 0.12), color: brand.mute },
          }}
        >
          {isFull ? "Мест нет" : "Забронировать"}
        </Button>
      )}
    </Box>
  );
}

// ─── DayBookingModal ──────────────────────────────────────────────────────────

interface DayBookingModalProps {
  open:     boolean;
  dateKey:  string | null;
  sessions: SessionResponse[];
  onClose:  () => void;
}

export function DayBookingModal({ open, dateKey, sessions, onClose }: DayBookingModalProps) {
  const [booking,   setBooking]   = useState<string | null>(null);
  const [bookedIds, setBookedIds] = useState<Set<string>>(new Set());
  const [error,     setError]     = useState<string | null>(null);
  const [sessionList, setSessionList] = useState<SessionResponse[]>(sessions);

  // Синхронизируем список сессий при открытии нового дня
  const [lastDateKey, setLastDateKey] = useState<string | null>(null);
  if (dateKey !== lastDateKey) {
    setLastDateKey(dateKey);
    setSessionList(sessions);
    setBookedIds(new Set());
    setError(null);
  }

  async function handleBook(sessionId: string) {
    setBooking(sessionId);
    setError(null);
    try {
      await bookingsApi.create(sessionId);
      setBookedIds((prev) => new Set(prev).add(sessionId));
      // Уменьшаем счётчик свободных мест локально
      setSessionList((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, booked_count: s.booked_count + 1 } : s,
        ),
      );
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { detail?: string } } })?.response?.status;
      const msg    = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      if (status === 409) {
        setError("Место уже занято или вы уже записаны на эту сессию");
      } else {
        setError(typeof msg === "string" ? msg : "Не удалось забронировать");
      }
    } finally {
      setBooking(null);
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
                fontWeight: 400, color: brand.cocoa, lineHeight: 1.1,
                textTransform: "capitalize",
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
                  onBook={handleBook}
                  booking={booking === session.id}
                  booked={bookedIds.has(session.id)}
                />
              ))
            )}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}
