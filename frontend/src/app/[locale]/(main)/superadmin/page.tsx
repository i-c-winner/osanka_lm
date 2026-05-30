"use client";

import { useEffect, useState, useCallback } from "react";
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
import { useMe } from "@/features/me/model/useMe";
import { usersApi } from "@/shared/api";
import type { MeResponse } from "@/shared/api";

// ─── Таблица пользователей ────────────────────────────────────────────────────

const ROLES = ["client", "admin", "superadmin"];

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
  return (
    <Box>
      <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 400, color: brand.cocoa, mb: "12px" }}>
        Локализация
      </Typography>
      <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "14px", color: brand.cocoaSoft, lineHeight: 1.6 }}>
        Управление переводами и языковыми настройками приложения. В разработке.
      </Typography>
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
  { label: "Dashboards", component: <DashboardsTab /> },
];

export default function SuperAdminPage() {
  const router = useRouter();
  const { me, loading, hasRole } = useMe();
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!hasRole("superadmin")) router.replace("/");
  }, [loading, me]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <Typography sx={{ fontFamily: "var(--font-body)", color: brand.mute }}>Загрузка...</Typography>
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
