import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TrendingUp, Plus } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMissions, useCommissions, useUpdateCommission, useCreateMission, useCreateCommission } from "@/hooks/useMissions";
import { useLeads } from "@/hooks/useLeads";
import { useCandidates } from "@/hooks/useCandidates";
import { useProfiles } from "@/hooks/useProfiles";

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
  const { data: missions = [], isLoading: missionsLoading } = useMissions();
  const { data: commissions = [], isLoading: commissionsLoading } = useCommissions();
  const { data: leads = [] } = useLeads();
  const { data: candidates = [] } = useCandidates();
  const { data: profiles = [] } = useProfiles();
  const updateCommission = useUpdateCommission();
  const createMission = useCreateMission();
  const createCommission = useCreateCommission();

  const [missionOpen, setMissionOpen] = useState(false);
  const [newMission, setNewMission] = useState({ lead_id: "", candidate_id: "", duration: "", percentage: "10" });

  const getApporteurName = (userId: string) => {
    const p = profiles.find(pr => pr.user_id === userId);
    return p ? `${p.first_name} ${p.last_name}` : "—";
  };

  const handleUpdateCommissionStatus = (id: string, status: string) => {
    updateCommission.mutate({ id, status }, {
      onSuccess: () => toast.success(`Commission : ${status}`),
    });
  };

  const wonLeads = leads.filter(l => l.status === "Gagné");
  const retainedCandidates = candidates.filter(c => c.status === "Retenu");

  const selectedLead = leads.find(l => l.id === newMission.lead_id);
  const leadCandidates = retainedCandidates.filter(c => c.lead_id === newMission.lead_id);

  const handleCreateMission = () => {
    if (!newMission.lead_id || !newMission.candidate_id) return;
    const lead = leads.find(l => l.id === newMission.lead_id);
    const candidate = candidates.find(c => c.id === newMission.candidate_id);
    if (!lead || !candidate) return;

    createMission.mutate({
      lead_id: lead.id,
      candidate_id: candidate.id,
      client: lead.client,
      consultant_name: candidate.name,
      apporteur_id: lead.user_id,
      tjm: candidate.tjm,
      duration: newMission.duration || lead.duration,
      status: "En cours",
      start_date: new Date().toISOString(),
    }, {
      onSuccess: () => {
        // Also create commission
        const pct = parseFloat(newMission.percentage) || 10;
        const durationMonths = parseInt(newMission.duration) || 6;
        const amount = candidate.tjm * 22 * durationMonths * (pct / 100);
        createCommission.mutate({
          mission_id: "", // will be set after
          apporteur_id: lead.user_id,
          percentage: pct,
          amount: Math.round(amount),
          status: "À générer",
        });
        setMissionOpen(false);
        setNewMission({ lead_id: "", candidate_id: "", duration: "", percentage: "10" });
      },
    });
  };

  const totalCommissions = commissions.reduce((sum, c) => sum + c.amount, 0);
  const paidCommissions = commissions.filter(c => c.status === "Payée").reduce((sum, c) => sum + c.amount, 0);
  const pendingCommissions = totalCommissions - paidCommissions;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Missions & Commissions</h1>
            <p className="text-sm text-muted-foreground">Suivi commercial et financier</p>
          </div>
          <Dialog open={missionOpen} onOpenChange={setMissionOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary border-0">
                <Plus className="mr-2 h-4 w-4" /> Créer une mission
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Nouvelle mission</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Lead gagné</Label>
                  <Select value={newMission.lead_id} onValueChange={v => setNewMission(p => ({ ...p, lead_id: v, candidate_id: "" }))}>
                    <SelectTrigger className="mt-1.5 bg-background/50"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {wonLeads.map(l => <SelectItem key={l.id} value={l.id}>{l.position} — {l.client}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {newMission.lead_id && (
                  <div>
                    <Label>Consultant retenu</Label>
                    <Select value={newMission.candidate_id} onValueChange={v => setNewMission(p => ({ ...p, candidate_id: v }))}>
                      <SelectTrigger className="mt-1.5 bg-background/50"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        {leadCandidates.map(c => <SelectItem key={c.id} value={c.id}>{c.name} — {c.tjm}€</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Durée (mois)</Label>
                    <Input className="mt-1.5 bg-background/50" type="number" value={newMission.duration} onChange={e => setNewMission(p => ({ ...p, duration: e.target.value }))} placeholder="6" />
                  </div>
                  <div>
                    <Label>Commission (%)</Label>
                    <Input className="mt-1.5 bg-background/50" type="number" value={newMission.percentage} onChange={e => setNewMission(p => ({ ...p, percentage: e.target.value }))} placeholder="10" />
                  </div>
                </div>
                <Button onClick={handleCreateMission} disabled={createMission.isPending} className="gradient-primary border-0 w-full">
                  {createMission.isPending ? "Création..." : "Créer"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
            <div className="mt-2 font-display text-2xl font-bold text-gradient">{totalCommissions.toLocaleString("fr-FR")} €</div>
          </div>
          <div className="gradient-card rounded-xl border border-border/50 p-5">
            <div className="text-sm text-muted-foreground">En attente</div>
            <div className="mt-2 font-display text-2xl font-bold text-warning">{pendingCommissions.toLocaleString("fr-FR")} €</div>
          </div>
          <div className="gradient-card rounded-xl border border-border/50 p-5">
            <div className="text-sm text-muted-foreground">Payées</div>
            <div className="mt-2 font-display text-2xl font-bold text-success">{paidCommissions.toLocaleString("fr-FR")} €</div>
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
              {missionsLoading ? (
                <div className="py-12 text-center text-muted-foreground">Chargement...</div>
              ) : missions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">Aucune mission pour le moment.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-secondary/30">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Consultant</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Apporteur</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">TJM</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Durée</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missions.map((m) => (
                      <tr key={m.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3 font-medium">{m.consultant_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{m.client}</td>
                        <td className="px-4 py-3 text-muted-foreground">{getApporteurName(m.apporteur_id)}</td>
                        <td className="px-4 py-3 font-medium">{m.tjm}€</td>
                        <td className="px-4 py-3 text-muted-foreground">{m.duration}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${missionStatusColor[m.status] || ""}`}>
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="commissions">
            <motion.div
              className="mt-4 overflow-x-auto rounded-xl border border-border/50"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {commissionsLoading ? (
                <div className="py-12 text-center text-muted-foreground">Chargement...</div>
              ) : commissions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">Aucune commission pour le moment.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-secondary/30">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Apporteur</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">%</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Montant</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut paiement</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((c) => (
                      <tr key={c.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{getApporteurName(c.apporteur_id)}</td>
                        <td className="px-4 py-3">{c.percentage}%</td>
                        <td className="px-4 py-3 font-semibold text-gradient">{c.amount.toLocaleString("fr-FR")}€</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${commStatusColor[c.status] || ""}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Select value={c.status} onValueChange={(v) => handleUpdateCommissionStatus(c.id, v)}>
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
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminMissions;
