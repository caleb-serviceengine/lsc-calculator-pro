// Fallback pricing settings used when Supabase is unavailable or the
// pricing_settings table hasn't been seeded yet.
// These mirror DEFAULT_SETTINGS in the main app's PricingSettingsContext.tsx.
// Once the internal calculator is deployed and settings are saved, Supabase
// will serve live values instead of these.

import type { PricingSettings } from "./pricing";

export const DEFAULT_SETTINGS: PricingSettings = {
  seasonalModifier: 0,

  sidingRates: [
    { name: "Vinyl", standard: 0.20, heavy: 0.20 },
    { name: "Brick/Vinyl Combo", standard: 0.20, heavy: 0.20 },
    { name: "Brick", standard: 0.32, heavy: 0.32 },
    { name: "EIFS/Dryvit/Stucco", standard: 0.40, heavy: 0.40 },
    { name: "Painted Wood", standard: 0.20, heavy: 0.20 },
    { name: "Aluminum Siding", standard: 0.20, heavy: 0.20 },
    { name: "Composite Siding/Hardie Board", standard: 0.40, heavy: 0.40 },
  ],
  windowPrice: 8.00,
  houseMinPrice: 349.00,
  spotFreeMinPrice: 149.00,
  houseTwo: { type: "percent", value: 30, enabled: true },
  houseThree: { type: "percent", value: 50, enabled: true },

  gutterTiers: [
    { minSqft: 1,    maxSqft: 1599, gold: 183, platinum: 257 },
    { minSqft: 1600, maxSqft: 1999, gold: 191, platinum: 297 },
    { minSqft: 2000, maxSqft: 2499, gold: 227, platinum: 356 },
    { minSqft: 2500, maxSqft: 2999, gold: 256, platinum: 378 },
    { minSqft: 3000, maxSqft: 3499, gold: 303, platinum: 403 },
    { minSqft: 3500, maxSqft: 3999, gold: 333, platinum: 469 },
    { minSqft: 4000, maxSqft: 4499, gold: 389, platinum: 527 },
    { minSqft: 4500, maxSqft: 4999, gold: 426, platinum: 603 },
  ],
  gutterMinPrice: 179.00,
  gutterTwo: { type: "percent", value: 25, enabled: true },
  gutterThree: { type: "percent", value: 40, enabled: true },

  gutterProtectionProducts: [
    {
      name: "Raindrop Gutter Guard",
      pricePerUnit: 14.50,
      minPrice: 379.00,
      twoStory: { type: "percent", value: 0, enabled: true },
      threeStory: { type: "percent", value: 25, enabled: true },
    },
    {
      name: "FlowGuard Gutter Guard",
      pricePerUnit: 8.00,
      minPrice: 379.00,
      twoStory: { type: "percent", value: 0, enabled: true },
      threeStory: { type: "percent", value: 25, enabled: true },
    },
    {
      name: "Gutter Stick",
      pricePerUnit: 40.00,
      minPrice: 379.00,
      twoStory: { type: "percent", value: 0, enabled: false },
      threeStory: { type: "percent", value: 0, enabled: false },
    },
  ],

  roofSurfaceRates: [
    { name: "Asphalt Shingle",      standard: 0.30, mossLichen: 0.40 },
    { name: "Concrete/Clay Tile",   standard: 0.70, mossLichen: 0.80 },
    { name: "Metal",                standard: 0.60, mossLichen: 0.70 },
    { name: "Slate/Stone Tile",     standard: 0.70, mossLichen: 0.80 },
    { name: "Flat Roof - EPDM/TPO", standard: 0.30, mossLichen: 0.40 },
  ],
  roofDifficultyLevels: [
    { name: "Low",      upcharge: 0  },
    { name: "Moderate", upcharge: 10 },
    { name: "High",     upcharge: 25 },
  ],
  roofMinPrice: 379.00,
  roofThreeStory: { type: "dollar", value: 200, enabled: true },

  flatworkRates: [
    { name: "Residential Concrete/Aggregate", standard: 0.30, heavy: 0.45 },
    { name: "Natural Stone",                  standard: 0.55, heavy: 0.65 },
    { name: "Pavers/Flagstone",               standard: 0.60, heavy: 0.70 },
    { name: "Commercial Concrete",            standard: 0.20, heavy: 0.30 },
    { name: "Dumpster Pads",                  standard: 0.50, heavy: 0.75 },
  ],
  flatworkMinPrice: 349.00,

  deckSurfaceRates: [
    { name: "Common Wood",  standard: 0.75, heavy: 0.85 },
    { name: "Composite",    standard: 0.50, heavy: 0.60 },
    { name: "Exotic Wood",  standard: 1.25, heavy: 3.00 },
  ],
  deckMinPrice: 349.00,
};
