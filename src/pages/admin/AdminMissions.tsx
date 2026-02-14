import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Handshake, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Mission {
  id: number;
  lead: string;
  client: string;
  consultant: string;
  apporteur: string;
  tjm: string;
  duration: string;
  status: "En cours" | "Terminée" | "Annulée";
  commissionPct: string;
  commissionAmount: string;
  commissionStatus: "À générer" | "Générée" | "Payée";
}

const mockMissions: Mission[] = [
  { id: 1, lead: "DevOps Senior", client: "Société Générale", consultant: "Thomas Girard", apporteur: "Marie Martin", tjm: "650€", duration: "12 mois", status: "En cours", commissionPct: "10%", commissionAmount: "17 160€", commissionStatus: "Générée" },
  { id: 2, lead: "Architecte Cloud", client: "AXA", consultant: "Nadia Bouzid", apporteur: "Sophie Bernard", tjm: "780€", duration: "6 mois", status: "En cours", commissionPct: "12%", commissionAmount: "12 355€", commissionStatus: "À générer" },
  { id: 3, lead: "Fullstack JS", client: "Engie", consultant: "Paul Remy", apporteur: "Jean Dupont", tjm: "550€", duration: "4 mois", status: "Terminée", commissionPct: "10%", commissionAmount: "4 620€", commissionStatus: "Payée" },
];

const missionStatusColor: Record<string, string> = {
  "En cours": "bg-primary/15 text-primary",
  "Terminée": "bg-success/15 text-success",
  "Annulée": "bg-destructive/15 text-destructive",
};

const commStatusColor: Record<string, string> = {
  "À générer": "bg-warning/15 text-warning",
  "Générée": "bg-primary/15 text-primary",
  "Payée": "bg-success/15 text-success",
};

const AdminMissions = () => {
  const [missions, setMissions] = useState(mockMissions);

  const updateCommissionStatus = (id: number, status: Mission["commissionStatus"]) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, commissionStatus: status } : m));
    toast.success(`Commission : ${status}`);
  };

  const totalCommissions = missions.reduce((sum, m) => sum + parseFloat(m.commissionAmount.replace(/[^\d]/g, "")), 0);
  const paidCommissions = missions.filter(m => m.commissionStatus === "Payée").reduce((sum, m) => sum + parseFloat(m.commissionAmount.replace(/[^\d]/g, "")), 0);
  const pendingCommissions = totalCommissions - paidCommissions;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Missions & Commissions</h1>
          <p className="text-sm text-muted-foreground">Suivi commercial et financier</p>
        </div>

        <motion.div
          className="grid gap-4 sm:grid-cols-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="gradient-card rounded-xl border border-border/50 p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" /> Total commissions
            </div>
            <div className="mt-2 font-display text-2xl font-bold text-gradient">{(totalCommissions).toLocaleString("fr-FR")} €</div>
          </div>
          <div className="gradient-card rounded-xl border border-border/50 p-5">
            <div className="text-sm text-muted-foreground">En attente</div>
            <div className="mt-2 font-display text-2xl font-bold text-warning">{(pendingCommissions).toLocaleString("fr-FR")} €</div>
          </div>
          <div className="gradient-card rounded-xl border border-border/50 p-5">
            <div className="text-sm text-muted-foreground">Payées</div>
            <div className="mt-2 font-display text-2xl font-bold text-success">{(paidCommissions).toLocaleString("fr-FR")} €</div>
          </div>
        </motion.div>

        <Tabs defaultValue="missions">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="missions">Missions</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
          </TabsList>

          <TabsContent value="missions">
            <motion.div
              className="mt-4 overflow-x-auto rounded-xl border border-border/50"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Mission</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Consultant</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Apporteur</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">TJM</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Durée</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {missions.map((m) => (
                    <tr key={m.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{m.lead}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.client}</td>
                      <td className="px-4 py-3">{m.consultant}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.apporteur}</td>
                      <td className="px-4 py-3 font-medium">{m.tjm}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.duration}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${missionStatusColor[m.status]}`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </TabsContent>

          <TabsContent value="commissions">
            <motion.div
              className="mt-4 overflow-x-auto rounded-xl border border-border/50"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Mission</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Apporteur</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">%</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Montant</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut paiement</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {missions.map((m) => (
                    <tr key={m.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{m.lead} — {m.client}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.apporteur}</td>
                      <td className="px-4 py-3">{m.commissionPct}</td>
                      <td className="px-4 py-3 font-semibold text-gradient">{m.commissionAmount}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${commStatusColor[m.commissionStatus]}`}>
                          {m.commissionStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Select value={m.commissionStatus} onValueChange={(v) => updateCommissionStatus(m.id, v as Mission["commissionStatus"])}>
                          <SelectTrigger className="h-7 w-[120px] bg-background/50 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="À générer">À générer</SelectItem>
                            <SelectItem value="Générée">Générée</SelectItem>
                            <SelectItem value="Payée">Payée</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminMissions;
