"use client";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useTranslations } from "next-intl";

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const t = useTranslations("common");

  return (
    <Box sx={{ p: 2 }}>
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Button color="inherit" size="small" onClick={onRetry}>
              {t("retry")}
            </Button>
          ) : undefined
        }
      >
        {message ?? t("error")}
      </Alert>
    </Box>
  );
}
