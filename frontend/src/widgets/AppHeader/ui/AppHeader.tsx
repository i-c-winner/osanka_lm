"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/shared/i18n/navigation";
import { brand } from "@/shared/theme";
import { useMe } from "@/features/me/model/useMe";

// ─── Логотип ──────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <Link href="/main" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
      <Box sx={{
        width: 28, height: 28, borderRadius: "50%",
        background: `radial-gradient(circle at 38% 38%, ${brand.blush}, ${brand.terracotta} 70%)`,
        flexShrink: 0,
        boxShadow: `0 2px 8px -2px ${alpha(brand.terracotta, 0.45)}`,
      }} />
      <Typography sx={{
        fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400,
        fontSize: "18px", lineHeight: 1, color: brand.cocoa,
        letterSpacing: "-0.01em", whiteSpace: "nowrap",
      }}>
        Gym Balance
      </Typography>
    </Link>
  );
}

// ─── Навигационная ссылка ─────────────────────────────────────────────────────

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <Box sx={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
        <Typography sx={{
          fontFamily: "var(--font-body)", fontWeight: active ? 600 : 400,
          fontSize: "14px", letterSpacing: "0.01em",
          color: active ? brand.cocoa : brand.cocoaSoft,
          transition: "color 0.2s ease", "&:hover": { color: brand.cocoa },
        }}>
          {label}
        </Typography>
        <Box sx={{
          width: 4, height: 4, borderRadius: "50%",
          backgroundColor: brand.terracotta,
          opacity: active ? 1 : 0, transition: "opacity 0.2s ease",
        }} />
      </Box>
    </Link>
  );
}

// ─── Аватар пользователя ──────────────────────────────────────────────────────

