"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { brand } from "@/shared/theme";
import { useMe } from "@/features/me/model/useMe";

export default function SuperAdminPage() {
  const router = useRouter();
  const { me, loading, hasRole } = useMe();

  useEffect(() => {
    if (loading) return;
    if (!hasRole("superadmin")) {
      router.replace("/");
    }
  }, [loading, me]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <Typography sx={{ fontFamily: "var(--font-body)", color: brand.mute }}>Загрузка...</Typography>
      </Box>
    );
  }

  if (!hasRole("superadmin")) return null;

  return (
    <Box sx={{
      maxWidth: "900px", mx: "auto",
      px: { xs: 2, sm: 3, md: 4 }, py: { xs: "32px", md: "48px" },
    }}>
      <Typography className="eyebrow" sx={{ display: "block", mb: "12px" }}>
        Системное управление
      </Typography>
      <Typography sx={{
        fontFamily: "var(--font-display)", fontWeight: 400,
        fontSize: "clamp(36px, 4vw, 52px)", lineHeight: 1.0,
        color: brand.cocoa, mb: "24px",
      }}>
        Супер
        <Box component="em" sx={{ fontStyle: "italic", color: brand.terracottaDeep }}> администратор</Box>
      </Typography>
      <Box sx={{
        borderRadius: "22px", backgroundColor: brand.ivory,
        border: `1px solid ${alpha(brand.line, 0.7)}`,
        p: { xs: "24px", md: "36px" },
        boxShadow: `0 2px 12px -4px ${alpha(brand.cocoa, 0.07)}`,
      }}>
        <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "15px", color: brand.cocoaSoft, lineHeight: 1.6 }}>
          Страница в разработке. Здесь будут инструменты системного уровня: роли, разрешения, конфигурация приложения.
        </Typography>
      </Box>
    </Box>
  );
}
