import type { PricingSettings, StoryModifier } from "@/contexts/PricingSettingsContext";

export const STAIN_LEVELS = ["Light", "Moderate", "Heavy"] as const;

interface PropertySpecs {
  sqft: number;
  twoStory: boolean;
  threeStory: boolean;
  detachedGarage: boolean;
}

interface HouseWashInput {
  windowCount: number;
  sidingType: string;
  stainLevel: string;
  nonOrganicStains: boolean;
  selectedPackage: string | null;
}

interface GutterInput {
  selectedPackage: string | null;
  undergroundDrains: number;
  brighteningFt: number;
}

export interface RoofInput {
  roofSqft: number;
  surfaceType: string;
  difficultyLevel: string;
  heavyMossLichen: boolean;
  noGutters: boolean;
}

function applyModifier(total: number, modifier: StoryModifier): number {
  if (!modifier.enabled) return total;
  if (modifier.type === "percent") {
    return total * (1 + modifier.value / 100);
  }
  return total + modifier.value;
}

export function calcHouseWash(property: PropertySpecs, input: HouseWashInput, s: PricingSettings): number {
  if (!input.selectedPackage) return 0;

  const windowCost = input.windowCount * s.windowPrice;

  // Spot Free only needs window count — no siding/stain dependency
  if (input.selectedPackage === "spot-free") {
    let total = windowCost;

    if (property.threeStory) {
      total = applyModifier(total, s.houseThree);
    } else if (property.twoStory) {
      total = applyModifier(total, s.houseTwo);
    }

    total = Math.max(total, s.spotFreeMinPrice);

    if (property.detachedGarage) total += s.detachedGarageFee;

    if (s.seasonalModifier !== 0) {
      total *= 1 + s.seasonalModifier / 100;
    }

    return Math.round(total * 100) / 100;
  }

  const rate = s.sidingRates.find((r) => r.name === input.sidingType);
  if (!rate) return 0;

  const rateVal = input.stainLevel === "Heavy" ? rate.heavy : rate.standard;
  const baseCost = property.sqft * rateVal;

  let total: number;
  if (input.selectedPackage === "silver") {
    // Silver: house wash only, no window cost
    total = baseCost;

    if (property.threeStory) {
      total = applyModifier(total, s.houseThree);
    } else if (property.twoStory) {
      total = applyModifier(total, s.houseTwo);
    }

    total = Math.max(total, s.houseMinPrice);
  } else if (input.selectedPackage === "gold") {
    // Gold: house wash + window cleaning
    // Apply story modifiers and minimum to house wash portion, then add window cost
    let houseTotal = baseCost;

    if (property.threeStory) {
      houseTotal = applyModifier(houseTotal, s.houseThree);
    } else if (property.twoStory) {
      houseTotal = applyModifier(houseTotal, s.houseTwo);
    }

    houseTotal = Math.max(houseTotal, s.houseMinPrice);
    total = houseTotal + windowCost;
  } else {
    // Platinum: (house wash + window cleaning) * 1.4
    total = (baseCost + windowCost) * 1.4;

    if (property.threeStory) {
      total = applyModifier(total, s.houseThree);
    } else if (property.twoStory) {
      total = applyModifier(total, s.houseTwo);
    }

    total = Math.max(total, s.houseMinPrice);
  }

  // Add-ons
  if (property.detachedGarage) total += s.detachedGarageFee;
  if (input.nonOrganicStains) total += s.specialtyChemFee;

  // Seasonal modifier
  if (s.seasonalModifier !== 0) {
    total *= 1 + s.seasonalModifier / 100;
  }

  return Math.round(total * 100) / 100;
}

