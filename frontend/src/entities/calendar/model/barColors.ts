import { brand } from "@/shared/theme";
import type { SessionBar } from "./types";

export const BAR_COLOR: Record<SessionBar, string> = {
  practice: brand.terracotta,
  mobility: brand.sage,
  live:     brand.gold,
};
