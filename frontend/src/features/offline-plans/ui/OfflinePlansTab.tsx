"use client";

import { useCallback, useEffect, useState } from "react";
import Box              from "@mui/material/Box";
import Typography       from "@mui/material/Typography";
import Button           from "@mui/material/Button";
import IconButton       from "@mui/material/IconButton";
import Switch           from "@mui/material/Switch";
import TextField        from "@mui/material/TextField";
import Checkbox         from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Modal            from "@mui/material/Modal";
import Fade             from "@mui/material/Fade";
import CircularProgress from "@mui/material/CircularProgress";
import Chip             from "@mui/material/Chip";
import AddIcon          from "@mui/icons-material/Add";
import CloseIcon        from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { alpha }        from "@mui/material/styles";
import { brand }        from "@/shared/theme";
import { subscriptionPlansApi } from "@/shared/api";
import type { SubscriptionPlanResponse, SubscriptionPlanCreate, SubscriptionPlanUpdate } from "@/shared/api";

// ─── Утилиты ─────────────────────────────────────────────────────────────────

function fmtPrice(price: number) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "KZT", maximumFractionDigits: 0 }).format(price);
}

type FormState = SubscriptionPlanCreate;

const EMPTY_FORM: FormState = {
  code:              "",
  name:              "",
  description:       "",
  price:             0,
  duration_days:     30,
  sessions_limit:    undefined,
  is_unlimited:      false,
  is_calendar_month: false,
  freeze_days_limit: undefined,
  is_active:         true,
};

function planToForm(plan: SubscriptionPlanResponse): FormState {
  return {
    code:              plan.code,
    name:              plan.name,
    description:       plan.description ?? "",
    price:             plan.price,
    duration_days:     plan.duration_days,
    sessions_limit:    plan.sessions_limit,
    is_unlimited:      plan.is_unlimited,
    is_calendar_month: plan.is_calendar_month,
    freeze_days_limit: plan.freeze_days_limit,
    is_active:         plan.is_active,
  };
}

// ─── PlanFormModal ────────────────────────────────────────────────────────────

interface PlanFormModalProps {
  open:        boolean;
  editPlan?:   SubscriptionPlanResponse | null;
  onClose:     () => void;
  onSaved:     (plan: SubscriptionPlanResponse) => void;
}

