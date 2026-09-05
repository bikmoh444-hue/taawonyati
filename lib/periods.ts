import type { PeriodKey } from "@/lib/constants";

// Start of the current period as a local YYYY-MM-DD string (Monday-start weeks).
export function periodStartDate(period: PeriodKey, now: Date = new Date()): string {
  const d = new Date(now);
  switch (period) {
    case "day":
      break;
    case "week": {
      const dow = d.getDay(); // 0 = Sunday
      const diffToMonday = dow === 0 ? -6 : 1 - dow;
      d.setDate(d.getDate() + diffToMonday);
      break;
    }
    case "month":
      d.setDate(1);
      break;
    case "year":
      d.setMonth(0, 1);
      break;
  }
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function isInPeriod(date: string, period: PeriodKey, now: Date = new Date()): boolean {
  return date >= periodStartDate(period, now);
}