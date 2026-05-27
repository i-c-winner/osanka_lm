"use client";

import Box          from "@mui/material/Box";
import Typography   from "@mui/material/Typography";
import { alpha }    from "@mui/material/styles";
import { useTranslations } from "next-intl";
import { brand }    from "@/shared/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

type CardVariant = "default" | "warm" | "sage" | "featured";

interface ReviewMeta {
  id:      number;
  variant: CardVariant;
  avatar:  string;
}

const REVIEWS: ReviewMeta[] = [
  { id: 1, variant: "default",  avatar: brand.blush },
  { id: 2, variant: "warm",     avatar: brand.sage },
  { id: 3, variant: "sage",     avatar: brand.sage },
  { id: 4, variant: "featured", avatar: brand.terracotta },
  { id: 5, variant: "default",  avatar: brand.blush },
  { id: 6, variant: "sage",     avatar: brand.terracotta },
  { id: 7, variant: "default",  avatar: brand.cream2 },
  { id: 8, variant: "default",  avatar: brand.blush },
  { id: 9, variant: "warm",     avatar: brand.rose },
];

const BG: Record<CardVariant, string> = {
  default:  brand.ivory,
  warm:     alpha(brand.blush,  0.55),
  sage:     alpha(brand.sage,   0.13),
  featured: brand.cocoa,
};

const BORDER: Record<CardVariant, string> = {
  default:  `1px solid ${alpha(brand.line, 0.7)}`,
  warm:     "none",
  sage:     "none",
  featured: "none",
};

// ─── Stars ────────────────────────────────────────────────────────────────────

function Stars() {
  return (
    <Box sx={{ display: "flex", gap: "3px" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Box
          key={i}
          component="span"
          sx={{ fontSize: "20px", color: brand.terracotta, lineHeight: 1 }}
        >
          ★
        </Box>
      ))}
    </Box>
  );
}

// ─── ReviewCard ───────────────────────────────────────────────────────────────

interface ReviewCardProps {
  text:    string;
  name:    string;
  since:   string;
  variant: CardVariant;
  avatar:  string;
}

function ReviewCard({ text, name, since, variant, avatar }: ReviewCardProps) {
  const isFeatured = variant === "featured";

  return (
    <Box
      sx={{
        display:         "flex",
        flexDirection:   "column",
        justifyContent:  "space-between",
        borderRadius:    "20px",
        p:               "24px",
        backgroundColor: BG[variant],
        border:          BORDER[variant],
        boxShadow:       variant === "default"
          ? `0 2px 12px -4px ${alpha(brand.cocoa, 0.06)}`
          : "none",
      }}
    >
      {/* Quote text */}
      <Typography
        sx={{
          fontFamily:  "var(--font-display)",
          fontWeight:  400,
          fontSize:    "clamp(14px, 1vw, 16px)",
          lineHeight:  1.55,
          fontStyle:   isFeatured ? "italic" : "normal",
          color:       isFeatured ? brand.ivory : "text.primary",
          mb:          "20px",
          flex:        1,
        }}
      >
        {text}
      </Typography>

      {/* Author */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Box
          sx={{
            width:           "32px",
            height:          "32px",
            borderRadius:    "50%",
            backgroundColor: avatar,
            flexShrink:      0,
          }}
        />
        <Box>
          <Typography
            sx={{
              fontFamily:  "var(--font-body)",
              fontWeight:  600,
              fontSize:    "13px",
              lineHeight:  1.3,
              color:       isFeatured ? brand.ivory : "text.primary",
            }}
          >
            {name}
          </Typography>
          <Typography
            sx={{
              fontFamily:  "var(--font-body)",
              fontWeight:  400,
              fontSize:    "11px",
              lineHeight:  1.4,
              color:       isFeatured
                ? alpha(brand.ivory, 0.55)
                : "text.disabled",
            }}
          >
            {since}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ─── ReviewsSection ───────────────────────────────────────────────────────────

export function ReviewsSection() {
  const t = useTranslations("reviews");

  return (
    <Box
      component="section"
      sx={{
        backgroundColor: "background.default",
        px:              { xs: 2, sm: 3, md: 4 },
        pt:              { xs: 6, md: 10 },
        pb:              { xs: 8, md: 12 },
      }}
    >
      <Box sx={{ maxWidth: "1100px", mx: "auto" }}>

        {/* Header row */}
        <Box
          sx={{
            display:        { xs: "block", md: "flex" },
            alignItems:     "flex-start",
            justifyContent: "space-between",
            gap:            "32px",
            mb:             { xs: 5, md: 7 },
          }}
        >
          {/* Left: eyebrow + heading */}
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontFamily:    "var(--font-body)",
                fontWeight:    500,
                fontSize:      "11px",
                letterSpacing: "0.20em",
                textTransform: "uppercase",
                color:         "text.disabled",
                mb:            "16px",
              }}
            >
              {t("eyebrow")}
            </Typography>
            <Typography
              component="h2"
              sx={{
                fontFamily:    "var(--font-display)",
                fontWeight:    400,
                fontSize:      "clamp(36px, 4.5vw, 68px)",
                lineHeight:    1.05,
                letterSpacing: "-0.02em",
                color:         "text.primary",
              }}
            >
              {t("titleNormal")}{" "}
              <Box component="em" sx={{ fontStyle: "italic", color: "primary.main" }}>
                {t("titleItalic")}
              </Box>{" "}
              {t("titleEnd")}
            </Typography>
          </Box>

          {/* Right: rating */}
          <Box
            sx={{
              textAlign:  { xs: "left", md: "right" },
              mt:         { xs: "20px", md: "8px" },
              flexShrink: 0,
            }}
          >
            <Stars />
            <Typography
              sx={{
                fontFamily:    "var(--font-display)",
                fontWeight:    400,
                fontSize:      "28px",
                letterSpacing: "-0.02em",
                color:         "text.primary",
                mt:            "6px",
              }}
            >
              {t("rating")}
            </Typography>
            <Typography
              sx={{
                fontFamily:    "var(--font-body)",
                fontWeight:    400,
                fontSize:      "11px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color:         "text.disabled",
                mt:            "2px",
              }}
            >
              {t("ratingCount")}
            </Typography>
          </Box>
        </Box>

        {/* 3×3 grid */}
        <Box
          sx={{
            display:             "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
            gap:                 "12px",
          }}
        >
          {REVIEWS.map(({ id, variant, avatar }) => (
            <ReviewCard
              key={id}
              text={t(`r${id}Text`)}
              name={t(`r${id}Name`)}
              since={t(`r${id}Since`)}
              variant={variant}
              avatar={avatar}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
