// Minimal typing for the settings shape the widget needs.
// Must stay in sync with PricingSettings in the main app.

export interface StoryModifier {
  type: "dollar" | "percent";
  value: number;
  enabled: boolean;
}

export interface PricingSettings {
  seasonalModifier: number;
  sidingRates: { name: string; standard: number; heavy: number }[];
  windowPrice: number;
  houseMinPrice: number;
  spotFreeMinPrice: number;
  houseTwo: StoryModifier;
  houseThree: StoryModifier;
  gutterTiers: { minSqft: number; maxSqft: number; gold: number; platinum: number }[];
  gutterMinPrice: number;
  gutterTwo: StoryModifier;
  gutterThree: StoryModifier;
  gutterProtectionProducts: {
    name: string;
    pricePerUnit: number;
    minPrice: number;
    twoStory: StoryModifier;
    threeStory: StoryModifier;
  }[];
  roofSurfaceRates: { name: string; standard: number; mossLichen: number }[];
  roofDifficultyLevels: { name: string; upcharge: number }[];
  roofMinPrice: number;
  roofThreeStory: StoryModifier;
  flatworkRates: { name: string; standard: number; heavy: number }[];
  flatworkMinPrice: number;
  deckSurfaceRates: { name: string; standard: number; heavy: number }[];
  deckMinPrice: number;
}

function applyModifier(total: number, modifier: StoryModifier): number {
  if (!modifier.enabled) return total;
  return modifier.type === "percent"
    ? total * (1 + modifier.value / 100)
    : total + modifier.value;
}

function withSeasonal(total: number, s: PricingSettings): number {
  if (s.seasonalModifier === 0) return total;
  return total * (1 + s.seasonalModifier / 100);
}

// ── House Washing (Silver package = wash only, Vinyl siding, Standard stain) ──
export function estimateHouseWash(homeSqft: number, s: PricingSettings): number {
  const rate = s.sidingRates.find((r) => r.name === "Vinyl") ?? s.sidingRates[0];
  if (!rate) return 0;
  let total = homeSqft * rate.standard;
  total = Math.max(total, s.houseMinPrice);
  return Math.round(withSeasonal(total, s) * 100) / 100;
}

// ── Gutter Cleaning (Silver package) ─────────────────────────────────────────
export function estimateGutterCleaning(homeSqft: number, s: PricingSettings): number {
  const tier = s.gutterTiers.find(
    (t) => homeSqft >= t.minSqft && homeSqft <= t.maxSqft
  ) ?? s.gutterTiers[s.gutterTiers.length - 1];

  if (!tier) return 0;
  // "silver" pkg uses the lower (gold) column from the tier matrix
  let price = tier.gold;
  return Math.max(Math.round(withSeasonal(price, s) * 100) / 100, s.gutterMinPrice);
}

// ── Gutter Protection (FlowGuard by default, linear ft estimated from home sqft) ─
export function estimateGutterProtection(
  linearFt: number,
  productIndex: number,
  s: PricingSettings
): number {
  const product = s.gutterProtectionProducts[productIndex];
  if (!product || linearFt <= 0) return 0;
  let total = linearFt * product.pricePerUnit;
  total = Math.max(total, product.minPrice);
  return Math.round(withSeasonal(total, s) * 100) / 100;
}

// ── Window Cleaning (Spot Free exterior package) ──────────────────────────────
export function estimateWindowCleaning(windowCount: number, s: PricingSettings): number {
  let total = windowCount * s.windowPrice;
  total = Math.max(total, s.spotFreeMinPrice);
  return Math.round(withSeasonal(total, s) * 100) / 100;
}

// ── Roof Cleaning (Asphalt Shingle, Low difficulty) ───────────────────────────
export function estimateRoofCleaning(roofSqft: number, s: PricingSettings): number {
  if (roofSqft <= 0) return 0;
  const surface = s.roofSurfaceRates.find((r) => r.name === "Asphalt Shingle") ?? s.roofSurfaceRates[0];
  if (!surface) return 0;
  let total = roofSqft * surface.standard;
  // Low difficulty → 0% upcharge, skip difficulty modifier
  total = Math.max(total, s.roofMinPrice);
  return Math.round(withSeasonal(total, s) * 100) / 100;
}

// ── Driveway Power Washing (Residential Concrete, Standard stain) ─────────────
export function estimateDriveway(sqft: number, s: PricingSettings): number {
  if (sqft <= 0) return 0;
  const rate = s.flatworkRates.find((r) => r.name === "Residential Concrete/Aggregate") ?? s.flatworkRates[0];
  if (!rate) return 0;
  let total = sqft * rate.standard;
  total = Math.max(total, s.flatworkMinPrice);
  return Math.round(withSeasonal(total, s) * 100) / 100;
}

// ── Deck Cleaning (Common Wood, Standard stain, surface only) ─────────────────
export function estimateDeckCleaning(sqft: number, s: PricingSettings): number {
  if (sqft <= 0) return 0;
  const rate = s.deckSurfaceRates.find((r) => r.name === "Common Wood") ?? s.deckSurfaceRates[0];
  if (!rate) return 0;
  let total = sqft * rate.standard;
  total = Math.max(total, s.deckMinPrice);
  return Math.round(withSeasonal(total, s) * 100) / 100;
}

// ── Price range (±spread → ~20% gap between low and high) ────────────────────
export function priceRange(
  mid: number,
  spread: number
): { low: number; high: number } {
  return {
    low:  Math.round(mid * (1 - spread)),
    high: Math.round(mid * (1 + spread)),
  };
}
