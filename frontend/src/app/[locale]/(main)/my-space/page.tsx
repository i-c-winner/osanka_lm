"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { alpha } from "@mui/material/styles";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import FormatListBulletedIcon   from "@mui/icons-material/FormatListBulleted";
import FitnessCenterIcon        from "@mui/icons-material/FitnessCenter";
import BookmarkBorderIcon       from "@mui/icons-material/BookmarkBorder";
import CheckCircleOutlineIcon   from "@mui/icons-material/CheckCircleOutline";
import SettingsOutlinedIcon     from "@mui/icons-material/SettingsOutlined";
import FavoriteIcon             from "@mui/icons-material/Favorite";
import { brand }                from "@/shared/theme";
import { CalendarView }         from "@/entities/calendar";

// ─── Типы ─────────────────────────────────────────────────────────────────────

type NavKey = "calendar" | "programs" | "sessions" | "favorites" | "progress" | "settings";
interface NavItem { key: NavKey; label: string; icon: React.ReactNode; count?: number }

const NAV_ITEMS: NavItem[] = [
  { key: "calendar",  label: "Календарь",     icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} /> },
  { key: "programs",  label: "Мои программы", icon: <FormatListBulletedIcon    sx={{ fontSize: 18 }} />, count: 3   },
  { key: "sessions",  label: "Offline занятия", icon: <FitnessCenterIcon         sx={{ fontSize: 18 }} />, count: 182 },
  { key: "favorites", label: "Избранное",     icon: <BookmarkBorderIcon        sx={{ fontSize: 18 }} />, count: 12  },
  { key: "progress",  label: "Прогресс",      icon: <CheckCircleOutlineIcon    sx={{ fontSize: 18 }} /> },
  { key: "settings",  label: "Настройки",     icon: <SettingsOutlinedIcon      sx={{ fontSize: 18 }} /> },
];

// ─── Карточка эфира ───────────────────────────────────────────────────────────

function LiveCard() {
  return (
    <Box sx={{
      borderRadius: "20px",
      background: `radial-gradient(ellipse at 80% 20%, ${brand.blush} 0%, ${alpha(brand.terracotta, 0.55)} 100%)`,
      p: "24px", display: "flex", flexDirection: "column", gap: "12px",
    }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: "50%", backgroundColor: brand.cocoa,
        display: "flex", alignItems: "center", justifyContent: "center", mb: "4px",
      }}>
        <FavoriteIcon sx={{ fontSize: 16, color: brand.blush }} />
      </Box>
      <Box>
        <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "22px", lineHeight: 1.1, color: brand.cocoa, mb: "8px" }}>
          Не пропустите живой эфир
        </Typography>
        <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", lineHeight: 1.5, color: alpha(brand.cocoa, 0.7) }}>
          В среду в 19:00 — практика для спины и плеч с тренером Алёной.
        </Typography>
      </Box>
      <Button variant="contained" sx={{
        mt: "4px", backgroundColor: brand.cocoa, color: brand.ivory,
        borderRadius: "100px", fontFamily: "var(--font-body)", fontWeight: 600,
        fontSize: "13px", letterSpacing: "0.02em", textTransform: "none",
        px: "20px", py: "10px", alignSelf: "flex-start", boxShadow: "none",
        "&:hover": { backgroundColor: brand.cocoaSoft, boxShadow: "none", transform: "translateY(-1px)" },
      }}>
        Записаться →
      </Button>
    </Box>
  );
}

// ─── Aside ────────────────────────────────────────────────────────────────────

function Aside({ active, onChange }: { active: NavKey; onChange: (k: NavKey) => void }) {
  return (
    <Box component="aside" sx={{
      width: { md: "280px", lg: "300px" }, flexShrink: 0,
      position: "sticky", top: "80px",
      height: "calc(100vh - 96px)",
      display: "flex", flexDirection: "column", gap: "8px",
      overflowY: "auto", pb: "24px",
    }}>
      {/* Приветствие */}
      <Box sx={{ mb: "8px" }}>
        <Typography className="eyebrow" sx={{ display: "block", mb: "6px" }}>С возвращением</Typography>
        <Typography sx={{
          fontFamily: "var(--font-display)", fontWeight: 400,
          fontSize: "clamp(28px, 2.4vw, 36px)", lineHeight: 1.05, color: brand.cocoa,
        }}>
          Доброе утро,{" "}
          <Box component="em" sx={{ fontStyle: "italic", color: brand.terracottaDeep }}>Янина</Box>
        </Typography>
      </Box>

      {/* Навигация */}
      <Box component="nav" sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {NAV_ITEMS.map(({ key, label, icon, count }) => {
          const isActive = key === active;
          return (
            <Box key={key} onClick={() => onChange(key)} sx={{
              display: "flex", alignItems: "center", gap: "12px",
              px: "16px", py: "13px", borderRadius: "14px", cursor: "pointer",
              backgroundColor: isActive ? brand.cocoa : "transparent",
              transition: "background-color 0.18s ease",
              "&:hover": { backgroundColor: isActive ? brand.cocoa : alpha(brand.line, 0.5) },
            }}>
              <Box sx={{ color: isActive ? brand.ivory : brand.cocoaSoft, display: "flex", alignItems: "center", flexShrink: 0, transition: "color 0.18s ease" }}>
                {icon}
              </Box>
              <Typography sx={{
                fontFamily: "var(--font-body)", fontWeight: isActive ? 500 : 400,
                fontSize: "14px", color: isActive ? brand.ivory : brand.cocoa,
                flex: 1, transition: "color 0.18s ease",
              }}>
                {label}
              </Typography>
              {count !== undefined && (
                <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 400, color: isActive ? alpha(brand.ivory, 0.6) : brand.mute, transition: "color 0.18s ease" }}>
                  {count}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      <LiveCard />
    </Box>
  );
}

// ─── Основной контент ─────────────────────────────────────────────────────────

function MainContent({ section }: { section: NavKey }) {
  if (section === "calendar") return <CalendarView />;
  const labels: Record<NavKey, string> = {
    calendar: "Календарь", programs: "Мои программы", sessions: "Offline занятия",
    favorites: "Избранное", progress: "Прогресс", settings: "Настройки",
  };
  return (
    <Box component="main" sx={{ flex: 1, minWidth: 0, pt: "8px" }}>
      <Typography variant="h3" sx={{ mb: "8px" }}>{labels[section]}</Typography>
      <Typography variant="body1" sx={{ color: brand.cocoaSoft }}>Раздел в разработке.</Typography>
    </Box>
  );
}

// ─── Страница ─────────────────────────────────────────────────────────────────

export default function MySpacePage() {
  const [activeSection, setActiveSection] = useState<NavKey>("calendar");
  return (
    <Box sx={{
      maxWidth: "1200px", mx: "auto",
      px: { xs: 2, sm: 3, md: 4 }, py: { xs: "32px", md: "48px" },
      display: "flex", gap: { md: "48px", lg: "64px" }, alignItems: "flex-start",
    }}>
      <Aside active={activeSection} onChange={setActiveSection} />
      <MainContent section={activeSection} />
    </Box>
  );
}
