"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { alpha } from "@mui/material/styles";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/navigation";
import { brand } from "@/shared/theme";
import { tokenStorage } from "@/shared/lib/token";
import { userStorage } from "@/shared/lib/userStorage";
import { CalendarView } from "@/entities/calendar";
import { useCalendarDays } from "@/features/calendar-days";
import { OfflinePlansSection } from "@/features/offline-plans";
import { ProgramsSection } from "@/features/programs";
import { MySpaceProvider } from "@/features/my-space";
import { useMe } from "@/features/me/model/useMe";

// ─── Типы ─────────────────────────────────────────────────────────────────────

type NavKey =
  | "calendar"
  | "programs"
  | "sessions"
  | "favorites"
  | "progress"
  | "settings";
interface NavItem {
  key: NavKey;
  label: string;
  icon: React.ReactNode;
  count?: number;
  disabled: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: "calendar",
    label: "Календарь",
    icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />,
    disabled: true,
  },
  {
    key: "programs",
    label: "Мои программы",
    icon: <FormatListBulletedIcon sx={{ fontSize: 18 }} />,
    disabled: false,
  },
  {
    key: "sessions",
    label: "Offline занятия",
    icon: <FitnessCenterIcon sx={{ fontSize: 18 }} />,
    count: 182,
    disabled: false,
  },
  {
    key: "favorites",
    label: "Избранное",
    icon: <BookmarkBorderIcon sx={{ fontSize: 18 }} />,
    count: 12,
    disabled: true,
  },
  {
    key: "progress",
    label: "Прогресс",
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />,
    disabled: true,
  },
  {
    key: "settings",
    label: "Настройки",
    icon: <SettingsOutlinedIcon sx={{ fontSize: 18 }} />,
    disabled: true,
  },
];

const SECTION_LABELS: Record<NavKey, string> = {
  calendar: "Календарь",
  programs: "Мои программы",
  sessions: "Offline занятия",
  favorites: "Избранное",
  progress: "Прогресс",
  settings: "Настройки",
};

// ─── Карточка эфира ───────────────────────────────────────────────────────────

function LiveCard() {
  return (
    <Box
      sx={{
        borderRadius: "20px",
        background: `radial-gradient(ellipse at 80% 20%, ${brand.blush} 0%, ${alpha(brand.terracotta, 0.55)} 100%)`,
        p: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          backgroundColor: brand.cocoa,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: "4px",
        }}
      >
        <FavoriteIcon sx={{ fontSize: 16, color: brand.blush }} />
      </Box>
      <Box>
        <Typography
          sx={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "22px",
            lineHeight: 1.1,
            color: brand.cocoa,
            mb: "8px",
          }}
        >
          Не пропустите живой эфир
        </Typography>
        <Typography
          sx={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            lineHeight: 1.5,
            color: alpha(brand.cocoa, 0.7),
          }}
        >
          В среду в 19:00 — практика для спины и плеч с тренером Алёной.
        </Typography>
      </Box>
      <Button
        variant="contained"
        sx={{
          mt: "4px",
          backgroundColor: brand.cocoa,
          color: brand.ivory,
          borderRadius: "100px",
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: "13px",
          letterSpacing: "0.02em",
          textTransform: "none",
          px: "20px",
          py: "10px",
          alignSelf: "flex-start",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: brand.cocoaSoft,
            boxShadow: "none",
            transform: "translateY(-1px)",
          },
        }}
      >
        Записаться →
      </Button>
    </Box>
  );
}

// ─── Содержимое боковой панели ────────────────────────────────────────────────

function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    tokenStorage.remove();
    userStorage.remove();
    router.replace("/main");
  }

  return (
    <Box
      onClick={handleLogout}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        px: "16px",
        py: "13px",
        borderRadius: "14px",
        cursor: "pointer",
        transition: "background-color 0.18s ease",
        "&:hover": { backgroundColor: alpha(brand.terracotta, 0.08) },
      }}
    >
      <Box
        sx={{
          color: brand.terracotta,
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <LogoutIcon sx={{ fontSize: 18 }} />
      </Box>
      <Typography
        sx={{
          fontFamily: "var(--font-body)",
          fontWeight: 400,
          fontSize: "14px",
          color: brand.terracotta,
        }}
      >
        Выйти
      </Typography>
    </Box>
  );
}

