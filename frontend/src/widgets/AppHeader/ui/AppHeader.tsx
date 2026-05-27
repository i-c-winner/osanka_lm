"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/shared/i18n/navigation";
import { brand } from "@/shared/theme";

// ─── Логотип ──────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <Link href="/main" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
      {/* Иконка — терракотовый круг */}
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
      {/* Wordmark */}
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontStyle:  "italic",
          fontWeight: 400,
          fontSize:   "18px",
          lineHeight: 1,
          color:      brand.cocoa,
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
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
            width:        4,
            height:       4,
            borderRadius: "50%",
            backgroundColor: brand.terracotta,
            opacity:      active ? 1 : 0,
            transition:   "opacity 0.2s ease",
          }}
        />
      </Box>
    </Link>
  );
}

// ─── AppHeader ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: "home",         href: "/main"         },
  { key: "programs",     href: "/programs"     },
  { key: "practice",     href: "/practice"     },
  { key: "subscription", href: "/subscription" },
  { key: "reviews",      href: "/reviews"      },
] as const;

export function AppHeader() {
  const t        = useTranslations("nav");
  const pathname = usePathname();

  return (
    <Box
      component="header"
      sx={{
        // ── Позиционирование ──────────────────────────────────────
        position:  "sticky",
        top:       0,
        zIndex:    1100,

        // ── Стеклянный фон ────────────────────────────────────────
        backgroundColor: alpha(brand.cream, 0.72),
        backdropFilter:  "blur(18px) saturate(160%)",
        WebkitBackdropFilter: "blur(18px) saturate(160%)",

        // ── Граница снизу ─────────────────────────────────────────
        borderBottom:    `1px solid ${alpha(brand.line, 0.55)}`,

        // ── Тень ─────────────────────────────────────────────────
        boxShadow:       `0 2px 16px -8px ${alpha(brand.cocoa, 0.08)}`,

        // ── Переход при скролле ───────────────────────────────────
        transition:      "background-color 0.3s ease, box-shadow 0.3s ease",
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

        {/* Навигация — скрывается на мобильных */}
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

        {/* CTA-кнопка */}
        <Button
          component={Link}
          href="/main"
          variant="contained"
          size="small"
          endIcon={
            <Box component="span" sx={{ fontSize: "13px", lineHeight: 1, mt: "-1px" }}>
              ↗
            </Box>
          }
          sx={{
            // Переопределяем цвет: тёмная какао-кнопка
            backgroundColor: brand.cocoa,
            color:           brand.ivory,
            fontFamily:      "var(--font-body)",
            fontWeight:      500,
            fontSize:        "13px",
            letterSpacing:   "0.02em",
            borderRadius:    "100px",
            px:              "20px",
            py:              "8px",
            whiteSpace:      "nowrap",
            flexShrink:      0,
            boxShadow:       `0 4px 14px -4px ${alpha(brand.cocoa, 0.35)}`,
            transition:      "background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease",
            "&:hover": {
              backgroundColor: brand.cocoaSoft,
              boxShadow:       `0 6px 18px -4px ${alpha(brand.cocoa, 0.40)}`,
              transform:       "translateY(-1px)",
            },
            "&:active": {
              transform:  "translateY(0)",
              boxShadow:  `0 2px 8px -2px ${alpha(brand.cocoa, 0.30)}`,
            },
          }}
        >
          {t("mySpace")}
        </Button>
      </Box>
    </Box>
  );
}
