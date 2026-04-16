
-- Drop FK constraints that reference auth.users (incompatible with Lovable Cloud proxy)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Now insert the data
INSERT INTO public.profiles (user_id, full_name)
VALUES ('4ce9209c-53b6-4555-a0c7-214dae2727a6', '')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('4ce9209c-53b6-4555-a0c7-214dae2727a6', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
