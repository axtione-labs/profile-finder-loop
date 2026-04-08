import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Download, FileSignature, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateContract } from "@/hooks/useContracts";
import { supabase } from "@/integrations/supabase/client";
import SignaturePad from "@/components/SignaturePad";

const ContractContent = () => (
  <div className="space-y-6 text-sm leading-relaxed text-foreground/90">
    <h2 className="text-center text-lg font-bold text-foreground">CONTRAT D'APPORT D'AFFAIRES</h2>

    <div className="space-y-2">
      <p className="font-semibold">ENTRE LES SOUSSIGNÉS</p>
      <p className="italic text-muted-foreground">[Donneur d'ordre — à compléter]</p>
      <p>Ci-après « le donneur d'ordre »</p>
      <p className="text-center font-medium">D'une part,</p>
      <p className="font-semibold">ET</p>
      <p className="italic text-muted-foreground">[Apporteur d'affaires — à compléter]</p>
      <p>Ci-après « l'apporteur d'affaires »</p>
      <p className="text-center font-medium">D'autre part,</p>
      <p>Ensemble « les parties »,</p>
    </div>

    <div className="space-y-2">
      <p className="font-semibold">APRÈS AVOIR PRÉALABLEMENT EXPOSÉ QUE :</p>
      <p>Le donneur d'ordre exerce les activités suivantes à titre principal : <strong>Prestations de services informatiques.</strong></p>
      <p>L'apporteur d'affaires a indiqué disposer d'un réseau relationnel utile aux activités du donneur d'ordre. En conséquence, l'apporteur d'affaires a proposé au donneur d'ordre, qui les a acceptés, ses services rémunérés pour la recherche et la présentation de nouveaux clients (ci-après « les clients apportés »).</p>
      <p>Les parties se sont rapprochées afin d'arrêter et de formaliser dans les termes de la présente convention d'apporteur d'affaires (ci-après, « le contrat ») les conditions et modalités de leur accord.</p>
    </div>

    <p className="font-semibold text-center">IL A ÉTÉ CONVENU CE QUI SUIT</p>

    <div className="space-y-2">
      <h3 className="font-bold text-foreground">ARTICLE 1. OBJET DU CONTRAT</h3>
      <p>Le présent contrat a pour objet de définir les termes et conditions selon lesquels le donneur d'ordre confie à l'apporteur d'affaires la mission, qu'il a acceptée, de lui présenter tout nouveau client potentiel susceptible d'être intéressé par les produits ou services suivants : <strong>Développement d'applications.</strong></p>
      <p>Le présent contrat s'applique à tous les clients que l'apporteur d'affaires apportera en raison de son action personnelle. La clientèle propre que possède déjà le donneur d'ordre est exclue du champ contractuel.</p>
      <p>L'apporteur d'affaires n'aura pas le pouvoir de négocier et/ou conclure les opérations commerciales auprès des clients potentiels pour le compte du donneur d'ordre. Il pourra le faire ponctuellement, en qualité de mandataire du donneur d'ordre, uniquement sur la base d'un accord écrit préalable et séparé, définissant notamment les conditions de sa rémunération.</p>
    </div>

    <div className="space-y-2">
      <h3 className="font-bold text-foreground">ARTICLE 2. TERRITOIRE</h3>
      <p>L'apporteur d'affaires exercera sa mission au sein du territoire géographique suivant : <strong>France ; Monde entier.</strong></p>
    </div>

    <div className="space-y-2">
      <h3 className="font-bold text-foreground">ARTICLE 3. DURÉE DU CONTRAT</h3>
      <p>Le contrat prend effet à compter de sa date de signature pour une durée indéterminée.</p>
      <p>Toutefois, en cas de résiliation unilatérale par le donneur d'ordre, ce dernier sera tenu d'honorer l'intégralité des commissions dues à l'apporteur d'affaires pour tous les clients apportés avant la date de résiliation.</p>
      <p>Cette obligation s'applique non seulement aux transactions conclues avant la résiliation, mais également à toutes celles réalisées postérieurement avec les clients apportés, et ce, jusqu'au terme des contrats conclus entre le donneur d'ordre et ces clients, y compris en cas de renouvellement tacite ou exprès.</p>
      <p>Le donneur d'ordre s'engage à communiquer à l'apporteur d'affaires, sur simple demande, les contrats signés avec les clients apportés ainsi que tout avenant les prolongeant afin de garantir la transparence dans le calcul des commissions dues.</p>
      <p>En cas de manquement à cette obligation, l'apporteur d'affaires pourra exiger le paiement immédiat de l'ensemble des commissions qu'il aurait perçues si le contrat était resté en vigueur, conformément aux dispositions de l'article 4.a.</p>
    </div>

    <div className="space-y-2">
      <h3 className="font-bold text-foreground">ARTICLE 4. OBLIGATIONS DES PARTIES</h3>
      <p className="font-semibold">Donneur d'ordre</p>
      <p>Le donneur d'ordre exécutera toutes les obligations de vente ou de prestation de service qu'il aura contractées avec les clients apportés, conformément à ses conditions générales telles qu'elles auront été transmises à l'apporteur d'affaires, en particulier en ce qui concerne les tarifs, les délais et les conditions de paiement.</p>
      <p>Le donneur d'ordre exécutera ses obligations envers les clients apportés avec diligence et bonne foi.</p>
      <p>Le donneur d'ordre s'engage également à :</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>rémunérer l'apporteur d'affaires conformément aux dispositions contractuelles définies dans l'Article 7.</li>
        <li>communiquer systématiquement et sans délai à l'apporteur d'affaires : les contrats signés avec les clients apportés, y compris leurs avenants et éventuelles prolongations ; les factures émises à ces clients, afin de garantir la transparence dans le calcul et le paiement des commissions dues.</li>
        <li>ne pas contourner l'apporteur d'affaires : le donneur d'ordre s'interdit de conclure directement avec un client apporté par l'apporteur d'affaires sans en informer ce dernier et sans lui verser les commissions dues.</li>
        <li>tenir un registre à jour des transactions réalisées avec les clients apportés et permettre à l'apporteur d'affaires d'y accéder sur simple demande.</li>
      </ul>
      <p>En cas de manquement à l'une de ces obligations, l'apporteur d'affaires pourra exiger le paiement immédiat de l'intégralité des commissions dues, sur la base du chiffre d'affaires réalisé avec les clients apportés lors des 12 derniers mois, majoré de 20% à titre de clause pénale.</p>

      <p className="font-semibold mt-4">Apporteur d'affaires</p>
      <p>L'apporteur d'affaires s'engage à apporter au donneur d'ordre toutes les informations et conseils nécessaires à la conclusion des transactions avec les clients apportés.</p>
      <p>Sauf dans le cadre d'une mission spécifique formalisée dans un accord écrit préalable, il ne pourra réceptionner des fonds au nom et pour le compte du donneur d'ordre.</p>
      <p>L'apporteur d'affaires déterminera ses méthodes de travail de façon autonome et sans aucun lien quelconque de subordination avec la société. Il assurera les risques inhérents à son activité personnelle.</p>
      <p>L'apporteur d'affaires devra veiller à donner une bonne image du donneur d'ordre auprès du public et des clients démarchés.</p>
    </div>

    <div className="space-y-2">
      <h3 className="font-bold text-foreground">ARTICLE 5. OBLIGATION D'INFORMATION</h3>
      <p>L'apporteur d'affaires s'engage à informer par écrit le donneur d'ordres sous les plus brefs délais pour chaque nouveau client manifestant son intérêt pour les produits ou services visés par le présent contrat.</p>
    </div>

    <div className="space-y-2">
      <h3 className="font-bold text-foreground">ARTICLE 6. SOLVABILITÉ DES CLIENTS</h3>
      <p>L'apporteur d'affaires ne garantit en aucun cas au donneur d'ordre la solvabilité des clients apportés.</p>
      <p>L'apporteur d'affaires ne garantit pas non plus la conclusion d'accords commerciaux entre le donneur d'ordre et les clients apportés ou la bonne exécution des contrats conclus par les clients apportés.</p>
      <p>L'apporteur d'affaires s'engage toutefois à sélectionner des clients dont les qualités d'honorabilité et de solvabilité ne sont pas contestables. Il devra porter à la connaissance du donneur d'ordre toute information qu'il détient relative à l'identité, la solvabilité ou encore le sérieux des clients apportés.</p>
    </div>

    <div className="space-y-2">
      <h3 className="font-bold text-foreground">ARTICLE 7. RÉMUNÉRATION DE L'APPORTEUR D'AFFAIRES</h3>
      <p>En contrepartie de ses services l'apporteur d'affaires recevra une commission (ci-après, « la commission ») versée dans les conditions définies ci-après.</p>
      <p className="font-semibold">Montant de la commission</p>
      <p>L'apporteur d'affaires recevra pour ses services une commission correspondant à 10% du montant hors taxe de chaque transaction réalisée entre le donneur d'ordre et un client apporté.</p>
      <p>Cette commission sera versée pour chaque transaction réalisée entre le donneur d'ordre et le client apporté.</p>
      <p className="font-semibold">Modalités de paiement de la rémunération</p>
      <p>La commission sera due à l'apporteur d'affaires à compter de l'encaissement par le donneur d'ordre de la totalité des sommes dues par le client apporté.</p>
      <p>L'apporteur d'affaires recevra le double de chaque facture émise au client par le donneur d'ordre. Les commissions seront alors facturées sur la base de ces factures et du pourcentage susmentionné.</p>
      <p>Le paiement de sommes dues devra être effectué par le donneur d'ordre à la réception de chaque facture émise par l'apporteur d'affaires.</p>
      <p>En cas de retard de paiement des commissions, des pénalités de retard équivalentes à 3 fois le taux d'intérêt légal s'appliqueront, ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40 euros par facture impayée.</p>
    </div>

    <div className="space-y-2">
      <h3 className="font-bold text-foreground">ARTICLE 8. INCESSIBILITÉ DU CONTRAT</h3>
      <p>Le contrat est conclu intuitu personae, et ne pourra par conséquent ni être transféré ou cédé, pas plus que les droits et obligations qui y figurent, par l'une ou l'autre des parties sans l'accord de l'autre partie.</p>
    </div>

    <div className="space-y-2">
      <h3 className="font-bold text-foreground">ARTICLE 9. ASSURANCES</h3>
      <p>L'apporteur d'affaires garantit qu'il dispose d'une police d'assurance garantissant sa responsabilité civile professionnelle et qui couvre toutes les obligations et les activités qui découlent du présent contrat. Il s'engage à maintenir cette police d'assurance pour la durée du contrat et à fournir au donneur d'ordre une attestation sur demande.</p>
      <p>Toute modification, suspension ou résiliation de la police d'assurance devra être signalée au donneur d'ordre sans délai.</p>
    </div>

    <div className="space-y-2">
      <h3 className="font-bold text-foreground">ARTICLE 10. INDÉPENDANCE</h3>
      <p>Les parties certifient qu'elles restent des partenaires commerciaux et professionnels indépendants l'un de l'autre.</p>
      <p>L'apporteur d'affaires agit en qualité de professionnel autonome, sans lien de subordination avec le donneur d'ordre. Il demeure libre d'organiser son activité comme il l'entend, sans que le donneur d'ordre ne puisse lui imposer d'instructions ou de directives dans l'exécution de sa mission.</p>
    </div>

    <div className="space-y-2">
      <h3 className="font-bold text-foreground">ARTICLE 11. PROPRIÉTÉ INTELLECTUELLE</h3>
      <p>Le donneur d'ordre autorise expressément et à titre gratuit l'apporteur d'affaires à utiliser les marques et signes distinctifs des produits et services dont il est chargé d'assurer la promotion au titre du présent contrat.</p>
      <p>Ce droit est strictement limité à la durée du contrat et aux besoins de son exécution.</p>
      <p>À la résiliation du contrat, l'apporteur d'affaires s'engage à cesser immédiatement tout usage des éléments de propriété intellectuelle du donneur d'ordre, sauf accord exprès écrit autorisant une utilisation prolongée.</p>
      <p>Le donneur d'ordre garantit que les éléments de propriété intellectuelle mis à disposition ne portent pas atteinte aux droits de tiers. Il garantit également l'apporteur d'affaires contre toute réclamation ou action intentée par un tiers en raison de l'usage desdits éléments dans le cadre du présent contrat.</p>
    </div>

    <div className="space-y-2">
      <h3 className="font-bold text-foreground">ARTICLE 12. CONFIDENTIALITÉ</h3>
      <p>Chaque partie s'engage pendant le contrat et pour une durée d'un an après son terme, à traiter comme confidentielle toute information révélée par l'autre partie et identifiée comme telle en raison de sa nature ou de ses modalités de communication.</p>
      <p>Le récepteur de l'information confidentielle s'engage à :</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Ne pas la divulguer à des tiers, directement ou indirectement, sans l'accord écrit préalable de l'autre partie.</li>
        <li>L'utiliser exclusivement pour l'exécution du présent contrat.</li>
        <li>Prendre toutes les mesures nécessaires pour assurer sa protection et éviter tout accès non autorisé.</li>
      </ul>
      <p>L'obligation de confidentialité ne s'applique pas aux informations :</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Déjà connues du récepteur avant leur divulgation.</li>
        <li>Tombées dans le domaine public sans faute du récepteur.</li>
        <li>Légitimement obtenues d'un tiers non soumis à une obligation de confidentialité.</li>
        <li>Dont la divulgation est requise par la loi ou une autorité judiciaire.</li>
      </ul>
      <p>En cas de violation, la partie lésée pourra demander des dommages et intérêts, sans préjudice des autres recours légaux à sa disposition.</p>
    </div>

    <div className="space-y-2">
      <h3 className="font-bold text-foreground">ARTICLE 13. RÉSILIATION ANTICIPÉE</h3>
      <p>Les parties peuvent décider de rompre le contrat unilatéralement en cas d'inexécution fautive ou de non-exécution de l'autre partie d'une de ses obligations figurant au contrat.</p>
      <p>En cas d'inexécution, la partie lésée envoie une mise en demeure d'exécuter à l'autre partie, par lettre recommandée avec accusé de réception. A peine de nullité, la mise en demeure devra mentionner la présente clause résolutoire. En cas d'inaction de la partie défaillante pendant un mois à compter de la réception de la lettre, le contrat est résilié de plein droit. Lorsque l'inexécution constitue une faute grave, la partie défaillante n'aura droit à aucune indemnité de rupture.</p>
      <p className="font-semibold">Obligations post-résiliation :</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>La résiliation ne dispense pas le donneur d'ordre de son obligation de paiement des commissions dues à l'apporteur d'affaires conformément à l'Article 3.</li>
        <li>L'apporteur d'affaires conservera son droit à percevoir ses commissions sur toutes les transactions conclues avec les clients apportés jusqu'au terme des contrats en cours, y compris en cas de renouvellement tacite ou exprès de ces contrats.</li>
        <li>Le donneur d'ordre s'engage à transmettre à l'apporteur d'affaires, sous 15 jours après la résiliation, l'ensemble des documents justificatifs permettant de garantir la transparence des commissions à percevoir.</li>
        <li>À défaut de transmission des documents requis ou en cas de non-paiement des commissions, l'apporteur d'affaires pourra exiger le paiement immédiat et intégral des commissions qu'il aurait perçues si le contrat était resté en vigueur, calculé sur la base du chiffre d'affaires réalisé avec les clients apportés lors des 12 derniers mois précédant la résiliation, majoré de 20% à titre de clause pénale.</li>
      </ul>
      <p>Par ailleurs, le contrat sera résilié de plein droit en cas de liquidation judiciaire de l'une ou l'autre des parties. Toutefois, l'apporteur d'affaires conservera son droit à percevoir toutes les commissions dues sur les contrats déjà conclus avant la liquidation.</p>
    </div>

    <div className="space-y-2">
      <h3 className="font-bold text-foreground">ARTICLE 14. MODIFICATIONS</h3>
      <p>Le présent contrat remplace et annule tout accord antérieur, écrit ou oral, entre les parties et contient l'entier accord entre elles. Tout autre document concernant l'objet et les obligations du présent contrat, non annexé, n'oblige pas les parties.</p>
      <p>Aucune modification, résiliation ou préavis relatif au présent contrat ne sera valable s'il n'a pas été donné par écrit et signé par les parties.</p>
      <p>Toute modification du présent contrat devra faire l'objet d'un avenant signé par les parties.</p>
    </div>

    <div className="space-y-2">
      <h3 className="font-bold text-foreground">ARTICLE 15. INVALIDITÉ PARTIELLE</h3>
      <p>Si l'une des clauses du présent contrat est ou devient non valable eu égard du droit applicable ou d'une décision de justice devenue définitive, elle sera réputée non écrite. Toutefois, les autres dispositions du présent contrat conservent toute leur force et leur portée.</p>
      <p>Les parties devront, de bonne foi, procéder au remplacement de la clause réputée non écrite, par une autre clause valide et dont le sens est le plus proche de l'intention originale des parties.</p>
    </div>

    <div className="space-y-2">
      <h3 className="font-bold text-foreground">ARTICLE 16. DONNÉES À CARACTÈRE PERSONNEL</h3>
      <p>Chaque partie s'engage à respecter les lois en vigueur sur la protection des données personnelles, notamment la Loi Informatique et Libertés et le RGPD (Règlement UE 2016/679).</p>
      <p>Les parties sont chacune responsables des traitements effectués sur leur propre périmètre. L'apporteur d'affaires est responsable des données jusqu'à leur transmission au donneur d'ordre, qui devient alors responsable de leur traitement.</p>
    </div>

    <div className="space-y-2">
      <h3 className="font-bold text-foreground">ARTICLE 17. LOI APPLICABLE ET JURIDICTION</h3>
      <p>Le présent contrat est régi par le droit français.</p>
      <p>En cas de litige, les parties tenteront une résolution amiable. À défaut d'accord sous 30 jours, les tribunaux compétents seront ceux du lieu du siège social de l'apporteur d'affaires, y compris en cas de pluralité de défendeurs ou d'appel en garantie.</p>
    </div>

    <div className="mt-8 pt-4 border-t border-border/50">
      <p className="text-center font-semibold">Fait à Paris, en 2 exemplaires.</p>
      <div className="grid grid-cols-2 gap-8 mt-6">
        <div className="text-center">
          <p className="font-semibold text-muted-foreground">LE DONNEUR D'ORDRE</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-muted-foreground">L'APPORTEUR D'AFFAIRES</p>
        </div>
      </div>
    </div>
  </div>
);

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
          <Link to="/" className="font-display text-xl font-bold text-gradient">DealFlowNetwork</Link>
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
