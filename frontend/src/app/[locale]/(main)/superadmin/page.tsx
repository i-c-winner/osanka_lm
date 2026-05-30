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
import { usersApi, locationsApi, daysApi } from "@/shared/api";
import type { MeResponse, LocationResponse, DayResponse } from "@/shared/api";
import { SessionsTab } from "@/features/sessions/ui/SessionsTab";
import { MONTH_RU, DOW_RU, toISO, buildGrid } from "@/shared/lib/calendar";
import { MonthCalendar } from "@/entities/calendar";
import { useAdminCalendarDays, DaySessionsModal } from "@/features/superadmin-calendar";

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

// ─── (SessionsTab вынесен в @/features/sessions/ui/SessionsTab) ──────────────
// ─── Вкладка «Дни» ───────────────────────────────────────────────────────────

// ─── Вкладка «Дни» ───────────────────────────────────────────────────────────


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
        <Box onClick={prevMonth} sx={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${alpha(brand.line, 0.8)}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", "&:hover": { backgroundColor: alpha(brand.line, 0.4) } }}>
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "16px", color: brand.cocoa, lineHeight: 1 }}>‹</Typography>
        </Box>
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

// ─── Вкладка «Календарь» ─────────────────────────────────────────────────────

function CalendarTab() {
  const { getDayData, sessionsByDate, loading, error, reload } = useAdminCalendarDays();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: "40px" }}>
        <CircularProgress size={28} sx={{ color: brand.terracotta }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: "24px", textAlign: "center" }}>
        <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "14px", color: brand.terracotta, mb: "12px" }}>
          {error}
        </Typography>
        <Button
          onClick={reload}
          variant="outlined"
          size="small"
          sx={{
            fontFamily: "var(--font-body)", fontSize: "13px", textTransform: "none",
            borderColor: alpha(brand.line, 0.8), color: brand.cocoa,
            "&:hover": { borderColor: brand.cocoa, backgroundColor: alpha(brand.line, 0.3) },
          }}
        >
          Повторить
        </Button>
      </Box>
    );
  }

  return (
    <>
      <MonthCalendar
        getDayData={getDayData}
        onDayClick={(dateKey) => setSelectedDate(dateKey)}
      />
      <DaySessionsModal
        open={!!selectedDate}
        dateKey={selectedDate}
        sessions={selectedDate ? (sessionsByDate[selectedDate] ?? []) : []}
        onClose={() => setSelectedDate(null)}
      />
    </>
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
  { label: "Календарь",  component: <CalendarTab />   },
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
