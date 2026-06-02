"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import TelegramIcon from "@mui/icons-material/Telegram";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/shared/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../model/useAuth";
import { brand } from "@/shared/theme";

export function LoginForm() {
  const t            = useTranslations("auth");
  const { login, loading, error } = useAuth();
  const [telegramId, setTelegramId] = useState("");
  const router       = useRouter();
  const searchParams = useSearchParams();

  // Если уже залогинен — редиректим сразу
  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      const from = searchParams.get("from") ?? "/my-space";
      router.replace(from as "/my-space");
    }
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramId.trim()) return;
    try {
      await login({ telegram_id: telegramId.trim() });
      const from = searchParams.get("from") ?? "/my-space";
      router.push(from as "/my-space");
    } catch {
      // ошибка обрабатывается в хуке
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
    >
      {/* Eyebrow */}
      <Typography
        sx={{
          fontFamily:    "var(--font-body)",
          fontWeight:    600,
          fontSize:      "11px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color:         brand.terracottaDeep,
        }}
      >
        Добро пожаловать
      </Typography>

      {/* Title */}
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontWeight: 400,
          fontSize:   "36px",
          lineHeight: 1.05,
          color:      brand.cocoa,
          mt: -1,
        }}
      >
        {t("title")}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ borderRadius: "14px" }}>
          {error}
        </Alert>
      )}

      <TextField
        label={t("telegramId")}
        value={telegramId}
        onChange={(e) => setTelegramId(e.target.value)}
        required
        disabled={loading}
        autoComplete="off"
        fullWidth
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <TelegramIcon />}
        fullWidth
      >
        {t("loginWithTelegram")}
      </Button>
    </Box>
  );
}
