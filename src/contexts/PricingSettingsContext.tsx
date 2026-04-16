import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SidingRate {
  name: string;
  standard: number;
  heavy: number;
}

export interface StoryModifier {
  type: "dollar" | "percent";
  value: number;
  enabled: boolean;
}

export interface GutterTier {
  minSqft: number;
  maxSqft: number;
  gold: number;
  platinum: number;
}

export interface RoofSurfaceRate {
  name: string;
  standard: number;
  mossLichen: number;
}

export interface DifficultyLevel {
  name: string;
  upcharge: number; // percentage
}

export interface GutterProtectionProduct {
  name: string;
  pricePerUnit: number;
  minPrice: number;
  unitLabel: string; // "per linear ft" or "per unit"
  twoStory: StoryModifier;
  threeStory: StoryModifier;
}

export interface SurfaceSealingRate {
  name: string;
  pricePerSqft: number;
  minPrice: number;
}

export interface FlatworkRate {
  name: string;
  standard: number;
  heavy: number;
}

export interface ArchitecturalRate {
  name: string;
  standard: number;
  heavy: number;
}

export interface FenceRate {
  name: string;
  standard: number;
  heavy: number;
}

export interface DeckSurfaceRate {
  name: string;
  standard: number;
  heavy: number;
}

export interface DeckStepRate {
  name: string;
  standard: number;
  heavy: number;
}

export interface DeckRailingRate {
  name: string;
  standard: number;
  heavy: number;
}

export interface DeckUndersideModifier {
  standard: number; // percentage
  heavy: number;    // percentage
}

export interface AnnualServicePlan {
  name: string;
  visitsPerYear: number;
  discountPercent: number;
  includesDVC: boolean;
}

export interface AnnualServicePlanSettings {
  enabled: boolean;
  plans: AnnualServicePlan[];
  dryerVentCleaningValue: number;
}

export interface Clean365PlanTier {
  name: string;
  discountPercent: number;
}

export interface Clean365Settings {
  enabled: boolean;
  weedRemovalPerVisit: number;
  garbageCansPerVisit: number;
  outdoorUpholsteryCleaning: number;
  interiorHighDusting: number;
  roofCleaningModifier: number; // percentage applied to base roof price for annual maintenance
  planTiers: Clean365PlanTier[];
}

export interface PaverTier {
  minSqft: number;
  maxSqft: number | null; // null = "Above" (open-ended last tier)
  silver: number;
  gold: number;
  platinum: number;
}

export interface PaverMinimums {
  silver: number;
  gold: number;
  platinum: number;
}

export interface PricingSettings {
  // Global
  seasonalModifier: number; // percentage

  // House Washing
  sidingRates: SidingRate[];
  windowPrice: number;
  houseMinPrice: number;
  spotFreeMinPrice: number;
  detachedGarageFee: number;
  specialtyChemFee: number;
  houseTwo: StoryModifier;
  houseThree: StoryModifier;
  stainLevelModifier: StoryModifier;

  // Gutter
  gutterTiers: GutterTier[];
  gutterMinPrice: number;
  brighteningPerFt: number;
  drainBasePrice: number;
  drainAdditionalPrice: number;
  gutterTwo: StoryModifier;
  gutterThree: StoryModifier;
  annualServicePlans: AnnualServicePlanSettings;

  roofSurfaceRates: RoofSurfaceRate[];
  roofDifficultyLevels: DifficultyLevel[];
  roofMinPrice: number;
  roofNoGutterModifier: number; // percentage
  roofDetachedGarageFee: number;
  goNanoRevivePrice: number; // per sqft
  roofMossLichenModifier: StoryModifier;
  roofThreeStory: StoryModifier;

  // Gutter Protection
  gutterProtectionProducts: GutterProtectionProduct[];

  // Surface Sealing
  surfaceSealingRates: SurfaceSealingRate[];

  // Paver Maintenance
  paverTiers: PaverTier[];
  paverMinimums: PaverMinimums;

  // Dryer Vent Cleaning
  dryerVentBasePrice: number;
  dryerVentAdditionalPrice: number;

  // Flatwork Power Washing
  flatworkRates: FlatworkRate[];
  flatworkMinPrice: number;

  // Architectural Power Washing
  archVerticalWallRates: ArchitecturalRate[];
  archBallustradeRates: ArchitecturalRate[];
  archCurbRates: ArchitecturalRate[];
  archMinPrice: number;

