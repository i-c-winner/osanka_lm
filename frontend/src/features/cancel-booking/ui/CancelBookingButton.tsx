"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import { useTranslations } from "next-intl";
import { bookingsApi } from "@/shared/api";

interface CancelBookingButtonProps {
  bookingId: string;
  onCancelled?: () => void;
}

export function CancelBookingButton({ bookingId, onCancelled }: CancelBookingButtonProps) {
  const t = useTranslations("bookings");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      await bookingsApi.cancel(bookingId);
      setOpen(false);
      onCancelled?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="error"
        size="small"
        onClick={() => setOpen(true)}
      >
        {t("cancelBooking")}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{t("cancelBooking")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("cancelConfirm")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            {tCommon("cancel")}
          </Button>
          <Button
            onClick={handleCancel}
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={14} /> : undefined}
          >
            {tCommon("confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