function AsideContent({
  active,
  onChange,
  displayName,
}: {
  active: NavKey;
  onChange: (k: NavKey) => void;
  displayName: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        height: "100%",
      }}
    >
      {/* Приветствие */}
      <Box sx={{ mb: "8px" }}>
        <Typography className="eyebrow" sx={{ display: "block", mb: "6px" }}>
          С возвращением
        </Typography>
        <Typography
          sx={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "clamp(28px, 2.4vw, 36px)",
            lineHeight: 1.05,
            color: brand.cocoa,
          }}
        >
          Доброе утро,{" "}
          <Box
            component="em"
            sx={{ fontStyle: "italic", color: brand.terracottaDeep }}
          >
            {displayName}
          </Box>
        </Typography>
      </Box>

      {/* Навигация */}
      <Box
        component="nav"
        sx={{ display: "flex", flexDirection: "column", gap: "2px" }}
      >
        {NAV_ITEMS.map(({ key, label, icon, count, disabled }) => {
          const isActive = key === active;
          return (
            <Box
              key={key}
              onClick={() => onChange(key)}
              sx={{
                filter: disabled ? "grayscale(100%)" : "initial",
                opacity: disabled ? 0.6 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
                pointerEvents: disabled ? "none" : "auto",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                px: "16px",
                py: "13px",
                borderRadius: "14px",
                backgroundColor: isActive ? brand.cocoa : "transparent",
                transition: "background-color 0.18s ease",
                "&:hover": {
                  backgroundColor: isActive
                    ? brand.cocoa
                    : alpha(brand.line, 0.5),
                },
              }}
            >
              <Box
                sx={{
                  color: isActive ? brand.ivory : brand.cocoaSoft,
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                  transition: "color 0.18s ease",
                }}
              >
                {icon}
              </Box>
              <Typography
                sx={{
                  fontFamily: "var(--font-body)",
                  fontWeight: isActive ? 500 : 400,
                  fontSize: "14px",
                  color: isActive ? brand.ivory : brand.cocoa,
                  flex: 1,
                  transition: "color 0.18s ease",
                }}
              >
                {label}
              </Typography>
              {count !== undefined && (
                <Typography
                  sx={{
                    fontFamily: "var(--font-body)",
                    fontSize: "13px",
                    fontWeight: 400,
                    color: isActive ? alpha(brand.ivory, 0.6) : brand.mute,
                    transition: "color 0.18s ease",
                  }}
                >
                  {count}
                </Typography>
              )}
            </Box>
          );
        })}
        <LogoutButton />
      </Box>

      <Box sx={{ mt: "auto" }}>
        <LiveCard />
      </Box>
    </Box>
  );
}

// ─── Десктопный Aside ─────────────────────────────────────────────────────────

function Aside({
  active,
  onChange,
  displayName,
}: {
  active: NavKey;
  onChange: (k: NavKey) => void;
  displayName: string;
}) {
  return (
    <Box
      component="aside"
      sx={{
        width: { md: "280px", lg: "300px" },
        flexShrink: 0,
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        position: "sticky",
        top: "80px",
        height: "calc(100vh - 96px)",
        overflowY: "auto",
        pb: "24px",
      }}
    >
      <AsideContent
        active={active}
        onChange={onChange}
        displayName={displayName}
      />
    </Box>
  );
}

// ─── Мобильный бургер + Drawer ────────────────────────────────────────────────

function MobileNav({
  active,
  onChange,
  displayName,
}: {
  active: NavKey;
  onChange: (k: NavKey) => void;
  displayName: string;
}) {
  const [open, setOpen] = useState(false);

  function handleSelect(key: NavKey) {
    onChange(key);
    setOpen(false);
  }

  return (
    <>
      {/* Топ-бар с бургером */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          alignItems: "center",
          justifyContent: "space-between",
          mb: "20px",
          px: "4px",
        }}
      >
        <Box>
          <Typography className="eyebrow" sx={{ display: "block", mb: "2px" }}>
            С возвращением
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "22px",
              lineHeight: 1.1,
              color: brand.cocoa,
            }}
          >
            {SECTION_LABELS[active]}
          </Typography>
        </Box>
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            width: 40,
            height: 40,
            borderRadius: "12px",
            border: `1px solid ${alpha(brand.line, 0.8)}`,
            color: brand.cocoa,
            "&:hover": { backgroundColor: alpha(brand.line, 0.4) },
          }}
        >
          <MenuIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* Drawer */}
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: "300px",
            backgroundColor: brand.ivory,
            borderRight: `1px solid ${alpha(brand.line, 0.6)}`,
            p: "24px",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* Шапка drawer */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            mb: "16px",
          }}
        >
          <IconButton
            onClick={() => setOpen(false)}
            size="small"
            sx={{
              color: brand.cocoaSoft,
              "&:hover": { backgroundColor: alpha(brand.line, 0.4) },
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <AsideContent
          active={active}
          onChange={handleSelect}
          displayName={displayName}
        />
      </Drawer>
    </>
  );
}

// ─── Основной контент ─────────────────────────────────────────────────────────

function MainContent({ section }: { section: NavKey }) {
  const { getDayData } = useCalendarDays();
  if (section === "calendar") return <CalendarView getDayData={getDayData} />;
  if (section === "sessions") return <OfflinePlansSection />;
  if (section === "programs") return <ProgramsSection />;
  return (
    <Box component="main" sx={{ flex: 1, minWidth: 0, pt: "8px" }}>
      <Typography variant="h3" sx={{ mb: "8px" }}>
        {SECTION_LABELS[section]}
      </Typography>
      <Typography variant="body1" sx={{ color: brand.cocoaSoft }}>
        Раздел в разработке.
      </Typography>
    </Box>
  );
}

// ─── Страница ─────────────────────────────────────────────────────────────────

function MySpacePageInner() {
  const [activeSection, setActiveSection] = useState<NavKey>("calendar");
  const { me } = useMe();

  const displayName = me?.telegram_username
    ? `@${me.telegram_username}`
    : (me?.first_name ?? me?.telegram_id ?? "");

  return (
    <Box
      sx={{
        maxWidth: "1200px",
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: "24px", md: "48px" },
      }}
    >
      <MobileNav
        active={activeSection}
        onChange={setActiveSection}
        displayName={displayName}
      />

      <Box
        sx={{
          display: "flex",
          gap: { md: "48px", lg: "64px" },
          alignItems: "flex-start",
        }}
      >
        <Aside
          active={activeSection}
          onChange={setActiveSection}
          displayName={displayName}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <MainContent section={activeSection} />
        </Box>
      </Box>
    </Box>
  );
}

export default function MySpacePage() {
  return (
    <MySpaceProvider>
      <MySpacePageInner />
    </MySpaceProvider>
  );
}
