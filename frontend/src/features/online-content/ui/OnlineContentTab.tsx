"use client";

import { useCallback, useEffect, useState } from "react";
import Box               from "@mui/material/Box";
import Typography        from "@mui/material/Typography";
import Button            from "@mui/material/Button";
import IconButton        from "@mui/material/IconButton";
import Switch            from "@mui/material/Switch";
import TextField         from "@mui/material/TextField";
import Checkbox          from "@mui/material/Checkbox";
import FormControlLabel  from "@mui/material/FormControlLabel";
import Modal             from "@mui/material/Modal";
import Fade              from "@mui/material/Fade";
import CircularProgress  from "@mui/material/CircularProgress";
import Chip              from "@mui/material/Chip";
import Select            from "@mui/material/Select";
import MenuItem          from "@mui/material/MenuItem";
import InputLabel        from "@mui/material/InputLabel";
import FormControl       from "@mui/material/FormControl";
import OutlinedInput     from "@mui/material/OutlinedInput";
import AddIcon           from "@mui/icons-material/Add";
import CloseIcon         from "@mui/icons-material/Close";
import EditOutlinedIcon  from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LinkIcon          from "@mui/icons-material/Link";
import LockIcon          from "@mui/icons-material/Lock";
import { alpha }         from "@mui/material/styles";
import { brand }         from "@/shared/theme";
import { onlineContentApi, subscriptionPlansApi } from "@/shared/api";
import type { OnlineContentResponse, OnlineContentCreate, OnlineContentUpdate, SubscriptionPlanResponse } from "@/shared/api";

// ─── Типы ─────────────────────────────────────────────────────────────────────

type ContentForm = {
  title:            string;
  description:      string;
  type:             string;
  stream_url:       string;
  thumbnail_url:    string;
  duration_minutes: string;
  status:           string;
  is_free:          boolean;
  plan_ids:         string[];
};

const EMPTY_FORM: ContentForm = {
  title:            "",
  description:      "",
  type:             "recorded",
  stream_url:       "",
  thumbnail_url:    "",
  duration_minutes: "",
  status:           "active",
  is_free:          false,
  plan_ids:         [],
};

function contentToForm(c: OnlineContentResponse): ContentForm {
  return {
    title:            c.title,
    description:      c.description ?? "",
    type:             c.type,
    stream_url:       c.stream_url ?? "",
    thumbnail_url:    c.thumbnail_url ?? "",
    duration_minutes: c.duration_minutes != null ? String(c.duration_minutes) : "",
    status:           c.status,
    is_free:          c.is_free,
    plan_ids:         c.plan_ids ?? [],
  };
}

// ─── Модалка создания/редактирования ─────────────────────────────────────────

interface ContentFormModalProps {
  open:         boolean;
  editContent?: OnlineContentResponse | null;
  onlinePlans:  SubscriptionPlanResponse[];
  onClose:      () => void;
  onSaved:      (c: OnlineContentResponse) => void;
}

