import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Mission {
  id: string;
  lead_id: string;
  candidate_id: string;
  client: string;
  consultant_name: string;
  apporteur_id: string;
  tjm: number;
  tjm_client: number;
  duration: string;
  status: string;
  start_date: string;
  created_at: string;
}

export interface Commission {
  id: string;
  mission_id: string;
  apporteur_id: string;
  percentage: number;
  amount: number;
  admin_amount: number;
  status: string;
  created_at: string;
  days_worked: number;
  commission_month: number;
  commission_year: number;
  invoice_url: string | null;
}

export const useMissions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["missions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("missions" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Mission[];
    },
    enabled: !!user,
  });
};

export const useCommissions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["commissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commissions" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Commission[];
    },
    enabled: !!user,
  });
};

export const useUpdateMission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Mission>) => {
      const { error } = await supabase.from("missions" as any).update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["missions"] }),
    onError: (e: any) => toast.error(e.message),
  });
};

export const useUpdateCommission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Commission>) => {
      const { error } = await supabase.from("commissions" as any).update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["commissions"] }),
    onError: (e: any) => toast.error(e.message),
  });
};

export const useCreateMission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (mission: Omit<Mission, "id" | "created_at">) => {
      const { data, error } = await supabase.from("missions" as any).insert(mission as any).select();
      if (error) throw error;
      return (data as any)?.[0];
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["missions"] });
      toast.success("Mission créée");
    },
    onError: (e: any) => toast.error(e.message),
  });
};

export const useCreateCommission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (commission: Omit<Commission, "id" | "created_at">) => {
      const { error } = await supabase.from("commissions" as any).insert(commission as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["commissions"] });
      toast.success("Commission créée");
    },
    onError: (e: any) => toast.error(e.message),
  });
};

export const useDeleteMission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("missions" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["missions"] });
      toast.success("Mission supprimée");
    },
    onError: (e: any) => toast.error(e.message),
  });
};
