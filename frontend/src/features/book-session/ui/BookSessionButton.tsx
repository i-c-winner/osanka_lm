"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useTranslations } from "next-intl";
import { bookingsApi } from "@/shared/api";

interface BookSessionButtonProps {
  sessionId: string;
  isBooked: boolean;
  isFull: boolean;
  onBooked?: () => void;
}

export function BookSessionButton({
  sessionId,
  isBooked,
  isFull,
  onBooked,
}: BookSessionButtonProps) {
  const t = useTranslations("sessions");
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    if (isBooked || isFull) return;
    setLoading(true);
    try {
      await bookingsApi.create(sessionId);
      onBooked?.();
    } finally {
      setLoading(false);
    }
  };

  if (isBooked) {
    return (
      <Button variant="outlined" disabled size="small">
        {t("booked")}
      </Button>
    );
  }

  if (isFull) {
    return (
      <Button variant="outlined" color="warning" disabled size="small">
        {t("full")}
      </Button>
    );
  }

  return (
    <Button
      variant="contained"
      size="small"
      onClick={handleBook}
      disabled={loading}
      startIcon={loading ? <CircularProgress size={14} /> : undefined}
    >
      {t("book")}
    </Button>
  );
}
