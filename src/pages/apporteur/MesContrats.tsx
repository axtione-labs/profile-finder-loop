import { useAuth } from "@/contexts/AuthContext";
import { useContracts } from "@/hooks/useContracts";
import ApporteurLayout from "@/components/apporteur/ApporteurLayout";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const MesContrats = () => {
  const { user } = useAuth();
  const { data: contracts = [], isLoading } = useContracts();

  const myContracts = contracts.filter((c) => c.user_id === user?.id);

  return (
    <ApporteurLayout title="Mes contrats">
      <h1 className="mb-6 font-display text-2xl font-bold">Mes contrats</h1>

      {isLoading ? (
        <div className="text-center text-muted-foreground">Chargement...</div>
      ) : myContracts.length === 0 ? (
        <div className="gradient-card rounded-xl border border-border/50 p-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Aucun contrat pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myContracts.map((contract) => (
            <div key={contract.id} className="gradient-card rounded-xl border border-border/50 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Contrat #{contract.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      Signé le {format(new Date(contract.signed_at), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
                <Badge className="bg-success/10 text-success border-success/30 w-fit">
                  Signé
                </Badge>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <span>Type : {contract.signature_type === "draw" ? "Dessinée" : "Texte"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </ApporteurLayout>
  );
};

export default MesContrats;
