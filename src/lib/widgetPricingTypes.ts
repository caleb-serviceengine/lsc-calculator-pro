/**
 * Types for widget pricing tiers.
 * Widget displays prices from a lookup table instead of calculating from formulas.
 */

export interface WidgetPricingTier {
  id: number;
  service_id: string;
  min_sqft: number;
  max_sqft: number;
  low_price: number;
  high_price: number;
  created_at?: string;
  updated_at?: string;
}

export type ServiceId =
  | "house-washing"
  | "window-cleaning"
  | "gutter-cleaning"
  | "gutter-protection"
  | "roof-cleaning"
  | "driveway"
  | "deck-cleaning";

export const SERVICE_IDS: ServiceId[] = [
  "house-washing",
  "window-cleaning",
  "gutter-cleaning",
  "gutter-protection",
  "roof-cleaning",
  "driveway",
  "deck-cleaning",
];

export const SERVICE_LABELS: Record<ServiceId, string> = {
  "house-washing": "House Washing",
  "window-cleaning": "Window Cleaning",
  "gutter-cleaning": "Gutter Cleaning",
  "gutter-protection": "Gutter Protection",
  "roof-cleaning": "Roof Cleaning",
  "driveway": "Driveway",
  "deck-cleaning": "Deck Cleaning",
};
