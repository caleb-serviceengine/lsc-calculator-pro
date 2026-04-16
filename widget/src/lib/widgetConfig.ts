// ─── Widget Translation Constants ────────────────────────────────────────────
// These map the widget's simple user inputs to the calculation variables used
// by the pricing engine. Update these when real-world data says the assumptions
// should change. Pricing RATES live in Supabase and update automatically.

// ── Home size brackets displayed to the user ──────────────────────────────────
// Each label maps to a midpoint (sq ft) used for calculations.
export const HOME_SIZE_OPTIONS = [
  { label: "Under 1,500 sq ft",     sqft: 1200 },
  { label: "1,500 – 2,000 sq ft",   sqft: 1750 },
  { label: "2,000 – 2,500 sq ft",   sqft: 2250 },
  { label: "2,500 – 3,000 sq ft",   sqft: 2750 },
  { label: "3,000 – 3,500 sq ft",   sqft: 3250 },
  { label: "3,500 – 4,000 sq ft",   sqft: 3750 },
  { label: "4,000 – 4,500 sq ft",   sqft: 4250 },
  { label: "4,500 – 5,000 sq ft",   sqft: 4750 },
] as const;

// ── Gutter protection: linear feet derived from home sq ft ────────────────────
// Assumes roughly 0.07 linear ft of gutter per sq ft of home.
// e.g. 2,000 sq ft → ~140 linear ft.
export const GUTTER_LIN_FT_PER_SQFT = 0.07;

// Which gutter protection product index (0-based) to use for the estimate.
// 0 = Raindrop (premium), 1 = FlowGuard (standard). Widget uses FlowGuard.
export const GUTTER_PROTECTION_PRODUCT_INDEX = 1;

// ── Window cleaning: window count derived from home sq ft ─────────────────────
// Assumes roughly 0.007 windows per sq ft.
// e.g. 2,000 sq ft → ~14 windows.
export const WINDOWS_PER_SQFT = 0.007;

// ── Roof cleaning: roof sq ft derived from home sq ft ────────────────────────
// 1.25× accounts for a typical 4/12 pitch and overhangs.
export const ROOF_SQFT_MULTIPLIER = 1.25;

// Default surface type assumed for roof estimates.
export const ROOF_DEFAULT_SURFACE = "Asphalt Shingle";

// ── House washing: default siding type for estimate ───────────────────────────
export const HOUSE_DEFAULT_SIDING = "Vinyl";

// ── Driveway power washing: sq ft by car count ────────────────────────────────
// Intentionally generous so that 2-car and 3-car+ break above the flatwork
// minimum and show a meaningful price range.
export const DRIVEWAY_SQFT = {
  one:   450,   // single-car: ~450 sq ft
  two:   900,   // two-car:    ~900 sq ft
  three: 1500,  // three-car+: ~1,500 sq ft
} as const;

// ── Deck cleaning: sq ft by size selection ───────────────────────────────────
export const DECK_SQFT = {
  small:  200,  // ~200 sq ft
  medium: 400,  // ~400 sq ft
  large:  700,  // ~700 sq ft
} as const;

// Default deck surface type for estimate.
export const DECK_DEFAULT_SURFACE = "Common Wood";

// ── Price range spread (±10% → 20% gap between low and high) ─────────────────
export const RANGE_SPREAD = 0.10;
