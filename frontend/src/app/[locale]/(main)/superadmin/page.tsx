"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Switch from "@mui/material/Switch";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import { alpha } from "@mui/material/styles";
import { brand } from "@/shared/theme";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { useMe } from "@/features/me/model/useMe";
import { usersApi, locationsApi, sessionsApi, daysApi } from "@/shared/api";
import type { MeResponse, LocationResponse, SessionResponse, DayResponse } from "@/shared/api";

// ─── Таблица пользователей ────────────────────────────────────────────────────

const ROLES = ["guest", "client", "user", "trainer", "admin"];

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

function UsersTab() {
  const [users, setUsers] = useState<MeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleActiveChange(user: MeResponse, value: boolean) {
    setUpdating(user.id);
    try {
      const updated = await usersApi.setActive(user.id, value);
      setUsers((prev) => prev.map((u) => u.id === updated.id ? { ...u, is_active: updated.is_active } : u));
    } finally {
      setUpdating(null);
    }
  }

  async function handleRoleChange(user: MeResponse, role: string) {
    setUpdating(user.id);
    try {
      const updated = await usersApi.changeRole(user.id, role);
      setUsers((prev) => prev.map((u) => u.id === updated.id ? { ...u, roles: [role] } : u));
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

  return (
    <Box>
      <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 400, color: brand.cocoa, mb: "20px" }}>
        Пользователи{" "}
        <Box component="span" sx={{ fontFamily: "var(--font-body)", fontSize: "14px", color: brand.mute, fontWeight: 400 }}>
          ({users.length})
        </Box>
      </Typography>

      <TableContainer sx={{ borderRadius: "14px", border: `1px solid ${alpha(brand.line, 0.6)}`, overflow: "hidden" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {["Имя", "Telegram", "Телефон", "Роль", "Активен", "Создан"].map((h) => (
                <TableCell key={h} sx={HEAD_CELL_SX}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => {
              const isUpdating = updating === user.id;
              const currentRole = user.roles?.[0] ?? "client";
              const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || "—";

              return (
                <TableRow
                  key={user.id}
                  sx={{
                    opacity: isUpdating ? 0.5 : 1,
                    transition: "opacity 0.2s",
                    "&:last-child td": { borderBottom: "none" },
                    "&:hover td": { backgroundColor: alpha(brand.cream, 0.4) },
                  }}
                >
                  {/* Имя */}
                  <TableCell sx={CELL_SX}>
                    <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 500, color: brand.cocoa }}>
                      {name}
                    </Typography>
                    <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "11px", color: brand.mute, mt: "1px" }}>
                      {user.telegram_id}
                    </Typography>
                  </TableCell>

                  {/* Telegram username */}
                  <TableCell sx={CELL_SX}>
                    {user.telegram_username ? `@${user.telegram_username}` : "—"}
                  </TableCell>

                  {/* Телефон */}
                  <TableCell sx={CELL_SX}>{user.phone ?? "—"}</TableCell>

                  {/* Роль */}
                  <TableCell sx={{ ...CELL_SX, minWidth: 140 }}>
                    {currentRole === "superadmin" ? (
                      <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.terracottaDeep, fontWeight: 600 }}>
                        superadmin
                      </Typography>
                    ) : (
                      <Select
                        value={currentRole}
                        disabled={isUpdating}
                        onChange={(e) => handleRoleChange(user, e.target.value)}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontFamily: "var(--font-body)",
                          fontSize: "12px",
                          color: brand.cocoa,
                          "& .MuiOutlinedInput-notchedOutline": { borderColor: alpha(brand.line, 0.8) },
                          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: brand.cocoa },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: brand.terracotta },
                          "& .MuiSelect-select": { py: "5px", px: "10px" },
                        }}
                      >
                        {ROLES.map((r) => (
                          <MenuItem key={r} value={r} sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>
                            {r}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  </TableCell>

                  {/* is_active */}
                  <TableCell sx={CELL_SX}>
                    <Switch
                      checked={user.is_active}
                      disabled={isUpdating}
                      onChange={(e) => handleActiveChange(user, e.target.checked)}
                      size="small"
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": { color: brand.sage },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: brand.sage },
                      }}
                    />
                  </TableCell>

                  {/* Дата */}
                  <TableCell sx={{ ...CELL_SX, whiteSpace: "nowrap", color: brand.mute }}>
                    {new Date(user.created_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" })}
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

// ─── Заглушки остальных вкладок ───────────────────────────────────────────────

function LocaleTab() {
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", address: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await locationsApi.list(true);
      setLocations(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleToggleActive(loc: LocationResponse) {
    setToggling(loc.id);
    try {
      const updated = await locationsApi.update(loc.id, { is_active: !loc.is_active });
      setLocations((prev) => prev.map((l) => l.id === updated.id ? updated : l));
    } finally {
      setToggling(null);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await locationsApi.delete(id);
      setLocations((prev) => prev.filter((l) => l.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setAdding(true);
    try {
      const created = await locationsApi.create({ name: form.name.trim(), address: form.address.trim() || undefined });
      setLocations((prev) => [...prev, created]);
      setForm({ name: "", address: "" });
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: "40px" }}>
        <CircularProgress size={28} sx={{ color: brand.terracotta }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 400, color: brand.cocoa, mb: "20px" }}>
        Локации{" "}
        <Box component="span" sx={{ fontFamily: "var(--font-body)", fontSize: "14px", color: brand.mute, fontWeight: 400 }}>
          ({locations.length})
        </Box>
      </Typography>

      {/* Форма добавления */}
      <Box
        component="form"
        onSubmit={handleAdd}
        sx={{
          display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end",
          mb: "20px", p: "20px", borderRadius: "14px",
          border: `1px solid ${alpha(brand.line, 0.7)}`,
          backgroundColor: alpha(brand.cream, 0.4),
        }}
      >
        <TextField
          label="Название"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          size="small"
          required
          disabled={adding}
          sx={{ flex: "1 1 180px", "& .MuiInputBase-input": { fontFamily: "var(--font-body)", fontSize: "13px" } }}
        />
        <TextField
          label="Адрес"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          size="small"
          disabled={adding}
          sx={{ flex: "2 1 240px", "& .MuiInputBase-input": { fontFamily: "var(--font-body)", fontSize: "13px" } }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={adding || !form.name.trim()}
          startIcon={adding ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
          sx={{
            backgroundColor: brand.cocoa, color: brand.ivory, borderRadius: "10px",
            fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "13px",
            textTransform: "none", boxShadow: "none", whiteSpace: "nowrap",
            "&:hover": { backgroundColor: brand.cocoaSoft, boxShadow: "none" },
          }}
        >
          Добавить
        </Button>
      </Box>

      {/* Таблица */}
      <TableContainer sx={{ borderRadius: "14px", border: `1px solid ${alpha(brand.line, 0.6)}`, overflow: "hidden" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {["Название", "Адрес", "Активна", ""].map((h) => (
                <TableCell key={h} sx={HEAD_CELL_SX}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {locations.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} sx={{ ...CELL_SX, textAlign: "center", color: brand.mute, py: "24px" }}>
                  Нет локаций
                </TableCell>
              </TableRow>
            )}
            {locations.map((loc) => {
              const isDeleting = deleting === loc.id;
              const isToggling = toggling === loc.id;
              return (
                <TableRow
                  key={loc.id}
                  sx={{
                    opacity: isDeleting || isToggling ? 0.4 : 1, transition: "opacity 0.2s",
                    "&:last-child td": { borderBottom: "none" },
                    "&:hover td": { backgroundColor: alpha(brand.cream, 0.4) },
                  }}
                >
                  <TableCell sx={{ ...CELL_SX, fontWeight: 500 }}>{loc.name}</TableCell>
                  <TableCell sx={{ ...CELL_SX, color: brand.mute }}>{loc.address ?? "—"}</TableCell>
                  <TableCell sx={CELL_SX}>
                    <Switch
                      checked={loc.is_active}
                      disabled={isToggling || isDeleting}
                      onChange={() => handleToggleActive(loc)}
                      size="small"
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": { color: brand.sage },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: brand.sage },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ ...CELL_SX, width: 48, pr: "8px" }}>
                    <IconButton
                      size="small"
                      disabled={isDeleting}
                      onClick={() => handleDelete(loc.id)}
                      sx={{ color: brand.mute, "&:hover": { color: brand.terracotta, backgroundColor: alpha(brand.terracotta, 0.08) } }}
                    >
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

const STATUS_COLOR: Record<string, string> = {
  active:    brand.sage,
  completed: brand.mute,
  cancelled: brand.terracotta,
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

// ─── Модалка создания сессии ──────────────────────────────────────────────────

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
      const status = (err as { response?: { status?: number; data?: { detail?: { code?: string; starts_at?: string; ends_at?: string; message?: string } } } })?.response;
      if (status?.status === 409 && status.data?.detail?.code === "session_conflict") {
        const d = status.data.detail;
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
          backgroundColor: brand.ivory,
          borderRadius: "22px",
          border: `1px solid ${alpha(brand.line, 0.7)}`,
          boxShadow: `0 24px 64px -16px ${alpha(brand.cocoa, 0.25)}`,
          p: "28px", outline: "none",
          maxHeight: "90vh", overflowY: "auto",
        }}>
          {/* Шапка */}
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

              {/* Навигация */}
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

              {/* Дни недели */}
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: "4px" }}>
                {DOW_RU.map((d) => (
                  <Typography key={d} sx={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, color: brand.mute, textAlign: "center", py: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {d}
                  </Typography>
                ))}
              </Box>

              {/* Сетка */}
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px" }}>
                {grid.map((date, i) => {
                  if (!date) return <Box key={i} />;
                  const iso = toISO(date);
                  const dayRecord = availableSet.get(iso);
                  const isAvailable = !!dayRecord;
                  const isToday = iso === toISO(now);
                  const isSelected = selectedDay?.date === iso;
                  return (
                    <Box key={iso}
                      onClick={() => isAvailable && dayRecord && setSelectedDay(dayRecord)}
                      sx={{
                        height: 40, borderRadius: "10px",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px",
                        cursor: isAvailable ? "pointer" : "default",
                        backgroundColor: isSelected ? brand.terracotta : isAvailable ? alpha(brand.cocoa, 0.08) : "transparent",
                        border: isToday ? `1px solid ${brand.terracotta}` : "1px solid transparent",
                        transition: "all 0.12s ease",
                        "&:hover": isAvailable && !isSelected ? { backgroundColor: alpha(brand.cocoa, 0.15) } : {},
                      }}>
                      <Typography sx={{
                        fontFamily: "var(--font-body)", fontSize: "13px",
                        fontWeight: isAvailable ? 600 : 400,
                        color: isSelected ? "#fff" : isAvailable ? brand.cocoa : alpha(brand.cocoa, 0.22),
                        lineHeight: 1,
                      }}>
                        {date.getDate()}
                      </Typography>
                      {isAvailable && !isSelected && (
                        <Box sx={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: brand.terracotta }} />
                      )}
                    </Box>
                  );
                })}
              </Box>

              <Button
                fullWidth variant="contained"
                disabled={!selectedDay}
                onClick={() => setStep("form")}
                sx={{ mt: "20px", backgroundColor: brand.cocoa, color: brand.ivory, borderRadius: "10px", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "13px", textTransform: "none", boxShadow: "none", "&:hover": { backgroundColor: brand.cocoaSoft, boxShadow: "none" } }}
              >
                {selectedDay
                  ? `Далее → ${new Date(selectedDay.date + "T00:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}`
                  : "Выберите день"}
              </Button>
            </>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Выбранный день */}
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

function SessionsTab() {
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
        onCreated={(s) => { setSessions(prev => [s, ...prev]); }}
      />

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "20px", flexWrap: "wrap", gap: "12px" }}>
        <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 400, color: brand.cocoa }}>
          Сессии{" "}
          <Box component="span" sx={{ fontFamily: "var(--font-body)", fontSize: "14px", color: brand.mute, fontWeight: 400 }}>
            ({sessions.length})
          </Box>
        </Typography>
        <Button
          onClick={() => setCreateOpen(true)}
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ backgroundColor: brand.cocoa, color: brand.ivory, borderRadius: "10px", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "13px", textTransform: "none", boxShadow: "none", "&:hover": { backgroundColor: brand.cocoaSoft, boxShadow: "none" } }}
        >
          Добавить сессию
        </Button>
      </Box>

      <TableContainer sx={{ borderRadius: "14px", border: `1px solid ${alpha(brand.line, 0.6)}`, overflow: "hidden" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {COLS.map((h) => (
                <TableCell key={h} sx={HEAD_CELL_SX}>{h}</TableCell>
              ))}
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
                <TableRow
                  key={s.id}
                  sx={{
                    opacity: isDeleting || isUpdating ? 0.4 : 1, transition: "opacity 0.2s",
                    "&:last-child td": { borderBottom: "none" },
                    "&:hover td": { backgroundColor: alpha(brand.cream, 0.4) },
                  }}
                >
                  {/* Начало */}
                  <TableCell sx={{ ...CELL_SX, whiteSpace: "nowrap" }}>{fmt(s.starts_at)}</TableCell>

                  {/* Конец */}
                  <TableCell sx={{ ...CELL_SX, whiteSpace: "nowrap", color: brand.mute }}>{fmt(s.ends_at)}</TableCell>

                  {/* Статус */}
                  <TableCell sx={{ ...CELL_SX, minWidth: 130 }}>
                    <Select
                      value={s.status}
                      disabled={isUpdating || isDeleting}
                      onChange={(e) => handleStatusChange(s.id, e.target.value)}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, color,
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: alpha(color, 0.4) },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: color },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: color },
                        "& .MuiSelect-select": { py: "4px", px: "10px" },
                        backgroundColor: alpha(color, 0.07), borderRadius: "6px",
                      }}
                    >
                      {Object.keys(STATUS_COLOR).map((st) => (
                        <MenuItem key={st} value={st} sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>{st}</MenuItem>
                      ))}
                    </Select>
                  </TableCell>

                  {/* Вместимость */}
                  <TableCell sx={{ ...CELL_SX, textAlign: "center" }}>{s.capacity}</TableCell>

                  {/* Локация */}
                  <TableCell sx={CELL_SX}>
                    {s.location_id
                      ? (locationMap[s.location_id] ?? "—")
                      : <Box component="span" sx={{ color: brand.mute }}>—</Box>
                    }
                  </TableCell>

                  {/* Тренер */}
                  <TableCell sx={{ ...CELL_SX, minWidth: 150 }}>
                    <Select
                      value={s.trainer_id ?? ""}
                      disabled={isUpdating || isDeleting}
                      onChange={(e) => handleTrainerChange(s.id, e.target.value)}
                      size="small"
                      displayEmpty
                      variant="outlined"
                      sx={{
                        fontFamily: "var(--font-body)", fontSize: "12px", color: brand.cocoa,
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: alpha(brand.line, 0.8) },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: brand.cocoa },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: brand.terracotta },
                        "& .MuiSelect-select": { py: "4px", px: "10px" },
                      }}
                    >
                      <MenuItem value="" sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.mute }}>
                        Без тренера
                      </MenuItem>
                      {trainers.map((t) => (
                        <MenuItem key={t.id} value={t.id} sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>
                          {trainerMap[t.id] ?? t.telegram_id}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>

                  {/* Дата занятия */}
                  <TableCell sx={{ ...CELL_SX, whiteSpace: "nowrap" }}>
                    {s.day_id
                      ? (dayMap[s.day_id] ?? shortId(s.day_id))
                      : <Box component="span" sx={{ color: brand.mute }}>—</Box>
                    }
                  </TableCell>

                  {/* Удалить */}
                  <TableCell sx={{ ...CELL_SX, width: 48, pr: "8px" }}>
                    <IconButton
                      size="small"
                      disabled={isDeleting}
                      onClick={() => handleDelete(s.id)}
                      sx={{ color: brand.mute, "&:hover": { color: brand.terracotta, backgroundColor: alpha(brand.terracotta, 0.08) } }}
                    >
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

// ─── Вкладка «Дни» ───────────────────────────────────────────────────────────

const MONTH_RU = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const DOW_RU   = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function buildGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const startDow = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array(startDow).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7) cells.push(null);
  return cells;
}

// 0=Пн…6=Вс (соответствует (getDay()+6)%7)
const DOW_LABELS = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

function DaysTab() {
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [days,  setDays]  = useState<DayResponse[]>([]);
  const [saving,    setSaving]    = useState<string | null>(null);
  const [filling,   setFilling]   = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [selectedDow, setSelectedDow] = useState<Set<number>>(new Set());  // 0=Пн…6=Вс

  const load = useCallback(async () => {
    setLoading(true);
    try { setDays(await daysApi.list()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const activeMap = useMemo(
    () => Object.fromEntries(days.map((d) => [d.date, d.id])),
    [days],
  );

  async function toggleDay(date: Date) {
    const iso = toISO(date);
    const existingId = activeMap[iso];
    setSaving(iso);
    try {
      if (existingId) {
        await daysApi.delete(existingId);
        setDays((prev) => prev.filter((d) => d.id !== existingId));
      } else {
        const created = await daysApi.create({ date: iso, status: "active" });
        setDays((prev) => [...prev, created]);
      }
    } finally {
      setSaving(null);
    }
  }

  function toggleDow(dow: number) {
    setSelectedDow((prev) => {
      const next = new Set(prev);
      if (next.has(dow)) next.delete(dow); else next.add(dow);
      return next;
    });
  }

  async function fillSixMonths() {
    if (selectedDow.size === 0) return;
    setFilling(true);
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 6);

      const toCreate: string[] = [];
      const cur = new Date(start);
      while (cur <= end) {
        const dow = (cur.getDay() + 6) % 7; // 0=Пн…6=Вс
        const iso = toISO(cur);
        if (selectedDow.has(dow) && !(iso in activeMap)) {
          toCreate.push(iso);
        }
        cur.setDate(cur.getDate() + 1);
      }

      // Создаём по одному (можно параллельно, но лимитируем нагрузку)
      const created: DayResponse[] = [];
      for (const iso of toCreate) {
        const d = await daysApi.create({ date: iso, status: "active" });
        created.push(d);
      }
      setDays((prev) => [...prev, ...created]);
    } finally {
      setFilling(false);
    }
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const grid = buildGrid(year, month);

  return (
    <Box>
      <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 400, color: brand.cocoa, mb: "20px" }}>
        Дни занятий{" "}
        <Box component="span" sx={{ fontFamily: "var(--font-body)", fontSize: "14px", color: brand.mute, fontWeight: 400 }}>
          ({days.length} в базе)
        </Box>
      </Typography>

      {/* Навигация */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "12px", mb: "16px" }}>
        {[["‹", prevMonth], ["›", nextMonth]].map(([ch, fn], i) => i === 0 ? (
          <Box key={String(ch)} onClick={() => (fn as () => void)()} sx={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${alpha(brand.line, 0.8)}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", "&:hover": { backgroundColor: alpha(brand.line, 0.4) } }}>
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "16px", color: brand.cocoa, lineHeight: 1 }}>{ch}</Typography>
          </Box>
        ) : null)}
        <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 400, color: brand.cocoa, minWidth: 180, textAlign: "center" }}>
          {MONTH_RU[month]} {year}
        </Typography>
        <Box onClick={nextMonth} sx={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${alpha(brand.line, 0.8)}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", "&:hover": { backgroundColor: alpha(brand.line, 0.4) } }}>
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "16px", color: brand.cocoa, lineHeight: 1 }}>›</Typography>
        </Box>
      </Box>

      {/* Календарная сетка */}
      <Box sx={{ border: `1px solid ${alpha(brand.line, 0.6)}`, borderRadius: "14px", overflow: "hidden" }}>
        {/* Заголовки */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", backgroundColor: alpha(brand.cream, 0.5) }}>
          {DOW_RU.map((d) => (
            <Box key={d} sx={{ py: "8px", textAlign: "center" }}>
              <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", color: brand.mute, textTransform: "uppercase" }}>
                {d}
              </Typography>
            </Box>
          ))}
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: "40px" }}>
            <CircularProgress size={28} sx={{ color: brand.terracotta }} />
          </Box>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px", backgroundColor: alpha(brand.line, 0.3) }}>
            {grid.map((date, i) => {
              if (!date) return <Box key={i} sx={{ backgroundColor: brand.ivory, minHeight: 52 }} />;
              const iso      = toISO(date);
              const isActive = iso in activeMap;
              const isSaving = saving === iso;
              const isToday  = iso === toISO(now);
              return (
                <Box
                  key={iso}
                  onClick={() => !isSaving && toggleDay(date)}
                  sx={{
                    minHeight: 52,
                    backgroundColor: isActive ? brand.cocoa : brand.ivory,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                    opacity: isSaving ? 0.5 : 1,
                    outline: isToday ? `2px solid ${brand.terracotta}` : "none",
                    outlineOffset: -2,
                    transition: "background-color 0.15s ease",
                    "&:hover": {
                      backgroundColor: isActive ? brand.cocoaSoft : alpha(brand.line, 0.4),
                    },
                  }}
                >
                  <Typography sx={{
                    fontFamily: "var(--font-body)", fontSize: "14px",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? brand.ivory : brand.cocoa,
                    lineHeight: 1,
                  }}>
                    {date.getDate()}
                  </Typography>
                  {isActive && (
                    <Box sx={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: brand.terracotta, mt: "4px" }} />
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: brand.mute, mt: "12px", mb: "24px" }}>
        Нажмите на день чтобы добавить или убрать. Тёмный фон — день есть в базе.
      </Typography>

      {/* Заполнение по дням недели */}
      <Box sx={{
        p: "20px", borderRadius: "14px",
        border: `1px solid ${alpha(brand.line, 0.7)}`,
        backgroundColor: alpha(brand.cream, 0.4),
      }}>
        <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "13px", color: brand.cocoa, mb: "12px" }}>
          Заполнить на 6 месяцев вперёд
        </Typography>

        {/* Выбор дней недели */}
        <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap", mb: "16px" }}>
          {DOW_LABELS.map((label, i) => {
            const active = selectedDow.has(i);
            return (
              <Box
                key={i}
                onClick={() => toggleDow(i)}
                sx={{
                  width: 40, height: 40, borderRadius: "10px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  backgroundColor: active ? brand.cocoa : "transparent",
                  border: `1px solid ${active ? brand.cocoa : alpha(brand.line, 0.8)}`,
                  transition: "all 0.15s ease",
                  "&:hover": { borderColor: brand.cocoa, backgroundColor: active ? brand.cocoaSoft : alpha(brand.line, 0.4) },
                }}
              >
                <Typography sx={{
                  fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600,
                  color: active ? brand.ivory : brand.cocoa,
                  letterSpacing: "0.04em",
                }}>
                  {label}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <Button
            variant="contained"
            disabled={selectedDow.size === 0 || filling}
            onClick={fillSixMonths}
            startIcon={filling ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
            sx={{
              backgroundColor: brand.cocoa, color: brand.ivory,
              borderRadius: "10px", fontFamily: "var(--font-body)",
              fontWeight: 600, fontSize: "13px", textTransform: "none",
              boxShadow: "none", "&:hover": { backgroundColor: brand.cocoaSoft, boxShadow: "none" },
            }}
          >
            {filling ? "Создаём..." : "Заполнить"}
          </Button>
          {selectedDow.size > 0 && !filling && (
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: brand.mute }}>
              Выбрано: {Array.from(selectedDow).sort().map((i) => DOW_LABELS[i]).join(", ")}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function DashboardsTab() {
  return (
    <Box>
      <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 400, color: brand.cocoa, mb: "12px" }}>
        Дашборды
      </Typography>
      <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "14px", color: brand.cocoaSoft, lineHeight: 1.6 }}>
        Системная аналитика, метрики и отчёты. В разработке.
      </Typography>
    </Box>
  );
}

// ─── Страница ─────────────────────────────────────────────────────────────────

const TABS = [
  { label: "Users",      component: <UsersTab />      },
  { label: "Locale",     component: <LocaleTab />     },
  { label: "Сессии",     component: <SessionsTab />   },
  { label: "Дни",        component: <DaysTab />       },
  { label: "Dashboards", component: <DashboardsTab /> },
];

export default function SuperAdminPage() {
  const router = useRouter();
  const { me, loading, hasRole } = useMe();
  const [tab, setTab] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || loading) return;
    if (!hasRole("superadmin")) router.replace("/");
  }, [mounted, loading, me]);

  if (!mounted || loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <CircularProgress size={28} sx={{ color: brand.terracotta }} />
      </Box>
    );
  }

  if (!hasRole("superadmin")) return null;

  return (
    <Box sx={{ maxWidth: "1100px", mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: "32px", md: "48px" } }}>
      <Typography className="eyebrow" sx={{ display: "block", mb: "12px" }}>Системное управление</Typography>
      <Typography sx={{
        fontFamily: "var(--font-display)", fontWeight: 400,
        fontSize: "clamp(36px, 4vw, 52px)", lineHeight: 1.0,
        color: brand.cocoa, mb: "32px",
      }}>
        Супер<Box component="em" sx={{ fontStyle: "italic", color: brand.terracottaDeep }}> администратор</Box>
      </Typography>

      <Box sx={{
        borderRadius: "22px", backgroundColor: brand.ivory,
        border: `1px solid ${alpha(brand.line, 0.7)}`,
        boxShadow: `0 2px 12px -4px ${alpha(brand.cocoa, 0.07)}`,
        overflow: "hidden",
      }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            px: { xs: "16px", md: "28px" },
            borderBottom: `1px solid ${alpha(brand.line, 0.7)}`,
            "& .MuiTabs-indicator": { backgroundColor: brand.terracotta, height: "2px", borderRadius: "2px 2px 0 0" },
            "& .MuiTab-root": {
              fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px",
              letterSpacing: "0.04em", color: brand.mute, textTransform: "none",
              minWidth: 0, px: "4px", mr: "24px", transition: "color 0.15s ease",
            },
            "& .MuiTab-root.Mui-selected": { color: brand.cocoa, fontWeight: 600 },
          }}
        >
          {TABS.map(({ label }) => <Tab key={label} label={label} disableRipple />)}
        </Tabs>

        <Box sx={{ p: { xs: "20px", md: "32px" } }}>
          {TABS[tab].component}
        </Box>
      </Box>
    </Box>
  );
}
