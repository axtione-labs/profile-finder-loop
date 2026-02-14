import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { FileText, Users, Handshake, Coins, Clock } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { useCandidates } from "@/hooks/useCandidates";
import { useMissions, useCommissions } from "@/hooks/useMissions";
import { useProfiles } from "@/hooks/useProfiles";

const statusColor: Record<string, string> = {
  "Déclaré": "bg-warning/15 text-warning",
  "À qualifier": "bg-warning/15 text-warning",
  "Qualifié": "bg-primary/15 text-primary",
  "En sourcing": "bg-primary/15 text-primary",
  "Profil trouvé": "bg-success/15 text-success",
  "Envoyé client": "bg-primary/15 text-primary",
  "Négociation": "bg-warning/15 text-warning",
  "Gagné": "bg-success/15 text-success",
  "Perdu": "bg-destructive/15 text-destructive",
};

const AdminOverview = () => {
  const { data: leads = [] } = useLeads();
  const { data: candidates = [] } = useCandidates();
  const { data: missions = [] } = useMissions();
  const { data: commissions = [] } = useCommissions();
  const { data: profiles = [] } = useProfiles();

  const activeLeads = leads.filter(l => !["Gagné", "Perdu"].includes(l.status));
  const inSourcing = leads.filter(l => l.status === "En sourcing");
  const activeMissions = missions.filter(m => m.status === "En cours");
  const totalPending = commissions.filter(c => c.status !== "Payée").reduce((s, c) => s + c.amount, 0);

  const getApporteurName = (userId: string) => {
    const p = profiles.find(pr => pr.user_id === userId);
    return p ? `${p.first_name} ${p.last_name}` : "—";
  };

  const cards = [
    { label: "Leads actifs", value: String(activeLeads.length), icon: FileText, change: `${leads.length} total` },
    { label: "En sourcing", value: String(inSourcing.length), icon: Users, change: `${candidates.length} candidats` },
    { label: "Missions en cours", value: String(activeMissions.length), icon: Handshake, change: `${missions.length} total` },
    { label: "Commissions à payer", value: `${totalPending.toLocaleString("fr-FR")}€`, icon: Coins, change: `${commissions.filter(c => c.status !== "Payée").length} en attente` },
  ];

  const recentLeads = leads.slice(0, 8);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl font-bold">Vue d'ensemble</h1>
          <p className="text-sm text-muted-foreground">Tableau de bord administrateur</p>
        </div>

        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {cards.map((card) => (
            <div key={card.label} className="gradient-card rounded-xl border border-border/50 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 font-display text-2xl font-bold">{card.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{card.change}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="mb-4 font-display text-lg font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Derniers besoins
          </h2>
          {recentLeads.length === 0 ? (
            <div className="gradient-card rounded-xl border border-border/50 p-8 text-center text-muted-foreground">
              Aucun lead pour le moment.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Apporteur</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Poste</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Priorité</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{getApporteurName(lead.user_id)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{lead.client}</td>
                      <td className="px-4 py-3">{lead.position}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[lead.status] || ""}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {lead.priority === "urgent" ? (
                          <span className="text-xs font-medium text-destructive">🔴 Urgent</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Normal</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(lead.created_at).toLocaleDateString("fr-FR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
