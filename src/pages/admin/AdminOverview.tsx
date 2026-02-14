import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { FileText, Users, Handshake, Coins, TrendingUp, Clock } from "lucide-react";

const cards = [
  { label: "Leads actifs", value: "24", icon: FileText, change: "+3 cette semaine" },
  { label: "En sourcing", value: "12", icon: Users, change: "5 urgents" },
  { label: "Missions en cours", value: "8", icon: Handshake, change: "+2 ce mois" },
  { label: "Commissions à payer", value: "18 400€", icon: Coins, change: "4 en attente" },
];

const recentLeads = [
  { id: 1, apporteur: "Jean Dupont", client: "BNP Paribas", position: "Tech Lead React", status: "À qualifier", priority: "urgent", date: "14/02/2026" },
  { id: 2, apporteur: "Marie Martin", client: "Société Générale", position: "DevOps Senior", status: "En sourcing", priority: "normal", date: "13/02/2026" },
  { id: 3, apporteur: "Pierre Durand", client: "Anonyme", position: "Data Engineer", status: "À qualifier", priority: "normal", date: "12/02/2026" },
  { id: 4, apporteur: "Sophie Bernard", client: "AXA", position: "Architecte Cloud", status: "Profil trouvé", priority: "urgent", date: "11/02/2026" },
];

const statusColor: Record<string, string> = {
  "À qualifier": "bg-warning/15 text-warning",
  "En sourcing": "bg-primary/15 text-primary",
  "Profil trouvé": "bg-success/15 text-success",
};

const AdminOverview = () => {
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
                    <td className="px-4 py-3 font-medium">{lead.apporteur}</td>
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
                    <td className="px-4 py-3 text-muted-foreground">{lead.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
