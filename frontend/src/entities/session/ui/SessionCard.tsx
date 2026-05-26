"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import { useTranslations } from "next-intl";
import { formatTime, formatDate } from "@/shared/lib/format";
import { brand } from "@/shared/theme";
import type { SessionResponse } from "../model/types";

interface SessionCardProps {
  session: SessionResponse;
  bookedCount?: number;
  isBooked?: boolean;
  action?: React.ReactNode;
}

export function SessionCard({
  session,
  bookedCount = 0,
  isBooked = false,
  action,
}: SessionCardProps) {
  const t = useTranslations("sessions");

  const isFull = bookedCount >= session.capacity;

  const statusStyles: Record<string, { bg: string; color: string }> = {
    active:    { bg: brand.sage,      color: "#fff" },
    cancelled: { bg: "#B04040",       color: "#fff" },
    completed: { bg: brand.cream2,    color: brand.mute },
  };

  const chipStyle = statusStyles[session.status] ?? statusStyles.completed;

  return (
    <Card
      variant="outlined"
      sx={{
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 30px 60px -30px rgba(60,30,15,0.25)",
        },
      }}
    >
      <CardContent>
        {/* Header row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "22px",
              color: brand.cocoa,
              lineHeight: 1.1,
            }}
          >
            {formatDate(session.starts_at)}
          </Typography>

          <Box
            sx={{
              px: "10px",
              py: "4px",
              borderRadius: "999px",
              background: chipStyle.bg,
              color: chipStyle.color,
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {t(`status.${session.status}`)}
          </Box>
        </Box>

        {/* Time + capacity */}
        <Box sx={{ display: "flex", gap: 2, color: brand.mute }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption">
              {formatTime(session.starts_at)} – {formatTime(session.ends_at)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <PeopleIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption">
              {t("capacity", { booked: bookedCount, total: session.capacity })}
            </Typography>
          </Box>
        </Box>

        {/* State chips */}
        {isBooked && (
          <Chip
            size="small"
            label={t("booked")}
            sx={{
              mt: 1.5,
              background: brand.terracotta,
              color: "#fff",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
            }}
          />
        )}
        {!isBooked && isFull && (
          <Chip
            size="small"
            label={t("full")}
            sx={{
              mt: 1.5,
              background: brand.cream2,
              color: brand.mute,
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
            }}
          />
        )}
      </CardContent>

      {action && (
        <CardActions>
          {action}
        </CardActions>
      )}
    </Card>
  );
}
