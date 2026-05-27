"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { alpha, useTheme } from "@mui/material/styles";
import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/navigation";
import { brand } from "@/shared/theme";

// Цветовые токены для тёмного фона футера
const onDark = (ivoryColor: string, creamColor: string) => ({
  primary:  ivoryColor,
  secondary: alpha(creamColor, 0.55),
  muted:     alpha(creamColor, 0.38),
  line:      alpha(creamColor, 0.10),
  input:     alpha(ivoryColor, 0.07),
  inputHov:  alpha(ivoryColor, 0.12),
});

// ─── FooterLogo ───────────────────────────────────────────────────────────────
function FooterLogo() {
  const theme = useTheme();
  const on = onDark(theme.palette.background.paper, brand.cream);
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <Box
        sx={{
          width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
          background:  `radial-gradient(circle at 38% 38%, ${brand.blush}, ${theme.palette.primary.main} 70%)`,
          boxShadow:   `0 2px 8px -2px ${alpha(theme.palette.primary.main, 0.50)}`,
        }}
      />
      <Typography sx={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400, fontSize: "17px", lineHeight: 1, color: on.primary, letterSpacing: "-0.01em" }}>
        Gym Balance
      </Typography>
    </Box>
  );
}

// ─── FooterColumn ─────────────────────────────────────────────────────────────
interface FooterColumnProps {
  heading: string;
  links:   { label: string; href: string }[];
}

function FooterColumn({ heading, links }: FooterColumnProps) {
  const theme = useTheme();
  const on = onDark(theme.palette.background.paper, brand.cream);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: on.muted }}>
        {heading}
      </Typography>
      {links.map(({ label, href }) => (
        <Link key={href} href={href} style={{ textDecoration: "none" }}>
          <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "14px", lineHeight: 1.4, color: on.secondary, transition: "color 0.18s ease", "&:hover": { color: on.primary } }}>
            {label}
          </Typography>
        </Link>
      ))}
    </Box>
  );
}

// ─── NewsletterForm ───────────────────────────────────────────────────────────
function NewsletterForm() {
  const t     = useTranslations("footer");
  const theme = useTheme();
  const on    = onDark(theme.palette.background.paper, brand.cream);

  const [email, setEmail] = useState("");
  const [sent,  setSent]  = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: on.muted }}>
        {t("newsletterHeading")}
      </Typography>
      <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", lineHeight: 1.6, color: on.secondary, maxWidth: "220px" }}>
        {t("newsletterDesc")}
      </Typography>

      {sent ? (
        <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", color: "primary.main" }}>
          {t("subscribeSuccess")}
        </Typography>
      ) : (
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex", alignItems: "center",
            borderRadius: "100px", backgroundColor: on.input,
            border: `1px solid ${on.line}`, overflow: "hidden",
            transition: "background-color 0.2s ease",
            "&:hover": { backgroundColor: on.inputHov },
            "&:focus-within": { backgroundColor: on.inputHov, borderColor: alpha(brand.cream, 0.22) },
          }}
        >
          <TextField
            type="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="standard"
            InputProps={{ disableUnderline: true }}
            sx={{
              flex: 1, px: "18px",
              "& input": {
                fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px",
                color: on.primary, py: "10px",
                "&::placeholder": { color: on.muted, opacity: 1 },
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px",
              borderRadius: "100px", px: "18px", py: "9px",
              mr: "4px", my: "4px", whiteSpace: "nowrap", flexShrink: 0, boxShadow: "none",
              "&:hover": { boxShadow: "none" },
            }}
          >
            {t("subscribeBtn")}
          </Button>
        </Box>
      )}
    </Box>
  );
}

// ─── AppFooter ────────────────────────────────────────────────────────────────
const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Telegram",  href: "https://t.me"          },
  { label: "YouTube",   href: "https://youtube.com"   },
];

export function AppFooter() {
  const t     = useTranslations("footer");
  const theme = useTheme();
  const on    = onDark(theme.palette.background.paper, brand.cream);

  const practiceLinks = [
    { label: t("links.programs"),   href: "/programs"   },
    { label: t("links.live"),       href: "/live"       },
    { label: t("links.mySpace"),    href: "/main"       },
    { label: t("links.challenges"), href: "/challenges" },
  ];

  const communityLinks = [
    { label: t("links.stories"),  href: "/stories" },
    { label: t("links.team"),     href: "/team"    },
    { label: t("links.blog"),     href: "/blog"    },
    { label: t("links.contacts"), href: "/contact" },
  ];

  return (
    <Box
      component="footer"
      sx={{
        position:        "relative",
        backgroundColor: brand.cocoa,
        overflow:        "hidden",
        pt:              { xs: 6, md: 8 },
        pb:              0,
      }}
    >
      {/* Декоративный круг */}
      <Box
        aria-hidden
        sx={{
          position: "absolute", right: { xs: "-120px", md: "-80px" },
          top: "50%", transform: "translateY(-50%)",
          width: { xs: "280px", md: "360px" }, height: { xs: "280px", md: "360px" },
          borderRadius: "50%", pointerEvents: "none",
          background: `radial-gradient(circle at 40% 40%, ${alpha(brand.blush, 0.28)}, ${alpha(theme.palette.primary.main, 0.18)} 55%, transparent 75%)`,
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1, maxWidth: "1200px", mx: "auto", px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Сетка */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "2fr 1.2fr 1.2fr 1.8fr" },
            gap: { xs: "40px", md: "48px" },
            pb:  { xs: 5, md: 6 },
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <FooterLogo />
            <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", lineHeight: 1.7, color: on.secondary, maxWidth: "230px" }}>
              {t("tagline")}
            </Typography>
          </Box>

          <FooterColumn heading={t("practiceHeading")}   links={practiceLinks}  />
          <FooterColumn heading={t("communityHeading")}  links={communityLinks} />
          <NewsletterForm />
        </Box>

        {/* Нижняя строка */}
        <Box
          sx={{
            display: "flex", flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: "12px", py: "20px",
            borderTop: `1px solid ${on.line}`,
          }}
        >
          <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px", color: on.muted }}>
            {t("copyright")}
          </Typography>

          <Box sx={{ display: "flex", gap: "24px" }}>
            {SOCIAL_LINKS.map(({ label, href }) => (
              <Box
                key={label}
                component="a"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px",
                  color: on.muted, textDecoration: "none",
                  transition: "color 0.18s ease", "&:hover": { color: on.secondary },
                }}
              >
                {label}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
