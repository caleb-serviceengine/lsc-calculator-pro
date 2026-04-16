import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { fetchPricingSettings } from "./lib/supabase";
import {
  estimateHouseWash,
  estimateGutterCleaning,
  estimateGutterProtection,
  estimateWindowCleaning,
  estimateRoofCleaning,
  estimateDriveway,
  estimateDeckCleaning,
  priceRange,
  type PricingSettings,
} from "./lib/pricing";
import {
  HOME_SIZE_OPTIONS,
  GUTTER_LIN_FT_PER_SQFT,
  GUTTER_PROTECTION_PRODUCT_INDEX,
  WINDOWS_PER_SQFT,
  ROOF_SQFT_MULTIPLIER,
  DRIVEWAY_SQFT,
  DECK_SQFT,
  RANGE_SPREAD,
} from "./lib/widgetConfig";

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceId =
  | "house-washing"
  | "gutter-cleaning"
  | "roof-cleaning"
  | "gutter-protection"
  | "window-cleaning"
  | "driveway"
  | "deck-cleaning";

type DrivewaySizeKey = keyof typeof DRIVEWAY_SQFT;
type DeckSizeKey = keyof typeof DECK_SQFT;

// Icon URLs sourced directly from lakestatecleaning.com/wp-content/uploads/
const BASE = "https://lakestatecleaning.com/wp-content/uploads/2026/04/";

const SERVICES: {
  id: ServiceId;
  label: string;
  shortLabel: string;
  icon: string;
}[] = [
  {
    id: "house-washing",
    label: "House Washing",
    shortLabel: "House Wash",
    icon: `${BASE}01-4-1.png`,
  },
  {
    id: "gutter-cleaning",
    label: "Gutter Cleaning",
    shortLabel: "Gutters",
    icon: `${BASE}01-3-1-1.png`,
  },
  {
    id: "roof-cleaning",
    label: "Roof Cleaning",
    shortLabel: "Roof",
    icon: `${BASE}01-7-1-1.png`,
  },
  {
    id: "gutter-protection",
    label: "Gutter Protection",
    shortLabel: "Gutter Guard",
    // Using the cleaning cart icon — update when a dedicated gutter guard
    // icon is available from the brand kit.
    icon: `${BASE}01-6-1.png`,
  },
  {
    id: "window-cleaning",
    label: "Window Cleaning",
    shortLabel: "Windows",
    icon: `${BASE}01-5-1.png`,
  },
  {
    id: "driveway",
    label: "Driveway Washing",
    shortLabel: "Driveway",
    icon: `${BASE}01-2-1-1.png`,
  },
  {
    id: "deck-cleaning",
    label: "Deck Cleaning",
    shortLabel: "Deck",
    icon: `${BASE}01-9-1-1.png`,
  },
];

const DRIVEWAY_OPTIONS: { key: DrivewaySizeKey; label: string; sub: string }[] =
  [
    { key: "one", label: "1-Car", sub: "Single bay" },
    { key: "two", label: "2-Car", sub: "Double bay" },
    { key: "three", label: "3-Car+", sub: "Large / extended" },
  ];

const DECK_OPTIONS: { key: DeckSizeKey; label: string; sub: string }[] = [
  { key: "small", label: "Small", sub: "Up to ~200 sq ft" },
  { key: "medium", label: "Medium", sub: "~200–400 sq ft" },
  { key: "large", label: "Large", sub: "400+ sq ft" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

// ─── Service Icon Tab ─────────────────────────────────────────────────────────

function ServiceTab({
  service,
  active,
  onClick,
}: {
  service: (typeof SERVICES)[number];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        // Matches the dark-card style from the LSC homepage service grid
        "relative flex flex-col items-center gap-2 px-2 pt-3 pb-2.5 rounded-xl",
        "transition-all duration-150 flex-shrink-0 w-[82px]",
        "focus:outline-none border-2",
        active
          ? "bg-lsc-navy border-lsc-orange shadow-md shadow-orange-200"
          : "bg-lsc-navy border-lsc-navy hover:border-lsc-teal/50 opacity-70 hover:opacity-90",
      ].join(" ")}
    >
      {/* Orange bottom accent bar (active only) */}
      {active && (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-t-full bg-lsc-orange" />
      )}

      {/* Icon — displayed directly on the dark card, transparent areas become navy */}
      <img
        src={service.icon}
        alt={service.label}
        className="w-10 h-10 object-contain"
        loading="lazy"
      />

      {/* Bold italic label — matches homepage card typography */}
      <span
        className={[
          "text-[10px] font-bold italic leading-tight text-center",
          active ? "text-white" : "text-white/70",
        ].join(" ")}
      >
        {service.shortLabel}
      </span>
    </button>
  );
}

