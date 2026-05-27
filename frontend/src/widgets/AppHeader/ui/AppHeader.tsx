"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/shared/i18n/navigation";
import { brand } from "@/shared/theme";

// ─── Логотип ──────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <Link href="/main" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
      <Box
        sx={{
          width:        28,
          height:       28,
          borderRadius: "50%",
          background:   `radial-gradient(circle at 38% 38%, ${brand.blush}, ${brand.terracotta} 70%)`,
          flexShrink:   0,
          boxShadow:    `0 2px 8px -2px ${alpha(brand.terracotta, 0.45)}`,
        }}
      />
      <Typography
        sx={{
          fontFamily:    "var(--font-display)",
          fontStyle:     "italic",
          fontWeight:    400,
          fontSize:      "18px",
          lineHeight:    1,
          color:         brand.cocoa,
          letterSpacing: "-0.01em",
          whiteSpace:    "nowrap",
        }}
      >
        Gym Balance
      </Typography>
    </Link>
  );
}

// ─── Навигационная ссылка ─────────────────────────────────────────────────────

interface NavLinkProps {
  href: string;
  label: string;
  active: boolean;
}

function NavLink({ href, label, active }: NavLinkProps) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <Box sx={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
        <Typography
          sx={{
            fontFamily:    "var(--font-body)",
            fontWeight:    active ? 600 : 400,
            fontSize:      "14px",
            letterSpacing: "0.01em",
            color:         active ? brand.cocoa : brand.cocoaSoft,
            transition:    "color 0.2s ease",
            "&:hover":     { color: brand.cocoa },
          }}
        >
          {label}
        </Typography>

        {/* Точка-индикатор активного пункта */}
        <Box
          sx={{
            width:           4,
            height:          4,
            borderRadius:    "50%",
            backgroundColor: brand.terracotta,
            opacity:         active ? 1 : 0,
            transition:      "opacity 0.2s ease",
          }}
        />
      </Box>
    </Link>
  );
}

// ─── Аватар пользователя ──────────────────────────────────────────────────────

function UserAvatar() {
  return (
    <Link href="/my-space" style={{ textDecoration: "none" }}>
      <Box
        sx={{
          width:        32,
          height:       32,
          borderRadius: "50%",
          background:   `radial-gradient(circle at 38% 38%, ${brand.blush}, ${brand.terracotta} 70%)`,
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
          cursor:       "pointer",
          boxShadow:    `0 2px 8px -2px ${alpha(brand.terracotta, 0.45)}`,
          transition:   "transform 0.15s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform:  "translateY(-1px)",
            boxShadow:  `0 4px 12px -2px ${alpha(brand.terracotta, 0.55)}`,
          },
        }}
      >
        <Typography
          sx={{
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize:   "12px",
            color:      "#fff",
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          Я
        </Typography>
      </Box>
    </Link>
  );
}

// ─── AppHeader ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: "home",         href: "/main"       },
  { key: "programs",     href: "/programs"   },
  { key: "practice",     href: "/practice"   },
  { key: "subscription", href: "/subscription" },
  { key: "mySpace",      href: "/my-space"   },
] as const;

export function AppHeader() {
  const t        = useTranslations("nav");
  const pathname = usePathname();

  return (
    <Box
      component="header"
      sx={{
        position:  "sticky",
        top:       0,
        zIndex:    1100,

        backgroundColor:      alpha(brand.cream, 0.72),
        backdropFilter:       "blur(18px) saturate(160%)",
        WebkitBackdropFilter: "blur(18px) saturate(160%)",

        borderBottom: `1px solid ${alpha(brand.line, 0.55)}`,
        boxShadow:    `0 2px 16px -8px ${alpha(brand.cocoa, 0.08)}`,
        transition:   "background-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <Box
        sx={{
          maxWidth:       "1200px",
          mx:             "auto",
          px:             { xs: 2, sm: 3, md: 4 },
          height:         "64px",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          gap:            2,
        }}
      >
        {/* Логотип */}
        <Logo />

        {/* Навигация */}
        <Box
          component="nav"
          sx={{
            display:    { xs: "none", md: "flex" },
            alignItems: "center",
            gap:        "32px",
          }}
        >
          {NAV_ITEMS.map(({ key, href }) => (
            <NavLink
              key={key}
              href={href}
              label={t(key)}
              active={pathname === href || (key === "home" && pathname === "/")}
            />
          ))}
        </Box>

        {/* Иконки справа */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <IconButton
            size="small"
            sx={{
              color:      brand.cocoaSoft,
              "&:hover": { color: brand.cocoa, backgroundColor: alpha(brand.line, 0.4) },
            }}
          >
            <NotificationsNoneIcon sx={{ fontSize: 20 }} />
          </IconButton>

          <IconButton
            size="small"
            sx={{
              color:      brand.cocoaSoft,
              "&:hover": { color: brand.cocoa, backgroundColor: alpha(brand.line, 0.4) },
            }}
          >
            <SearchIcon sx={{ fontSize: 20 }} />
          </IconButton>

          <Box sx={{ ml: "4px" }}>
            <UserAvatar />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
