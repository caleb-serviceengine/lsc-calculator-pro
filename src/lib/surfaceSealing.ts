import type { PricingSettings } from "@/contexts/PricingSettingsContext";

export function calcSurfaceSealing(sqft: number, surfaceIndex: number, s: PricingSettings): number {
  const rate = s.surfaceSealingRates[surfaceIndex];
  if (!rate || sqft <= 0) return 0;

  const base = sqft * rate.pricePerSqft;
  return Math.round(Math.max(base, rate.minPrice) * 100) / 100;
}
