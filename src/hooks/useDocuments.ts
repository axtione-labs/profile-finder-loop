import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Document {
  id: string;
  user_id: string;
  type: "rib" | "kbis" | "id_card";
  file_url: string;
  file_name: string;
  status: "pending" | "validated" | "rejected";
  validated_at: string | null;
  validated_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useDocuments = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ["documents", targetUserId],
    queryFn: async () => {
      let query = supabase.from("documents" as any).select("*");
      if (targetUserId) {
        query = query.eq("user_id", targetUserId);
      }
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Document[];
    },
    enabled: !!user,
  });
};

export const useAllDocuments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["documents", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Document[];
    },
    enabled: !!user,
  });
};

export const useUploadDocument = () => {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ file, type }: { file: File; type: Document["type"] }) => {
      if (!user) throw new Error("Non authentifié");
      
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${type}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(filePath);

      // Upsert document record
      const { error: dbError } = await supabase
        .from("documents" as any)
        .upsert({
          user_id: user.id,
          type,
          file_url: filePath,
          file_name: file.name,
          status: "pending",
          validated_at: null,
          validated_by: null,
        } as any, { onConflict: "user_id,type" });
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document uploadé avec succès");
    },
    onError: (e: any) => toast.error("Erreur upload: " + e.message),
  });
};

export const useValidateDocument = () => {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "validated" | "rejected" }) => {
      const { error } = await supabase
        .from("documents" as any)
        .update({
          status,
          validated_at: new Date().toISOString(),
          validated_by: user?.id,
        } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast.success(status === "validated" ? "Document validé" : "Document rejeté");
    },
    onError: (e: any) => toast.error(e.message),
  });
};
