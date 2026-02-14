import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  company: string | null;
  phone: string | null;
}

export const useProfiles = () => {
  const { user, isAdmin } = useAuth();

  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*");
      if (error) throw error;
      return (data || []) as Profile[];
    },
    enabled: !!user && isAdmin,
  });
};