export function calcGutterPackagePrice(property: PropertySpecs, pkg: string, s: PricingSettings): number {
  const tier = s.gutterTiers.find(
    (t) => property.sqft >= t.minSqft && property.sqft <= t.maxSqft
  );
  let price = 0;
  if (tier) {
    price = pkg === "silver" ? tier.gold : tier.platinum;
  } else if (property.sqft > (s.gutterTiers[s.gutterTiers.length - 1]?.maxSqft ?? 4999)) {
    const last = s.gutterTiers[s.gutterTiers.length - 1];
    price = pkg === "silver" ? (last?.gold ?? 0) : (last?.platinum ?? 0);
  }

  if (property.threeStory) {
    price = applyModifier(price, s.gutterThree);
  } else if (property.twoStory) {
    price = applyModifier(price, s.gutterTwo);
  }

  // Seasonal modifier
  if (s.seasonalModifier !== 0) {
    price *= 1 + s.seasonalModifier / 100;
  }

  return Math.max(Math.round(price * 100) / 100, property.sqft > 0 ? s.gutterMinPrice : 0);
}

export function calcGutterCleaning(property: PropertySpecs, input: GutterInput, s: PricingSettings) {
  let packagePrice = 0;

  if (input.selectedPackage) {
    packagePrice = calcGutterPackagePrice(property, input.selectedPackage, s);
  }

  const drainPrice =
    input.undergroundDrains > 0
      ? s.drainBasePrice + Math.max(0, input.undergroundDrains - 1) * s.drainAdditionalPrice
      : 0;

  const brighteningPrice = input.brighteningFt * s.brighteningPerFt;

  return {
    packagePrice: Math.round(packagePrice * 100) / 100,
    drainPrice,
    brighteningPrice,
  };
}

export function calcRoofCleaning(property: PropertySpecs, input: RoofInput, s: PricingSettings): number {
  if (input.roofSqft <= 0) return 0;

  // 1. Get surface rate
  const surface = s.roofSurfaceRates.find((r) => r.name === input.surfaceType);
  if (!surface) return 0;

  const rate = input.heavyMossLichen ? surface.mossLichen : surface.standard;

  // 2. Base = roofSqft × rate
  let total = input.roofSqft * rate;

  // 3. Apply difficulty modifier
  const difficulty = s.roofDifficultyLevels.find((d) => d.name === input.difficultyLevel);
  if (difficulty && difficulty.upcharge > 0) {
    total *= 1 + difficulty.upcharge / 100;
  }

  // 4. No gutter modifier
  if (input.noGutters) {
    total *= 1 + s.roofNoGutterModifier / 100;
  }

  // 5. Moss/Lichen additional modifier
  if (input.heavyMossLichen) {
    total = applyModifier(total, s.roofMossLichenModifier);
  }

  // 6. 3+ Story modifier (only 3-story, not 2-story)
  if (property.threeStory) {
    total = applyModifier(total, s.roofThreeStory);
  }

  // 7. Detached garage fee
  if (property.detachedGarage) {
    total += s.roofDetachedGarageFee;
  }

  // 8. Seasonal modifier
  if (s.seasonalModifier !== 0) {
    total *= 1 + s.seasonalModifier / 100;
  }

  // 9. Apply minimum price
  total = Math.max(total, s.roofMinPrice);

  return Math.round(total * 100) / 100;
}

export function calcGoNano(roofSqft: number, s: PricingSettings): number {
  if (roofSqft <= 0) return 0;
  let total = roofSqft * s.goNanoRevivePrice;

  // Seasonal modifier
  if (s.seasonalModifier !== 0) {
    total *= 1 + s.seasonalModifier / 100;
  }

  return Math.round(total * 100) / 100;
}

export function calcGutterProtection(
  property: PropertySpecs,
  productIndex: number,
  quantity: number,
  s: PricingSettings
): number {
  const product = s.gutterProtectionProducts[productIndex];
  if (!product || quantity <= 0) return 0;

  let total = quantity * product.pricePerUnit;

  // Story modifiers
  if (property.threeStory) {
    total = applyModifier(total, product.threeStory);
  } else if (property.twoStory) {
    total = applyModifier(total, product.twoStory);
  }

  // Seasonal modifier
  if (s.seasonalModifier !== 0) {
    total *= 1 + s.seasonalModifier / 100;
  }

  // Minimum price
  total = Math.max(total, product.minPrice);

  return Math.round(total * 100) / 100;
}
