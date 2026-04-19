import { useState, useMemo, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CalculatorHeader from "@/components/CalculatorHeader";
import PropertySpecs from "@/components/PropertySpecs";
import CollapsibleServiceSection from "@/components/CollapsibleServiceSection";
import HouseWashingSection from "@/components/HouseWashingSection";
import GutterCleaningSection from "@/components/GutterCleaningSection";
import GutterProtectionSection from "@/components/GutterProtectionSection";
import RoofCleaningSection from "@/components/RoofCleaningSection";
import SurfaceSealingSection from "@/components/SurfaceSealingSection";
import PaverMaintenanceSection from "@/components/PaverMaintenanceSection";
import FlatworkPowerWashingSection, { type FlatworkArea } from "@/components/FlatworkPowerWashingSection";
import ArchitecturalPowerWashingSection, { type ArchArea } from "@/components/ArchitecturalPowerWashingSection";
import DryerVentCleaningSection from "@/components/DryerVentCleaningSection";
import FenceCleaningSection from "@/components/FenceCleaningSection";
import DeckCleaningSection from "@/components/DeckCleaningSection";
import OutdoorFurnitureShrinkWrappingSection from "@/components/OutdoorFurnitureShrinkWrappingSection";
import CustomItemsSection, { type CustomItem } from "@/components/CustomItemsSection";
import AnnualServicePlanCard from "@/components/AnnualServicePlanCard";
import Clean365PreviewCard, { type Clean365SourcePrices, type ServiceStatusMap } from "@/components/Clean365PreviewCard";
import BundleSummary from "@/components/BundleSummary";
import BidHistoryModal from "@/components/BidHistoryModal";

import AccountSettingsModal from "@/components/AccountSettingsModal";

import { useUserRole } from "@/hooks/useUserRole";
import { calcHouseWash, calcGutterCleaning, calcGutterPackagePrice, calcRoofCleaning, calcGoNano, calcGutterProtection } from "@/lib/pricing";
import { calcSurfaceSealing } from "@/lib/surfaceSealing";
import { calcPaverMaintenance, type PaverPackage } from "@/lib/paverMaintenance";
import { usePricingSettings, validateGutterTiers, validatePaverTiers } from "@/contexts/PricingSettingsContext";

const Index = () => {
  const { settings } = usePricingSettings();
  const { isAdmin } = useUserRole();
  const [showBidHistory, setShowBidHistory] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [currentBid, setCurrentBid] = useState<{ bid_id: string; customer_name: string; status: "draft" | "sent" | "won" | "lost" } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email ?? undefined);
    });
  }, []);

  // Property specs
  const [sqft, setSqft] = useState("");
  const [twoStory, setTwoStory] = useState(false);
  const [threeStory, setThreeStory] = useState(false);
  const [detachedGarage, setDetachedGarage] = useState(false);

  // House washing
  const [windowCount, setWindowCount] = useState("");
  const [sidingType, setSidingType] = useState("Vinyl");
  const [stainLevel, setStainLevel] = useState("Light");
  const [nonOrganicStains, setNonOrganicStains] = useState(false);
  const [houseWashPackage, setHouseWashPackage] = useState<string | null>(null);

  // Gutter cleaning
  const [gutterPackage, setGutterPackage] = useState<string | null>(null);
  const [undergroundDrains, setUndergroundDrains] = useState("");
  const [brighteningFt, setBrighteningFt] = useState("");
  const [drainSelected, setDrainSelected] = useState(false);
  const [brighteningSelected, setBrighteningSelected] = useState(false);
  const [annualPlan, setAnnualPlan] = useState<string | null>(null);
  const [annualPlanBundle, setAnnualPlanBundle] = useState(false);

  // Gutter protection
  const [gpLinearFeet, setGpLinearFeet] = useState("");
  const [gpDownspouts, setGpDownspouts] = useState("");
  const [gpGutterStickQty, setGpGutterStickQty] = useState("");
  const [gpSelectedProduct, setGpSelectedProduct] = useState<string | null>(null);

  // Roof cleaning
  const [roofSqft, setRoofSqft] = useState("");
  const [surfaceType, setSurfaceType] = useState("Asphalt Shingle");
  const [difficultyLevel, setDifficultyLevel] = useState("Low");
  const [heavyMossLichen, setHeavyMossLichen] = useState(false);
  const [noGutters, setNoGutters] = useState(false);
  const [roofPlatinumSelected, setRoofPlatinumSelected] = useState(false);
  const [goNanoSelected, setGoNanoSelected] = useState(false);

  // Surface sealing
  const [surfaceSqfts, setSurfaceSqfts] = useState(["", "", ""]);
  const [surfaceSelected, setSurfaceSelected] = useState([false, false, false]);

  // Paver maintenance
  const [paverSqft, setPaverSqft] = useState("");
  const [paverPackage, setPaverPackage] = useState<string | null>(null);

  // Dryer vent cleaning
  const [dryerVentQty, setDryerVentQty] = useState("");
  const [dryerVentSelected, setDryerVentSelected] = useState(false);

  // Flatwork power washing
  const [flatworkAreas, setFlatworkAreas] = useState<FlatworkArea[]>([]);

  // Architectural power washing
  const [archAreas, setArchAreas] = useState<ArchArea[]>([]);
  const [archAddToBundle, setArchAddToBundle] = useState(false);

  // Fence cleaning
  const [fencePanelFt, setFencePanelFt] = useState("");
  const [fenceAddToBundle, setFenceAddToBundle] = useState(false);
  const [fencePanelMaterial, setFencePanelMaterial] = useState("Wood Panel");
  const [fenceRailFt, setFenceRailFt] = useState("");
  const [fenceRailMaterial, setFenceRailMaterial] = useState("Wood Rail");
  const [fenceStainLevel, setFenceStainLevel] = useState<"Standard" | "Heavy">("Standard");

  // Deck cleaning
  const [deckMaterial, setDeckMaterial] = useState("Common Wood");
  const [deckStainLevel, setDeckStainLevel] = useState<"Standard" | "Heavy">("Standard");
  const [deckSurfaceSqft, setDeckSurfaceSqft] = useState("");
  const [deckUndersideCleaning, setDeckUndersideCleaning] = useState(false);
  const [deckRailingFt, setDeckRailingFt] = useState("");
  const [deckStepCount, setDeckStepCount] = useState("");
  const [deckAddToBundle, setDeckAddToBundle] = useState(false);

  // Outdoor furniture shrink wrapping
  const [shrinkWrapLarge, setShrinkWrapLarge] = useState(0);
  const [shrinkWrapSmall, setShrinkWrapSmall] = useState(0);
  const [shrinkWrapAddToBundle, setShrinkWrapAddToBundle] = useState(false);

  // Clean365
  const [clean365AddToBundle, setClean365AddToBundle] = useState(false);
  const [clean365NAServices, setClean365NAServices] = useState<string[]>([]);

  // Custom items
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);

  const property = useMemo(
    () => ({
      sqft: parseFloat(sqft) || 0,
      twoStory,
      threeStory,
      detachedGarage,
    }),
    [sqft, twoStory, threeStory, detachedGarage]
  );

  const sidingTypes = useMemo(() => settings.sidingRates.map((r) => r.name), [settings.sidingRates]);

  const houseWashPrice = useMemo(
    () =>
      calcHouseWash(property, {
        windowCount: parseInt(windowCount) || 0,
        sidingType,
        stainLevel,
        nonOrganicStains,
        selectedPackage: houseWashPackage,
      }, settings),
    [property, windowCount, sidingType, stainLevel, nonOrganicStains, houseWashPackage, settings]
  );

  const gutterPrices = useMemo(
    () =>
      calcGutterCleaning(property, {
        selectedPackage: gutterPackage,
        undergroundDrains: parseInt(undergroundDrains) || 0,
        brighteningFt: parseFloat(brighteningFt) || 0,
      }, settings),
    [property, gutterPackage, undergroundDrains, brighteningFt, settings]
  );

  const houseWashPackagePrices = useMemo(() => {
    const base = {
      windowCount: parseInt(windowCount) || 0,
      sidingType,
      stainLevel,
      nonOrganicStains,
    };
    return {
      spotFree: calcHouseWash(property, { ...base, selectedPackage: "spot-free" }, settings),
      silver: calcHouseWash(property, { ...base, selectedPackage: "silver" }, settings),
      gold: calcHouseWash(property, { ...base, selectedPackage: "gold" }, settings),
      platinum: calcHouseWash(property, { ...base, selectedPackage: "platinum" }, settings),
    };
  }, [property, windowCount, sidingType, stainLevel, nonOrganicStains, settings]);

  const gutterHasErrors = useMemo(() => validateGutterTiers(settings.gutterTiers).length > 0, [settings.gutterTiers]);

  const gutterCardPrices = useMemo(() => ({
    silver: gutterHasErrors ? 0 : calcGutterPackagePrice(property, "silver", settings),
    gold: gutterHasErrors ? 0 : calcGutterPackagePrice(property, "gold", settings),
  }), [property, settings, gutterHasErrors]);

  // Annual service plan base price (uses Silver package pricing)
  const aspBasePrice = useMemo(() => {
    if (gutterHasErrors) return 0;
    return calcGutterPackagePrice(property, "silver", settings);
  }, [property, settings, gutterHasErrors]);

  const aspSelectedPlanPrice = useMemo(() => {
    if (!annualPlan || gutterHasErrors) return 0;
    const plan = settings.annualServicePlans.plans.find(
      (p) => p.name.toLowerCase() === annualPlan
    );
    if (!plan) return 0;
    return aspBasePrice * plan.visitsPerYear * (1 - plan.discountPercent / 100);
  }, [annualPlan, aspBasePrice, settings.annualServicePlans.plans, gutterHasErrors]);

  // Gutter protection pricing
  const gpPrices = useMemo(() => {
    const lf = parseFloat(gpLinearFeet) || 0;
    const stickQty = parseInt(gpGutterStickQty) || 0;
    return {
      raindrop: calcGutterProtection(property, 0, lf, settings),
      flowguard: calcGutterProtection(property, 1, lf, settings),
      gutterStick: calcGutterProtection(property, 2, stickQty, settings),
    };
  }, [property, gpLinearFeet, gpGutterStickQty, settings]);

  // Roof pricing
  const roofInput = useMemo(() => ({
    roofSqft: parseFloat(roofSqft) || 0,
    surfaceType,
    difficultyLevel,
    heavyMossLichen,
    noGutters,
  }), [roofSqft, surfaceType, difficultyLevel, heavyMossLichen, noGutters]);

  const roofPlatinumPrice = useMemo(
    () => calcRoofCleaning(property, roofInput, settings),
    [property, roofInput, settings]
  );

  const goNanoPrice = useMemo(
    () => calcGoNano(parseFloat(roofSqft) || 0, settings),
    [roofSqft, settings]
  );

  const surfaceSealingPrices = useMemo(() =>
    surfaceSqfts.map((s, i) => calcSurfaceSealing(parseFloat(s) || 0, i, settings)),
    [surfaceSqfts, settings]
  );

  // Paver maintenance
  const paverHasErrors = useMemo(() => validatePaverTiers(settings.paverTiers).length > 0, [settings.paverTiers]);

  const paverPkgPrices = useMemo(() => {
    const sq = parseFloat(paverSqft) || 0;
    if (paverHasErrors) return { silver: 0, gold: 0, platinum: 0 };
    return {
      silver: calcPaverMaintenance(sq, "silver", settings),
      gold: calcPaverMaintenance(sq, "gold", settings),
      platinum: calcPaverMaintenance(sq, "platinum", settings),
    };
  }, [paverSqft, settings, paverHasErrors]);

  // Dryer vent cleaning
  const dryerVentPrice = useMemo(() => {
    const qty = parseInt(dryerVentQty) || 0;
    if (qty <= 0) return 0;
    return settings.dryerVentBasePrice + Math.max(0, qty - 1) * settings.dryerVentAdditionalPrice;
  }, [dryerVentQty, settings.dryerVentBasePrice, settings.dryerVentAdditionalPrice]);

  // Flatwork power washing
  const flatworkCheckedAreas = useMemo(() => {
    const checkedAreas = flatworkAreas.filter((a) => a.checked);
    const rates = settings.flatworkRates ?? [];
    return checkedAreas.map((area) => {
      const sq = parseFloat(area.sqft) || 0;
      const rate = rates.find((r) => r.name === area.material);
      const price = sq > 0 && rate ? sq * (area.stain === "Heavy" ? rate.heavy : rate.standard) : 0;
      return { ...area, price };
    });
  }, [flatworkAreas, settings.flatworkRates]);

  const flatworkTotal = useMemo(() => {
    if (flatworkCheckedAreas.length === 0) return 0;
    const sum = flatworkCheckedAreas.reduce((acc, a) => acc + a.price, 0);
    return sum > 0 ? Math.max(sum, settings.flatworkMinPrice ?? 349) : 0;
  }, [flatworkCheckedAreas, settings.flatworkMinPrice]);

  // Architectural power washing
  const archCalc = useMemo(() => {
    const calcSurface = (value: string, material: string, stain: "Standard" | "Heavy", rates: { name: string; standard: number; heavy: number }[]) => {
      const v = parseFloat(value) || 0;
      if (v <= 0 || !material) return 0;
      const rate = rates.find((r) => r.name === material);
      if (!rate) return 0;
      return v * (stain === "Heavy" ? rate.heavy : rate.standard);
    };

    const areaDetails = archAreas.map((area) => {
      const vw = calcSurface(area.verticalWalls.value, area.verticalWalls.material, area.verticalWalls.stain, settings.archVerticalWallRates);
      const bl = calcSurface(area.ballustrades.value, area.ballustrades.material, area.ballustrades.stain, settings.archBallustradeRates);
      const cb = calcSurface(area.curbs.value, area.curbs.material, area.curbs.stain, settings.archCurbRates);
      return { label: area.label, vw, bl, cb, total: vw + bl + cb };
    });

    const rawTotal = areaDetails.reduce((acc, a) => acc + a.total, 0);
    const grandTotal = rawTotal > 0 ? Math.max(rawTotal, settings.archMinPrice) : 0;

    return { areaDetails, rawTotal, grandTotal };
  }, [archAreas, settings.archVerticalWallRates, settings.archBallustradeRates, settings.archCurbRates, settings.archMinPrice]);

  // Fence cleaning price
  const fencePrice = useMemo(() => {
    const pFt = parseFloat(fencePanelFt) || 0;
    const rFt = parseFloat(fenceRailFt) || 0;
    const pRate = settings.fenceRates.find((r) => r.name === fencePanelMaterial);
    const rRate = settings.fenceRates.find((r) => r.name === fenceRailMaterial);
    const pPrice = pFt > 0 && pRate ? pFt * (fenceStainLevel === "Heavy" ? pRate.heavy : pRate.standard) : 0;
    const rPrice = rFt > 0 && rRate ? rFt * (fenceStainLevel === "Heavy" ? rRate.heavy : rRate.standard) : 0;
    const subtotal = pPrice + rPrice;
    return subtotal > 0 ? Math.max(subtotal, settings.fenceMinPrice) : 0;
  }, [fencePanelFt, fenceRailFt, fencePanelMaterial, fenceRailMaterial, fenceStainLevel, settings.fenceRates, settings.fenceMinPrice]);

  // Deck cleaning price
  const deckPrice = useMemo(() => {
    const sqft = parseFloat(deckSurfaceSqft) || 0;
    const rFt = parseFloat(deckRailingFt) || 0;
    const steps = parseInt(deckStepCount) || 0;

    const surfaceRate = settings.deckSurfaceRates.find((r) => r.name === deckMaterial);
    const surfacePrice = sqft > 0 && surfaceRate
      ? sqft * (deckStainLevel === "Heavy" ? surfaceRate.heavy : surfaceRate.standard)
      : 0;

    const undersideModifier = deckStainLevel === "Heavy"
      ? settings.deckUndersideModifier.heavy
      : settings.deckUndersideModifier.standard;
    const undersidePrice = deckUndersideCleaning && surfacePrice > 0
      ? surfacePrice * (undersideModifier / 100)
      : 0;

    const railingRate = settings.deckRailingRates.find((r) => r.name === deckMaterial);
    const railingPrice = rFt > 0 && railingRate
      ? rFt * (deckStainLevel === "Heavy" ? railingRate.heavy : railingRate.standard)
      : 0;

    const stepRate = settings.deckStepRates.find((r) => r.name === deckMaterial);
    const stepPrice = steps > 0 && stepRate
      ? steps * (deckStainLevel === "Heavy" ? stepRate.heavy : stepRate.standard)
      : 0;

    const subtotal = surfacePrice + undersidePrice + railingPrice + stepPrice;
    return subtotal > 0 ? Math.max(subtotal, settings.deckMinPrice) : 0;
  }, [deckSurfaceSqft, deckRailingFt, deckStepCount, deckMaterial, deckStainLevel, deckUndersideCleaning, settings.deckSurfaceRates, settings.deckRailingRates, settings.deckStepRates, settings.deckUndersideModifier, settings.deckMinPrice]);

  // Shrink wrapping price
  const shrinkWrapPrice = useMemo(() => {
    const total = (shrinkWrapLarge * settings.shrinkWrapLargePiecePrice) + (shrinkWrapSmall * settings.shrinkWrapSmallPiecePrice);
    if (total === 0) return 0;
    return Math.max(total, settings.shrinkWrapMinPrice);
  }, [shrinkWrapLarge, shrinkWrapSmall, settings.shrinkWrapLargePiecePrice, settings.shrinkWrapSmallPiecePrice, settings.shrinkWrapMinPrice]);

  // Clean365 source prices
  const clean365SourcePrices = useMemo<Clean365SourcePrices>(() => {
    // 1. Gutter Cleaning ×4 — always Silver tier
    const gutterBasePrice = gutterHasErrors ? 0 : calcGutterPackagePrice(property, "silver", settings);
    // 2. House Washing ×1 — always Silver package
    const hwPrice = calcHouseWash(property, {
      windowCount: parseInt(windowCount) || 0,
      sidingType,
      stainLevel,
      nonOrganicStains,
      selectedPackage: "silver",
    }, settings);
    // 3. Window Cleaning ×2 — Spot Free Exterior price
    const wCount = parseInt(windowCount) || 0;
    let spotFreePrice = wCount * settings.windowPrice;
    if (spotFreePrice > 0) spotFreePrice = Math.max(spotFreePrice, settings.spotFreeMinPrice);
    const windowCleaningPrice = spotFreePrice * 2;
    // 4. Roof Cleaning ×1 — base price × annual maintenance modifier
    const roofModifier = settings.clean365.roofCleaningModifier / 100;
    const roofCleaningPrice = roofPlatinumPrice * roofModifier;
    // 5. Gutter brightening (from user's calculator inputs)
    const bFt = parseFloat(brighteningFt) || 0;
    const brighteningPrice = bFt > 0 ? bFt * settings.brighteningPerFt : 0;

    return {
      gutterBasePrice,
      dryerVentPrice: dryerVentPrice,
      windowCleaningPrice,
      houseWashPrice: hwPrice,
      gutterBrighteningPrice: brighteningPrice,
      deckCleaningPrice: deckPrice,
      flatworkDrivewayPrice: flatworkTotal,
      flatworkGaragePrice: 0, // garage included in flatwork areas
      roofCleaningPrice,
      shrinkWrapPrice: shrinkWrapPrice,
    };
  }, [property, settings, gutterHasErrors, windowCount, sidingType, stainLevel, nonOrganicStains, brighteningFt, dryerVentPrice, deckPrice, flatworkTotal, roofPlatinumPrice, shrinkWrapPrice]);

  // Clean365 service configuration status
  const clean365ServiceStatus = useMemo<ServiceStatusMap>(() => {
    const p = clean365SourcePrices;
    const c = settings.clean365;
    const wCount = parseInt(windowCount) || 0;
    const hasSqft = (parseFloat(sqft) || 0) > 0;
    const hasRoof = (parseFloat(roofSqft) || 0) > 0;
    const hasDVC = (parseInt(dryerVentQty) || 0) > 0;
    const hasDeck = (parseFloat(deckSurfaceSqft) || 0) > 0;
    const hasShrinkWrap = shrinkWrapLarge > 0 || shrinkWrapSmall > 0;
    const bFt = parseFloat(brighteningFt) || 0;

    // Check flatwork areas for driveway/garage specifically
    const hasDriveway = flatworkAreas.some(a => a.label?.toLowerCase().includes("driveway") && (parseFloat(a.sqft) || 0) > 0 && a.checked);
    const hasGarage = flatworkAreas.some(a => a.label?.toLowerCase().includes("garage") && (parseFloat(a.sqft) || 0) > 0 && a.checked);

    return {
      gutterCleaning: { status: hasSqft ? "configured" : "missing", price: p.gutterBasePrice * 4, sectionTitle: "Gutter & Drainage Cleaning" },
      dryerVent: { status: hasDVC ? "configured" : "missing", price: p.dryerVentPrice, sectionTitle: "Dryer Vent Cleaning" },
      interiorDusting: { status: "configured", price: c.interiorHighDusting },
      garagePW: { status: hasGarage ? "configured" : "missing", price: p.flatworkGaragePrice, sectionTitle: "Power Washing - Flatwork" },
      windowCleaning: { status: wCount > 0 ? "configured" : "missing", price: p.windowCleaningPrice, sectionTitle: "House Washing Options" },
      houseWashing: { status: hasSqft ? "configured" : "missing", price: p.houseWashPrice, sectionTitle: "House Washing Options" },
      gutterBrightening: { status: "configured", price: p.gutterBrighteningPrice, sectionTitle: "Gutter & Drainage Cleaning" },
      deckPW: { status: hasDeck ? "configured" : "missing", price: p.deckCleaningPrice, sectionTitle: "Deck Cleaning" },
      weedRemoval: { status: "configured", price: c.weedRemovalPerVisit * 3 },
      drivewayPW: { status: hasDriveway || flatworkTotal > 0 ? "configured" : "missing", price: p.flatworkDrivewayPrice, sectionTitle: "Power Washing - Flatwork" },
      roofCleaning: { status: hasRoof ? "configured" : "missing", price: p.roofCleaningPrice, sectionTitle: "Roof Cleaning & Protection" },
      outdoorUpholstery: { status: "configured", price: c.outdoorUpholsteryCleaning },
      furnitureWrap: { status: hasShrinkWrap ? "configured" : "missing", price: p.shrinkWrapPrice, sectionTitle: "Outdoor Furniture Shrink Wrapping" },
      garbageCans: { status: "configured", price: c.garbageCansPerVisit * 4 },
      touchUps: { status: "configured", price: 0 },
    };
  }, [clean365SourcePrices, settings.clean365, sqft, windowCount, roofSqft, dryerVentQty, deckSurfaceSqft, shrinkWrapLarge, shrinkWrapSmall, brighteningFt, flatworkAreas, flatworkTotal]);

  const handleToggleClean365NA = useCallback((serviceKey: string) => {
    setClean365NAServices(prev =>
      prev.includes(serviceKey) ? prev.filter(k => k !== serviceKey) : [...prev, serviceKey]
    );
  }, []);

  const handleScrollToSection = useCallback((sectionTitle: string) => {
    // Find the CollapsibleServiceSection trigger button by its title text
    const headings = document.querySelectorAll("button span");
    for (const el of headings) {
      if (el.textContent?.trim().includes(sectionTitle)) {
        const triggerButton = el.closest("button");
        const collapsibleRoot = triggerButton?.closest("[data-state]");
        // If the section is collapsed, click to expand it
        if (collapsibleRoot && collapsibleRoot.getAttribute("data-state") === "closed") {
          triggerButton?.click();
        }
        // Scroll into view after a short delay to allow expansion animation
        setTimeout(() => {
          triggerButton?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
        return;
      }
    }
  }, []);

  const clean365SelectedPrice = useMemo(() => {
    const p = clean365SourcePrices;
    const c = settings.clean365;
    const isNA = (key: string) => clean365NAServices.includes(key);
    const aLaCarte =
      (isNA("gutterCleaning") ? 0 : p.gutterBasePrice * 4) +
      (isNA("dryerVent") ? 0 : p.dryerVentPrice) +
      (isNA("windowCleaning") ? 0 : p.windowCleaningPrice) +
      (isNA("houseWashing") ? 0 : p.houseWashPrice) +
      (isNA("gutterBrightening") ? 0 : p.gutterBrighteningPrice) +
      (isNA("deckPW") ? 0 : p.deckCleaningPrice) +
      (isNA("drivewayPW") ? 0 : p.flatworkDrivewayPrice) +
      (isNA("garagePW") ? 0 : p.flatworkGaragePrice) +
      (isNA("roofCleaning") ? 0 : p.roofCleaningPrice) +
      (isNA("furnitureWrap") ? 0 : p.shrinkWrapPrice) +
      (isNA("weedRemoval") ? 0 : c.weedRemovalPerVisit * 3) +
      (isNA("garbageCans") ? 0 : c.garbageCansPerVisit * 4) +
      (isNA("outdoorUpholstery") ? 0 : c.outdoorUpholsteryCleaning) +
      (isNA("interiorDusting") ? 0 : c.interiorHighDusting);
    return aLaCarte * (1 - c.discountPercent / 100);
  }, [clean365SourcePrices, settings.clean365, clean365NAServices]);

  const clean365DataForSellSheet = useMemo(() => {
    if (!clean365AddToBundle || clean365SelectedPrice <= 0) return null;
    const p = clean365SourcePrices;
    const c = settings.clean365;
    const isNA = (key: string) => clean365NAServices.includes(key);
    const aLaCarteTotal =
      (isNA("gutterCleaning") ? 0 : p.gutterBasePrice * 4) +
      (isNA("dryerVent") ? 0 : p.dryerVentPrice) +
      (isNA("windowCleaning") ? 0 : p.windowCleaningPrice) +
      (isNA("houseWashing") ? 0 : p.houseWashPrice) +
      (isNA("gutterBrightening") ? 0 : p.gutterBrighteningPrice) +
      (isNA("deckPW") ? 0 : p.deckCleaningPrice) +
      (isNA("drivewayPW") ? 0 : p.flatworkDrivewayPrice) +
      (isNA("garagePW") ? 0 : p.flatworkGaragePrice) +
      (isNA("roofCleaning") ? 0 : p.roofCleaningPrice) +
      (isNA("furnitureWrap") ? 0 : p.shrinkWrapPrice) +
      (isNA("weedRemoval") ? 0 : c.weedRemovalPerVisit * 3) +
      (isNA("garbageCans") ? 0 : c.garbageCansPerVisit * 4) +
      (isNA("outdoorUpholstery") ? 0 : c.outdoorUpholsteryCleaning) +
      (isNA("interiorDusting") ? 0 : c.interiorHighDusting);
    const annualPrice = aLaCarteTotal * (1 - c.discountPercent / 100);
    return {
      aLaCarteTotal,
      annualPrice,
      monthlyPrice: annualPrice / 12,
      savings: aLaCarteTotal - annualPrice,
      discountPercent: c.discountPercent,
      propertySpecs: property,
    };
  }, [clean365AddToBundle, clean365SelectedPrice, clean365SourcePrices, settings.clean365, property, clean365NAServices]);

  const bundleItems = useMemo(() => {
    const items: { label: string; price: number }[] = [];

    if (houseWashPackage && houseWashPrice > 0) {
      const pkgName =
        houseWashPackage === "spot-free" ? "Spot Free Exterior Window Cleaning" : houseWashPackage === "gold" ? "House Washing — Gold" : "House Washing — Platinum";
      items.push({ label: pkgName, price: houseWashPrice });
    }

    if (!gutterHasErrors && gutterPackage && gutterPrices.packagePrice > 0) {
      const pkgName = gutterPackage === "silver" ? "Gutter Cleaning — Silver" : "Gutter Cleaning — Gold";
      items.push({ label: pkgName, price: gutterPrices.packagePrice });
    }

    if (!gutterHasErrors && drainSelected && gutterPrices.drainPrice > 0) {
      items.push({ label: "Gutter Cleaning — Underground Drains", price: gutterPrices.drainPrice });
    }

    if (!gutterHasErrors && brighteningSelected && gutterPrices.brighteningPrice > 0) {
      items.push({ label: "Gutter Cleaning — Brightening", price: gutterPrices.brighteningPrice });
    }

    // Annual service plan
    if (annualPlanBundle && annualPlan && aspSelectedPlanPrice > 0) {
      const planLabel = annualPlan.charAt(0).toUpperCase() + annualPlan.slice(1);
      items.push({ label: `Annual Service Plan — ${planLabel}`, price: aspSelectedPlanPrice });
    }

    // Gutter protection
    if (gpSelectedProduct) {
      const gpLabels: Record<string, string> = {
        raindrop: "Gutter Protection - Raindrop",
        flowguard: "Gutter Protection - FlowGuard",
        gutterstick: "Gutter Protection - Gutter Stick",
      };
      const gpPriceMap: Record<string, number> = {
        raindrop: gpPrices.raindrop,
        flowguard: gpPrices.flowguard,
        gutterstick: gpPrices.gutterStick,
      };
      const price = gpPriceMap[gpSelectedProduct] || 0;
      if (price > 0) {
        items.push({ label: gpLabels[gpSelectedProduct] || "Gutter Protection", price });
      }
    }

    if (roofPlatinumSelected && roofPlatinumPrice > 0) {
      items.push({ label: "Roof Cleaning - Platinum", price: roofPlatinumPrice });
    }

    if (goNanoSelected && goNanoPrice > 0) {
      items.push({ label: "GoNano Revive Treatment", price: goNanoPrice });
    }

    // Surface sealing
    settings.surfaceSealingRates.forEach((rate, i) => {
      if (surfaceSelected[i] && surfaceSealingPrices[i] > 0) {
        items.push({ label: `Surface Sealing — ${rate.name}`, price: surfaceSealingPrices[i] });
      }
    });

    // Paver maintenance
    if (!paverHasErrors && paverPackage && paverPkgPrices[paverPackage as PaverPackage] > 0) {
      const pkgLabel = paverPackage === "silver" ? "Silver" : paverPackage === "gold" ? "Gold" : "Platinum";
      items.push({ label: `Paver Maintenance — ${pkgLabel}`, price: paverPkgPrices[paverPackage as PaverPackage] });
    }

    // Dryer vent cleaning
    if (dryerVentSelected && dryerVentPrice > 0) {
      items.push({ label: "Dryer Vent Cleaning", price: dryerVentPrice });
    }

    // Flatwork power washing
    if (flatworkTotal > 0 && flatworkCheckedAreas.length > 0) {
      const rawSum = flatworkCheckedAreas.reduce((acc, a) => acc + a.price, 0);
      for (const area of flatworkCheckedAreas) {
        const label = area.label?.trim() || `Area`;
        items.push({ label: `Power Washing — ${label}`, price: area.price });
      }
      if (flatworkTotal > rawSum) {
        items.push({ label: "Power Washing — Minimum Price Upcharge", price: flatworkTotal - rawSum });
      }
    }

    // Architectural power washing
    if (archAddToBundle && archCalc.grandTotal > 0) {
      for (const ad of archCalc.areaDetails) {
        if (ad.total <= 0) continue;
        const aLabel = ad.label?.trim() || "Area";
        if (ad.vw > 0) items.push({ label: `Arch PW — ${aLabel} — Vertical Walls`, price: ad.vw });
        if (ad.bl > 0) items.push({ label: `Arch PW — ${aLabel} — Ballustrades`, price: ad.bl });
        if (ad.cb > 0) items.push({ label: `Arch PW — ${aLabel} — Curbs`, price: ad.cb });
      }
      if (archCalc.grandTotal > archCalc.rawTotal) {
        items.push({ label: "Arch PW — Minimum Price Upcharge", price: archCalc.grandTotal - archCalc.rawTotal });
      }
    }

    // Fence cleaning
    if (fenceAddToBundle && fencePrice > 0) {
      items.push({ label: "Fence Cleaning", price: fencePrice });
    }

    // Deck cleaning
    if (deckAddToBundle && deckPrice > 0) {
      items.push({ label: "Deck Cleaning", price: deckPrice });
    }

    // Shrink wrapping
    if (shrinkWrapAddToBundle && shrinkWrapPrice > 0) {
      items.push({ label: "Outdoor Furniture Shrink Wrapping", price: shrinkWrapPrice });
    }

    // Custom items
    for (const ci of customItems) {
      if (ci.addToBundle && ci.name.trim()) {
        const p = parseFloat(ci.price) || 0;
        const desc = ci.description.trim();
        const label = desc ? `Custom — ${ci.name} — ${desc}` : `Custom — ${ci.name}`;
        items.push({ label, price: p });
      }
    }

    // Clean365 Annual Maintenance Plan
    if (clean365AddToBundle && clean365SelectedPrice > 0) {
      items.push({ label: "Clean365 Annual Plan", price: clean365SelectedPrice });
    }

    return items;
  }, [houseWashPackage, houseWashPrice, gutterPackage, gutterPrices, gutterHasErrors, drainSelected, brighteningSelected, annualPlanBundle, annualPlan, aspSelectedPlanPrice, gpSelectedProduct, gpPrices, roofPlatinumSelected, roofPlatinumPrice, goNanoSelected, goNanoPrice, surfaceSelected, surfaceSealingPrices, settings.surfaceSealingRates, paverPackage, paverPkgPrices, paverHasErrors, dryerVentSelected, dryerVentPrice, flatworkTotal, flatworkCheckedAreas, archAddToBundle, archCalc, fenceAddToBundle, fencePrice, deckAddToBundle, deckPrice, shrinkWrapAddToBundle, shrinkWrapPrice, customItems, clean365AddToBundle, clean365SelectedPrice]);

  const getCalculatorState = useCallback(() => ({
    sqft, twoStory, threeStory, detachedGarage,
    windowCount, sidingType, stainLevel, nonOrganicStains, houseWashPackage,
    gutterPackage, undergroundDrains, brighteningFt, drainSelected, brighteningSelected,
    gpLinearFeet, gpDownspouts, gpGutterStickQty, gpSelectedProduct,
    roofSqft, surfaceType, difficultyLevel, heavyMossLichen, noGutters, roofPlatinumSelected, goNanoSelected,
    surfaceSqfts, surfaceSelected,
    paverSqft, paverPackage,
    dryerVentQty, dryerVentSelected,
    flatworkAreas, archAreas, archAddToBundle,
    fencePanelFt, fenceAddToBundle, fencePanelMaterial, fenceRailFt, fenceRailMaterial, fenceStainLevel,
    deckMaterial, deckStainLevel, deckSurfaceSqft, deckUndersideCleaning, deckRailingFt, deckStepCount, deckAddToBundle,
    shrinkWrapLarge, shrinkWrapSmall, shrinkWrapAddToBundle,
    clean365AddToBundle,
    customItems,
  }), [sqft, twoStory, threeStory, detachedGarage, windowCount, sidingType, stainLevel, nonOrganicStains, houseWashPackage, gutterPackage, undergroundDrains, brighteningFt, drainSelected, brighteningSelected, gpLinearFeet, gpDownspouts, gpGutterStickQty, gpSelectedProduct, roofSqft, surfaceType, difficultyLevel, heavyMossLichen, noGutters, roofPlatinumSelected, goNanoSelected, surfaceSqfts, surfaceSelected, paverSqft, paverPackage, dryerVentQty, dryerVentSelected, flatworkAreas, archAreas, archAddToBundle, fencePanelFt, fenceAddToBundle, fencePanelMaterial, fenceRailFt, fenceRailMaterial, fenceStainLevel, deckMaterial, deckStainLevel, deckSurfaceSqft, deckUndersideCleaning, deckRailingFt, deckStepCount, deckAddToBundle, shrinkWrapLarge, shrinkWrapSmall, shrinkWrapAddToBundle, clean365AddToBundle, customItems]);

  const restoreCalculatorState = useCallback((s: any) => {
    if (!s) return;
    if (s.sqft !== undefined) setSqft(s.sqft);
    if (s.twoStory !== undefined) setTwoStory(s.twoStory);
    if (s.threeStory !== undefined) setThreeStory(s.threeStory);
    if (s.detachedGarage !== undefined) setDetachedGarage(s.detachedGarage);
    if (s.windowCount !== undefined) setWindowCount(s.windowCount);
    if (s.sidingType !== undefined) setSidingType(s.sidingType);
    if (s.stainLevel !== undefined) setStainLevel(s.stainLevel);
    if (s.nonOrganicStains !== undefined) setNonOrganicStains(s.nonOrganicStains);
    if (s.houseWashPackage !== undefined) setHouseWashPackage(s.houseWashPackage);
    if (s.gutterPackage !== undefined) setGutterPackage(s.gutterPackage);
    if (s.undergroundDrains !== undefined) setUndergroundDrains(s.undergroundDrains);
    if (s.brighteningFt !== undefined) setBrighteningFt(s.brighteningFt);
    if (s.drainSelected !== undefined) setDrainSelected(s.drainSelected);
    if (s.brighteningSelected !== undefined) setBrighteningSelected(s.brighteningSelected);
    if (s.gpLinearFeet !== undefined) setGpLinearFeet(s.gpLinearFeet);
    if (s.gpDownspouts !== undefined) setGpDownspouts(s.gpDownspouts);
    if (s.gpGutterStickQty !== undefined) setGpGutterStickQty(s.gpGutterStickQty);
    if (s.gpSelectedProduct !== undefined) setGpSelectedProduct(s.gpSelectedProduct);
    if (s.roofSqft !== undefined) setRoofSqft(s.roofSqft);
    if (s.surfaceType !== undefined) setSurfaceType(s.surfaceType);
    if (s.difficultyLevel !== undefined) setDifficultyLevel(s.difficultyLevel);
    if (s.heavyMossLichen !== undefined) setHeavyMossLichen(s.heavyMossLichen);
    if (s.noGutters !== undefined) setNoGutters(s.noGutters);
    if (s.roofPlatinumSelected !== undefined) setRoofPlatinumSelected(s.roofPlatinumSelected);
    if (s.goNanoSelected !== undefined) setGoNanoSelected(s.goNanoSelected);
    if (s.surfaceSqfts !== undefined) setSurfaceSqfts(s.surfaceSqfts);
    if (s.surfaceSelected !== undefined) setSurfaceSelected(s.surfaceSelected);
    if (s.paverSqft !== undefined) setPaverSqft(s.paverSqft);
    if (s.paverPackage !== undefined) setPaverPackage(s.paverPackage);
    if (s.dryerVentQty !== undefined) setDryerVentQty(s.dryerVentQty);
    if (s.dryerVentSelected !== undefined) setDryerVentSelected(s.dryerVentSelected);
    if (s.flatworkAreas !== undefined) setFlatworkAreas(s.flatworkAreas);
    if (s.archAreas !== undefined) setArchAreas(s.archAreas);
    if (s.archAddToBundle !== undefined) setArchAddToBundle(s.archAddToBundle);
    if (s.fencePanelFt !== undefined) setFencePanelFt(s.fencePanelFt);
    if (s.fenceAddToBundle !== undefined) setFenceAddToBundle(s.fenceAddToBundle);
    if (s.fencePanelMaterial !== undefined) setFencePanelMaterial(s.fencePanelMaterial);
    if (s.fenceRailFt !== undefined) setFenceRailFt(s.fenceRailFt);
    if (s.fenceRailMaterial !== undefined) setFenceRailMaterial(s.fenceRailMaterial);
    if (s.fenceStainLevel !== undefined) setFenceStainLevel(s.fenceStainLevel);
    if (s.deckMaterial !== undefined) setDeckMaterial(s.deckMaterial);
    if (s.deckStainLevel !== undefined) setDeckStainLevel(s.deckStainLevel);
    if (s.deckSurfaceSqft !== undefined) setDeckSurfaceSqft(s.deckSurfaceSqft);
    if (s.deckUndersideCleaning !== undefined) setDeckUndersideCleaning(s.deckUndersideCleaning);
    if (s.deckRailingFt !== undefined) setDeckRailingFt(s.deckRailingFt);
    if (s.deckStepCount !== undefined) setDeckStepCount(s.deckStepCount);
    if (s.deckAddToBundle !== undefined) setDeckAddToBundle(s.deckAddToBundle);
    if (s.shrinkWrapLarge !== undefined) setShrinkWrapLarge(s.shrinkWrapLarge);
    if (s.shrinkWrapSmall !== undefined) setShrinkWrapSmall(s.shrinkWrapSmall);
    if (s.shrinkWrapAddToBundle !== undefined) setShrinkWrapAddToBundle(s.shrinkWrapAddToBundle);
    if (s.clean365AddToBundle !== undefined) setClean365AddToBundle(s.clean365AddToBundle);
    if (s.customItems !== undefined) setCustomItems(s.customItems);
  }, []);

  const handleNewBid = useCallback(() => {
    if (!confirm("Start a new bid? Any unsaved changes will be lost.")) return;
    setCurrentBid(null);
    restoreCalculatorState({
      sqft: "", twoStory: false, threeStory: false, detachedGarage: false,
      windowCount: "", sidingType: "", stainLevel: "", nonOrganicStains: false, houseWashPackage: null,
      gutterPackage: null, undergroundDrains: "", brighteningFt: "", drainSelected: false, brighteningSelected: false,
      gpLinearFeet: "", gpDownspouts: "", gpGutterStickQty: "", gpSelectedProduct: null,
      roofSqft: "", surfaceType: "Asphalt Shingle", difficultyLevel: "Low", heavyMossLichen: false, noGutters: false, roofPlatinumSelected: false, goNanoSelected: false,
      surfaceSqfts: ["", "", ""], surfaceSelected: [false, false, false],
      paverSqft: "", paverPackage: null,
      dryerVentQty: "", dryerVentSelected: false,
      flatworkAreas: [], archAreas: [], archAddToBundle: false,
      fencePanelFt: "", fenceAddToBundle: false, fencePanelMaterial: "Wood Panel", fenceRailFt: "", fenceRailMaterial: "Wood Rail", fenceStainLevel: "Standard",
      deckMaterial: "Common Wood", deckStainLevel: "Standard", deckSurfaceSqft: "", deckUndersideCleaning: false, deckRailingFt: "", deckStepCount: "", deckAddToBundle: false,
      shrinkWrapLarge: 0, shrinkWrapSmall: 0, shrinkWrapAddToBundle: false,
      clean365AddToBundle: false,
      customItems: [],
    });
    toast.success("Started new bid");
  }, [restoreCalculatorState]);

  const handleReset = useCallback(() => {
    if (!confirm("Reset calculator? This will zero out all inputs but keep the current bid loaded if editing.")) return;
    restoreCalculatorState({
      sqft: "", twoStory: false, threeStory: false, detachedGarage: false,
      windowCount: "", sidingType: "", stainLevel: "", nonOrganicStains: false, houseWashPackage: null,
      gutterPackage: null, undergroundDrains: "", brighteningFt: "", drainSelected: false, brighteningSelected: false,
      gpLinearFeet: "", gpDownspouts: "", gpGutterStickQty: "", gpSelectedProduct: null,
      roofSqft: "", surfaceType: "Asphalt Shingle", difficultyLevel: "Low", heavyMossLichen: false, noGutters: false, roofPlatinumSelected: false, goNanoSelected: false,
      surfaceSqfts: ["", "", ""], surfaceSelected: [false, false, false],
      paverSqft: "", paverPackage: null,
      dryerVentQty: "", dryerVentSelected: false,
      flatworkAreas: [], archAreas: [], archAddToBundle: false,
      fencePanelFt: "", fenceAddToBundle: false, fencePanelMaterial: "Wood Panel", fenceRailFt: "", fenceRailMaterial: "Wood Rail", fenceStainLevel: "Standard",
      deckMaterial: "Common Wood", deckStainLevel: "Standard", deckSurfaceSqft: "", deckUndersideCleaning: false, deckRailingFt: "", deckStepCount: "", deckAddToBundle: false,
      shrinkWrapLarge: 0, shrinkWrapSmall: 0, shrinkWrapAddToBundle: false,
      clean365AddToBundle: false,
      customItems: [],
    });
    toast.success("Calculator reset");
  }, [restoreCalculatorState]);

  return (
    <div className="min-h-screen bg-background">
      <CalculatorHeader onBidHistoryClick={() => setShowBidHistory(true)} onAccountSettingsClick={() => setShowAccountSettings(true)} onNewBid={handleNewBid} onReset={handleReset} userEmail={userEmail} currentBidId={currentBid?.bid_id ?? null} isAdmin={isAdmin} />
      <AccountSettingsModal open={showAccountSettings} onClose={() => setShowAccountSettings(false)} userEmail={userEmail} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PropertySpecs
              sqft={sqft}
              onSqftChange={setSqft}
              twoStory={twoStory}
              onTwoStoryChange={setTwoStory}
              threeStory={threeStory}
              onThreeStoryChange={setThreeStory}
              detachedGarage={detachedGarage}
              onDetachedGarageChange={setDetachedGarage}
            />

            {settings.clean365.enabled && (
              <CollapsibleServiceSection
                title="Clean365 Annual Maintenance Plan"
                price={clean365AddToBundle ? clean365SelectedPrice : 0}
                isInBundle={clean365AddToBundle && clean365SelectedPrice > 0}
              >
                <Clean365PreviewCard
                  sourcePrices={clean365SourcePrices}
                  clean365Settings={settings.clean365}
                  addToBundle={clean365AddToBundle}
                  onAddToBundleChange={setClean365AddToBundle}
                  serviceStatus={clean365ServiceStatus}
                  naServices={clean365NAServices}
                  onToggleNA={handleToggleClean365NA}
                  onScrollToSection={handleScrollToSection}
                />
              </CollapsibleServiceSection>
            )}

            <CollapsibleServiceSection
              title="House Washing Options"
              price={houseWashPackage ? houseWashPrice : 0}
              isInBundle={!!houseWashPackage && houseWashPrice > 0}
            >
              <HouseWashingSection
                windowCount={windowCount}
                onWindowCountChange={setWindowCount}
                sidingType={sidingType}
                onSidingTypeChange={setSidingType}
                stainLevel={stainLevel}
                onStainLevelChange={setStainLevel}
                nonOrganicStains={nonOrganicStains}
                onNonOrganicStainsChange={setNonOrganicStains}
                selectedPackage={houseWashPackage}
                onSelectPackage={(pkg) =>
                  setHouseWashPackage((prev) => (prev === pkg ? null : pkg))
                }
                packagePrices={houseWashPackagePrices}
                sidingTypes={sidingTypes}
              />
            </CollapsibleServiceSection>

            <CollapsibleServiceSection
              title="Gutter & Drainage Cleaning"
              price={
                (!gutterHasErrors && gutterPackage ? gutterPrices.packagePrice : 0) +
                (drainSelected ? gutterPrices.drainPrice : 0) +
                (brighteningSelected ? gutterPrices.brighteningPrice : 0) +
                (annualPlanBundle ? aspSelectedPlanPrice : 0)
              }
              isInBundle={
                (!gutterHasErrors && !!gutterPackage && gutterPrices.packagePrice > 0) ||
                (drainSelected && gutterPrices.drainPrice > 0) ||
                (brighteningSelected && gutterPrices.brighteningPrice > 0) ||
                (annualPlanBundle && aspSelectedPlanPrice > 0)
              }
            >
              <GutterCleaningSection
                selectedPackage={gutterPackage}
                onSelectPackage={(pkg) =>
                  setGutterPackage((prev) => (prev === pkg ? null : pkg))
                }
                undergroundDrains={undergroundDrains}
                onUndergroundDrainsChange={setUndergroundDrains}
                brighteningFt={brighteningFt}
                onBrighteningFtChange={setBrighteningFt}
                packagePrices={gutterCardPrices}
                drainPrice={gutterPrices.drainPrice}
                brighteningPrice={gutterPrices.brighteningPrice}
                hasMatrixErrors={gutterHasErrors}
                drainSelected={drainSelected}
                onDrainSelectedChange={setDrainSelected}
                brighteningSelected={brighteningSelected}
                onBrighteningSelectedChange={setBrighteningSelected}
              />
              <AnnualServicePlanCard
                basePrice={aspBasePrice}
                planSettings={settings.annualServicePlans}
                selectedPlan={annualPlan}
                onSelectPlan={setAnnualPlan}
                addToBundle={annualPlanBundle}
                onAddToBundleChange={setAnnualPlanBundle}
                hasMatrixErrors={gutterHasErrors}
              />
            </CollapsibleServiceSection>

            <CollapsibleServiceSection
              title="Gutter Protection"
              price={gpSelectedProduct ? (gpPrices[gpSelectedProduct as keyof typeof gpPrices] ?? 0) : 0}
              isInBundle={!!gpSelectedProduct && (gpPrices[gpSelectedProduct as keyof typeof gpPrices] ?? 0) > 0}
            >
              <GutterProtectionSection
                linearFeet={gpLinearFeet}
                onLinearFeetChange={setGpLinearFeet}
                downspouts={gpDownspouts}
                onDownspoutsChange={setGpDownspouts}
                gutterStickQty={gpGutterStickQty}
                onGutterStickQtyChange={setGpGutterStickQty}
                selectedProduct={gpSelectedProduct}
                onSelectProduct={setGpSelectedProduct}
                prices={gpPrices}
              />
            </CollapsibleServiceSection>



            <CollapsibleServiceSection
              title="Roof Cleaning & Protection"
              price={(roofPlatinumSelected ? roofPlatinumPrice : 0) + (goNanoSelected ? goNanoPrice : 0)}
              isInBundle={(roofPlatinumSelected && roofPlatinumPrice > 0) || (goNanoSelected && goNanoPrice > 0)}
            >
              <RoofCleaningSection
                roofSqft={roofSqft}
                onRoofSqftChange={setRoofSqft}
                surfaceType={surfaceType}
                onSurfaceTypeChange={setSurfaceType}
                difficultyLevel={difficultyLevel}
                onDifficultyLevelChange={setDifficultyLevel}
                heavyMossLichen={heavyMossLichen}
                onHeavyMossLichenChange={setHeavyMossLichen}
                noGutters={noGutters}
                onNoGuttersChange={setNoGutters}
                platinumSelected={roofPlatinumSelected}
                onPlatinumSelectedChange={setRoofPlatinumSelected}
                goNanoSelected={goNanoSelected}
                onGoNanoSelectedChange={setGoNanoSelected}
                platinumPrice={roofPlatinumPrice}
                goNanoPrice={goNanoPrice}
              />
            </CollapsibleServiceSection>

            <CollapsibleServiceSection
              title="Dryer Vent Cleaning"
              price={dryerVentSelected ? dryerVentPrice : 0}
              isInBundle={dryerVentSelected && dryerVentPrice > 0}
            >
              <DryerVentCleaningSection
                quantity={dryerVentQty}
                onQuantityChange={setDryerVentQty}
                selected={dryerVentSelected}
                onSelectedChange={setDryerVentSelected}
                price={dryerVentPrice}
              />
            </CollapsibleServiceSection>

            <CollapsibleServiceSection
              title="Power Washing - Flatwork"
              price={flatworkTotal}
              isInBundle={flatworkTotal > 0}
            >
              <FlatworkPowerWashingSection
                areas={flatworkAreas}
                onAreasChange={setFlatworkAreas}
              />
            </CollapsibleServiceSection>

            <CollapsibleServiceSection
              title="Power Washing - Architectural"
              price={archAddToBundle ? archCalc.grandTotal : 0}
              isInBundle={archAddToBundle && archCalc.grandTotal > 0}
            >
              <ArchitecturalPowerWashingSection
                areas={archAreas}
                onAreasChange={setArchAreas}
                addToBundle={archAddToBundle}
                onAddToBundleChange={setArchAddToBundle}
              />
            </CollapsibleServiceSection>

            <CollapsibleServiceSection
              title="Paver Cleaning, Sanding & Sealing"
              price={!paverHasErrors && paverPackage ? (paverPkgPrices[paverPackage as keyof typeof paverPkgPrices] ?? 0) : 0}
              isInBundle={!paverHasErrors && !!paverPackage && (paverPkgPrices[paverPackage as keyof typeof paverPkgPrices] ?? 0) > 0}
            >
              <PaverMaintenanceSection
                paverSqft={paverSqft}
                onPaverSqftChange={setPaverSqft}
                selectedPackage={paverPackage}
                onSelectPackage={setPaverPackage}
                packagePrices={paverPkgPrices}
                hasMatrixErrors={paverHasErrors}
              />
            </CollapsibleServiceSection>

            <CollapsibleServiceSection
              title="Surface Sealing"
              price={surfaceSelected.reduce((acc, sel, i) => acc + (sel ? surfaceSealingPrices[i] : 0), 0)}
              isInBundle={surfaceSelected.some((sel, i) => sel && surfaceSealingPrices[i] > 0)}
            >
              <SurfaceSealingSection
                surfaceSqfts={surfaceSqfts}
                onSurfaceSqftChange={(i, v) => setSurfaceSqfts(prev => { const n = [...prev]; n[i] = v; return n; })}
                surfaceSelected={surfaceSelected}
                onSurfaceSelectedChange={(i, v) => setSurfaceSelected(prev => { const n = [...prev]; n[i] = v; return n; })}
                prices={surfaceSealingPrices}
              />
            </CollapsibleServiceSection>

            <CollapsibleServiceSection
              title="Fence Cleaning"
              price={fenceAddToBundle ? fencePrice : 0}
              isInBundle={fenceAddToBundle && fencePrice > 0}
            >
              <FenceCleaningSection
                panelLinearFt={fencePanelFt}
                onPanelLinearFtChange={setFencePanelFt}
                panelMaterial={fencePanelMaterial}
                onPanelMaterialChange={setFencePanelMaterial}
                railLinearFt={fenceRailFt}
                onRailLinearFtChange={setFenceRailFt}
                railMaterial={fenceRailMaterial}
                onRailMaterialChange={setFenceRailMaterial}
                stainLevel={fenceStainLevel}
                onStainLevelChange={setFenceStainLevel}
                price={fencePrice}
                addToBundle={fenceAddToBundle}
                onAddToBundleChange={setFenceAddToBundle}
              />
            </CollapsibleServiceSection>

            <CollapsibleServiceSection
              title="Deck Cleaning"
              price={deckAddToBundle ? deckPrice : 0}
              isInBundle={deckAddToBundle && deckPrice > 0}
            >
              <DeckCleaningSection
                material={deckMaterial}
                onMaterialChange={setDeckMaterial}
                stainLevel={deckStainLevel}
                onStainLevelChange={setDeckStainLevel}
                surfaceSqft={deckSurfaceSqft}
                onSurfaceSqftChange={setDeckSurfaceSqft}
                undersideCleaning={deckUndersideCleaning}
                onUndersideCleaningChange={setDeckUndersideCleaning}
                railingFt={deckRailingFt}
                onRailingFtChange={setDeckRailingFt}
                stepCount={deckStepCount}
                onStepCountChange={setDeckStepCount}
                price={deckPrice}
                addToBundle={deckAddToBundle}
                onAddToBundleChange={setDeckAddToBundle}
              />
            </CollapsibleServiceSection>

            <CollapsibleServiceSection
              title="Outdoor Furniture Shrink Wrapping"
              price={shrinkWrapAddToBundle ? shrinkWrapPrice : 0}
              isInBundle={shrinkWrapAddToBundle && shrinkWrapPrice > 0}
            >
              <OutdoorFurnitureShrinkWrappingSection
                largePieces={shrinkWrapLarge}
                onLargePiecesChange={setShrinkWrapLarge}
                smallPieces={shrinkWrapSmall}
                onSmallPiecesChange={setShrinkWrapSmall}
                price={shrinkWrapPrice}
                addToBundle={shrinkWrapAddToBundle}
                onAddToBundleChange={setShrinkWrapAddToBundle}
              />
            </CollapsibleServiceSection>

            <CollapsibleServiceSection
              title="Custom Items"
              price={customItems.filter(i => i.addToBundle && i.name.trim()).reduce((acc, i) => acc + (parseFloat(i.price) || 0), 0)}
              isInBundle={customItems.some(i => i.addToBundle && i.name.trim())}
            >
              <CustomItemsSection
                items={customItems}
                onItemsChange={setCustomItems}
              />
            </CollapsibleServiceSection>
          </div>

          <div>
            <BundleSummary items={bundleItems} currentBid={currentBid} calculatorState={getCalculatorState()} clean365Data={clean365DataForSellSheet} />
          </div>
        </div>
      </div>
      <BidHistoryModal
        isOpen={showBidHistory}
        onClose={() => setShowBidHistory(false)}
        currentBidId={currentBid?.bid_id ?? null}
        onClearCurrentBid={() => setCurrentBid(null)}
        onLoadBid={(bid) => {
          const data = bid.bundle_data as any;
          let state: Record<string, any> | null = null;

          if (data?.calculatorState) {
            // New format: calculatorState saved directly
            state = data.calculatorState;
          } else if (data?.baseParams) {
            // Legacy format: map structured bundle_data to calculator state
            const bp = data.baseParams || {};
            state = {
              sqft: bp.sqft != null ? String(bp.sqft) : "",
              twoStory: bp.is2Story ?? false,
              threeStory: bp.is3Story ?? false,
              detachedGarage: bp.detachedGarage ?? false,
              // House washing
              houseWashPackage: data.house?.enabled ? (data.house.package === "Platinum" ? "platinum" : data.house.package === "Gold" ? "gold" : data.house.package === "Spot Free" ? "spot-free" : data.house.package?.toLowerCase() ?? null) : null,
              windowCount: data.house?.windowCount != null ? String(data.house.windowCount) : "",
              sidingType: data.house?.sidingType ?? "",
              stainLevel: data.house?.stainLevel ?? "",
              nonOrganicStains: data.house?.hasNonOrganicStains ?? false,
              // Gutter cleaning
              gutterPackage: data.gutter?.enabled ? (data.gutter.package?.toLowerCase() ?? null) : null,
              undergroundDrains: data.gutter?.undergroundDrainsQty != null ? String(data.gutter.undergroundDrainsQty) : "",
              drainSelected: (data.gutter?.undergroundDrainsQty ?? 0) > 0,
              brighteningFt: data.gutter?.brighteningLinearFt != null ? String(data.gutter.brighteningLinearFt) : "",
              brighteningSelected: (data.gutter?.brighteningLinearFt ?? 0) > 0,
              // Gutter protection
              gpSelectedProduct: data.gutterProtection?.enabled ? (data.gutterProtection.product?.toLowerCase() ?? null) : null,
              gpLinearFeet: data.gutterProtection?.linearFeet != null ? String(data.gutterProtection.linearFeet) : "",
              // Roof cleaning
              roofSqft: data.roof?.enabled ? String(data.roof.roofSqft ?? "") : "",
              surfaceType: data.roof?.surfaceType ?? "Asphalt Shingle",
              difficultyLevel: data.roof?.difficultyLevel ?? "Low",
              heavyMossLichen: data.roof?.hasMossLichen ?? false,
              noGutters: data.roof?.hasNoGutters ?? false,
              roofPlatinumSelected: data.roof?.enabled ?? false,
              goNanoSelected: data.roof?.includeGoNano ?? false,
              // Paver maintenance
              paverSqft: data.paverMaintenance?.enabled ? String(data.paverMaintenance.paverSqft ?? "") : "",
              paverPackage: data.paverMaintenance?.enabled ? (data.paverMaintenance.package?.toLowerCase() ?? null) : null,
              // Deck cleaning
              deckSurfaceSqft: data.deck?.enabled ? String(data.deck.deckSqft ?? "") : "",
              deckMaterial: data.deck?.material ?? "Common Wood",
              deckStainLevel: data.deck?.stainLevel ?? "Standard",
              deckRailingFt: data.deck?.railingsLinearFt != null ? String(data.deck.railingsLinearFt) : "",
              deckStepCount: data.deck?.stepsQty != null ? String(data.deck.stepsQty) : "",
              deckUndersideCleaning: data.deck?.undersideCleaning ?? false,
              deckAddToBundle: data.deck?.enabled ?? false,
              // Fence cleaning
              fencePanelFt: data.fence?.enabled ? String(data.fence.panelsLinearFt ?? "") : "",
              fenceRailFt: data.fence?.enabled ? String(data.fence.railsLinearFt ?? "") : "",
              fencePanelMaterial: data.fence?.panelMaterial === "Wood" ? "Wood Panel" : (data.fence?.panelMaterial ?? "Wood Panel"),
              fenceRailMaterial: data.fence?.railMaterial === "Wood" ? "Wood Rail" : (data.fence?.railMaterial ?? "Wood Rail"),
              fenceStainLevel: data.fence?.stainLevel ?? "Standard",
              fenceAddToBundle: data.fence?.enabled ?? false,
              // Flatwork
              flatworkAreas: data.flatwork?.enabled ? (data.flatwork.areas ?? []).map((a: any, i: number) => ({
                id: String(i),
                label: a.label ?? `Area ${i + 1}`,
                sqft: String(a.sqft ?? ""),
                material: a.material ?? "",
                stain: a.stainLevel ?? "Standard",
                checked: true,
              })) : [],
              // Surface sealing
              surfaceSqfts: data.surfaceSealing?.enabled ? (data.surfaceSealing.surfaces ?? []).map((s: any) => String(s.sqft ?? "")) : ["", "", ""],
              surfaceSelected: data.surfaceSealing?.enabled ? (data.surfaceSealing.surfaces ?? []).map(() => true) : [false, false, false],
              // Custom items
              customItems: (data.customItems ?? []).map((ci: any) => ({
                name: ci.name ?? "",
                description: ci.description ?? "",
                price: String(ci.price ?? "0"),
                addToBundle: true,
              })),
              // Dryer vent
              dryerVentQty: "",
              dryerVentSelected: false,
            };
          }

          if (state) {
            restoreCalculatorState(state);
          }
          setCurrentBid({ bid_id: bid.bid_id, customer_name: bid.customer_name, status: bid.status as "draft" | "sent" | "won" | "lost" });
          setShowBidHistory(false);
          toast.success(`Loaded bid ${bid.bid_id} — ${bid.customer_name}`);
        }}
      />
    </div>
  );
};

export default Index;
