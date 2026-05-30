"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { brand } from "@/shared/theme";
import { useMe } from "@/features/me/model/useMe";

// ─── Заглушки вкладок ─────────────────────────────────────────────────────────

function UsersTab() {
  return (
    <Box>
      <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 400, color: brand.cocoa, mb: "12px" }}>
        Пользователи
      </Typography>
      <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "14px", color: brand.cocoaSoft, lineHeight: 1.6 }}>
        Управление пользователями, ролями и правами доступа. В разработке.
      </Typography>
    </Box>
  );
}

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

const TABS = [
  { label: "Users",      component: <UsersTab />      },
  { label: "Locale",     component: <LocaleTab />     },
  { label: "Dashboards", component: <DashboardsTab /> },
];

// ─── Страница ─────────────────────────────────────────────────────────────────

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
    <Box sx={{ maxWidth: "900px", mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: "32px", md: "48px" } }}>
      {/* Заголовок */}
      <Typography className="eyebrow" sx={{ display: "block", mb: "12px" }}>
        Системное управление
      </Typography>
      <Typography sx={{
        fontFamily: "var(--font-display)", fontWeight: 400,
        fontSize: "clamp(36px, 4vw, 52px)", lineHeight: 1.0,
        color: brand.cocoa, mb: "32px",
      }}>
        Супер
        <Box component="em" sx={{ fontStyle: "italic", color: brand.terracottaDeep }}> администратор</Box>
      </Typography>

      {/* Карточка с табами */}
      <Box sx={{
        borderRadius: "22px", backgroundColor: brand.ivory,
        border: `1px solid ${alpha(brand.line, 0.7)}`,
        boxShadow: `0 2px 12px -4px ${alpha(brand.cocoa, 0.07)}`,
        overflow: "hidden",
      }}>
        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            px: { xs: "16px", md: "28px" },
            borderBottom: `1px solid ${alpha(brand.line, 0.7)}`,
            "& .MuiTabs-indicator": {
              backgroundColor: brand.terracotta,
              height: "2px",
              borderRadius: "2px 2px 0 0",
            },
            "& .MuiTab-root": {
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "13px",
              letterSpacing: "0.04em",
              color: brand.mute,
              textTransform: "none",
              minWidth: 0,
              px: "4px",
              mr: "24px",
              transition: "color 0.15s ease",
            },
            "& .MuiTab-root.Mui-selected": {
              color: brand.cocoa,
              fontWeight: 600,
            },
          }}
        >
          {TABS.map(({ label }) => (
            <Tab key={label} label={label} disableRipple />
          ))}
        </Tabs>

        {/* Контент вкладки */}
        <Box sx={{ p: { xs: "24px", md: "36px" } }}>
          {TABS[tab].component}
        </Box>
      </Box>
    </Box>
  );
}
