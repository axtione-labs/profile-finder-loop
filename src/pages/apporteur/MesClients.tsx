import { useAuth } from "@/contexts/AuthContext";
import { useLeads } from "@/hooks/useLeads";
import ApporteurLayout from "@/components/apporteur/ApporteurLayout";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

const MesClients = () => {
  const { user } = useAuth();
  const { data: leads = [], isLoading } = useLeads();

  // Extract unique clients from leads belonging to this apporteur
  const myLeads = leads.filter((l) => l.user_id === user?.id);
  const clientsMap = new Map<string, { client: string; sector: string; location: string; leadsCount: number; latestStatus: string }>();

  myLeads.forEach((lead) => {
    const existing = clientsMap.get(lead.client);
    if (existing) {
      existing.leadsCount += 1;
      // Keep the most recent status
      if (new Date(lead.created_at) > new Date()) {
        existing.latestStatus = lead.status;
      }
    } else {
      clientsMap.set(lead.client, {
        client: lead.client,
        sector: lead.sector,
        location: lead.location,
        leadsCount: 1,
        latestStatus: lead.status,
      });
    }
  });

  const clients = Array.from(clientsMap.values());

  return (
    <ApporteurLayout title="Mes clients">
      <h1 className="mb-6 font-display text-2xl font-bold">Mes clients</h1>

      {isLoading ? (
        <div className="text-center text-muted-foreground">Chargement...</div>
      ) : clients.length === 0 ? (
        <div className="gradient-card rounded-xl border border-border/50 p-8 text-center">
          <Building2 className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Aucun client pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <div key={c.client} className="gradient-card rounded-xl border border-border/50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{c.client}</p>
                  <p className="text-xs text-muted-foreground">{c.sector}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{c.location}</span>
                <Badge variant="outline">{c.leadsCount} besoin{c.leadsCount > 1 ? "s" : ""}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </ApporteurLayout>
  );
};

export default MesClients;
