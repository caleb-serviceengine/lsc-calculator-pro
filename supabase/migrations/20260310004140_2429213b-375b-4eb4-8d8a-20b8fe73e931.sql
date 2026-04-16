
-- Insert profile for existing user (disable FK check temporarily isn't possible, so use a function)
CREATE OR REPLACE FUNCTION public.seed_existing_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  uid uuid := '4ce9209c-53b6-4555-a0c7-214dae2727a6';
  user_exists boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = uid) INTO user_exists;
  
  IF user_exists THEN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (uid, '')
    ON CONFLICT (user_id) DO NOTHING;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

SELECT public.seed_existing_user();

DROP FUNCTION public.seed_existing_user();
