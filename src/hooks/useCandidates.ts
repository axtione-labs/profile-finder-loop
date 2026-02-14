import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Candidate {
  id: string;
  lead_id: string;
  name: string;
  experience: string;
  stack: string[];
  tjm: number;
  status: string;
  cv_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useCandidates = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["candidates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidates" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Candidate[];
    },
    enabled: !!user,
  });
};

export const useCreateCandidate = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (candidate: Omit<Candidate, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase
        .from("candidates" as any)
        .insert(candidate as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Candidat ajouté");
    },
    onError: (e: any) => toast.error(e.message),
  });
};

export const useUpdateCandidate = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Candidate>) => {
      const { error } = await supabase
        .from("candidates" as any)
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
};