// ─── Home Size Select ─────────────────────────────────────────────────────────

function HomeSizeSelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (sqft: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
        Home Size
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={[
            "w-full appearance-none border-2 border-gray-200 rounded-xl",
            "px-4 py-2.5 pr-9 text-sm font-medium text-lsc-navy bg-white",
            "focus:outline-none focus:border-lsc-teal transition-colors",
          ].join(" ")}
        >
          {HOME_SIZE_OPTIONS.map((opt) => (
            <option key={opt.sqft} value={opt.sqft}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom chevron */}
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lsc-teal"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}

// ─── Option Buttons (Driveway / Deck size) ────────────────────────────────────

function OptionButtons<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: T; label: string; sub: string }[];
  value: T;
  onChange: (key: T) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
        {label}
      </label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={[
              "flex flex-col items-center gap-0.5 rounded-xl border-2 py-3 px-2",
              "text-center transition-all duration-150 focus:outline-none",
              value === opt.key
                ? "border-lsc-orange bg-orange-50 text-lsc-orange"
                : "border-gray-200 bg-white text-gray-600 hover:border-lsc-teal/50",
            ].join(" ")}
          >
            <span className="text-sm font-bold">{opt.label}</span>
            <span className="text-[10px] text-gray-400 leading-tight">
              {opt.sub}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Price Display ────────────────────────────────────────────────────────────

function PriceDisplay({
  low,
  high,
  loading,
}: {
  low: number;
  high: number;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-lsc-navy rounded-2xl p-5 text-center">
        <div className="text-white/50 text-sm animate-pulse">
          Loading pricing…
        </div>
      </div>
    );
  }

  return (
    <div className="bg-lsc-navy rounded-2xl overflow-hidden">
      {/* Top accent stripe */}
      <div className="h-1 bg-lsc-orange" />

      <div className="px-5 py-4">
        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-3 text-center">
          Estimated Price Range
        </p>

        <div className="flex items-center justify-center gap-4">
          {/* Low */}
          <div className="text-center">
            <div className="text-3xl font-bold text-white tabular-nums">
              {fmt(low)}
            </div>
            <div className="text-white/40 text-[9px] uppercase tracking-widest mt-0.5">
              Low
            </div>
          </div>

          {/* Divider */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-px h-6 bg-white/20 rounded-full" />
            <span className="text-white/30 text-xs">–</span>
            <div className="w-px h-6 bg-white/20 rounded-full" />
          </div>

          {/* High */}
          <div className="text-center">
            <div className="text-3xl font-bold text-lsc-orange tabular-nums">
              {fmt(high)}
            </div>
            <div className="text-white/40 text-[9px] uppercase tracking-widest mt-0.5">
              High
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [settings, setSettings] = useState<PricingSettings | null>(null);
  const [activeService, setActiveService] = useState<ServiceId>("house-washing");
  const [homeSqft, setHomeSqft] = useState<number>(HOME_SIZE_OPTIONS[2].sqft);
  const [drivewaySz, setDrivewaySz] = useState<DrivewaySizeKey>("two");
  const [deckSz, setDeckSz] = useState<DeckSizeKey>("medium");

  // ── Tab row scroll state ───────────────────────────────────────────────────
  const tabRowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = tabRowRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [updateScrollState]);

  function scrollTabs(dir: "left" | "right") {
    const el = tabRowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 160 : -160, behavior: "smooth" });
  }

  // Load from Supabase, fall back to hardcoded defaults
  useEffect(() => {
    fetchPricingSettings().then(setSettings);
  }, []);

  // ── Calculate mid-price ────────────────────────────────────────────────────
  const mid = useMemo(() => {
    if (!settings) return 0;

    switch (activeService) {
      case "house-washing":
        return estimateHouseWash(homeSqft, settings);

      case "gutter-cleaning":
        return estimateGutterCleaning(homeSqft, settings);

      case "gutter-protection": {
        const linearFt = Math.round(homeSqft * GUTTER_LIN_FT_PER_SQFT);
        return estimateGutterProtection(
          linearFt,
          GUTTER_PROTECTION_PRODUCT_INDEX,
          settings
        );
      }

      case "window-cleaning": {
        const windows = Math.round(homeSqft * WINDOWS_PER_SQFT);
        return estimateWindowCleaning(windows, settings);
      }

      case "roof-cleaning": {
        const roofSqft = Math.round(homeSqft * ROOF_SQFT_MULTIPLIER);
        return estimateRoofCleaning(roofSqft, settings);
      }

      case "driveway":
        return estimateDriveway(DRIVEWAY_SQFT[drivewaySz], settings);

      case "deck-cleaning":
        return estimateDeckCleaning(DECK_SQFT[deckSz], settings);

      default:
        return 0;
    }
  }, [settings, activeService, homeSqft, drivewaySz, deckSz]);

  const { low, high } = priceRange(mid, RANGE_SPREAD);

  const isLoading = !settings;
  const needsHomeSize = !["driveway", "deck-cleaning"].includes(activeService);
  const needsDriveway = activeService === "driveway";
  const needsDeck = activeService === "deck-cleaning";

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center p-3">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="bg-lsc-navy px-5 py-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-base leading-tight">
              Instant Price Estimator
            </h2>
            <p className="text-white/50 text-[11px] mt-0.5 font-medium tracking-wide">
              LAKE STATE CLEANING · MAKING MICHIGAN SHINE
            </p>
          </div>
          {/* Orange accent pill */}
          <div className="flex-shrink-0 bg-lsc-orange rounded-lg px-3 py-1.5">
            <span className="text-white text-[10px] font-bold uppercase tracking-wider">
              Estimator
            </span>
          </div>
        </div>

        {/* ── Service Tabs ─────────────────────────────────────────────── */}
        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2.5">
          <div className="relative">
            {/* Left scroll arrow */}
            {canScrollLeft && (
              <button
                onClick={() => scrollTabs("left")}
                aria-label="Scroll left"
                className={[
                  "absolute left-0 top-1/2 -translate-y-1/2 z-10",
                  "flex items-center justify-center w-7 h-7 rounded-full",
                  "bg-white border border-gray-200 shadow-sm text-lsc-navy",
                  "hover:bg-lsc-teal hover:text-white hover:border-lsc-teal transition-colors",
                ].join(" ")}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </button>
            )}

            {/* Scrollable row */}
            <div
              ref={tabRowRef}
              onScroll={updateScrollState}
              className={[
                "flex gap-1 overflow-x-auto pb-0.5 scroll-smooth",
                canScrollLeft ? "pl-8" : "",
                canScrollRight ? "pr-8" : "",
              ].join(" ")}
              style={{ scrollbarWidth: "none" }}
            >
              {SERVICES.map((svc) => (
                <ServiceTab
                  key={svc.id}
                  service={svc}
                  active={activeService === svc.id}
                  onClick={() => setActiveService(svc.id)}
                />
              ))}
            </div>

            {/* Right scroll arrow */}
            {canScrollRight && (
              <button
                onClick={() => scrollTabs("right")}
                aria-label="Scroll right"
                className={[
                  "absolute right-0 top-1/2 -translate-y-1/2 z-10",
                  "flex items-center justify-center w-7 h-7 rounded-full",
                  "bg-white border border-gray-200 shadow-sm text-lsc-navy",
                  "hover:bg-lsc-teal hover:text-white hover:border-lsc-teal transition-colors",
                ].join(" ")}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Selected service label ────────────────────────────────────── */}
        <div className="px-5 pt-4 pb-1">
          <h3 className="text-lsc-navy font-bold text-sm">
            {SERVICES.find((s) => s.id === activeService)?.label}
          </h3>
        </div>

        {/* ── Inputs ───────────────────────────────────────────────────── */}
        <div className="px-5 pb-4 pt-2 space-y-3">
          {needsHomeSize && (
            <HomeSizeSelect value={homeSqft} onChange={setHomeSqft} />
          )}
          {needsDriveway && (
            <OptionButtons
              label="Driveway Size"
              options={DRIVEWAY_OPTIONS}
              value={drivewaySz}
              onChange={setDrivewaySz}
            />
          )}
          {needsDeck && (
            <OptionButtons
              label="Deck Size"
              options={DECK_OPTIONS}
              value={deckSz}
              onChange={setDeckSz}
            />
          )}

          {/* Price result */}
          <PriceDisplay low={low} high={high} loading={isLoading} />

          {/* Disclaimer */}
          <p className="text-[10px] text-gray-400 text-center leading-relaxed px-2">
            Rough estimates only. Actual prices vary based on home condition,
            accessibility, and other factors.{" "}
            <a
              href="https://lakestatecleaning.com/get-a-quote/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lsc-orange underline font-semibold"
            >
              Get a free exact quote →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
