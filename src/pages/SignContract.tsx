import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Download, FileSignature, ScrollText, ShieldCheck, AlertTriangle } from "lucide-react";
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
  const { user, profile } = useAuth();
  const createContract = useCreateContract();

  const [signatureData, setSignatureData] = useState("");
  const [signatureType, setSignatureType] = useState<"draw" | "text">("draw");
  const [signed, setSigned] = useState(false);
  const [signedAt, setSignedAt] = useState<Date | null>(null);
  const [contractUrl, setContractUrl] = useState<string | null>(null);
  const [signatureError, setSignatureError] = useState("");

  const apporteurName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim() || "[Apporteur d'affaires — à compléter]"
    : "[Apporteur d'affaires — à compléter]";

  const handleSignatureChange = (data: string, type: "draw" | "text") => {
    setSignatureData(data);
    setSignatureType(type);
    if (data) setSignatureError("");
  };

  const handleSign = async () => {
    if (!signatureData) {
      setSignatureError("La signature est obligatoire avant de valider le contrat");
      return;
    }
    if (!leadId) return;

    const now = new Date();
    setSignedAt(now);

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
                <ContractContent
                  apporteurName={apporteurName}
                  donneurOrdre="Lynx"
                />
              </div>
            </div>

            <div className="gradient-card rounded-2xl border border-border/50 p-8">
              <div className="flex items-center gap-2 mb-4">
                <FileSignature className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold">Votre signature</h2>
              </div>
              <SignaturePad onSignatureChange={handleSignatureChange} />
              {signatureError && (
                <div className="flex items-center gap-2 mt-3 text-destructive text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{signatureError}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Annuler
              </Button>
              <Button
                onClick={handleSign}
                disabled={createContract.isPending}
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
            className="space-y-8"
          >
            {/* Success banner */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                  <ShieldCheck className="h-10 w-10 text-success" />
                </div>
              </div>
              <h1 className="font-display text-3xl font-bold">Contrat signé avec succès !</h1>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium">
                <Check className="h-4 w-4" />
                Contrat signé avec succès
              </div>
            </div>

            {/* Signed contract preview */}
            <div className="gradient-card rounded-2xl border border-border/50 p-8">
              <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <ScrollText className="h-5 w-5 text-primary" />
                Aperçu du contrat signé
              </h2>
              <div className="max-h-[500px] overflow-y-auto pr-4">
                <ContractContent
                  apporteurName={apporteurName}
                  donneurOrdre="Lynx"
                  signatureData={signatureData}
                  signedAt={signedAt || undefined}
                  showSignature
                />
              </div>
            </div>

            {/* Contract details recap */}
            <div className="gradient-card rounded-2xl border border-border/50 p-6">
              <h3 className="font-semibold mb-4">Récapitulatif</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Apporteur d'affaires</p>
                  <p className="font-medium">{apporteurName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Donneur d'ordre</p>
                  <p className="font-medium">Lynx</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date et heure de signature</p>
                  <p className="font-medium">
                    {signedAt
                      ? `Le ${signedAt.toLocaleDateString("fr-FR")} à ${signedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Signature</p>
                  <div className="mt-1">
                    {signatureData ? (
                      <img src={signatureData} alt="Signature" className="max-h-12 object-contain" />
                    ) : (
                      <p>—</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground text-center text-sm max-w-md mx-auto">
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
