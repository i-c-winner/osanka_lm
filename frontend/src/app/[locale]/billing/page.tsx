"use client";

import Box       from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha }  from "@mui/material/styles";
import { brand }  from "@/shared/theme";

export default function BillingPage() {
  return (
    <Box sx={{ maxWidth: "1100px", mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: "32px", md: "48px" } }}>
      <Typography className="eyebrow" sx={{ display: "block", mb: "12px" }}>
        Финансы
      </Typography>
      <Typography sx={{
        fontFamily: "var(--font-display)", fontWeight: 400,
        fontSize: "clamp(36px, 4vw, 52px)", lineHeight: 1.0,
        color: brand.cocoa, mb: "40px",
      }}>
        Billing
      </Typography>

      <Box sx={{
        borderRadius: "22px",
        border: `1px dashed ${alpha(brand.line, 0.8)}`,
        p: { xs: "32px", md: "48px" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "14px", color: brand.mute }}>
          Раздел в разработке
        </Typography>
      </Box>
    </Box>
  );
}