function PlanFormModal({ open, editPlan, onClose, onSaved }: PlanFormModalProps) {
  const isEdit = !!editPlan;
  const [form,   setForm]   = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(editPlan ? planToForm(editPlan) : EMPTY_FORM);
      setError(null);
    }
  }, [open, editPlan]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const base = {
        ...form,
        price:             Number(form.price),
        duration_days:     Number(form.duration_days),
        sessions_limit:    form.is_unlimited ? undefined : (form.sessions_limit ? Number(form.sessions_limit) : undefined),
        freeze_days_limit: form.freeze_days_limit ? Number(form.freeze_days_limit) : undefined,
        description:       form.description || undefined,
      };

      const result = isEdit
        ? await subscriptionPlansApi.update(editPlan!.id, base as SubscriptionPlanUpdate)
        : await subscriptionPlansApi.create(base as SubscriptionPlanCreate);

      onSaved(result);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(typeof msg === "string" ? msg : `Ошибка при ${isEdit ? "сохранении" : "создании"} плана`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Fade in={open}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "calc(100vw - 32px)", sm: 520 },
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
              {isEdit ? "Редактировать план" : "Новый план"}
            </Typography>
            <IconButton size="small" onClick={onClose} sx={{ color: brand.cocoaSoft }}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          {/* Поля */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Box sx={{ display: "flex", gap: "12px" }}>
              <TextField
                label="Название" required fullWidth
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                size="small" disabled={saving}
              />
              <TextField
                label="Код" required
                value={form.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                size="small" disabled={saving}
                sx={{ width: 140, flexShrink: 0 }}
                inputProps={{ style: { fontFamily: "monospace" } }}
              />
            </Box>

            <TextField
              label="Описание" multiline rows={2} fullWidth
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              size="small" disabled={saving}
            />

            <Box sx={{ display: "flex", gap: "12px" }}>
              <TextField
                label="Цена (KZT)" required type="number" fullWidth
                value={form.price || ""}
                onChange={(e) => set("price", Number(e.target.value))}
                size="small" disabled={saving}
                inputProps={{ min: 0, step: 100 }}
              />
              <TextField
                label="Длительность (дней)" required type="number"
                value={form.duration_days || ""}
                onChange={(e) => set("duration_days", Number(e.target.value))}
                size="small" disabled={saving}
                sx={{ width: 190, flexShrink: 0 }}
                inputProps={{ min: 1 }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <TextField
                label="Лимит занятий" type="number"
                value={form.sessions_limit ?? ""}
                onChange={(e) => set("sessions_limit", e.target.value ? Number(e.target.value) : undefined)}
                size="small"
                disabled={saving || form.is_unlimited}
                sx={{ flex: 1, minWidth: 140 }}
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Дней заморозки" type="number"
                value={form.freeze_days_limit ?? ""}
                onChange={(e) => set("freeze_days_limit", e.target.value ? Number(e.target.value) : undefined)}
                size="small" disabled={saving}
                sx={{ flex: 1, minWidth: 140 }}
                inputProps={{ min: 0 }}
              />
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              <FormControlLabel
                control={<Checkbox checked={!!form.is_unlimited} onChange={(e) => set("is_unlimited", e.target.checked)} size="small" disabled={saving} />}
                label={<Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>Безлимит</Typography>}
              />
              <FormControlLabel
                control={<Checkbox checked={!!form.is_calendar_month} onChange={(e) => set("is_calendar_month", e.target.checked)} size="small" disabled={saving} />}
                label={<Typography sx={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>Календарный месяц</Typography>}
              />
              <FormControlLabel
                control={<Checkbox checked={!!form.is_active} onChange={(e) => set("is_active", e.target.checked)} size="small" disabled={saving} />}
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
            disabled={saving || !form.name.trim() || !form.code.trim() || !form.price || !form.duration_days}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : (isEdit ? <EditOutlinedIcon /> : <AddIcon />)}
            sx={{
              backgroundColor: brand.cocoa, color: brand.ivory,
              borderRadius: "10px", fontFamily: "var(--font-body)",
              fontWeight: 600, fontSize: "13px", textTransform: "none",
              boxShadow: "none", "&:hover": { backgroundColor: brand.cocoaSoft, boxShadow: "none" },
            }}
          >
            {saving ? "Сохраняем..." : isEdit ? "Сохранить" : "Создать план"}
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
}

// ─── PlanCard ─────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan:     SubscriptionPlanResponse;
  onToggle: (plan: SubscriptionPlanResponse) => void;
  onEdit:   (plan: SubscriptionPlanResponse) => void;
  toggling: boolean;
}

function PlanCard({ plan, onToggle, onEdit, toggling }: PlanCardProps) {
  return (
    <Box sx={{
      borderRadius: "14px",
      border: `1px solid ${alpha(brand.line, 0.7)}`,
      p: "20px",
      display: "flex", flexDirection: "column", gap: "10px",
      opacity: toggling ? 0.5 : 1,
      transition: "opacity 0.2s",
      backgroundColor: plan.is_active ? brand.ivory : alpha(brand.cream, 0.5),
    }}>
      {/* Шапка */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", mb: "2px" }}>
            <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: 400, color: brand.cocoa }}>
              {plan.name}
            </Typography>
            <Typography sx={{ fontFamily: "monospace", fontSize: "11px", color: brand.mute, backgroundColor: alpha(brand.line, 0.7), px: "6px", py: "1px", borderRadius: "4px" }}>
              {plan.code}
            </Typography>
            {plan.is_unlimited && (
              <Chip label="Безлимит" size="small" sx={{ height: 20, fontFamily: "var(--font-body)", fontSize: "10px", backgroundColor: alpha(brand.sage, 0.15), color: brand.sage }} />
            )}
            {plan.is_calendar_month && (
              <Chip label="Кал. месяц" size="small" sx={{ height: 20, fontFamily: "var(--font-body)", fontSize: "10px", backgroundColor: alpha(brand.gold, 0.15), color: brand.gold }} />
            )}
          </Box>
          {plan.description && (
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "12px", color: brand.cocoaSoft, lineHeight: 1.5 }}>
              {plan.description}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: "2px", flexShrink: 0 }}>
          <IconButton
            size="small"
            onClick={() => onEdit(plan)}
            disabled={toggling}
            sx={{ color: brand.cocoaSoft, "&:hover": { color: brand.cocoa, backgroundColor: alpha(brand.line, 0.5) } }}
          >
            <EditOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <Switch
            checked={plan.is_active}
            disabled={toggling}
            onChange={() => onToggle(plan)}
            size="small"
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": { color: brand.sage },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: brand.sage },
            }}
          />
        </Box>
      </Box>

      {/* Параметры */}
      <Box sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <Box>
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: brand.mute, mb: "2px" }}>
            Цена
          </Typography>
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: 600, color: brand.cocoa }}>
            {fmtPrice(plan.price)}
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: brand.mute, mb: "2px" }}>
            Длительность
          </Typography>
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: 600, color: brand.cocoa }}>
            {plan.duration_days} дн.
          </Typography>
        </Box>
        {!plan.is_unlimited && plan.sessions_limit != null && (
          <Box>
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: brand.mute, mb: "2px" }}>
              Занятий
            </Typography>
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: 600, color: brand.cocoa }}>
              {plan.sessions_limit}
            </Typography>
          </Box>
        )}
        {plan.freeze_days_limit != null && (
          <Box>
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: brand.mute, mb: "2px" }}>
              Заморозка
            </Typography>
            <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: 600, color: brand.cocoa }}>
              {plan.freeze_days_limit} дн.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ─── OfflinePlansTab ──────────────────────────────────────────────────────────

