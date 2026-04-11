import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Download, FileSignature, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateContract } from "@/hooks/useContracts";
import { supabase } from "@/integrations/supabase/client";
import SignaturePad from "@/components/SignaturePad";
import ContractContent from "@/components/ContractContent";

const SignContract = () => {
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get("lead_id");
  const navigate = useNavigate();
  const { user } = useAuth();
  const createContract = useCreateContract();

  const [signatureData, setSignatureData] = useState("");
  const [signatureType, setSignatureType] = useState<"draw" | "text">("draw");
  const [signed, setSigned] = useState(false);
  const [contractUrl, setContractUrl] = useState<string | null>(null);

  const handleSignatureChange = (data: string, type: "draw" | "text") => {
    setSignatureData(data);
    setSignatureType(type);
  };

  const handleSign = async () => {
    if (!signatureData || !leadId) return;

    const result = await createContract.mutateAsync({
      leadId,
      signatureData,
      signatureType,
    });

    if (result?.contract_pdf_url) {
      const { data } = await supabase.storage
        .from("contracts")
        .createSignedUrl(result.contract_pdf_url, 3600);
      if (data?.signedUrl) {
        setContractUrl(data.signedUrl);
      }
    }

    setSigned(true);
  };

  const handleDownload = () => {
    if (contractUrl) {
      window.open(contractUrl, "_blank");
    }
  };

  if (!leadId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Aucun besoin associé.</p>
          <Link to="/dashboard" className="text-primary underline mt-2 inline-block">
            Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center px-6">
          <Link to="/" className="font-display text-xl font-bold text-gradient-gold">Lynx</Link>
        </div>
      </nav>

      <div className="container mx-auto max-w-3xl px-6 py-12">
        {!signed ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                <ScrollText className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">Contrat d'Apport d'Affaires</h1>
                <p className="text-sm text-muted-foreground">Veuillez lire et signer le contrat ci-dessous</p>
              </div>
            </div>

            <div className="gradient-card rounded-2xl border border-border/50 p-8">
              <div className="max-h-[500px] overflow-y-auto pr-4">
                <ContractContent />
              </div>
            </div>

            <div className="gradient-card rounded-2xl border border-border/50 p-8">
              <div className="flex items-center gap-2 mb-4">
                <FileSignature className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold">Votre signature</h2>
              </div>
              <SignaturePad onSignatureChange={handleSignatureChange} />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Annuler
              </Button>
              <Button
                onClick={handleSign}
                disabled={!signatureData || createContract.isPending}
                className="gradient-primary glow-primary border-0"
              >
                <Check className="mr-2 h-4 w-4" />
                {createContract.isPending ? "Signature en cours..." : "Signer le contrat"}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                <Check className="h-10 w-10 text-success" />
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold">Contrat signé avec succès !</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Votre contrat d'apport d'affaires a été signé et enregistré. Vous pouvez le télécharger ci-dessous.
              Une copie vous sera également envoyée par email.
            </p>
            <div className="flex justify-center gap-4">
              {contractUrl && (
                <Button onClick={handleDownload} variant="outline">
                  <Download className="mr-2 h-4 w-4" /> Télécharger le contrat
                </Button>
              )}
              <Button onClick={() => navigate("/dashboard")} className="gradient-primary border-0">
                Retour au dashboard
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SignContract;