  // Fence Cleaning
  fenceRates: FenceRate[];
  fenceMinPrice: number;

  // Deck Cleaning
  deckSurfaceRates: DeckSurfaceRate[];
  deckStepRates: DeckStepRate[];
  deckRailingRates: DeckRailingRate[];
  deckUndersideModifier: DeckUndersideModifier;
  deckMinPrice: number;

  // Outdoor Furniture Shrink Wrapping
  shrinkWrapLargePiecePrice: number;
  shrinkWrapSmallPiecePrice: number;
  shrinkWrapMinPrice: number;

  // Clean365 Annual Maintenance Plan
  clean365: Clean365Settings;
}

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
  detachedGarageFee: 89.00,
  specialtyChemFee: 125.00,
  houseTwo: { type: "percent", value: 30, enabled: true },
  houseThree: { type: "percent", value: 50, enabled: true },
  stainLevelModifier: { type: "percent", value: 20, enabled: true },

  gutterTiers: [
    { minSqft: 1, maxSqft: 1599, gold: 183, platinum: 257 },
    { minSqft: 1600, maxSqft: 1999, gold: 191, platinum: 297 },
    { minSqft: 2000, maxSqft: 2499, gold: 227, platinum: 356 },
    { minSqft: 2500, maxSqft: 2999, gold: 256, platinum: 378 },
    { minSqft: 3000, maxSqft: 3499, gold: 303, platinum: 403 },
    { minSqft: 3500, maxSqft: 3999, gold: 333, platinum: 469 },
    { minSqft: 4000, maxSqft: 4499, gold: 389, platinum: 527 },
    { minSqft: 4500, maxSqft: 4999, gold: 426, platinum: 603 },
  ],
  gutterMinPrice: 179.00,
  brighteningPerFt: 2.00,
  drainBasePrice: 50.00,
  drainAdditionalPrice: 25.00,
  gutterTwo: { type: "percent", value: 25, enabled: true },
  gutterThree: { type: "percent", value: 40, enabled: true },
  annualServicePlans: {
    enabled: true,
    plans: [
      { name: "Silver", visitsPerYear: 2, discountPercent: 6, includesDVC: false },
      { name: "Gold", visitsPerYear: 3, discountPercent: 8, includesDVC: false },
      { name: "Platinum", visitsPerYear: 4, discountPercent: 10, includesDVC: true },
    ],
    dryerVentCleaningValue: 149,
  },

  roofSurfaceRates: [
    { name: "Asphalt Shingle", standard: 0.30, mossLichen: 0.40 },
    { name: "Concrete/Clay Tile", standard: 0.70, mossLichen: 0.80 },
    { name: "Metal", standard: 0.60, mossLichen: 0.70 },
    { name: "Slate/Stone Tile", standard: 0.70, mossLichen: 0.80 },
    { name: "Flat Roof - EPDM/TPO", standard: 0.30, mossLichen: 0.40 },
  ],
  roofDifficultyLevels: [
    { name: "Low", upcharge: 0 },
    { name: "Moderate", upcharge: 10 },
    { name: "High", upcharge: 25 },
  ],
  roofMinPrice: 379.00,
  roofNoGutterModifier: 25,
  roofDetachedGarageFee: 89.00,
  goNanoRevivePrice: 1.75,
  roofMossLichenModifier: { type: "percent", value: 25, enabled: true },
  roofThreeStory: { type: "dollar", value: 200, enabled: true },

  gutterProtectionProducts: [
    {
      name: "Raindrop Gutter Guard",
      pricePerUnit: 14.50,
      minPrice: 379.00,
      unitLabel: "per linear ft",
      twoStory: { type: "percent", value: 0, enabled: true },
      threeStory: { type: "percent", value: 25, enabled: true },
    },
    {
      name: "FlowGuard Gutter Guard",
      pricePerUnit: 8.00,
      minPrice: 379.00,
      unitLabel: "per linear ft",
      twoStory: { type: "percent", value: 0, enabled: true },
      threeStory: { type: "percent", value: 25, enabled: true },
    },
    {
      name: "Gutter Stick",
      pricePerUnit: 40.00,
      minPrice: 379.00,
      unitLabel: "per unit",
      twoStory: { type: "percent", value: 0, enabled: false },
      threeStory: { type: "percent", value: 0, enabled: false },
    },
  ],

  surfaceSealingRates: [
    { name: "Concrete", pricePerSqft: 1.50, minPrice: 200.00 },
    { name: "Natural Stone", pricePerSqft: 2.00, minPrice: 250.00 },
    { name: "Aggregate", pricePerSqft: 1.75, minPrice: 225.00 },
  ],

  paverTiers: [
    { minSqft: 1, maxSqft: 199, silver: 1.25, gold: 6.00, platinum: 10.00 },
    { minSqft: 200, maxSqft: 299, silver: 1.10, gold: 4.00, platinum: 7.00 },
    { minSqft: 300, maxSqft: 399, silver: 1.00, gold: 3.33, platinum: 4.00 },
    { minSqft: 400, maxSqft: 499, silver: 1.00, gold: 2.00, platinum: 3.50 },
    { minSqft: 500, maxSqft: null, silver: 1.00, gold: 2.00, platinum: 3.50 },
  ],
  paverMinimums: {
    silver: 349.00,
    gold: 1000.00,
    platinum: 1500.00,
  },

  dryerVentBasePrice: 149.00,
  dryerVentAdditionalPrice: 79.00,

  flatworkRates: [
    { name: "Residential Concrete/Aggregate", standard: 0.30, heavy: 0.45 },
    { name: "Natural Stone", standard: 0.55, heavy: 0.65 },
    { name: "Pavers/Flagstone", standard: 0.60, heavy: 0.70 },
    { name: "Commercial Concrete", standard: 0.20, heavy: 0.30 },
    { name: "Dumpster Pads", standard: 0.50, heavy: 0.75 },
  ],
  flatworkMinPrice: 349.00,

  archVerticalWallRates: [
    { name: "Natural Stone/Pre-Cast", standard: 0.15, heavy: 0.30 },
    { name: "Concrete", standard: 0.12, heavy: 0.20 },
    { name: "Block/Brick", standard: 0.15, heavy: 0.30 },
  ],
  archBallustradeRates: [
    { name: "Natural Stone/Pre-Cast", standard: 7.00, heavy: 10.00 },
    { name: "Concrete", standard: 7.00, heavy: 10.00 },
    { name: "Block/Brick", standard: 7.00, heavy: 10.00 },
  ],
  archCurbRates: [
    { name: "Natural Stone/Pre-Cast", standard: 1.25, heavy: 2.00 },
    { name: "Concrete", standard: 1.00, heavy: 1.50 },
    { name: "Block/Brick", standard: 1.25, heavy: 2.00 },
  ],
  archMinPrice: 349.00,

  fenceRates: [
    { name: "Wood Panel", standard: 4.00, heavy: 5.00 },
    { name: "Wood Rail", standard: 4.00, heavy: 5.00 },
    { name: "Vinyl Panel", standard: 3.00, heavy: 4.00 },
    { name: "Vinyl Rail", standard: 3.00, heavy: 4.00 },
  ],
  fenceMinPrice: 349.00,

  deckSurfaceRates: [
    { name: "Common Wood", standard: 0.75, heavy: 0.85 },
    { name: "Composite", standard: 0.50, heavy: 0.60 },
    { name: "Exotic Wood", standard: 1.25, heavy: 3.00 },
  ],
  deckStepRates: [
    { name: "Common Wood", standard: 5.00, heavy: 10.00 },
    { name: "Composite", standard: 5.00, heavy: 10.00 },
    { name: "Exotic Wood", standard: 5.00, heavy: 10.00 },
  ],
  deckRailingRates: [
    { name: "Common Wood", standard: 4.00, heavy: 6.00 },
    { name: "Composite", standard: 3.00, heavy: 5.00 },
    { name: "Exotic Wood", standard: 4.00, heavy: 6.00 },
  ],
  deckUndersideModifier: {
    standard: 50,
    heavy: 100,
  },
  deckMinPrice: 349.00,

  shrinkWrapLargePiecePrice: 50.00,
  shrinkWrapSmallPiecePrice: 30.00,
  shrinkWrapMinPrice: 0,

  clean365: {
    enabled: true,
    weedRemovalPerVisit: 0,
    garbageCansPerVisit: 0,
    outdoorUpholsteryCleaning: 0,
    interiorHighDusting: 0,
    roofCleaningModifier: 60,
    planTiers: [
      { name: "Silver", discountPercent: 10 },
      { name: "Gold", discountPercent: 15 },
      { name: "Platinum", discountPercent: 20 },
    ],
  },
};

