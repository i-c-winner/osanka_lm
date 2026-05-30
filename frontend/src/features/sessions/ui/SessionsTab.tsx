"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Fade from "@mui/material/Fade";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Modal from "@mui/material/Modal";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { brand } from "@/shared/theme";
import { sessionsApi, locationsApi, daysApi, usersApi } from "@/shared/api";
import type { DayResponse, LocationResponse, MeResponse, SessionResponse } from "@/shared/api";
import { buildGrid, DOW_RU, MONTH_RU, toISO } from "@/shared/lib/calendar";

// ─── Константы ───────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  active:    brand.sage,
  completed: brand.mute,
  cancelled: brand.terracotta,
};

const CELL_SX = {
  fontFamily: "var(--font-body)",
  fontSize: "13px",
  color: brand.cocoa,
  borderBottom: `1px solid ${alpha(brand.line, 0.5)}`,
  py: "12px",
  px: "16px",
};

const HEAD_CELL_SX = {
  ...CELL_SX,
  fontWeight: 600,
  fontSize: "11px",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: brand.mute,
  backgroundColor: alpha(brand.cream, 0.5),
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function shortId(id: string | null | undefined) {
  return id ? id.slice(0, 8) + "…" : "—";
}

// ─── Модалка создания ─────────────────────────────────────────────────────────

interface CreateSessionModalProps {
  open: boolean;
  onClose: () => void;
  availableDays: DayResponse[];
  locations: LocationResponse[];
  trainers: MeResponse[];
  onCreated: (s: SessionResponse) => void;
}

function CreateSessionModal({ open, onClose, availableDays, locations, trainers, onCreated }: CreateSessionModalProps) {
  const now = new Date();
  const [step, setStep] = useState<"calendar" | "form">("calendar");
  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<DayResponse | null>(null);
  const [form, setForm] = useState({ startTime: "09:00", endTime: "10:00", capacity: "10", status: "active", location_id: "", trainer_id: "" });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  useEffect(() => {
    if (!open) { setStep("calendar"); setSelectedDay(null); setError(null); }
  }, [open]);

  const availableSet = useMemo(
    () => new Map(availableDays.map((d) => [d.date, d])),
    [availableDays],
  );

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDay) return;
    setSaving(true);
    setError(null);
    try {
      const created = await sessionsApi.create({
        day_id:      selectedDay.id,
        starts_at:   `${selectedDay.date}T${form.startTime}:00`,
        ends_at:     `${selectedDay.date}T${form.endTime}:00`,
        capacity:    Number(form.capacity),
        status:      form.status,
        location_id: form.location_id || undefined,
        trainer_id:  form.trainer_id  || undefined,
      });
      onCreated(created);
      onClose();
    } catch (err: unknown) {
      const res = (err as { response?: { status?: number; data?: { detail?: { code?: string; starts_at?: string; ends_at?: string } } } })?.response;
      if (res?.status === 409 && res.data?.detail?.code === "session_conflict") {
        const d = res.data.detail;
        const from = d.starts_at ? new Date(d.starts_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) : "";
        const to   = d.ends_at   ? new Date(d.ends_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) : "";
        setError(`Сессия занята: на этой локации уже есть занятие ${from}–${to}`);
      } else {
        setError("Ошибка при создании сессии");
      }
    } finally {
      setSaving(false);
    }
  }

  const grid = buildGrid(calYear, calMonth);
  const inputSx = { "& .MuiInputBase-input": { fontFamily: "var(--font-body)", fontSize: "13px" } };

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Fade in={open}>
        <Box sx={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95vw", sm: step === "calendar" ? 420 : 440 },
          backgroundColor: brand.ivory, borderRadius: "22px",
          border: `1px solid ${alpha(brand.line, 0.7)}`,
          boxShadow: `0 24px 64px -16px ${alpha(brand.cocoa, 0.25)}`,
          p: "28px", outline: "none", maxHeight: "90vh", overflowY: "auto",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "16px" }}>
            <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 400, color: brand.cocoa }}>
              {step === "calendar" ? "Выберите день" : "Новая сессия"}
            </Typography>
            <IconButton size="small" onClick={onClose} sx={{ color: brand.mute }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {step === "calendar" ? (
            <>
              <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: brand.mute, mb: "16px" }}>
                Доступны только дни из таблицы расписания
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "12px" }}>
                <Box onClick={() => { if (calMonth === 0) { setCalYear(y => y-1); setCalMonth(11); } else setCalMonth(m => m-1); }}
                  sx={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${alpha(brand.line,0.8)}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", "&:hover": { backgroundColor: alpha(brand.line,0.4) } }}>
                  <Typography sx={{ fontSize: "14px", color: brand.cocoa, lineHeight: 1 }}>‹</Typography>
                </Box>
                <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "17px", color: brand.cocoa }}>
                  {MONTH_RU[calMonth]} {calYear}
                </Typography>
                <Box onClick={() => { if (calMonth === 11) { setCalYear(y => y+1); setCalMonth(0); } else setCalMonth(m => m+1); }}
                  sx={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${alpha(brand.line,0.8)}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", "&:hover": { backgroundColor: alpha(brand.line,0.4) } }}>
                  <Typography sx={{ fontSize: "14px", color: brand.cocoa, lineHeight: 1 }}>›</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: "4px" }}>
                {DOW_RU.map((d) => (
                  <Typography key={d} sx={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, color: brand.mute, textAlign: "center", py: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{d}</Typography>
                ))}
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px" }}>
                {grid.map((date, i) => {
                  if (!date) return <Box key={i} />;
                  const iso = toISO(date);
                  const dayRecord = availableSet.get(iso);
                  const isAvailable = !!dayRecord;
                  const isToday = iso === toISO(now);
                  const isSelected = selectedDay?.date === iso;
                  return (
                    <Box key={iso} onClick={() => isAvailable && dayRecord && setSelectedDay(dayRecord)}
                      sx={{
                        height: 40, borderRadius: "10px",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px",
                        cursor: isAvailable ? "pointer" : "default",
                        backgroundColor: isSelected ? brand.terracotta : isAvailable ? alpha(brand.cocoa, 0.08) : "transparent",
                        border: isToday ? `1px solid ${brand.terracotta}` : "1px solid transparent",
                        transition: "all 0.12s ease",
                        "&:hover": isAvailable && !isSelected ? { backgroundColor: alpha(brand.cocoa, 0.15) } : {},
                      }}>
                      <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: isAvailable ? 600 : 400, color: isSelected ? "#fff" : isAvailable ? brand.cocoa : alpha(brand.cocoa, 0.22), lineHeight: 1 }}>
                        {date.getDate()}
                      </Typography>
                      {isAvailable && !isSelected && (
                        <Box sx={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: brand.terracotta }} />
                      )}
                    </Box>
                  );
                })}
              </Box>
              <Button fullWidth variant="contained" disabled={!selectedDay} onClick={() => setStep("form")}
                sx={{ mt: "20px", backgroundColor: brand.cocoa, color: brand.ivory, borderRadius: "10px", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "13px", textTransform: "none", boxShadow: "none", "&:hover": { backgroundColor: brand.cocoaSoft, boxShadow: "none" } }}>
                {selectedDay ? `Далее → ${new Date(selectedDay.date + "T00:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}` : "Выберите день"}
              </Button>
            </>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "10px 14px", borderRadius: "12px", backgroundColor: alpha(brand.cocoa, 0.06) }}>
                <Box>
                  <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, color: brand.mute, letterSpacing: "0.1em", textTransform: "uppercase", mb: "2px" }}>
                    День занятия
                  </Typography>
                  <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 600, color: brand.cocoa }}>
                    {selectedDay && new Date(selectedDay.date + "T00:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                  </Typography>
                </Box>
                <Button size="small" onClick={() => setStep("calendar")} sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: brand.terracottaDeep, textTransform: "none" }}>
                  Изменить
                </Button>
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <TextField label="Начало" type="time" value={form.startTime} onChange={set("startTime")} size="small" required sx={inputSx} InputLabelProps={{ shrink: true }} />
                <TextField label="Конец"  type="time" value={form.endTime}   onChange={set("endTime")}   size="small" required sx={inputSx} InputLabelProps={{ shrink: true }} />
              </Box>
              <TextField label="Вместимость" type="number" value={form.capacity} onChange={set("capacity")} size="small" required inputProps={{ min: 1 }} sx={inputSx} />
              <Select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} size="small" displayEmpty sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>
                {["active","completed","cancelled"].map((s) => (
                  <MenuItem key={s} value={s} sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>{s}</MenuItem>
                ))}
              </Select>
              <Select value={form.trainer_id} onChange={(e) => setForm(f => ({ ...f, trainer_id: e.target.value }))} size="small" displayEmpty sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>
                <MenuItem value="" sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.mute }}>Без тренера</MenuItem>
                {trainers.map((t) => {
                  const name = [t.first_name, t.last_name].filter(Boolean).join(" ") || t.telegram_username || t.telegram_id;
                  return <MenuItem key={t.id} value={t.id} sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>{name}</MenuItem>;
                })}
              </Select>
              <Select value={form.location_id} onChange={(e) => setForm(f => ({ ...f, location_id: e.target.value }))} size="small" displayEmpty sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>
                <MenuItem value="" sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.mute }}>Без локации</MenuItem>
                {locations.map((l) => (
                  <MenuItem key={l.id} value={l.id} sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>{l.name}</MenuItem>
                ))}
              </Select>
              {error && <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: brand.terracotta }}>{error}</Typography>}
              <Button type="submit" variant="contained" disabled={saving}
                startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
                sx={{ backgroundColor: brand.cocoa, color: brand.ivory, borderRadius: "10px", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "13px", textTransform: "none", boxShadow: "none", "&:hover": { backgroundColor: brand.cocoaSoft, boxShadow: "none" } }}>
                Создать сессию
              </Button>
            </Box>
          )}
        </Box>
      </Fade>
    </Modal>
  );
}

