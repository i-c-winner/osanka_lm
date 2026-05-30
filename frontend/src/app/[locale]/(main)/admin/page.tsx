"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { brand } from "@/shared/theme";
import { useMe } from "@/features/me/model/useMe";
import { SessionsTab } from "@/features/sessions/ui/SessionsTab";

const TAB_SX = {
  "& .MuiTabs-indicator": { backgroundColor: brand.terracotta, height: "2px", borderRadius: "2px 2px 0 0" },
  "& .MuiTab-root": { fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", letterSpacing: "0.04em", color: brand.mute, textTransform: "none", minWidth: 0, px: "4px", mr: "24px", transition: "color 0.15s ease" },
  "& .MuiTab-root.Mui-selected": { color: brand.cocoa, fontWeight: 600 },
};

const TABS = [
  { label: "Сессии", component: <SessionsTab /> },
];

export default function AdminPage() {
  const router = useRouter();
  const { me, loading, hasRole } = useMe();
  const [tab, setTab] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || loading) return;
    if (!hasRole("admin", "superadmin")) router.replace("/");
  }, [mounted, loading, me]);

  if (!mounted || loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <CircularProgress size={28} sx={{ color: brand.terracotta }} />
      </Box>
    );
  }

  if (!hasRole("admin", "superadmin")) return null;

  return (
    <Box sx={{ maxWidth: "1100px", mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: "32px", md: "48px" } }}>
      <Typography className="eyebrow" sx={{ display: "block", mb: "12px" }}>
        Панель управления
      </Typography>
      <Typography sx={{
        fontFamily: "var(--font-display)", fontWeight: 400,
        fontSize: "clamp(36px, 4vw, 52px)", lineHeight: 1.0,
        color: brand.cocoa, mb: "32px",
      }}>
        Админ
        <Box component="em" sx={{ fontStyle: "italic", color: brand.terracottaDeep }}> панель</Box>
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
          sx={{ px: { xs: "16px", md: "28px" }, borderBottom: `1px solid ${alpha(brand.line, 0.7)}`, ...TAB_SX }}
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