export interface TierError {
  row: number;
  type: "invalid-range" | "overlap" | "gap";
  message: string;
  overlapsWithRow?: number;
}

// Keep backward compat alias
export type GutterTierError = TierError;

export function validateGutterTiers(tiers: GutterTier[]): TierError[] {
  const errors: TierError[] = [];
  tiers.forEach((tier, i) => {
    if (tier.minSqft >= tier.maxSqft) {
      errors.push({ row: i, type: "invalid-range", message: `Row ${i + 1} has an invalid range (Low >= High)` });
    }
  });
  for (let i = 0; i < tiers.length; i++) {
    for (let j = i + 1; j < tiers.length; j++) {
      if (tiers[i].minSqft < tiers[j].maxSqft && tiers[j].minSqft < tiers[i].maxSqft) {
        errors.push({ row: i, type: "overlap", overlapsWithRow: j, message: `Rows ${i + 1} and ${j + 1} have overlapping ranges` });
      }
    }
  }
  return errors;
}

export function validatePaverTiers(tiers: PaverTier[]): TierError[] {
  const errors: TierError[] = [];
  const sorted = tiers.map((t, i) => ({ ...t, origIndex: i })).sort((a, b) => a.minSqft - b.minSqft);

  tiers.forEach((tier, i) => {
    if (tier.maxSqft !== null && tier.minSqft >= tier.maxSqft) {
      errors.push({ row: i, type: "invalid-range", message: `Row ${i + 1} has an invalid range (Low >= High)` });
    }
  });

  for (let i = 0; i < tiers.length; i++) {
    for (let j = i + 1; j < tiers.length; j++) {
      const aMax = tiers[i].maxSqft ?? Infinity;
      const bMax = tiers[j].maxSqft ?? Infinity;
      if (tiers[i].minSqft < bMax && tiers[j].minSqft < aMax) {
        errors.push({ row: i, type: "overlap", overlapsWithRow: j, message: `Rows ${i + 1} and ${j + 1} have overlapping ranges` });
      }
    }
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = sorted[i];
    const next = sorted[i + 1];
    if (curr.maxSqft !== null && curr.maxSqft + 1 < next.minSqft) {
      errors.push({ row: curr.origIndex, type: "gap", message: `Gap between rows ${curr.origIndex + 1} and ${next.origIndex + 1} (${curr.maxSqft + 1}–${next.minSqft - 1})` });
    }
  }

  return errors;
}