function UserAvatar() {
  return (
    <Link href="/my-space" style={{ textDecoration: "none" }}>
      <Box sx={{
        width: 32, height: 32, borderRadius: "50%",
        background: `radial-gradient(circle at 38% 38%, ${brand.blush}, ${brand.terracotta} 70%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        boxShadow: `0 2px 8px -2px ${alpha(brand.terracotta, 0.45)}`,
        transition: "transform 0.15s ease, box-shadow 0.2s ease",
        "&:hover": { transform: "translateY(-1px)", boxShadow: `0 4px 12px -2px ${alpha(brand.terracotta, 0.55)}` },
      }}>
        <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "12px", color: "#fff", lineHeight: 1, userSelect: "none" }}>
          Я
        </Typography>
      </Box>
    </Link>
  );
}

// ─── Кнопка роли (десктоп) ────────────────────────────────────────────────────

function RoleButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <Box sx={{
        borderRadius: "100px", border: `1px solid ${alpha(brand.line, 0.8)}`,
        px: "12px", py: "5px", cursor: "pointer", transition: "all 0.15s ease",
        "&:hover": { backgroundColor: alpha(brand.line, 0.5), borderColor: brand.cocoa },
      }}>
        <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "12px", letterSpacing: "0.04em", color: brand.cocoa }}>
          {label}
        </Typography>
      </Box>
    </Link>
  );
}

// ─── Мобильный Drawer ─────────────────────────────────────────────────────────

function MobileDrawer({
  open,
  onClose,
  navItems,
  pathname,
  hasAdmin,
  hasSuperadmin,
  t,
}: {
  open: boolean;
  onClose: () => void;
  navItems: readonly { key: string; href: string }[];
  pathname: string;
  hasAdmin: boolean;
  hasSuperadmin: boolean;
  t: (k: string) => string;
}) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "260px",
          backgroundColor: brand.ivory,
          borderLeft: `1px solid ${alpha(brand.line, 0.6)}`,
          p: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        },
      }}
    >
      {/* Закрыть */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: "8px" }}>
        <IconButton onClick={onClose} size="small" sx={{ color: brand.cocoaSoft, "&:hover": { backgroundColor: alpha(brand.line, 0.4) } }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* Навигация */}
      {navItems.map(({ key, href }) => {
        const active = pathname === href || (key === "home" && pathname === "/");
        return (
          <Link key={key} href={href} style={{ textDecoration: "none" }} onClick={onClose}>
            <Box sx={{
              px: "16px", py: "13px", borderRadius: "14px",
              backgroundColor: active ? brand.cocoa : "transparent",
              transition: "background-color 0.18s ease",
              "&:hover": { backgroundColor: active ? brand.cocoa : alpha(brand.line, 0.5) },
            }}>
              <Typography sx={{
                fontFamily: "var(--font-body)", fontWeight: active ? 600 : 400,
                fontSize: "15px", color: active ? brand.ivory : brand.cocoa,
              }}>
                {t(key)}
              </Typography>
            </Box>
          </Link>
        );
      })}

      {/* Кнопки ролей */}
      {(hasAdmin || hasSuperadmin) && (
        <Box sx={{ mt: "12px", pt: "12px", borderTop: `1px solid ${alpha(brand.line, 0.6)}`, display: "flex", flexDirection: "column", gap: "4px" }}>
          {hasAdmin && (
            <Link href="/admin" style={{ textDecoration: "none" }} onClick={onClose}>
              <Box sx={{
                px: "16px", py: "13px", borderRadius: "14px",
                transition: "background-color 0.18s ease",
                "&:hover": { backgroundColor: alpha(brand.line, 0.5) },
              }}>
                <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "15px", color: brand.terracottaDeep }}>
                  Admin
                </Typography>
              </Box>
            </Link>
          )}
          {hasSuperadmin && (
            <Link href="/superadmin" style={{ textDecoration: "none" }} onClick={onClose}>
              <Box sx={{
                px: "16px", py: "13px", borderRadius: "14px",
                transition: "background-color 0.18s ease",
                "&:hover": { backgroundColor: alpha(brand.line, 0.5) },
              }}>
                <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "15px", color: brand.terracottaDeep }}>
                  Superadmin
                </Typography>
              </Box>
            </Link>
          )}
        </Box>
      )}
    </Drawer>
  );
}

// ─── AppHeader ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [{ key: "home", href: "/main" }] as const;

export function AppHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { hasRole } = useMe();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const hasAdmin = hasRole("admin", "superadmin");
  const hasSuperadmin = hasRole("superadmin");

  return (
    <Box
      component="header"
      sx={{
        position: "sticky", top: 0, zIndex: 1100,
        backgroundColor: alpha(brand.cream, 0.72),
        backdropFilter: "blur(18px) saturate(160%)",
        WebkitBackdropFilter: "blur(18px) saturate(160%)",
        borderBottom: `1px solid ${alpha(brand.line, 0.55)}`,
        boxShadow: `0 2px 16px -8px ${alpha(brand.cocoa, 0.08)}`,
        transition: "background-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <Box sx={{
        maxWidth: "1200px", mx: "auto",
        px: { xs: 2, sm: 3, md: 4 }, height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2,
      }}>
        {/* Логотип */}
        <Logo />

        {/* Десктопная навигация */}
        <Box component="nav" sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: "32px" }}>
          {NAV_ITEMS.map(({ key, href }) => (
            <NavLink key={key} href={href} label={t(key)} active={pathname === href || (key === "home" && pathname === "/")} />
          ))}
        </Box>

        {/* Кнопки ролей (десктоп) */}
        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: "8px" }}>
          {hasAdmin && <RoleButton href="/admin" label="Admin" />}
          {hasSuperadmin && <RoleButton href="/superadmin" label="Superadmin" />}
        </Box>

        {/* Правая панель */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <IconButton size="small" sx={{ color: brand.cocoaSoft, "&:hover": { color: brand.cocoa, backgroundColor: alpha(brand.line, 0.4) } }}>
            <NotificationsNoneIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton size="small" sx={{ color: brand.cocoaSoft, "&:hover": { color: brand.cocoa, backgroundColor: alpha(brand.line, 0.4) } }}>
            <SearchIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Box sx={{ ml: "4px" }}>
            <UserAvatar />
          </Box>

          {/* Бургер (только мобильный) */}
          <IconButton
            size="small"
            onClick={() => setDrawerOpen(true)}
            sx={{
              display: { xs: "flex", md: "none" },
              ml: "4px",
              color: brand.cocoaSoft,
              "&:hover": { color: brand.cocoa, backgroundColor: alpha(brand.line, 0.4) },
            }}
          >
            <MenuIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Мобильный Drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navItems={NAV_ITEMS}
        pathname={pathname}
        hasAdmin={hasAdmin}
        hasSuperadmin={hasSuperadmin}
        t={t}
      />
    </Box>
  );
}
