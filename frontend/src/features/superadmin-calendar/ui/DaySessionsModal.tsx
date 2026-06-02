"use client";

import { useEffect, useState } from "react";
import Modal        from "@mui/material/Modal";
import Fade         from "@mui/material/Fade";
import Box          from "@mui/material/Box";
import Typography   from "@mui/material/Typography";
import IconButton   from "@mui/material/IconButton";
import Divider      from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon    from "@mui/icons-material/Close";
import AccessTimeIcon       from "@mui/icons-material/AccessTime";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PersonOutlineIcon    from "@mui/icons-material/PersonOutline";
import PeopleOutlineIcon    from "@mui/icons-material/PeopleOutline";
import { alpha } from "@mui/material/styles";
import { brand } from "@/shared/theme";
import { bookingsApi, usersApi, locationsApi } from "@/shared/api";
import type { SessionResponse, BookingResponse, UserResponse, LocationResponse } from "@/shared/api";

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

function userName(user: UserResponse | undefined): string {
  if (!user) return "—";
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.telegram_username || "—";
}

// ─── SessionCard ─────────────────────────────────────────────────────────────

interface SessionCardProps {
  session:   SessionResponse;
  bookings:  BookingResponse[];
  usersMap:  Record<string, UserResponse>;
  locationsMap: Record<string, LocationResponse>;
}

function SessionCard({ session, bookings, usersMap, locationsMap }: SessionCardProps) {
  const trainer  = session.trainer_id ? usersMap[session.trainer_id] : undefined;
  const location = session.location_id ? locationsMap[session.location_id] : undefined;
  // Оставляем только последнюю бронь на каждого пользователя
  const latestByUser = Object.values(
    bookings.reduce<Record<string, BookingResponse>>((acc, b) => {
      const prev = acc[b.user_id];
      if (!prev || b.booked_at > prev.booked_at) acc[b.user_id] = b;
      return acc;
    }, {})
  );
  const activeBookings    = latestByUser.filter((b) => b.status !== "cancelled");
  const cancelledBookings = latestByUser.filter((b) => b.status === "cancelled");

  const STATUS_LABEL: Record<string, string> = {
    active:    "Активна",
    completed: "Завершена",
    cancelled: "Отменена",
  };
  const STATUS_COLOR: Record<string, string> = {
    active:    brand.sage,
    completed: brand.mute,
    cancelled: brand.terracotta,
  };

  return (
    <Box sx={{
      borderRadius: "14px",
      border: `1px solid ${alpha(brand.line, 0.7)}`,
      p: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    }}>
      {/* Шапка: время + статус */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <AccessTimeIcon sx={{ fontSize: 15, color: brand.cocoaSoft }} />
          <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "14px", color: brand.cocoa }}>
            {fmtTime(session.starts_at)} — {fmtTime(session.ends_at)}
          </Typography>
        </Box>
        <Box sx={{
          px: "8px", py: "2px", borderRadius: "100px",
          backgroundColor: alpha(STATUS_COLOR[session.status] ?? brand.mute, 0.12),
        }}>
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 600, color: STATUS_COLOR[session.status] ?? brand.mute }}>
            {STATUS_LABEL[session.status] ?? session.status}
          </Typography>
        </Box>
      </Box>

      {/* Локация */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <LocationOnOutlinedIcon sx={{ fontSize: 15, color: brand.cocoaSoft }} />
        <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.cocoaSoft }}>
          {location ? `${location.name}${location.address ? `, ${location.address}` : ""}` : "Локация не указана"}
        </Typography>
      </Box>

      {/* Тренер */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <PersonOutlineIcon sx={{ fontSize: 15, color: brand.cocoaSoft }} />
        <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.cocoaSoft }}>
          Тренер:{" "}
          <Box component="span" sx={{ color: brand.cocoa, fontWeight: 500 }}>
            {userName(trainer)}
          </Box>
        </Typography>
      </Box>

      {/* Клиенты */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mb: "8px" }}>
          <PeopleOutlineIcon sx={{ fontSize: 15, color: brand.cocoaSoft }} />
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.cocoaSoft }}>
            Записи{" "}
            <Box component="span" sx={{ color: brand.mute }}>
              ({activeBookings.length} / {session.capacity})
            </Box>
            {cancelledBookings.length > 0 && (
              <Box component="span" sx={{ color: brand.terracotta, ml: "6px" }}>
                · {cancelledBookings.length} отменено
              </Box>
            )}
          </Typography>
        </Box>

        {bookings.length === 0 ? (
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: brand.mute, pl: "21px" }}>
            Нет записей
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", pl: "21px" }}>
            {activeBookings.map((b) => {
              const user = usersMap[b.user_id];
              return (
                <Box key={b.id} sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: brand.sage, flexShrink: 0 }} />
                  <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.cocoa }}>
                    {userName(user)}
                    {user?.telegram_username && (
                      <Box component="span" sx={{ color: brand.mute, ml: "6px" }}>@{user.telegram_username}</Box>
                    )}
                  </Typography>
                </Box>
              );
            })}
            {cancelledBookings.map((b) => {
              const user = usersMap[b.user_id];
              return (
                <Box key={b.id} sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: alpha(brand.terracotta, 0.4), flexShrink: 0 }} />
                  <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.mute, textDecoration: "line-through" }}>
                    {userName(user)}
                    {user?.telegram_username && (
                      <Box component="span" sx={{ ml: "6px" }}>@{user.telegram_username}</Box>
                    )}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ─── DaySessionsModal ─────────────────────────────────────────────────────────

