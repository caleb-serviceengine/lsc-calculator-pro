import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchRole() {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[useUserRole] session user:', session?.user?.id);
      if (!session?.user?.id) {
        if (!cancelled) {
          setRole(null);
          setIsRoleLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      console.log('[useUserRole] data:', data, 'error:', error);

      if (!cancelled) {
        if (error) {
          console.error("[useUserRole] Error fetching role:", error);
          setRole(null);
        } else {
          setRole(data?.role ?? null);
        }
        setIsRoleLoading(false);
      }
    }

    fetchRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setIsRoleLoading(true);
      fetchRole();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return { role, isRoleLoading, isAdmin: role === "admin" };
}
