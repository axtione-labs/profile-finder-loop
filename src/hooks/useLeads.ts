import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Lead {
  id: string;
  user_id: string;
  client: string;
  sector: string;
  location: string;
  remote: string;
  position: string;
  seniority: string;
  stack: string[];
  start_date: string;
  duration: string;
  tjm: number;
  margin: number;
  margin_status: string;
  admin_margin: number;
  priority: string;
  description: string;
  status: string;
  recruiter: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  created_at: string;
  updated_at: string;
  apporteur_name?: string;
}

export const useLeads = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Lead[];
    },
    enabled: !!user,
  });
};

export const useCreateLead = () => {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (lead: Omit<Lead, "id" | "user_id" | "created_at" | "updated_at" | "status" | "recruiter" | "apporteur_name" | "margin_status" | "admin_margin">) => {
      const { data, error } = await supabase
        .from("leads" as any)
        .insert({ ...lead, user_id: user!.id } as any)
        .select("id")
        .single();
      if (error) throw error;
      return data as unknown as { id: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Besoin envoyé avec succès !");
    },
    onError: (e: any) => toast.error(e.message),
  });
};

export const useUpdateLead = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Lead>) => {
      const { error } = await supabase
        .from("leads" as any)
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
};

export const useDeleteLead = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Soft-delete: hide the lead for the apporteur without removing admin data
      const { error } = await supabase
        .from("leads" as any)
        .update({ hidden_by_user: true } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Besoin masqué");
    },
    onError: (e: any) => toast.error(e.message),
  });
};