interface DaySessionsModalProps {
  open:     boolean;
  dateKey:  string | null;
  sessions: SessionResponse[];
  onClose:  () => void;
}

interface ModalData {
  bookingsBySession: Record<string, BookingResponse[]>;
  usersMap:          Record<string, UserResponse>;
  locationsMap:      Record<string, LocationResponse>;
}

export function DaySessionsModal({ open, dateKey, sessions, onClose }: DaySessionsModalProps) {
  const [data,    setData]    = useState<ModalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!open || sessions.length === 0) { setData(null); return; }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([bookingsApi.list(), usersApi.getAll(), locationsApi.list(true)])
      .then(([bookings, users, locations]) => {
        if (cancelled) return;

        const sessionIds = new Set(sessions.map((s) => s.id));

        const bookingsBySession: Record<string, BookingResponse[]> = {};
        for (const b of bookings) {
          if (!sessionIds.has(b.session_id)) continue;
          if (!bookingsBySession[b.session_id]) bookingsBySession[b.session_id] = [];
          bookingsBySession[b.session_id].push(b);
        }

        const usersMap: Record<string, UserResponse> = {};
        for (const u of users) usersMap[u.id] = u;

        const locationsMap: Record<string, LocationResponse> = {};
        for (const l of locations) locationsMap[l.id] = l;

        setData({ bookingsBySession, usersMap, locationsMap });
      })
      .catch(() => { if (!cancelled) setError("Не удалось загрузить данные"); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [open, sessions]);

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Fade in={open}>
        <Box sx={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "calc(100vw - 32px)", sm: 560 },
          maxHeight: "80vh",
          backgroundColor: brand.ivory,
          borderRadius: "20px",
          boxShadow: `0 24px 48px -12px ${alpha(brand.cocoa, 0.22)}`,
          display: "flex",
          flexDirection: "column",
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
                Расписание
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 400, color: brand.cocoa, lineHeight: 1.1, textTransform: "capitalize" }}>
                {dateKey ? fmtDate(dateKey) : ""}
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{ color: brand.cocoaSoft, "&:hover": { backgroundColor: alpha(brand.line, 0.5) } }}
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          {/* Контент */}
          <Box sx={{ overflowY: "auto", p: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: "32px" }}>
                <CircularProgress size={28} sx={{ color: brand.terracotta }} />
              </Box>
            )}

            {error && !loading && (
              <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.terracotta, textAlign: "center", py: "24px" }}>
                {error}
              </Typography>
            )}

            {!loading && !error && data && sessions.length === 0 && (
              <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.mute, textAlign: "center", py: "24px" }}>
                В этот день нет сессий
              </Typography>
            )}

            {!loading && !error && data && sessions.map((session, i) => (
              <Box key={session.id}>
                {i > 0 && <Divider sx={{ borderColor: alpha(brand.line, 0.5), mb: "12px" }} />}
                <SessionCard
                  session={session}
                  bookings={data.bookingsBySession[session.id] ?? []}
                  usersMap={data.usersMap}
                  locationsMap={data.locationsMap}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}