function ContentFormModal({ open, editContent, onlinePlans, onClose, onSaved }: ContentFormModalProps) {
  const isEdit = !!editContent;
  const [form,   setForm]   = useState<ContentForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(editContent ? contentToForm(editContent) : EMPTY_FORM);
      setError(null);
    }
  }, [open, editContent]);

  function set<K extends keyof ContentForm>(key: K, value: ContentForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const base = {
        title:            form.title.trim(),
        description:      form.description.trim() || undefined,
        type:             form.type,
        stream_url:       form.stream_url.trim() || undefined,
        thumbnail_url:    form.thumbnail_url.trim() || undefined,
        duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : undefined,
        status:           form.status,
        is_free:          form.is_free,
        plan_ids:         form.plan_ids,
      };

      const result = isEdit
        ? await onlineContentApi.update(editContent!.id, base as OnlineContentUpdate)
        : await onlineContentApi.create(base as OnlineContentCreate);

      onSaved(result);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(typeof msg === "string" ? msg : `Ошибка при ${isEdit ? "сохранении" : "создании"}`);
    } finally {
      setSaving(false);
    }
  }

  const INPUT_SX = { "& .MuiInputBase-input": { fontFamily: "var(--font-body)", fontSize: "13px" } };

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Fade in={open}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "calc(100vw - 32px)", sm: 560 },
            maxHeight: "90vh", overflowY: "auto",
            backgroundColor: brand.ivory,
            borderRadius: "20px",
            boxShadow: `0 24px 48px -12px ${alpha(brand.cocoa, 0.22)}`,
            p: "28px",
            display: "flex", flexDirection: "column", gap: "16px",
          }}
        >
          {/* Шапка */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 400, color: brand.cocoa }}>
              {isEdit ? "Редактировать контент" : "Новый контент"}
            </Typography>
            <IconButton size="small" onClick={onClose} sx={{ color: brand.cocoaSoft }}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Название */}
            <TextField
              label="Название" required fullWidth
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              size="small" disabled={saving} sx={INPUT_SX}
            />

            {/* Описание */}
            <TextField
              label="Описание" multiline rows={2} fullWidth
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              size="small" disabled={saving} sx={INPUT_SX}
            />

            {/* Тип + длительность */}
            <Box sx={{ display: "flex", gap: "12px" }}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>Тип</InputLabel>
                <Select
                  value={form.type}
                  label="Тип"
                  onChange={(e) => set("type", e.target.value)}
                  disabled={saving}
                  sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}
                >
                  <MenuItem value="recorded" sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>Запись</MenuItem>
                  <MenuItem value="live"     sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>Прямой эфир</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Длительность (мин)" type="number"
                value={form.duration_minutes}
                onChange={(e) => set("duration_minutes", e.target.value)}
                size="small" disabled={saving}
                sx={{ width: 190, flexShrink: 0, ...INPUT_SX }}
                inputProps={{ min: 1 }}
              />
            </Box>

            {/* URL потока */}
            <TextField
              label="URL видео / потока" fullWidth
              value={form.stream_url}
              onChange={(e) => set("stream_url", e.target.value)}
              size="small" disabled={saving} sx={INPUT_SX}
              placeholder="https://..."
            />

            {/* URL превью */}
            <TextField
              label="URL превью (thumbnail)" fullWidth
              value={form.thumbnail_url}
              onChange={(e) => set("thumbnail_url", e.target.value)}
              size="small" disabled={saving} sx={INPUT_SX}
              placeholder="https://..."
            />

            {/* Привязка к планам */}
            <FormControl size="small" fullWidth disabled={saving || form.is_free}>
              <InputLabel sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>
                Доступен в планах
              </InputLabel>
              <Select
                multiple
                value={form.plan_ids}
                onChange={(e) => set("plan_ids", typeof e.target.value === "string" ? [e.target.value] : e.target.value as string[])}
                input={<OutlinedInput label="Доступен в планах" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {(selected as string[]).map((id) => {
                      const plan = onlinePlans.find((p) => p.id === id);
                      return (
                        <Chip
                          key={id}
                          label={plan?.name ?? id.slice(0, 8)}
                          size="small"
                          sx={{ height: 20, fontFamily: "var(--font-body)", fontSize: "11px" }}
                        />
                      );
                    })}
                  </Box>
                )}
                sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}
              >
                {onlinePlans.length === 0 ? (
                  <MenuItem disabled sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>
                    Нет онлайн-планов
                  </MenuItem>
                ) : (
                  onlinePlans.map((p) => (
                    <MenuItem key={p.id} value={p.id} sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>
                      {p.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "11px", color: brand.mute, mt: "4px", pl: "2px" }}>
                {form.is_free
                  ? "Бесплатный контент доступен всем — планы не применяются"
                  : form.plan_ids.length === 0
                  ? "Без выбора планов — доступен всем онлайн-подписчикам"
                  : "Только подписчикам выбранных планов"}
              </Typography>
            </FormControl>

            {/* Флаги */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.is_free}
                    onChange={(e) => {
                      set("is_free", e.target.checked);
                      if (e.target.checked) set("plan_ids", []);
                    }}
                    size="small" disabled={saving}
                  />
                }
                label={<Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>Бесплатный</Typography>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.status === "active"}
                    onChange={(e) => set("status", e.target.checked ? "active" : "archived")}
                    size="small" disabled={saving}
                  />
                }
                label={<Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>Активен</Typography>}
              />
            </Box>
          </Box>

          {error && (
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px", color: brand.terracotta }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={saving || !form.title.trim()}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : (isEdit ? <EditOutlinedIcon /> : <AddIcon />)}
            sx={{
              backgroundColor: brand.cocoa, color: brand.ivory,
              borderRadius: "10px", fontFamily: "var(--font-body)",
              fontWeight: 600, fontSize: "13px", textTransform: "none",
              boxShadow: "none", "&:hover": { backgroundColor: brand.cocoaSoft, boxShadow: "none" },
            }}
          >
            {saving ? "Сохраняем..." : isEdit ? "Сохранить" : "Создать"}
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
}

// ─── Карточка контента ────────────────────────────────────────────────────────

interface ContentCardProps {
  content:     OnlineContentResponse;
  onlinePlans: SubscriptionPlanResponse[];
  onEdit:      (c: OnlineContentResponse) => void;
  onDelete:    (c: OnlineContentResponse) => void;
  onToggle:    (c: OnlineContentResponse) => void;
  toggling:    boolean;
  deleting:    boolean;
}

function ContentCard({ content, onlinePlans, onEdit, onDelete, onToggle, toggling, deleting }: ContentCardProps) {
  const planNames = (content.plan_ids ?? [])
    .map((id) => onlinePlans.find((p) => p.id === id)?.name ?? id.slice(0, 8))
    .join(", ");

  return (
    <Box sx={{
      borderRadius: "14px",
      border: `1px solid ${alpha(brand.line, 0.7)}`,
      p: "18px",
      display: "flex", flexDirection: "column", gap: "10px",
      opacity: toggling || deleting ? 0.5 : 1,
      transition: "opacity 0.2s",
      backgroundColor: content.status === "active" ? brand.ivory : alpha(brand.cream, 0.5),
    }}>
      {/* Шапка */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", mb: "4px" }}>
            <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 400, color: brand.cocoa }}>
              {content.title}
            </Typography>
            <Chip
              label={content.type === "live" ? "Эфир" : "Запись"}
              size="small"
              sx={{ height: 18, fontFamily: "var(--font-body)", fontSize: "10px",
                backgroundColor: content.type === "live" ? alpha(brand.terracotta, 0.12) : alpha(brand.sage, 0.12),
                color: content.type === "live" ? brand.terracottaDeep : brand.sage,
              }}
            />
            {content.is_free && (
              <Chip label="Бесплатно" size="small" sx={{ height: 18, fontFamily: "var(--font-body)", fontSize: "10px", backgroundColor: alpha(brand.gold, 0.15), color: brand.gold }} />
            )}
          </Box>
          {content.description && (
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: brand.cocoaSoft, lineHeight: 1.5 }}>
              {content.description}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: "2px", flexShrink: 0 }}>
          <IconButton size="small" onClick={() => onEdit(content)} disabled={toggling || deleting}
            sx={{ color: brand.cocoaSoft, "&:hover": { color: brand.cocoa, backgroundColor: alpha(brand.line, 0.5) } }}>
            <EditOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(content)} disabled={toggling || deleting}
            sx={{ color: brand.mute, "&:hover": { color: brand.terracotta, backgroundColor: alpha(brand.terracotta, 0.08) } }}>
            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <Switch
            checked={content.status === "active"}
            disabled={toggling || deleting}
            onChange={() => onToggle(content)}
            size="small"
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": { color: brand.sage },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: brand.sage },
            }}
          />
        </Box>
      </Box>

      {/* Мета-информация */}
      <Box sx={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        {content.duration_minutes && (
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: brand.mute }}>
            {content.duration_minutes} мин
          </Typography>
        )}
        {content.stream_url && (
          <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <LinkIcon sx={{ fontSize: 13, color: brand.mute }} />
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: brand.mute }}>
              Ссылка добавлена
            </Typography>
          </Box>
        )}
        {/* Привязанные планы */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <LockIcon sx={{ fontSize: 13, color: brand.mute }} />
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: brand.mute }}>
            {content.is_free
              ? "Бесплатный"
              : (content.plan_ids ?? []).length === 0
              ? "Все онлайн-подписчики"
              : planNames}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ─── OnlineContentTab ─────────────────────────────────────────────────────────

