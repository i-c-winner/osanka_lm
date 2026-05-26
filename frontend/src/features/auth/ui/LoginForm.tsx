"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import TelegramIcon from "@mui/icons-material/Telegram";
import { useTranslations } from "next-intl";
import { useAuth } from "../model/useAuth";
import { brand } from "@/shared/theme";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const t = useTranslations("auth");
  const { login, loading, error } = useAuth();
  const [telegramId, setTelegramId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramId.trim()) return;
    try {
      await login({ telegram_id: telegramId.trim() });
      onSuccess?.();
    } catch {
      // error handled in hook
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
        startIcon={<TelegramIcon />}
        fullWidth
      >
        {t("loginWithTelegram")}
      </Button>
    </Box>
  );
}
