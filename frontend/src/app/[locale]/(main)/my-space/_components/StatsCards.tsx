"use client";

import Box         from "@mui/material/Box";
import Typography  from "@mui/material/Typography";
import { alpha }   from "@mui/material/styles";
import BoltIcon    from "@mui/icons-material/Bolt";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ShowChartIcon  from "@mui/icons-material/ShowChart";
import { brand }   from "@/shared/theme";

// ─── Иконка в цветном круге ───────────────────────────────────────────────────

function IconBadge({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <Box sx={{
      width: 36, height: 36, borderRadius: "50%",
      backgroundColor: dark ? alpha(brand.ivory, 0.15) : alpha(brand.terracotta, 0.12),
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Box sx={{ color: dark ? brand.ivory : brand.terracotta, display: "flex", alignItems: "center" }}>
        {children}
      </Box>
    </Box>
  );
}

// ─── Карточка 1: серия практики ───────────────────────────────────────────────

function StreakCard() {
  return (
    <Box sx={{
      borderRadius: "22px",
      background: `linear-gradient(145deg, ${brand.cocoa} 0%, ${brand.cocoaSoft} 100%)`,
      p: "24px", display: "flex", flexDirection: "column", gap: "12px",
      boxShadow: `0 12px 32px -12px ${alpha(brand.cocoa, 0.45)}`,
      gridRow: "span 1",
    }}>
      <IconBadge dark><BoltIcon sx={{ fontSize: 18 }} /></IconBadge>

      <Box>
        <Typography sx={{
          fontFamily: "var(--font-display)", fontWeight: 400,
          fontSize: "clamp(32px, 3vw, 44px)", lineHeight: 1.0, color: brand.ivory,
        }}>
          14 дней
          <br />подряд
        </Typography>
      </Box>

      <Box>
        <Typography sx={{
          fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "10px",
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: alpha(brand.ivory, 0.5), mb: "6px",
        }}>
          Серия практики
        </Typography>
        <Typography sx={{
          fontFamily: "var(--font-body)", fontSize: "13px", lineHeight: 1.5,
          color: alpha(brand.ivory, 0.65),
        }}>
          Так держать — на этой неделе уже 4 занятия
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Карточка 2: в этом месяце ───────────────────────────────────────────────

function MonthCard() {
  return (
    <Box sx={{
      borderRadius: "22px", backgroundColor: brand.ivory,
      border: `1px solid ${alpha(brand.line, 0.7)}`,
      p: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between",
      boxShadow: `0 2px 12px -4px ${alpha(brand.cocoa, 0.07)}`,
    }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Typography sx={{
          fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "10px",
          letterSpacing: "0.2em", textTransform: "uppercase", color: brand.mute,
        }}>
          В этом месяце
        </Typography>
        <IconBadge><AccessTimeIcon sx={{ fontSize: 16 }} /></IconBadge>
      </Box>

      <Box sx={{ mt: "12px" }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
          <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "48px", fontWeight: 400, lineHeight: 1.0, color: brand.cocoa }}>
            18
          </Typography>
          <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 400, color: brand.mute }}>
            / 24
          </Typography>
        </Box>
        <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: brand.sage, fontWeight: 500, mt: "6px" }}>
          +3 к прошлому месяцу
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Карточка 3: минуты ───────────────────────────────────────────────────────

function MinutesCard() {
  return (
    <Box sx={{
      borderRadius: "22px", backgroundColor: brand.ivory,
      border: `1px solid ${alpha(brand.line, 0.7)}`,
      p: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between",
      boxShadow: `0 2px 12px -4px ${alpha(brand.cocoa, 0.07)}`,
    }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Typography sx={{
          fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "10px",
          letterSpacing: "0.2em", textTransform: "uppercase", color: brand.mute,
        }}>
          Минут на практике
        </Typography>
        <IconBadge><ShowChartIcon sx={{ fontSize: 16 }} /></IconBadge>
      </Box>

      <Box sx={{ mt: "12px" }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
          <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "48px", fontWeight: 400, lineHeight: 1.0, color: brand.cocoa }}>
            486
          </Typography>
          <Typography sx={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "20px", fontWeight: 400, color: brand.mute }}>
            мин
          </Typography>
        </Box>
        <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: brand.cocoaSoft, mt: "6px" }}>
          в среднем 27 мин за урок
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Круговой прогресс ────────────────────────────────────────────────────────

function CircularProgress({ value }: { value: number }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  return (
    <Box component="svg" sx={{ width: 56, height: 56, flexShrink: 0 }} viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} fill="none" stroke={alpha(brand.line, 0.7)} strokeWidth="4" />
      <circle cx="28" cy="28" r={r} fill="none" stroke={brand.terracotta} strokeWidth="4"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 28 28)" style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text x="28" y="33" textAnchor="middle" fontSize="11" fontWeight="700" fill={brand.cocoa}>
        {value}%
      </text>
    </Box>
  );
}

// ─── Карточка 4: программа ────────────────────────────────────────────────────

function ProgramCard() {
  return (
    <Box sx={{
      borderRadius: "22px", backgroundColor: brand.ivory,
      border: `1px solid ${alpha(brand.line, 0.7)}`,
      p: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between",
      boxShadow: `0 2px 12px -4px ${alpha(brand.cocoa, 0.07)}`,
    }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Typography sx={{
          fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "10px",
          letterSpacing: "0.2em", textTransform: "uppercase", color: brand.mute,
          maxWidth: "120px", lineHeight: 1.4,
        }}>
          Программа «Опора»
        </Typography>
        <CircularProgress value={72} />
      </Box>

      <Box sx={{ mt: "8px" }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
          <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "48px", fontWeight: 400, lineHeight: 1.0, color: brand.cocoa }}>
            8
          </Typography>
          <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 400, color: brand.mute }}>
            из 12
          </Typography>
        </Box>
        <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: brand.cocoaSoft, mt: "6px", lineHeight: 1.4 }}>
          Следующий — «Подвижность таза»
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Сетка карточек ───────────────────────────────────────────────────────────

export function StatsCards() {
  return (
    <Box sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1.1fr 1fr 1fr 1fr" },
      gap: "16px",
      mb: "28px",
    }}>
      <StreakCard />
      <MonthCard />
      <MinutesCard />
      <ProgramCard />
    </Box>
  );
}
