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
<head><meta charset="UTF-8"><title>Contrat d'Apport d'Affaires - Signé</title>
<style>
body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1a1a2e; line-height: 1.7; font-size: 14px; }
h1 { text-align: center; color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; font-size: 22px; }
h2 { color: #2563eb; margin-top: 30px; font-size: 16px; }
ul { padding-left: 20px; }
li { margin-bottom: 4px; }
.meta { color: #666; font-size: 0.9em; text-align: center; }
.signature-block { margin-top: 40px; border-top: 2px solid #2563eb; padding-top: 20px; }
.signature-img { max-width: 300px; border: 1px solid #eee; border-radius: 8px; }
.signatures-grid { display: flex; justify-content: space-between; margin-top: 30px; }
.sig-col { text-align: center; width: 45%; }
</style></head>
<body>
<h1>CONTRAT D'APPORT D'AFFAIRES</h1>
<p class="meta">Signé électroniquement le ${date} par ${email}</p>

<p><strong>ENTRE LES SOUSSIGNÉS</strong></p>
<p><em>[Donneur d'ordre]</em><br/>Ci-après « le donneur d'ordre »<br/>D'une part,</p>
<p><strong>ET</strong></p>
<p>${email}<br/>Ci-après « l'apporteur d'affaires »<br/>D'autre part,</p>
<p>Ensemble « les parties »,</p>

<p><strong>APRÈS AVOIR PRÉALABLEMENT EXPOSÉ QUE :</strong></p>
<p>Le donneur d'ordre exerce les activités suivantes à titre principal : <strong>Prestations de services informatiques.</strong></p>
<p>L'apporteur d'affaires a indiqué disposer d'un réseau relationnel utile aux activités du donneur d'ordre. En conséquence, l'apporteur d'affaires a proposé au donneur d'ordre, qui les a acceptés, ses services rémunérés pour la recherche et la présentation de nouveaux clients (ci-après « les clients apportés »).</p>
<p>Les parties se sont rapprochées afin d'arrêter et de formaliser dans les termes de la présente convention d'apporteur d'affaires (ci-après, « le contrat ») les conditions et modalités de leur accord.</p>

<p style="text-align:center;font-weight:bold;">IL A ÉTÉ CONVENU CE QUI SUIT</p>

<h2>ARTICLE 1. OBJET DU CONTRAT</h2>
<p>Le présent contrat a pour objet de définir les termes et conditions selon lesquels le donneur d'ordre confie à l'apporteur d'affaires la mission, qu'il a acceptée, de lui présenter tout nouveau client potentiel susceptible d'être intéressé par les produits ou services suivants : Développement d'applications.</p>
<p>Le présent contrat s'applique à tous les clients que l'apporteur d'affaires apportera en raison de son action personnelle. La clientèle propre que possède déjà le donneur d'ordre est exclue du champ contractuel.</p>
<p>L'apporteur d'affaires n'aura pas le pouvoir de négocier et/ou conclure les opérations commerciales auprès des clients potentiels pour le compte du donneur d'ordre. Il pourra le faire ponctuellement, en qualité de mandataire du donneur d'ordre, uniquement sur la base d'un accord écrit préalable et séparé.</p>

<h2>ARTICLE 2. TERRITOIRE</h2>
<p>L'apporteur d'affaires exercera sa mission au sein du territoire géographique suivant : France ; Monde entier.</p>

<h2>ARTICLE 3. DURÉE DU CONTRAT</h2>
<p>Le contrat prend effet à compter de sa date de signature pour une durée indéterminée.</p>
<p>Toutefois, en cas de résiliation unilatérale par le donneur d'ordre, ce dernier sera tenu d'honorer l'intégralité des commissions dues à l'apporteur d'affaires pour tous les clients apportés avant la date de résiliation.</p>
<p>Cette obligation s'applique non seulement aux transactions conclues avant la résiliation, mais également à toutes celles réalisées postérieurement avec les clients apportés, et ce, jusqu'au terme des contrats conclus entre le donneur d'ordre et ces clients, y compris en cas de renouvellement tacite ou exprès.</p>

<h2>ARTICLE 4. OBLIGATIONS DES PARTIES</h2>
<p><strong>Donneur d'ordre</strong></p>
<p>Le donneur d'ordre exécutera toutes les obligations de vente ou de prestation de service qu'il aura contractées avec les clients apportés. Il s'engage également à :</p>
<ul>
<li>rémunérer l'apporteur d'affaires conformément à l'Article 7 ;</li>
<li>communiquer les contrats signés et factures émises aux clients apportés ;</li>
<li>ne pas contourner l'apporteur d'affaires ;</li>
<li>tenir un registre à jour des transactions.</li>
</ul>
<p>En cas de manquement, l'apporteur d'affaires pourra exiger le paiement immédiat des commissions dues, majoré de 20% à titre de clause pénale.</p>
<p><strong>Apporteur d'affaires</strong></p>
<p>L'apporteur d'affaires s'engage à apporter au donneur d'ordre toutes les informations et conseils nécessaires. Il déterminera ses méthodes de travail de façon autonome et sans aucun lien de subordination.</p>

<h2>ARTICLE 5. OBLIGATION D'INFORMATION</h2>
<p>L'apporteur d'affaires s'engage à informer par écrit le donneur d'ordres sous les plus brefs délais pour chaque nouveau client manifestant son intérêt.</p>

<h2>ARTICLE 6. SOLVABILITÉ DES CLIENTS</h2>
<p>L'apporteur d'affaires ne garantit en aucun cas au donneur d'ordre la solvabilité des clients apportés ni la conclusion d'accords commerciaux.</p>

<h2>ARTICLE 7. RÉMUNÉRATION DE L'APPORTEUR D'AFFAIRES</h2>
<p>L'apporteur d'affaires recevra une commission correspondant à 10% du montant HT de chaque transaction réalisée entre le donneur d'ordre et un client apporté.</p>
<p>La commission sera due à compter de l'encaissement par le donneur d'ordre de la totalité des sommes dues par le client apporté.</p>
<p>En cas de retard de paiement, des pénalités de retard équivalentes à 3 fois le taux d'intérêt légal s'appliqueront, ainsi qu'une indemnité forfaitaire de 40 euros par facture impayée.</p>

<h2>ARTICLE 8. INCESSIBILITÉ DU CONTRAT</h2>
<p>Le contrat est conclu intuitu personae et ne pourra être transféré ou cédé par l'une ou l'autre des parties sans l'accord de l'autre partie.</p>

<h2>ARTICLE 9. ASSURANCES</h2>
<p>L'apporteur d'affaires garantit qu'il dispose d'une police d'assurance RC professionnelle couvrant toutes les obligations du présent contrat.</p>

<h2>ARTICLE 10. INDÉPENDANCE</h2>
<p>Les parties certifient qu'elles restent des partenaires commerciaux et professionnels indépendants l'un de l'autre.</p>

<h2>ARTICLE 11. PROPRIÉTÉ INTELLECTUELLE</h2>
<p>Le donneur d'ordre autorise expressément et à titre gratuit l'apporteur d'affaires à utiliser ses marques et signes distinctifs, strictement limité à la durée du contrat.</p>

<h2>ARTICLE 12. CONFIDENTIALITÉ</h2>
<p>Chaque partie s'engage pendant le contrat et pour une durée d'un an après son terme, à traiter comme confidentielle toute information révélée par l'autre partie.</p>

<h2>ARTICLE 13. RÉSILIATION ANTICIPÉE</h2>
<p>Les parties peuvent rompre le contrat unilatéralement en cas d'inexécution fautive, après mise en demeure restée sans effet pendant un mois. La résiliation ne dispense pas du paiement des commissions dues.</p>

<h2>ARTICLE 14. MODIFICATIONS</h2>
<p>Toute modification du présent contrat devra faire l'objet d'un avenant signé par les parties.</p>

<h2>ARTICLE 15. INVALIDITÉ PARTIELLE</h2>
<p>Si l'une des clauses est non valable, les autres dispositions conservent toute leur force et portée.</p>

<h2>ARTICLE 16. DONNÉES À CARACTÈRE PERSONNEL</h2>
<p>Chaque partie s'engage à respecter les lois en vigueur sur la protection des données personnelles, notamment le RGPD.</p>

<h2>ARTICLE 17. LOI APPLICABLE ET JURIDICTION</h2>
<p>Le présent contrat est régi par le droit français. En cas de litige, les tribunaux compétents seront ceux du lieu du siège social de l'apporteur d'affaires.</p>

<p style="text-align:center; margin-top:40px;">Fait à Paris, le ${date} en 2 exemplaires.</p>

<div class="signature-block">
<div class="signatures-grid">
<div class="sig-col">
<p><strong>LE DONNEUR D'ORDRE</strong></p>
<p style="color:#999;">DealFlowNetwork</p>
</div>
<div class="sig-col">
<p><strong>L'APPORTEUR D'AFFAIRES</strong></p>
<img src="${signatureDataUrl}" alt="Signature" class="signature-img" />
<p class="meta">${email}</p>
<p class="meta">Signé électroniquement le ${date}</p>
</div>
</div>
</div>
</body></html>`;
}