export function OnlineContentTab() {
  const [content,     setContent]     = useState<OnlineContentResponse[]>([]);
  const [onlinePlans, setOnlinePlans] = useState<SubscriptionPlanResponse[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [toggling,    setToggling]    = useState<string | null>(null);
  const [deleting,    setDeleting]    = useState<string | null>(null);
  const [editItem,    setEditItem]    = useState<OnlineContentResponse | null>(null);
  const [modal,       setModal]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [items, plans] = await Promise.all([
        onlineContentApi.list(),
        subscriptionPlansApi.listAll(),
      ]);
      setContent(items);
      setOnlinePlans(plans.filter((p) => p.plan_type === "online" && p.is_active));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() { setEditItem(null); setModal(true); }
  function openEdit(c: OnlineContentResponse) { setEditItem(c); setModal(true); }
  function closeModal() { setModal(false); }

  async function handleToggle(c: OnlineContentResponse) {
    setToggling(c.id);
    try {
      const updated = await onlineContentApi.update(c.id, {
        status: c.status === "active" ? "archived" : "active",
      });
      setContent((prev) => prev.map((item) => item.id === updated.id ? updated : item));
    } finally {
      setToggling(null);
    }
  }

  async function handleDelete(c: OnlineContentResponse) {
    setDeleting(c.id);
    try {
      await onlineContentApi.delete(c.id);
      setContent((prev) => prev.filter((item) => item.id !== c.id));
    } finally {
      setDeleting(null);
    }
  }

  function handleSaved(c: OnlineContentResponse) {
    setContent((prev) => {
      const idx = prev.findIndex((item) => item.id === c.id);
      return idx >= 0 ? prev.map((item) => item.id === c.id ? c : item) : [c, ...prev];
    });
  }

  const active   = content.filter((c) => c.status === "active");
  const archived = content.filter((c) => c.status !== "active");

  const renderCards = (list: OnlineContentResponse[]) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {list.map((c) => (
        <ContentCard
          key={c.id}
          content={c}
          onlinePlans={onlinePlans}
          onEdit={openEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
          toggling={toggling === c.id}
          deleting={deleting === c.id}
        />
      ))}
    </Box>
  );

  return (
    <Box>
      {/* Заголовок + кнопка */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "24px", flexWrap: "wrap", gap: "12px" }}>
        <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 400, color: brand.cocoa }}>
          Онлайн-контент{" "}
          <Box component="span" sx={{ fontFamily: "var(--font-body)", fontSize: "14px", color: brand.mute, fontWeight: 400 }}>
            ({content.length})
          </Box>
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{
            backgroundColor: brand.cocoa, color: brand.ivory,
            borderRadius: "10px", fontFamily: "var(--font-body)",
            fontWeight: 600, fontSize: "13px", textTransform: "none",
            boxShadow: "none", "&:hover": { backgroundColor: brand.cocoaSoft, boxShadow: "none" },
          }}
        >
          Добавить контент
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: "40px" }}>
          <CircularProgress size={28} sx={{ color: brand.terracotta }} />
        </Box>
      ) : content.length === 0 ? (
        <Box sx={{ textAlign: "center", py: "48px", border: `1px dashed ${alpha(brand.line, 0.8)}`, borderRadius: "14px" }}>
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "14px", color: brand.mute }}>
            Нет контента. Добавьте первое видео.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {active.length > 0 && (
            <Box>
              <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: brand.mute, mb: "12px" }}>
                Активные
              </Typography>
              {renderCards(active)}
            </Box>
          )}
          {archived.length > 0 && (
            <Box>
              <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: brand.mute, mb: "12px" }}>
                Архив
              </Typography>
              {renderCards(archived)}
            </Box>
          )}
        </Box>
      )}

      <ContentFormModal
        open={modal}
        editContent={editItem}
        onlinePlans={onlinePlans}
        onClose={closeModal}
        onSaved={handleSaved}
      />
    </Box>
  );
}
