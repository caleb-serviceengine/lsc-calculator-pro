-- widget_pricing_tiers: lookup table for widget pricing by square footage range.
-- Stores low/high price for each service + sqft bracket.
-- Authenticated users (internal staff) can read and write.
-- Anonymous users (public widget) can read only.

CREATE TABLE public.widget_pricing_tiers (
  id bigserial PRIMARY KEY,
  service_id text NOT NULL,
  min_sqft integer NOT NULL,
  max_sqft integer NOT NULL,
  low_price numeric NOT NULL,
  high_price numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_service_range UNIQUE(service_id, min_sqft, max_sqft),
  CONSTRAINT valid_range CHECK (min_sqft < max_sqft),
  CONSTRAINT valid_prices CHECK (low_price >= 0 AND high_price >= 0 AND low_price <= high_price)
);

ALTER TABLE public.widget_pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Internal staff: full read/write
CREATE POLICY "Authenticated users can read widget pricing tiers"
  ON public.widget_pricing_tiers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert widget pricing tiers"
  ON public.widget_pricing_tiers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update widget pricing tiers"
  ON public.widget_pricing_tiers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete widget pricing tiers"
  ON public.widget_pricing_tiers FOR DELETE
  TO authenticated
  USING (true);

-- Public widget: read-only
CREATE POLICY "Anonymous users can read widget pricing tiers"
  ON public.widget_pricing_tiers FOR SELECT
  TO anon
  USING (true);

-- Trigger to update updated_at on changes
CREATE TRIGGER widget_pricing_tiers_updated_at
  BEFORE UPDATE ON public.widget_pricing_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
