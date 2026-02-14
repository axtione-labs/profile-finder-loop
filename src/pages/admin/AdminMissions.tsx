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
import { useMissions, useCreateMission, useCreateCommission, useUpdateMission } from "@/hooks/useMissions";
import { useLeads } from "@/hooks/useLeads";
import { useCandidates } from "@/hooks/useCandidates";
import { useProfiles } from "@/hooks/useProfiles";

const missionStatuses = ["Validé apporteur", "Non validé apporteur", "CV envoyé client", "Perdu", "Gagné"];

const missionStatusColor: Record<string, string> = {
  "Validé apporteur": "bg-success/15 text-success",
  "Non validé apporteur": "bg-destructive/15 text-destructive",
  "CV envoyé client": "bg-primary/15 text-primary",
  "Perdu": "bg-destructive/15 text-destructive",
  "Gagné": "bg-success/15 text-success",
  "En cours": "bg-primary/15 text-primary",
};

const commStatusColor: Record<string, string> = {
  "À générer": "bg-warning/15 text-warning",
  "Générée": "bg-primary/15 text-primary",
  "Payée": "bg-success/15 text-success",
};

const AdminMissions = () => {
  const { data: missions = [], isLoading: missionsLoading } = useMissions();
  const { data: leads = [] } = useLeads();
  const { data: candidates = [] } = useCandidates();
  const { data: profiles = [] } = useProfiles();
  const updateMission = useUpdateMission();
  const createMission = useCreateMission();
  const createCommission = useCreateCommission();

  const [missionOpen, setMissionOpen] = useState(false);
  const [newMission, setNewMission] = useState({ lead_id: "", candidate_id: "", duration: "", tjm_client: "", commission_apporteur: "" });

  const getApporteurName = (userId: string) => {
    const p = profiles.find(pr => pr.user_id === userId);
    return p ? `${p.first_name} ${p.last_name}` : "—";
  };

  const handleUpdateMissionStatus = (id: string, status: string) => {
    updateMission.mutate({ id, status }, {
      onSuccess: () => toast.success(`Mission : ${status}`),
    });
  };

  // All leads that are qualified+ for mission assignment
  const eligibleLeads = leads.filter(l => !["Déclaré", "Perdu"].includes(l.status));
  // All candidates available
  const availableCandidates = candidates.filter(c => c.status === "Disponible" || c.status === "En process");

  const handleCreateMission = async () => {
    if (!newMission.lead_id || !newMission.candidate_id) return;
    const lead = leads.find(l => l.id === newMission.lead_id);
    const candidate = candidates.find(c => c.id === newMission.candidate_id);
    if (!lead || !candidate) return;

    const tjmClient = parseFloat(newMission.tjm_client) || lead.tjm;
    const commissionApporteur = parseFloat(newMission.commission_apporteur) || 0;
    const adminMargin = tjmClient - commissionApporteur - candidate.tjm;

    const mission = await createMission.mutateAsync({
      lead_id: lead.id,
      candidate_id: candidate.id,
      client: lead.client,
      consultant_name: `${candidate.first_name} ${candidate.last_name}`,
      apporteur_id: lead.user_id,
      tjm: candidate.tjm,
      tjm_client: tjmClient,
      duration: newMission.duration || lead.duration,
      status: "CV envoyé client",
      start_date: new Date().toISOString(),
    });

    if (mission?.id) {
      createCommission.mutate({
        mission_id: mission.id,
        apporteur_id: lead.user_id,
        percentage: 0,
        amount: commissionApporteur,
        admin_amount: Math.max(0, adminMargin),
        status: "À générer",
        days_worked: 0,
        commission_month: new Date().getMonth() + 1,
        commission_year: new Date().getFullYear(),
      });
    }

    setMissionOpen(false);
    setNewMission({ lead_id: "", candidate_id: "", duration: "", tjm_client: "", commission_apporteur: "" });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Missions</h1>
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
                  <Label>Besoin associé</Label>
                  <Select value={newMission.lead_id} onValueChange={v => setNewMission(p => ({ ...p, lead_id: v }))}>
                    <SelectTrigger className="mt-1.5 bg-background/50"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {eligibleLeads.map(l => <SelectItem key={l.id} value={l.id}>{l.position} — {l.client}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Candidat</Label>
                  <Select value={newMission.candidate_id} onValueChange={v => setNewMission(p => ({ ...p, candidate_id: v }))}>
                    <SelectTrigger className="mt-1.5 bg-background/50"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {availableCandidates.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name} — {c.tjm}€</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>TJM client final (€)</Label>
                    <Input className="mt-1.5 bg-background/50" type="number" value={newMission.tjm_client} onChange={e => setNewMission(p => ({ ...p, tjm_client: e.target.value }))} placeholder="600" />
                  </div>
                  <div>
                    <Label>Commission apporteur (€/j)</Label>
                    <Input className="mt-1.5 bg-background/50" type="number" value={newMission.commission_apporteur} onChange={e => setNewMission(p => ({ ...p, commission_apporteur: e.target.value }))} placeholder="50" />
                  </div>
                </div>
                <div>
                  <Label>Durée (mois)</Label>
                  <Input className="mt-1.5 bg-background/50" type="number" value={newMission.duration} onChange={e => setNewMission(p => ({ ...p, duration: e.target.value }))} placeholder="6" />
                </div>
                {newMission.tjm_client && newMission.commission_apporteur && newMission.candidate_id && (
                  <div className="rounded-lg bg-secondary/30 p-3 text-sm space-y-1">
                    <p>TJM candidat : <strong>{candidates.find(c => c.id === newMission.candidate_id)?.tjm || 0}€</strong></p>
                    <p>Commission apporteur : <strong>{newMission.commission_apporteur}€/j</strong></p>
                    <p>Marge admin : <strong>{(parseFloat(newMission.tjm_client) - parseFloat(newMission.commission_apporteur) - (candidates.find(c => c.id === newMission.candidate_id)?.tjm || 0)).toFixed(0)}€/j</strong></p>
                  </div>
                )}
                <Button onClick={handleCreateMission} disabled={createMission.isPending} className="gradient-primary border-0 w-full">
                  {createMission.isPending ? "Création..." : "Créer"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>



        <Tabs defaultValue="missions">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="missions">Missions</TabsTrigger>
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
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">TJM cand.</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">TJM client</th>
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
                        <td className="px-4 py-3 font-medium">{m.tjm_client}€</td>
                        <td className="px-4 py-3">
                          <Select value={m.status} onValueChange={(v) => handleUpdateMissionStatus(m.id, v)}>
                            <SelectTrigger className={`h-7 w-[170px] border text-xs font-medium ${missionStatusColor[m.status] || "bg-secondary"}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {missionStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
