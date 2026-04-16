import type { PricingSettings } from "@/contexts/PricingSettingsContext";

export type PaverPackage = "silver" | "gold" | "platinum";

export function calcPaverMaintenance(
  sqft: number,
  pkg: PaverPackage,
  s: PricingSettings
): number {
  if (sqft <= 0) return 0;

  // Find matching tier
  const tier = s.paverTiers.find((t) => {
    if (t.maxSqft === null) return sqft >= t.minSqft;
    return sqft >= t.minSqft && sqft <= t.maxSqft;
  });

  if (!tier) return 0;

  const rate = tier[pkg];
  const base = sqft * rate;
  const min = s.paverMinimums[pkg];

  return Math.round(Math.max(base, min) * 100) / 100;
}
