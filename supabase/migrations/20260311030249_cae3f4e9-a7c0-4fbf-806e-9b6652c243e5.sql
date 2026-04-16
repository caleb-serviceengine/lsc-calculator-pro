
-- Drop the restrictive public SELECT policy that conflicts
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Add a permissive admin SELECT policy so admins can see all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));
