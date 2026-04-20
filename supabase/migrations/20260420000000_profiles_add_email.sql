-- Add email column to profiles so the admin user list can display it
-- without needing direct access to auth.users

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text;

-- Backfill email for existing profiles from auth.users
-- profiles.id = auth.users.id (id is the auth user UUID, not a separate FK)
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND p.email IS NULL;

-- Update the trigger so new signups (including OAuth) always capture email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name);

  RETURN NEW;
END;
$$;
