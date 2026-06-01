import { createTheme, alpha } from "@mui/material/styles";

// ─── Brand tokens ─────────────────────────────────────────────────────────────

const brand = {
  cream:           "#FCE0D0",   // светлый нюдовый — основной фон
  cream2:          "#F5CEBF",   // чуть темнее для вторичных фонов
  shell:           "#FEF0EA",   // очень светлый нюдовый
  ivory:           "#FFF8F5",   // почти белый с тёплым тоном
  cocoa:           "#3D1A1C",   // очень тёмный ягодный — основной текст
  cocoaSoft:       "#793435",   // глубокий ягодный — вторичный текст
  mute:            "#B87A80",   // приглушённый розово-ягодный
  line:            "#E0B4B3",   // пудрово-розовый — линии и бордеры
  terracotta:      "#A83D56",   // насыщенный тёмно-розовый — основной акцент
  terracottaDeep:  "#8A2E46",   // более тёмный акцент
  blush:           "#F2D0D0",   // очень светло-розовый
  rose:            "#E0B4B3",   // пудрово-розовый
  sage:            "#7A9C80",   // зелёный (success)
  gold:            "#C49070",   // тёплый золотистый
} as const;

const fonts = {
  display: "'Cormorant Garamond', 'Times New Roman', serif",
  body:    "'Manrope', system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

const shadows = {
  xs:    "0 1px 4px rgba(60,30,15,0.10)",
  sm:    "0 6px 16px -8px rgba(60,30,15,0.18)",
  md:    "0 18px 40px -18px rgba(60,30,15,0.30)",
  lg:    "0 24px 50px -20px rgba(60,30,15,0.40)",
  xl:    "0 40px 80px -30px rgba(60,30,15,0.35)",
  hover: "0 30px 60px -30px rgba(60,30,15,0.25)",
  cta:   `0 10px 30px -10px ${alpha(brand.terracotta, 0.70)}`,
  ctaHov:`0 14px 38px -10px ${alpha(brand.terracotta, 0.80)}`,
};

// ─── Theme ────────────────────────────────────────────────────────────────────

export const theme = createTheme({
  // ─ Palette ──────────────────────────────────────────────────────────────────
  palette: {
    primary: {
      main:         brand.terracotta,
      dark:         brand.terracottaDeep,
      light:        brand.blush,
      contrastText: "#ffffff",
    },
    secondary: {
      main:         brand.blush,
      dark:         brand.rose,
      light:        brand.cream2,
      contrastText: brand.cocoa,
    },
    success: {
      main:         brand.sage,
      contrastText: "#ffffff",
    },
    warning: {
      main:         brand.gold,
      contrastText: brand.cocoa,
    },
    error: {
      main:         "#B04040",
      contrastText: "#ffffff",
    },
    text: {
      primary:   brand.cocoa,
      secondary: brand.cocoaSoft,
      disabled:  brand.mute,
    },
    background: {
      default: brand.cream,
      paper:   brand.ivory,
    },
    divider: brand.line,
    // Extend palette with brand tokens via augmentColor or custom keys
    // (accessible as theme.palette.brand.* after module augmentation)
  },

  // ─ Typography ───────────────────────────────────────────────────────────────
  typography: {
    fontFamily:  fonts.body,
    fontWeightLight:   300,
    fontWeightRegular: 400,
    fontWeightMedium:  500,
    fontWeightBold:    700,

    h1: {
      fontFamily:    fonts.display,
      fontWeight:    400,
      fontSize:      "clamp(44px, 4.4vw, 68px)",
      lineHeight:    1.0,
      letterSpacing: "-0.02em",
      color:         brand.cocoa,
    },
    h2: {
      fontFamily:    fonts.display,
      fontWeight:    400,
      fontSize:      "clamp(36px, 3.2vw, 52px)",
      lineHeight:    1.0,
      letterSpacing: "-0.02em",
      color:         brand.cocoa,
    },
    h3: {
      fontFamily:    fonts.display,
      fontWeight:    400,
      fontSize:      "36px",
      lineHeight:    1.05,
      letterSpacing: "-0.01em",
      color:         brand.cocoa,
    },
    h4: {
      fontFamily:    fonts.display,
      fontWeight:    500,
      fontSize:      "28px",
      lineHeight:    1.05,
      letterSpacing: "-0.01em",
      color:         brand.cocoa,
    },
    h5: {
      fontFamily:    fonts.display,
      fontWeight:    500,
      fontSize:      "22px",
      lineHeight:    1.1,
      letterSpacing: "-0.005em",
      color:         brand.cocoa,
    },
    h6: {
      fontFamily:    fonts.display,
      fontWeight:    500,
      fontSize:      "18px",
      lineHeight:    1.15,
      color:         brand.cocoa,
    },
    subtitle1: {
      fontFamily:  fonts.body,
      fontWeight:  600,
      fontSize:    "15px",
      lineHeight:  1.5,
      color:       brand.cocoa,
    },
    subtitle2: {
      fontFamily:  fonts.body,
      fontWeight:  600,
      fontSize:    "13px",
      lineHeight:  1.4,
      color:       brand.cocoaSoft,
    },
    body1: {
      fontFamily:  fonts.body,
      fontWeight:  400,
      fontSize:    "15px",
      lineHeight:  1.55,
      color:       brand.cocoa,
    },
    body2: {
      fontFamily:  fonts.body,
      fontWeight:  400,
      fontSize:    "13px",
      lineHeight:  1.5,
      color:       brand.cocoaSoft,
    },
    caption: {
      fontFamily:  fonts.body,
      fontWeight:  400,
      fontSize:    "12px",
      lineHeight:  1.5,
      color:       brand.mute,
    },
    overline: {
      fontFamily:    fonts.body,
      fontWeight:    600,
      fontSize:      "11px",
      lineHeight:    1.2,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color:         brand.terracottaDeep,
    },
    button: {
      fontFamily:    fonts.body,
      fontWeight:    600,
      fontSize:      "13px",
      letterSpacing: "0.05em",
      textTransform: "uppercase",
    },
  },

  // ─ Shape ────────────────────────────────────────────────────────────────────
  shape: {
    borderRadius: 22, // radius-md as default
  },

  // ─ Shadows ──────────────────────────────────────────────────────────────────
  // MUI uses indices 0-24; we map our scale to a few key slots
  shadows: [
    "none",                                          // 0 – none
    shadows.xs,                                      // 1 – xs
    shadows.sm,                                      // 2 – sm
    shadows.md,                                      // 3 – md
    shadows.lg,                                      // 4 – lg
    shadows.xl,                                      // 5 – xl
    shadows.hover,                                   // 6 – hover
    shadows.cta,                                     // 7 – cta
    shadows.ctaHov,                                  // 8 – cta-hover
    shadows.sm, shadows.sm, shadows.sm, shadows.sm,  // 9-12
    shadows.md, shadows.md, shadows.md, shadows.md,  // 13-16
    shadows.lg, shadows.lg, shadows.lg, shadows.lg,  // 17-20
    shadows.xl, shadows.xl, shadows.xl, shadows.xl,  // 21-24
  ],

  // ─ Transitions ──────────────────────────────────────────────────────────────
  transitions: {
    easing: {
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      easeOut:   "cubic-bezier(0.0, 0, 0.2, 1)",
      easeIn:    "cubic-bezier(0.4, 0, 1, 1)",
      sharp:     "cubic-bezier(0.4, 0, 0.6, 1)",
    },
    duration: {
      shortest:        150,
      shorter:         200,
      short:           300,
      standard:        200,
      complex:         300,
      enteringScreen:  200,
      leavingScreen:   150,
    },
  },

  // ─ Component overrides ──────────────────────────────────────────────────────
  components: {

    // ── CssBaseline ───────────────────────────────────────────────────────────
    MuiCssBaseline: {
      styleOverrides: `
        ::selection { background: ${brand.terracotta}; color: #fff; }

        h1 em, h2 em, h3 em, h4 em {
          font-style: italic;
          color: ${brand.terracottaDeep};
        }

        .eyebrow {
          font-family: ${fonts.body};
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: ${brand.terracottaDeep};
        }
      `,
    },

    // ── Button ────────────────────────────────────────────────────────────────
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: "999px",
          fontFamily:   fonts.body,
          fontWeight:   600,
          letterSpacing:"0.05em",
          textTransform:"uppercase",
          transition:   `background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease`,
          "&:active": { transform: "translateY(1px)" },
        },
        containedPrimary: {
          background:   brand.terracotta,
          color:        "#fff",
          padding:      "14px 28px",
          boxShadow:    shadows.cta,
          "&:hover": {
            background: brand.terracottaDeep,
            transform:  "translateY(-1px)",
            boxShadow:  shadows.ctaHov,
          },
        },
        containedSecondary: {
          background: brand.cocoa,
          color:      brand.ivory,
          "&:hover": {
            background: brand.terracottaDeep,
          },
        },
        outlinedPrimary: {
          borderColor: brand.cocoa,
          color:       brand.cocoa,
          padding:     "12px 20px",
          "&:hover": {
            background:  brand.cocoa,
            borderColor: brand.cocoa,
            color:       brand.ivory,
          },
        },
        sizeLarge: {
          padding:    "16px 36px",
          fontSize:   "15px",
        },
        sizeSmall: {
          padding:    "8px 16px",
          fontSize:   "12px",
          letterSpacing: "0.06em",
        },
      },
    },

    // ── Card ──────────────────────────────────────────────────────────────────
    MuiCard: {
      styleOverrides: {
        root: {
          background:   brand.ivory,
          border:       `1px solid ${alpha(brand.line, 0.6)}`,
          borderRadius: "30px",
          boxShadow:    "none",
          transition:   "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            // Only apply lift if the card is interactive (has onClick)
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding:   "28px",
          "&:last-child": { paddingBottom: "28px" },
        },
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          padding: "0 28px 24px",
        },
      },
    },

    // ── Paper ─────────────────────────────────────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        root: {
          background:   brand.ivory,
          backgroundImage: "none",
          borderRadius: "30px",
        },
        outlined: {
          border: `1px solid ${brand.line}`,
        },
        elevation1: { boxShadow: shadows.xs },
        elevation2: { boxShadow: shadows.sm },
        elevation3: { boxShadow: shadows.md },
        elevation4: { boxShadow: shadows.lg },
      },
    },

    // ── AppBar ────────────────────────────────────────────────────────────────
    MuiAppBar: {
      styleOverrides: {
        root: {
          background:    `color-mix(in oklab, ${brand.cream} 80%, transparent)`,
          backdropFilter:"blur(14px)",
          borderBottom:  `1px solid ${alpha(brand.line, 0.6)}`,
          borderRadius:  0,
          boxShadow:     "none",
          color:         brand.cocoa,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: { padding: "22px 48px" },
      },
    },

    // ── Chip ──────────────────────────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily:    fonts.body,
          fontWeight:    600,
          fontSize:      "12px",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          borderRadius:  "999px",
          height:        "auto",
          padding:       "6px 2px",
        },
        colorDefault: {
          background: brand.cream2,
          color:      brand.cocoa,
        },
        colorPrimary: {
          background: brand.terracotta,
          color:      "#fff",
        },
        colorSuccess: {
          background: brand.sage,
          color:      "#fff",
        },
        colorWarning: {
          background: brand.gold,
          color:      brand.cocoa,
        },
        colorError: {
          background: "#B04040",
          color:      "#fff",
        },
      },
    },

    // ── TextField / Input ─────────────────────────────────────────────────────
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius:  "999px",
          background:    brand.ivory,
          fontFamily:    fonts.body,
          fontSize:      "14px",
          "& fieldset": {
            borderColor: brand.line,
          },
          "&:hover fieldset": {
            borderColor: brand.cocoaSoft,
          },
          "&.Mui-focused fieldset": {
            borderColor: brand.terracotta,
            borderWidth: "1.5px",
          },
        },
        input: {
          padding: "12px 20px",
          "&::placeholder": { color: brand.mute, opacity: 1 },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily:  fonts.body,
          fontSize:    "14px",
          color:       brand.mute,
          "&.Mui-focused": { color: brand.terracottaDeep },
        },
      },
    },

    // ── Alert ─────────────────────────────────────────────────────────────────
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: "22px",
          fontFamily:   fonts.body,
          fontSize:     "14px",
        },
        standardSuccess: { background: alpha(brand.sage, 0.12), color: brand.cocoa },
        standardWarning: { background: alpha(brand.gold, 0.12), color: brand.cocoa },
        standardError:   { background: alpha("#B04040", 0.1),   color: brand.cocoa },
        standardInfo:    { background: alpha(brand.blush, 0.3),  color: brand.cocoa },
      },
    },

    // ── Dialog ────────────────────────────────────────────────────────────────
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "30px",
          padding:      "8px",
          background:   brand.ivory,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily:  fonts.display,
          fontWeight:  400,
          fontSize:    "24px",
          color:       brand.cocoa,
          padding:     "24px 28px 12px",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "8px 28px 16px",
          fontFamily: fonts.body,
          fontSize: "15px",
          color: brand.cocoaSoft,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: { padding: "8px 20px 20px", gap: "8px" },
      },
    },

    // ── List ──────────────────────────────────────────────────────────────────
    MuiListItem: {
      styleOverrides: {
        root: {
          fontFamily: fonts.body,
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontFamily: fonts.body,
          color:      brand.cocoa,
        },
        secondary: {
          fontFamily: fonts.body,
          color:      brand.mute,
          fontSize:   "12px",
        },
      },
    },

    // ── Divider ───────────────────────────────────────────────────────────────
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: brand.line },
      },
    },

    // ── CircularProgress ──────────────────────────────────────────────────────
    MuiCircularProgress: {
      styleOverrides: {
        colorPrimary: { color: brand.terracotta },
      },
    },

    // ── LinearProgress ────────────────────────────────────────────────────────
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          height:       "5px",
          background:   alpha(brand.line, 0.6),
        },
        barColorPrimary: { background: brand.terracotta },
      },
    },

    // ── Tabs ──────────────────────────────────────────────────────────────────
    MuiTabs: {
      styleOverrides: {
        root: {
          background:   brand.cream2,
          borderRadius: "999px",
          padding:      "4px",
          minHeight:    "auto",
        },
        indicator: {
          display: "none",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily:    fonts.body,
          fontWeight:    600,
          fontSize:      "12px",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color:         brand.cocoaSoft,
          borderRadius:  "999px",
          minHeight:     "auto",
          padding:       "8px 16px",
          "&.Mui-selected": {
            background:  brand.ivory,
            color:       brand.cocoa,
            boxShadow:   shadows.xs,
          },
        },
      },
    },

    // ── Container ─────────────────────────────────────────────────────────────
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft:  "48px",
          paddingRight: "48px",
          "@media (max-width: 1080px)": {
            paddingLeft:  "32px",
            paddingRight: "32px",
          },
          "@media (max-width: 640px)": {
            paddingLeft:  "20px",
            paddingRight: "20px",
          },
        },
      },
    },

    // ── Tooltip ───────────────────────────────────────────────────────────────
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background:  brand.cocoa,
          color:       brand.ivory,
          fontFamily:  fonts.body,
          fontSize:    "12px",
          borderRadius:"14px",
          padding:     "8px 14px",
        },
      },
    },
  },
});

// Re-export brand tokens for use in custom CSS-in-JS
export { brand, shadows as brandShadows, fonts as brandFonts };
