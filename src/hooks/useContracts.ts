import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Contract {
  id: string;
  user_id: string;
  lead_id: string;
  signature_data: string;
  signature_type: string;
  contract_pdf_url: string | null;
  signed_at: string;
  created_at: string;
  updated_at: string;
}

export const useContracts = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["contracts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Contract[];
    },
    enabled: !!user,
  });
};

export const useContractByLead = (leadId: string | undefined) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["contracts", "lead", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts" as any)
        .select("*")
        .eq("lead_id", leadId)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Contract | null;
    },
    enabled: !!user && !!leadId,
  });
};

export const useCreateContract = () => {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      leadId,
      signatureData,
      signatureType,
    }: {
      leadId: string;
      signatureData: string;
      signatureType: "draw" | "text";
    }) => {
      if (!user) throw new Error("Non authentifié");

      // 1. Insert contract record
      const { data: contract, error: insertError } = await supabase
        .from("contracts" as any)
        .insert({
          user_id: user.id,
          lead_id: leadId,
          signature_data: signatureData,
          signature_type: signatureType,
        } as any)
        .select()
        .single();
      if (insertError) throw insertError;

      // 2. Generate and upload a simple contract text + signature as a blob
      const contractId = (contract as any).id;

      // Create a simple HTML representation for PDF-like storage
      const htmlContent = generateContractHtml(signatureData, user.email || "");
      const blob = new Blob([htmlContent], { type: "text/html" });
      const filePath = `${user.id}/${contractId}.html`;

      const { error: uploadError } = await supabase.storage
        .from("contracts")
        .upload(filePath, blob, { upsert: true });
      if (uploadError) throw uploadError;

      // 3. Update contract with PDF URL
      const { error: updateError } = await supabase
        .from("contracts" as any)
        .update({ contract_pdf_url: filePath } as any)
        .eq("id", contractId);
      if (updateError) throw updateError;

      return contract as unknown as Contract;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contracts"] });
      toast.success("Contrat signé avec succès !");
    },
    onError: (e: any) => toast.error("Erreur: " + e.message),
  });
};

function generateContractHtml(signatureDataUrl: string, email: string) {
  const date = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Contrat d'Apport d'Affaires</title>
<style>
body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1a1a2e; line-height: 1.6; }
h1 { text-align: center; color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
h2 { color: #2563eb; margin-top: 30px; }
.signature-block { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
.signature-img { max-width: 300px; border: 1px solid #eee; border-radius: 8px; }
.meta { color: #666; font-size: 0.9em; }
</style></head>
<body>
<h1>CONTRAT D'APPORT D'AFFAIRES</h1>
<p class="meta">Signé le ${date} par ${email}</p>

<h2>Article 1 — Objet</h2>
<p>Le présent contrat a pour objet de définir les conditions dans lesquelles l'Apporteur d'Affaires s'engage à présenter des opportunités commerciales à DealFlowNetwork.</p>

<h2>Article 2 — Obligations de l'Apporteur</h2>
<p>L'Apporteur s'engage à communiquer toute information utile relative aux besoins identifiés et à agir de bonne foi dans le cadre de cette collaboration.</p>

<h2>Article 3 — Commission</h2>
<p>En contrepartie de l'apport d'affaires, l'Apporteur percevra une commission dont le pourcentage sera défini lors de la réunion de qualification du besoin, avec un minimum garanti de 5%.</p>

<h2>Article 4 — Confidentialité</h2>
<p>L'Apporteur s'engage à respecter la confidentialité des informations communiquées dans le cadre de cette collaboration.</p>

<h2>Article 5 — Durée</h2>
<p>Le présent contrat est conclu pour une durée indéterminée et peut être résilié par l'une ou l'autre des parties avec un préavis de 30 jours.</p>

<div class="signature-block">
<p><strong>Signature de l'Apporteur :</strong></p>
<img src="${signatureDataUrl}" alt="Signature" class="signature-img" />
<p class="meta">Signé électroniquement le ${date}</p>
</div>
</body></html>`;
}