export function OfflinePlansTab() {
  const [plans,    setPlans]    = useState<SubscriptionPlanResponse[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState<SubscriptionPlanResponse | null>(null);
  const [modal,    setModal]    = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setPlans(await subscriptionPlansApi.listAll()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() { setEditPlan(null); setModal(true); }
  function openEdit(plan: SubscriptionPlanResponse) { setEditPlan(plan); setModal(true); }
  function closeModal() { setModal(false); }

  async function handleToggle(plan: SubscriptionPlanResponse) {
    setToggling(plan.id);
    try {
      const updated = await subscriptionPlansApi.update(plan.id, { is_active: !plan.is_active });
      setPlans((prev) => prev.map((p) => p.id === updated.id ? updated : p));
    } finally {
      setToggling(null);
    }
  }

  function handleSaved(plan: SubscriptionPlanResponse) {
    setPlans((prev) => {
      const idx = prev.findIndex((p) => p.id === plan.id);
      return idx >= 0
        ? prev.map((p) => p.id === plan.id ? plan : p)
        : [plan, ...prev];
    });
  }

  const active   = plans.filter((p) => p.is_active);
  const inactive = plans.filter((p) => !p.is_active);

  const renderCards = (list: SubscriptionPlanResponse[]) => (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: "12px" }}>
      {list.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          onToggle={handleToggle}
          onEdit={openEdit}
          toggling={toggling === plan.id}
        />
      ))}
    </Box>
  );

  return (
    <Box>
      {/* Заголовок + кнопка */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "24px", flexWrap: "wrap", gap: "12px" }}>
        <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 400, color: brand.cocoa }}>
          Планы офлайн{" "}
          <Box component="span" sx={{ fontFamily: "var(--font-body)", fontSize: "14px", color: brand.mute, fontWeight: 400 }}>
            ({plans.length})
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
          Добавить план
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: "40px" }}>
          <CircularProgress size={28} sx={{ color: brand.terracotta }} />
        </Box>
      ) : plans.length === 0 ? (
        <Box sx={{ textAlign: "center", py: "48px", border: `1px dashed ${alpha(brand.line, 0.8)}`, borderRadius: "14px" }}>
          <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "14px", color: brand.mute }}>
            Нет планов. Создайте первый.
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
          {inactive.length > 0 && (
            <Box>
              <Typography sx={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: brand.mute, mb: "12px" }}>
                Неактивные
              </Typography>
              {renderCards(inactive)}
            </Box>
          )}
        </Box>
      )}

      <PlanFormModal
        open={modal}
        editPlan={editPlan}
        onClose={closeModal}
        onSaved={handleSaved}
      />
    </Box>
  );
}
