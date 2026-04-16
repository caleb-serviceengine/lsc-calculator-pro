ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'viewer';

UPDATE public.profiles p
SET role = ur.role::text
FROM public.user_roles ur
WHERE p.user_id = ur.user_id;