// ─── SessionsTab ──────────────────────────────────────────────────────────────

export function SessionsTab() {
  const [sessions,    setSessions]    = useState<SessionResponse[]>([]);
  const [locationMap, setLocationMap] = useState<Record<string, string>>({});
  const [trainerMap,  setTrainerMap]  = useState<Record<string, string>>({});
  const [dayMap,      setDayMap]      = useState<Record<string, string>>({});
  const [locations,   setLocations]   = useState<LocationResponse[]>([]);
  const [trainers,    setTrainers]    = useState<MeResponse[]>([]);
  const [availableDays, setAvailableDays] = useState<DayResponse[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, locs, days, users] = await Promise.all([
        sessionsApi.list(),
        locationsApi.list(true),
        daysApi.list(),
        usersApi.getAll(),
      ]);
      setSessions(data);
      setLocations(locs);
      setLocationMap(Object.fromEntries(locs.map((l) => [l.id, l.name])));
      setAvailableDays(days);
      setDayMap(Object.fromEntries(
        days.map((d) => [
          d.id,
          new Date(d.date + "T00:00:00").toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" }),
        ])
      ));
      const trainerList = users.filter((u) => u.roles.includes("trainer"));
      setTrainers(trainerList);
      setTrainerMap(Object.fromEntries(
        trainerList.map((u) => [
          u.id,
          [u.first_name, u.last_name].filter(Boolean).join(" ") || u.telegram_username || u.telegram_id,
        ])
      ));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await sessionsApi.delete(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  async function handleStatusChange(id: string, status: string) {
    setUpdating(id);
    try {
      const updated = await sessionsApi.update(id, { status });
      setSessions((prev) => prev.map((s) => s.id === updated.id ? { ...s, status: updated.status } : s));
    } finally {
      setUpdating(null);
    }
  }

  async function handleTrainerChange(id: string, trainer_id: string) {
    setUpdating(id);
    try {
      const updated = await sessionsApi.update(id, { trainer_id: trainer_id || undefined });
      setSessions((prev) => prev.map((s) => s.id === updated.id ? { ...s, trainer_id: updated.trainer_id } : s));
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: "40px" }}>
        <CircularProgress size={28} sx={{ color: brand.terracotta }} />
      </Box>
    );
  }

  const COLS = ["Начало", "Конец", "Статус", "Вместимость", "Локация", "Тренер", "Дата занятия", ""];

  return (
    <Box>
      <CreateSessionModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        availableDays={availableDays}
        locations={locations}
        trainers={trainers}
        onCreated={(s) => setSessions(prev => [s, ...prev])}
      />

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "20px", flexWrap: "wrap", gap: "12px" }}>
        <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 400, color: brand.cocoa }}>
          Сессии{" "}
          <Box component="span" sx={{ fontFamily: "var(--font-body)", fontSize: "14px", color: brand.mute, fontWeight: 400 }}>
            ({sessions.length})
          </Box>
        </Typography>
        <Button onClick={() => setCreateOpen(true)} variant="contained" startIcon={<AddIcon />}
          sx={{ backgroundColor: brand.cocoa, color: brand.ivory, borderRadius: "10px", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "13px", textTransform: "none", boxShadow: "none", "&:hover": { backgroundColor: brand.cocoaSoft, boxShadow: "none" } }}>
          Добавить сессию
        </Button>
      </Box>

      <TableContainer sx={{ borderRadius: "14px", border: `1px solid ${alpha(brand.line, 0.6)}`, overflow: "hidden" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {COLS.map((h) => <TableCell key={h} sx={HEAD_CELL_SX}>{h}</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={COLS.length} sx={{ ...CELL_SX, textAlign: "center", color: brand.mute, py: "24px" }}>
                  Нет сессий
                </TableCell>
              </TableRow>
            )}
            {sessions.map((s) => {
              const isDeleting = deleting === s.id;
              const isUpdating = updating === s.id;
              const color = STATUS_COLOR[s.status] ?? brand.mute;
              return (
                <TableRow key={s.id} sx={{ opacity: isDeleting || isUpdating ? 0.4 : 1, transition: "opacity 0.2s", "&:last-child td": { borderBottom: "none" }, "&:hover td": { backgroundColor: alpha(brand.cream, 0.4) } }}>
                  <TableCell sx={{ ...CELL_SX, whiteSpace: "nowrap" }}>{fmt(s.starts_at)}</TableCell>
                  <TableCell sx={{ ...CELL_SX, whiteSpace: "nowrap", color: brand.mute }}>{fmt(s.ends_at)}</TableCell>

                  {/* Статус */}
                  <TableCell sx={{ ...CELL_SX, minWidth: 130 }}>
                    <Select value={s.status} disabled={isUpdating || isDeleting} onChange={(e) => handleStatusChange(s.id, e.target.value)} size="small" variant="outlined"
                      sx={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, color, "& .MuiOutlinedInput-notchedOutline": { borderColor: alpha(color, 0.4) }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: color }, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: color }, "& .MuiSelect-select": { py: "4px", px: "10px" }, backgroundColor: alpha(color, 0.07), borderRadius: "6px" }}>
                      {Object.keys(STATUS_COLOR).map((st) => (
                        <MenuItem key={st} value={st} sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>{st}</MenuItem>
                      ))}
                    </Select>
                  </TableCell>

                  <TableCell sx={{ ...CELL_SX, textAlign: "center" }}>{s.capacity}</TableCell>

                  {/* Локация */}
                  <TableCell sx={CELL_SX}>
                    {s.location_id ? (locationMap[s.location_id] ?? "—") : <Box component="span" sx={{ color: brand.mute }}>—</Box>}
                  </TableCell>

                  {/* Тренер */}
                  <TableCell sx={{ ...CELL_SX, minWidth: 150 }}>
                    <Select value={s.trainer_id ?? ""} disabled={isUpdating || isDeleting} onChange={(e) => handleTrainerChange(s.id, e.target.value)} size="small" displayEmpty variant="outlined"
                      sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: brand.cocoa, "& .MuiOutlinedInput-notchedOutline": { borderColor: alpha(brand.line, 0.8) }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: brand.cocoa }, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: brand.terracotta }, "& .MuiSelect-select": { py: "4px", px: "10px" } }}>
                      <MenuItem value="" sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.mute }}>Без тренера</MenuItem>
                      {trainers.map((t) => (
                        <MenuItem key={t.id} value={t.id} sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>{trainerMap[t.id] ?? t.telegram_id}</MenuItem>
                      ))}
                    </Select>
                  </TableCell>

                  {/* Дата */}
                  <TableCell sx={{ ...CELL_SX, whiteSpace: "nowrap" }}>
                    {s.day_id ? (dayMap[s.day_id] ?? shortId(s.day_id)) : <Box component="span" sx={{ color: brand.mute }}>—</Box>}
                  </TableCell>

                  {/* Удалить */}
                  <TableCell sx={{ ...CELL_SX, width: 48, pr: "8px" }}>
                    <IconButton size="small" disabled={isDeleting} onClick={() => handleDelete(s.id)}
                      sx={{ color: brand.mute, "&:hover": { color: brand.terracotta, backgroundColor: alpha(brand.terracotta, 0.08) } }}>
                      <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
