-- pricing_settings: single global row storing all pricing configuration as JSONB.
-- Authenticated users (internal staff) can read and write.
-- Anonymous users (public widget) can read only.

CREATE TABLE public.pricing_settings (
  id text PRIMARY KEY DEFAULT 'global',
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;

-- Internal staff: full read/write
CREATE POLICY "Authenticated users can read pricing settings"
  ON public.pricing_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can upsert pricing settings"
  ON public.pricing_settings FOR INSERT
  TO authenticated
  WITH CHECK (id = 'global');

CREATE POLICY "Authenticated users can update pricing settings"
  ON public.pricing_settings FOR UPDATE
  TO authenticated
  USING (id = 'global')
  WITH CHECK (id = 'global');

-- Public widget: read-only
CREATE POLICY "Anonymous users can read pricing settings"
  ON public.pricing_settings FOR SELECT
  TO anon
  USING (true);

CREATE TRIGGER pricing_settings_updated_at
  BEFORE UPDATE ON public.pricing_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
