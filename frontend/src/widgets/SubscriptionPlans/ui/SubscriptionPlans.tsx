"use client";

import { useEffect, useState, useCallback } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useTranslations } from "next-intl";
import { subscriptionPlansApi, subscriptionsApi } from "@/shared/api";
import type { SubscriptionPlanResponse } from "@/shared/api";
import { SubscriptionPlanCard } from "@/entities/subscription";
import { PageLoader } from "@/shared/ui/PageLoader";
import { ErrorMessage } from "@/shared/ui/ErrorMessage";

export function SubscriptionPlans() {
  const t = useTranslations("subscriptions");
  const [plans, setPlans] = useState<SubscriptionPlanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await subscriptionPlansApi.list();
      setPlans(data);
    } catch {
      setError("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleBuy = async (planId: string) => {
    setBuying(planId);
    try {
      await subscriptionsApi.create(planId);
    } finally {
      setBuying(null);
    }
  };

  if (loading) return <PageLoader />;
  if (error) return <ErrorMessage onRetry={load} />;

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h5" fontWeight={600}>
          {t("plans")}
        </Typography>
      </Grid>

      {plans.map((plan) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={plan.id}>
          <SubscriptionPlanCard
            plan={plan}
            action={
              <Button
                variant="contained"
                size="small"
                onClick={() => handleBuy(plan.id)}
                disabled={buying === plan.id}
              >
                {t("buy")}
              </Button>
            }
          />
        </Grid>
      ))}
    </Grid>
  );
}