interface PricingSettingsContextValue {
  settings: PricingSettings;
  updateSettings: (partial: Partial<PricingSettings>) => void;
  isLoading: boolean;
  isSaving: boolean;
  saveError: string | null;
}

const PricingSettingsContext = createContext<PricingSettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  isLoading: true,
  isSaving: false,
  saveError: null,
});

export const usePricingSettings = () => useContext(PricingSettingsContext);

const DEBOUNCE_MS = 1500;

export const PricingSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PricingSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Track whether initial load is done so we don't save the defaults back
  const loadedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load settings from Supabase on mount
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("pricing_settings")
          .select("settings")
          .eq("id", "global")
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error("Failed to load pricing settings:", error);
        } else if (data?.settings && typeof data.settings === "object" && !Array.isArray(data.settings)) {
          // Merge loaded settings with defaults so new keys added in future are present
          setSettings((prev) => ({ ...prev, ...(data.settings as Partial<PricingSettings>) }));
        }
        // If no row exists yet, we stay on DEFAULT_SETTINGS — first save will create it
      } finally {
        if (!cancelled) {
          loadedRef.current = true;
          setIsLoading(false);
        }
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // Debounced save to Supabase whenever settings change (after initial load)
  useEffect(() => {
    if (!loadedRef.current) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      setIsSaving(true);
      setSaveError(null);
      try {
        const { error } = await supabase
          .from("pricing_settings")
          .upsert({ id: "global", settings: settings as unknown as Record<string, unknown> }, { onConflict: "id" });

        if (error) {
          console.error("Failed to save pricing settings:", error);
          setSaveError("Settings could not be saved. Changes may be lost on refresh.");
        }
      } finally {
        setIsSaving(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [settings]);

  const updateSettings = useCallback((partial: Partial<PricingSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <PricingSettingsContext.Provider value={{ settings, updateSettings, isLoading, isSaving, saveError }}>
      {children}
    </PricingSettingsContext.Provider>
  );
};
