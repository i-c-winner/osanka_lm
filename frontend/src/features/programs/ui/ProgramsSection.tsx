"use client";

import { useEffect, useState } from "react";
import Box          from "@mui/material/Box";
import Typography   from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Chip         from "@mui/material/Chip";
import { alpha }    from "@mui/material/styles";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import LiveTvIcon   from "@mui/icons-material/LiveTv";
import LockIcon     from "@mui/icons-material/Lock";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { brand }    from "@/shared/theme";
import { onlineContentApi } from "@/shared/api";
import type { OnlineContentResponse } from "@/shared/api";

// ─── Карточка видео ───────────────────────────────────────────────────────────

function VideoCard({ content }: { content: OnlineContentResponse }) {
  const isLive = content.type === "live";

  return (
    <Box
      component={content.stream_url ? "a" : "div"}
      href={content.stream_url ?? undefined}
      target={content.stream_url ? "_blank" : undefined}
      rel="noopener noreferrer"
      sx={{
        borderRadius: "18px",
        overflow: "hidden",
        border: `1px solid ${alpha(brand.line, 0.7)}`,
        backgroundColor: brand.ivory,
        display: "flex",
        flexDirection: "column",
        cursor: content.stream_url ? "pointer" : "default",
        textDecoration: "none",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        "&:hover": content.stream_url ? {
          transform: "translateY(-2px)",
          boxShadow: `0 8px 24px -6px ${alpha(brand.cocoa, 0.12)}`,
        } : {},
      }}
    >
      {/* Превью */}
      <Box
        sx={{
          position: "relative",
          aspectRatio: "16/9",
          backgroundColor: alpha(brand.cocoa, 0.06),
          overflow: "hidden",
        }}
      >
        {content.thumbnail_url ? (
          <Box
            component="img"
            src={content.thumbnail_url}
            alt={content.title}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Box sx={{
            width: "100%", height: "100%",
            background: isLive
              ? `radial-gradient(ellipse at 70% 30%, ${alpha(brand.terracotta, 0.3)} 0%, ${alpha(brand.cocoa, 0.08)} 100%)`
              : `radial-gradient(ellipse at 70% 30%, ${alpha(brand.sage, 0.2)} 0%, ${alpha(brand.cocoa, 0.06)} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {isLive
              ? <LiveTvIcon sx={{ fontSize: 40, color: alpha(brand.terracotta, 0.4) }} />
              : <PlayArrowIcon sx={{ fontSize: 40, color: alpha(brand.cocoa, 0.2) }} />
            }
          </Box>
        )}

        {/* Плей-оверлей */}
        {content.stream_url && (
          <Box sx={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: alpha(brand.cocoa, 0.0),
            transition: "background-color 0.18s ease",
            ".MuiBox-root:hover > &": { backgroundColor: alpha(brand.cocoa, 0.18) },
          }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: "50%",
              backgroundColor: alpha(brand.ivory, 0.9),
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.18s ease",
              ".MuiBox-root:hover > div > &": { opacity: 1 },
            }}>
              <PlayArrowIcon sx={{ fontSize: 24, color: brand.cocoa, ml: "2px" }} />
            </Box>
          </Box>
        )}

        {/* Чипы сверху */}
        <Box sx={{ position: "absolute", top: "10px", left: "10px", display: "flex", gap: "6px" }}>
          {isLive && (
            <Chip
              label="LIVE"
              size="small"
              sx={{
                height: 20, fontFamily: "var(--font-body)", fontSize: "10px",
                fontWeight: 700, letterSpacing: "0.08em",
                backgroundColor: brand.terracotta, color: brand.ivory,
              }}
            />
          )}
          {content.is_free && (
            <Chip
              label="Бесплатно"
              size="small"
              sx={{
                height: 20, fontFamily: "var(--font-body)", fontSize: "10px",
                backgroundColor: alpha(brand.ivory, 0.9), color: brand.cocoa,
              }}
            />
          )}
        </Box>
      </Box>

      {/* Контент */}
      <Box sx={{ p: "16px", display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
        <Typography sx={{
          fontFamily: "var(--font-display)", fontSize: "16px",
          fontWeight: 400, color: brand.cocoa, lineHeight: 1.25,
        }}>
          {content.title}
        </Typography>

        {content.description && (
          <Typography sx={{
            fontFamily: "var(--font-body)", fontSize: "12px",
            color: brand.cocoaSoft, lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {content.description}
          </Typography>
        )}

        <Box sx={{ display: "flex", gap: "12px", alignItems: "center", mt: "4px" }}>
          {content.duration_minutes && (
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <AccessTimeIcon sx={{ fontSize: 13, color: brand.mute }} />
              <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: brand.mute }}>
                {content.duration_minutes} мин
              </Typography>
            </Box>
          )}
          {!content.stream_url && (
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <LockIcon sx={{ fontSize: 13, color: brand.mute }} />
              <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: brand.mute }}>
                Скоро
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ─── Пустое состояние ─────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <Box sx={{
      textAlign: "center", py: "64px",
      border: `1px dashed ${alpha(brand.line, 0.8)}`,
      borderRadius: "18px",
    }}>
      <Box sx={{
        width: 56, height: 56, borderRadius: "50%",
        backgroundColor: alpha(brand.line, 0.5),
        display: "flex", alignItems: "center", justifyContent: "center",
        mx: "auto", mb: "16px",
      }}>
        <PlayArrowIcon sx={{ fontSize: 28, color: brand.mute }} />
      </Box>
      <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 400, color: brand.cocoa, mb: "8px" }}>
        Нет доступных программ
      </Typography>
      <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "14px", color: brand.cocoaSoft, maxWidth: 320, mx: "auto", lineHeight: 1.6 }}>
        Подключите онлайн-подписку, чтобы получить доступ к видео-урокам и прямым эфирам.
      </Typography>
    </Box>
  );
}

// ─── ProgramsSection ──────────────────────────────────────────────────────────

export function ProgramsSection() {
  const [items,   setItems]   = useState<OnlineContentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    onlineContentApi.list()
      .then(setItems)
      .catch(() => setError("Не удалось загрузить контент"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: "60px" }}>
        <CircularProgress size={28} sx={{ color: brand.terracotta }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "14px", color: brand.terracotta, py: "24px" }}>
        {error}
      </Typography>
    );
  }

  const live     = items.filter((c) => c.type === "live");
  const recorded = items.filter((c) => c.type !== "live");

  return (
    <Box sx={{ pt: "8px" }}>
      <Typography sx={{
        fontFamily: "var(--font-display)", fontSize: "clamp(28px, 3vw, 36px)",
        fontWeight: 400, color: brand.cocoa, lineHeight: 1.05, mb: "28px",
      }}>
        Мои{" "}
        <Box component="em" sx={{ fontStyle: "italic", color: brand.terracottaDeep }}>
          программы
        </Box>
      </Typography>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Эфиры */}
          {live.length > 0 && (
            <Box>
              <Typography sx={{
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "11px",
                letterSpacing: "0.12em", textTransform: "uppercase", color: brand.mute, mb: "14px",
              }}>
                Прямые эфиры
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: "14px" }}>
                {live.map((c) => <VideoCard key={c.id} content={c} />)}
              </Box>
            </Box>
          )}

          {/* Записи */}
          {recorded.length > 0 && (
            <Box>
              {live.length > 0 && (
                <Typography sx={{
                  fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "11px",
                  letterSpacing: "0.12em", textTransform: "uppercase", color: brand.mute, mb: "14px",
                }}>
                  Записи
                </Typography>
              )}
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: "14px" }}>
                {recorded.map((c) => <VideoCard key={c.id} content={c} />)}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
