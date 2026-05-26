"use client";

import Chip from "@mui/material/Chip";
import { useTranslations } from "next-intl";
import type { BookingStatus } from "@/shared/api";

const colorMap: Record<BookingStatus, "primary" | "success" | "error" | "warning" | "default"> = {
  booked: "primary",
  attended: "success",
  missed: "warning",
  cancelled: "error",
};

interface BookingStatusChipProps {
  status: BookingStatus;
}

export function BookingStatusChip({ status }: BookingStatusChipProps) {
  const t = useTranslations("bookings");

  return (
    <Chip
      size="small"
      label={t(`status.${status}`)}
      color={colorMap[status] ?? "default"}
    />
  );
}
