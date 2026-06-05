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
import { useRouter } from "@/shared/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../model/useAuth";
import { brand } from "@/shared/theme";
import { TelegramLoginButton, type TelegramUser } from "./TelegramLoginButton";

const isProd = process.env.NODE_ENV === "production";
const BOT_NAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "";

export function LoginForm() {
  const t = useTranslations("auth");
  const { login, loading, error } = useAuth();
  const [telegramId, setTelegramId] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      const from = searchParams.get("from") ?? "/my-space";
      router.replace(from as "/my-space");
    }
  }, [router, searchParams]);

  const redirect = () => {
    const from = searchParams.get("from") ?? "/my-space";
    router.push(from as "/my-space");
  };

  const handleTelegramAuth = async (user: TelegramUser) => {
    try {
      await login({
        telegram_id: String(user.id),
        telegram_username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
      });
      redirect();
    } catch {
      // ошибка обрабатывается в хуке
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!telegramId.trim()) return;
    try {
      await login({ telegram_id: telegramId.trim() });
      redirect();
    } catch {
      // ошибка обрабатывается в хуке
    }
  };

  return (
    <Box
      component={isProd ? "div" : "form"}
      onSubmit={isProd ? undefined : handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
    >
      {/* Eyebrow */}
      <Typography
        sx={{
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: "11px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: brand.terracottaDeep,
        }}
      >
        Добро пожаловать
      </Typography>

      {/* Title */}
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontWeight: 400,
          fontSize: "36px",
          lineHeight: 1.05,
          color: brand.cocoa,
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

      {isProd ? (
        <TelegramLoginButton
          botName={BOT_NAME}
          onAuth={handleTelegramAuth}
          disabled={loading}
        />
      ) : (
        <>
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
            startIcon={
              loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <TelegramIcon />
              )
            }
            fullWidth
          >
            {t("loginWithTelegram")}
          </Button>
        </>
      )}
    </Box>
  );
}
