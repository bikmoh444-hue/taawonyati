// Feature icons for the landing page "Fonctionnalités" grid.
// Stored in the DB as a string key (landing_features.icon); mapped to lucide
// components here so both the public site and the admin picker share one map.

import {
  BarChart3,
  CalendarCheck2,
  FileText,
  Languages,
  Package,
  Users,
} from "lucide-react";

export const LANDING_FEATURE_ICONS = {
  "file-text": FileText,
  archive: Package,
  "bar-chart-2": BarChart3,
  users: Users,
  activities: CalendarCheck2,
  languages: Languages,
} as const;

export type LandingIconKey = keyof typeof LANDING_FEATURE_ICONS;

export const LANDING_ICON_KEYS = Object.keys(LANDING_FEATURE_ICONS) as LandingIconKey[];