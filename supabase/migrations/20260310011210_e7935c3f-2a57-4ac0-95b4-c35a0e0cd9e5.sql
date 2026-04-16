-- Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- Also verify the user's profile data
SELECT user_id, full_name, role FROM public.profiles WHERE user_id = '4ce9209c-53b6-4555-a0c7-214dae2727a6';