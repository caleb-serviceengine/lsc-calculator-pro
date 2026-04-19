import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  fullName: string;
  createdAt: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('[useProfile] session user:', session?.user?.id);
    if (!session?.user?.id) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, created_at")
      .eq("id", session.user.id)
      .maybeSingle();

    console.log('[useProfile] data:', data, 'error:', error);

    if (!data && !error) {
      // No profile yet — create one
      console.log('[useProfile] No profile found, creating one...');
      const { data: inserted, error: insertErr } = await supabase
        .from("profiles")
        .insert({ id: session.user.id, full_name: "" } as any)
        .select("full_name, created_at")
        .single();

      console.log('[useProfile] insert result:', inserted, 'insertErr:', insertErr);
      if (inserted) {
        setProfile({ fullName: inserted.full_name ?? "", createdAt: inserted.created_at });
      }
    } else if (data) {
      setProfile({ fullName: data.full_name ?? "", createdAt: data.created_at });
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateFullName = useCallback(async (fullName: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return false;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", session.user.id);

    if (!error) {
      setProfile((prev) => prev ? { ...prev, fullName } : prev);
      return true;
    }
    return false;
  }, []);

  return { profile, isLoading, updateFullName, refetch: fetchProfile };
}
