"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import LogoutIcon from "@mui/icons-material/Logout";
import { useTranslations } from "next-intl";
import { useRouter, usePathname, Link } from "@/shared/i18n/navigation";
import { LOCALES, type Locale } from "@/shared/config";
import { tokenStorage } from "@/shared/lib/token";
import { brand } from "@/shared/theme";

export function AppHeader() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    tokenStorage.remove();
    router.push("/login");
  };

  const handleLocaleChange = (locale: Locale) => {
    router.replace(pathname, { locale });
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ gap: 1 }}>
        {/* Logo */}
        <Typography
          variant="h5"
          component="span"
          sx={{
            flexGrow: 1,
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 400,
            color: brand.cocoa,
            letterSpacing: "-0.01em",
          }}
        >
          Osanka
        </Typography>

        {/* Nav links */}
        <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 0.5 }}>
          {([
            { href: "/schedule",      label: t("schedule") },
            { href: "/my-bookings",   label: t("myBookings") },
            { href: "/subscriptions", label: t("subscriptions") },
          ] as const).map(({ href, label }) => (
            <Button
              key={href}
              component={Link}
              href={href}
              size="small"
              sx={{
                color: brand.cocoaSoft,
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "13px",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                borderRadius: "999px",
                px: 1.5,
                "&:hover": {
                  background: brand.shell,
                  color: brand.cocoa,
                },
              }}
            >
              {label}
            </Button>
          ))}
        </Box>

        {/* Locale switcher */}
        <Box sx={{ display: "flex", gap: 0.25 }}>
          {LOCALES.map((locale) => (
            <Button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              size="small"
              sx={{
                minWidth: "auto",
                px: 1,
                py: 0.5,
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: brand.mute,
                borderRadius: "999px",
                "&:hover": {
                  background: brand.cream2,
                  color: brand.cocoa,
                },
              }}
            >
              {locale}
            </Button>
          ))}
        </Box>

        {/* Logout */}
        <IconButton
          onClick={handleLogout}
          title={tCommon("logout")}
          size="small"
          sx={{
            color: brand.mute,
            border: `1px solid ${brand.line}`,
            width: 36,
            height: 36,
            "&:hover": { background: brand.cream2, color: brand.cocoa },
          }}
        >
          <LogoutIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
