"use client";

import Box        from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button     from "@mui/material/Button";
import { alpha }  from "@mui/material/styles";
import AccessTimeOutlinedIcon  from "@mui/icons-material/AccessTimeOutlined";
import SignalCellularAltIcon   from "@mui/icons-material/SignalCellularAlt";
import PersonOutlineIcon       from "@mui/icons-material/PersonOutline";
import ChevronRightIcon        from "@mui/icons-material/ChevronRight";
import { brand } from "@/shared/theme";

// ─── Метаданные урока ─────────────────────────────────────────────────────────

function MetaItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
      <Box sx={{ color: alpha(brand.ivory, 0.5), display: "flex", alignItems: "center" }}>{icon}</Box>
      <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: alpha(brand.ivory, 0.7) }}>
        {text}
      </Typography>
    </Box>
  );
}

// ─── Карточка «Сегодня» ───────────────────────────────────────────────────────

function TodayCard() {
  return (
    <Box sx={{
      borderRadius: "22px",
      background: `linear-gradient(145deg, ${brand.cocoa} 0%, ${brand.cocoaSoft} 100%)`,
      p: "28px",
      boxShadow: `0 12px 32px -12px ${alpha(brand.cocoa, 0.45)}`,
      mb: "16px",
    }}>
      {/* Eyebrow */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mb: "16px" }}>
        <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: brand.terracotta }} />
        <Typography sx={{
          fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "10px",
          letterSpacing: "0.2em", textTransform: "uppercase", color: alpha(brand.ivory, 0.55),
        }}>
          Сегодня · 09:00 утра
        </Typography>
      </Box>

      {/* Заголовок */}
      <Typography sx={{
        fontFamily: "var(--font-display)", fontWeight: 400,
        fontSize: "clamp(22px, 2vw, 28px)", lineHeight: 1.1, color: brand.ivory, mb: "16px",
      }}>
        Раскрытие{" "}
        <Box component="em" sx={{ fontStyle: "italic", color: brand.blush }}>спины</Box>
        {" "}и плечевого пояса
      </Typography>

      {/* Мета */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "12px", mb: "24px" }}>
        <MetaItem icon={<AccessTimeOutlinedIcon sx={{ fontSize: 14 }} />} text="25 минут" />
        <MetaItem icon={<SignalCellularAltIcon  sx={{ fontSize: 14 }} />} text="Уровень 1" />
        <MetaItem icon={<PersonOutlineIcon      sx={{ fontSize: 14 }} />} text="Тренер · Алёна" />
      </Box>

      {/* Кнопки */}
      <Box sx={{ display: "flex", gap: "10px", mb: "24px", flexWrap: "wrap" }}>
        <Button variant="contained" sx={{
          backgroundColor: brand.terracotta, color: "#fff",
          borderRadius: "100px", fontFamily: "var(--font-body)",
          fontWeight: 700, fontSize: "12px", letterSpacing: "0.1em",
          textTransform: "uppercase", px: "22px", py: "10px",
          boxShadow: `0 6px 18px -6px ${alpha(brand.terracotta, 0.6)}`,
          "&:hover": { backgroundColor: brand.terracottaDeep, transform: "translateY(-1px)" },
        }}>
          Начать урок →
        </Button>
        <Button variant="outlined" sx={{
          borderColor: alpha(brand.ivory, 0.3), color: brand.ivory,
          borderRadius: "100px", fontFamily: "var(--font-body)",
          fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em",
          textTransform: "none", px: "22px", py: "10px",
          "&:hover": { borderColor: alpha(brand.ivory, 0.6), backgroundColor: alpha(brand.ivory, 0.06) },
        }}>
          Перенести
        </Button>
      </Box>

      {/* Прогресс */}
      <Box sx={{ borderTop: `1px solid ${alpha(brand.ivory, 0.1)}`, pt: "16px" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: "8px" }}>
          <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: alpha(brand.ivory, 0.45) }}>
            Подготовка · 02 из 06
          </Typography>
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: alpha(brand.ivory, 0.45) }}>
            10:25 / 25:00
          </Typography>
        </Box>
        <Box sx={{ height: "3px", borderRadius: "100px", backgroundColor: alpha(brand.ivory, 0.12) }}>
          <Box sx={{ height: "100%", width: "41%", borderRadius: "100px", backgroundColor: brand.terracotta }} />
        </Box>
      </Box>
    </Box>
  );
}

// ─── Элемент ближайшего занятия ───────────────────────────────────────────────

interface UpcomingItemProps {
  dayNum: number;
  dayName: string;
  title: string;
  meta: string;
  isLive?: boolean;
}

function UpcomingItem({ dayNum, dayName, title, meta, isLive }: UpcomingItemProps) {
  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: "14px",
      py: "14px",
      borderBottom: `1px solid ${alpha(brand.line, 0.5)}`,
      cursor: "pointer",
      "&:hover .arrow": { transform: "translateX(3px)" },
    }}>
      {/* Дата */}
      <Box sx={{
        width: 44, minWidth: 44, height: 44, borderRadius: "12px",
        backgroundColor: brand.cream2,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "16px", color: brand.cocoa, lineHeight: 1 }}>
          {dayNum}
        </Typography>
        <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "9px", color: brand.mute, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {dayName}
        </Typography>
      </Box>

      {/* Текст */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mb: "3px" }}>
          <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", color: brand.cocoa }}>
            {title}
          </Typography>
          {isLive && (
            <Box sx={{ borderRadius: "4px", backgroundColor: alpha(brand.terracotta, 0.12), px: "5px", py: "1px" }}>
              <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "9px", letterSpacing: "0.06em", color: brand.terracottaDeep }}>
                LIVE
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: brand.terracotta, flexShrink: 0 }} />
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: brand.mute }}>
            {meta}
          </Typography>
        </Box>
      </Box>

      {/* Стрелка */}
      <Box className="arrow" sx={{ color: brand.mute, display: "flex", transition: "transform 0.15s ease" }}>
        <ChevronRightIcon sx={{ fontSize: 18 }} />
      </Box>
    </Box>
  );
}

// ─── TodayPanel ───────────────────────────────────────────────────────────────

export function TodayPanel() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <TodayCard />

      {/* Ближайшие занятия */}
      <Box sx={{
        borderRadius: "22px", backgroundColor: brand.ivory,
        border: `1px solid ${alpha(brand.line, 0.7)}`,
        p: "24px",
        boxShadow: `0 2px 12px -4px ${alpha(brand.cocoa, 0.07)}`,
      }}>
        <Typography sx={{
          fontFamily: "var(--font-display)", fontWeight: 400,
          fontSize: "22px", lineHeight: 1.1, color: brand.cocoa, mb: "4px",
        }}>
          Ближайшие{" "}
          <Box component="em" sx={{ fontStyle: "italic", color: brand.terracottaDeep }}>занятия</Box>
        </Typography>
        <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: brand.mute, mb: "4px" }}>
          На этой неделе у вас запланировано 4 урока
        </Typography>

        <UpcomingItem dayNum={12} dayName="ЧТ" title="Подвижность таза и стоп"  meta="Подвижность · 30 мин · 18:30" />
        <UpcomingItem dayNum={13} dayName="ПТ" title="Дыхание и опора" meta="Живой эфир · 40 мин · 19:00" isLive />
        <Box sx={{ pt: "12px" }}>
          <Typography sx={{
            fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 500,
            color: brand.terracottaDeep, cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}>
            Показать все занятия →
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
