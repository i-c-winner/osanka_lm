"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha, keyframes } from "@mui/material/styles";
import { useTranslations } from "next-intl";
import { brand } from "@/shared/theme";

const tickerScroll = keyframes`
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

// Ключи слов + флаг italic — структурное решение дизайна, не переводится
const TICKER_KEYS: { key: string; italic?: boolean }[] = [
  { key: "mobility" },
  { key: "silence",   italic: true },
  { key: "strength" },
  { key: "awareness" },
  { key: "comfort" },
  { key: "balance",   italic: true },
  { key: "breathing" },
  { key: "support" },
];

// Один сет = BASE × 3 (~3360 px) — шире любого вьюпорта.
// Дублируется дважды; translateX(-50%) = один сет → бесшовная петля.
const TICKER_SET   = [...TICKER_KEYS, ...TICKER_KEYS, ...TICKER_KEYS];
const TICKER_ITEMS = [...TICKER_SET, ...TICKER_SET];

export function HelloMarquee() {
  const t = useTranslations("marquee");

  return (
    <Box
      sx={{
        overflow:        "hidden",
        backgroundColor: "background.paper",
        borderTop:       `1px solid ${alpha(brand.line, 0.9)}`,
        borderBottom:    `1px solid ${alpha(brand.line, 0.9)}`,
        py:              "14px",
        userSelect:      "none",
      }}
    >
      <Box
        sx={{
          display:    "flex",
          alignItems: "center",
          width:      "max-content",
          flexShrink: 0,
          flexWrap:   "nowrap",
          animation:  `${tickerScroll} 32s linear infinite`,
          willChange: "transform",
        }}
      >
        {TICKER_ITEMS.map(({ key, italic }, i) => (
          <Box
            key={i}
            sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}
          >
            <Box
              component="span"
              sx={{
                display:         "inline-block",
                width:           "5px",
                height:          "5px",
                borderRadius:    "50%",
                backgroundColor: "primary.main",
                mx:              "20px",
                flexShrink:      0,
                opacity:         0.75,
              }}
            />
            <Typography
              component="span"
              sx={{
                fontFamily:    italic ? "var(--font-display)" : "var(--font-body)",
                fontStyle:     italic ? "italic" : "normal",
                fontWeight:    400,
                fontSize:      italic ? "15px" : "13px",
                letterSpacing: italic ? "-0.01em" : "0.04em",
                color:         "text.secondary",
                whiteSpace:    "nowrap",
                flexShrink:    0,
              }}
            >
              {t(key)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
