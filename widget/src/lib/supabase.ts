import { createClient } from "@supabase/supabase-js";
import type { PricingSettings } from "./pricing";
import type { WidgetPricingTier } from "@/lib/widgetPricingTypes";

// These are public/anon credentials — safe to expose in the browser bundle.
// The pricing_settings table has an RLS policy that allows anonymous reads.
const SUPABASE_URL = "https://kagakiecujurplqfkrft.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZ2FraWVjdWp1cnBscWZrcmZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMTI1MzEsImV4cCI6MjA4ODU4ODUzMX0._I5gHHZ_5GQVEzywY9grb947hukrsoyCRp2ltiaV-2w";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

import { DEFAULT_SETTINGS } from "./defaultSettings";

export async function fetchPricingSettings(): Promise<PricingSettings> {
  try {
    const { data, error } = await supabase
      .from("pricing_settings")
      .select("settings")
      .eq("id", "global")
      .maybeSingle();

    if (error) {
      console.warn("[LSC Widget] Could not load live pricing settings, using defaults:", error.message);
      return DEFAULT_SETTINGS;
    }

    if (!data?.settings || typeof data.settings !== "object" || Array.isArray(data.settings)) {
      // Table exists but no row yet — use defaults until the internal calculator saves settings
      return DEFAULT_SETTINGS;
    }

    // Merge with defaults so any new settings keys added later are present
    return { ...DEFAULT_SETTINGS, ...(data.settings as Partial<PricingSettings>) };
  } catch (err) {
    console.warn("[LSC Widget] Network error loading pricing settings, using defaults:", err);
    return DEFAULT_SETTINGS;
  }
}

export async function fetchWidgetPricingSettings(): Promise<WidgetPricingTier[]> {
  try {
    const { data, error } = await supabase
      .from("widget_pricing_tiers")
      .select("*")
      .order("service_id, min_sqft");

    if (error) {
      console.warn("[LSC Widget] Could not load widget pricing tiers:", error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.warn("[LSC Widget] Network error loading widget pricing tiers:", err);
    return [];
  }
}
