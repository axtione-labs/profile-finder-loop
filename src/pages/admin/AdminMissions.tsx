import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMissions, useCreateMission, useCreateCommission, useUpdateMission, useDeleteMission } from "@/hooks/useMissions";
import { useLeads } from "@/hooks/useLeads";
import { useCandidates, useUpdateCandidate } from "@/hooks/useCandidates";
import { useProfiles } from "@/hooks/useProfiles";

const missionStatuses = ["Déclaré", "Qualifié", "En sourcing", "Profil trouvé", "Envoyé client", "Perdu", "Gagné"];

const missionStatusColor: Record<string, string> = {
  "Déclaré": "bg-warning/15 text-warning",
  "Qualifié": "bg-primary/15 text-primary",
  "En sourcing": "bg-primary/15 text-primary",
  "Profil trouvé": "bg-success/15 text-success",
  "Envoyé client": "bg-primary/15 text-primary",
  "Perdu": "bg-destructive/15 text-destructive",
  "Gagné": "bg-success/15 text-success",
  "En cours": "bg-primary/15 text-primary",
};

const AdminMissions = () => {
  const { data: missions = [], isLoading: missionsLoading } = useMissions();
  const { data: leads = [] } = useLeads();
  const { data: candidates = [] } = useCandidates();
  const { data: profiles = [] } = useProfiles();
  const updateMission = useUpdateMission();
  const createMission = useCreateMission();
  const createCommission = useCreateCommission();
  const deleteMission = useDeleteMission();
  const updateCandidate = useUpdateCandidate();

  const [missionOpen, setMissionOpen] = useState(false);
  const [newMission, setNewMission] = useState({ lead_id: "", candidate_id: "", duration: "", tjm_client: "", commission_apporteur: "" });

  const [editOpen, setEditOpen] = useState(false);
  const [editMission, setEditMission] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const getApporteurName = (userId: string) => {
    const p = profiles.find(pr => pr.user_id === userId);
    return p ? `${p.first_name} ${p.last_name}` : "—";
  };

  const [statusConfirm, setStatusConfirm] = useState<{ id: string; status: string } | null>(null);

  const handleUpdateMissionStatus = (id: string, status: string) => {
    setStatusConfirm({ id, status });
  };

  const confirmStatusUpdate = () => {
    if (!statusConfirm) return;
    const mission = missions.find(m => m.id === statusConfirm.id);
    updateMission.mutate({ id: statusConfirm.id, status: statusConfirm.status }, {
      onSuccess: () => {
        toast.success(`Mission : ${statusConfirm.status}`);
        // Sync lead status with mission status
        if (mission?.lead_id) {
          supabase
            .from("leads" as any)
            .update({ status: statusConfirm.status } as any)
            .eq("id", mission.lead_id)
            .then(({ error }: any) => {
              if (!error) toast.success("Statut du besoin synchronisé");
            });
        }
      },
    });
    setStatusConfirm(null);
  };

  // All leads except closed ones can be assigned to a mission
  const eligibleLeads = leads.filter(l => l.status !== "Perdu" && l.status !== "Gagné");
  
  // Only candidates NOT already placed
  const availableCandidates = candidates.filter(c => 
    !c.status.startsWith("Placé chez") && c.status !== "Indisponible"
  );

  // Pre-fill TJM client and commission when lead is selected
  useEffect(() => {
    if (newMission.lead_id) {
      const lead = leads.find(l => l.id === newMission.lead_id);
      if (lead) {
        const tjm = lead.tjm;
        const marginPercent = lead.margin || 5;
        const commission = Math.round(tjm * marginPercent / 100);
        setNewMission(p => ({
          ...p,
          tjm_client: p.tjm_client || String(tjm),
          commission_apporteur: String(commission),
        }));
      }
    }
  }, [newMission.lead_id]);

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
      status: "Envoyé client",
      start_date: new Date().toISOString(),
    });

    if (mission?.id) {
      // Create commission
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

      // Update candidate status to "Placé chez [client]"
      updateCandidate.mutate({
        id: candidate.id,
        status: `Placé chez ${lead.client}`,
      });
    }

    setMissionOpen(false);
    setNewMission({ lead_id: "", candidate_id: "", duration: "", tjm_client: "", commission_apporteur: "" });
  };

  const openEdit = (m: any) => {
    setEditMission({ ...m });
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editMission) return;
    const { id, created_at, updated_at, ...updates } = editMission;
    updateMission.mutate({ id, ...updates }, {
      onSuccess: () => {
        toast.success("Mission mise à jour");
        setEditOpen(false);
      },
    });
  };

  const handleDelete = (id: string) => {
    // Free the candidate
    const mission = missions.find(m => m.id === id);
    if (mission) {
      updateCandidate.mutate({ id: mission.candidate_id, status: "Disponible" });
    }
    deleteMission.mutate(id, {
      onSuccess: () => {
        toast.success("Mission supprimée");
        setDeleteConfirm(null);
      },
    });
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
                  <Select value={newMission.lead_id} onValueChange={v => {
                    const lead = leads.find(l => l.id === v);
                    const marginPercent = lead?.margin || 5;
                    const commission = lead ? Math.round(lead.tjm * marginPercent / 100) : "";
                    setNewMission(p => ({ ...p, lead_id: v, tjm_client: lead ? String(lead.tjm) : "", commission_apporteur: String(commission) }));
                  }}>
                    <SelectTrigger className="mt-1.5 bg-background/50"><SelectValue placeholder="Sélectionner un besoin" /></SelectTrigger>
                    <SelectContent>
                      {eligibleLeads.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">Aucun besoin disponible</div>
                      ) : (
                        eligibleLeads.map(l => <SelectItem key={l.id} value={l.id}>{l.position} — {l.client} ({l.status}, TJM: {l.tjm}€)</SelectItem>)
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Candidat (disponible uniquement)</Label>
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
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missions.map((m) => {
                      const statusBadgeColor = missionStatusColor[m.status] || "bg-secondary text-muted-foreground";
                      return (
                        <tr key={m.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                          <td className="px-4 py-3 font-medium">{m.consultant_name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{m.client}</td>
                          <td className="px-4 py-3 text-muted-foreground">{getApporteurName(m.apporteur_id)}</td>
                          <td className="px-4 py-3 font-medium">{m.tjm}€</td>
                          <td className="px-4 py-3 font-medium">{m.tjm_client}€</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeColor}`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openEdit(m)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(m.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Mission Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier la mission</DialogTitle>
          </DialogHeader>
          {editMission && (
            <div className="space-y-4">
              <div>
                <Label>Consultant</Label>
                <Input value={editMission.consultant_name} onChange={e => setEditMission((m: any) => ({ ...m, consultant_name: e.target.value }))} />
              </div>
              <div>
                <Label>Client</Label>
                <Input value={editMission.client} onChange={e => setEditMission((m: any) => ({ ...m, client: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>TJM candidat (€)</Label>
                  <Input type="number" value={editMission.tjm} onChange={e => setEditMission((m: any) => ({ ...m, tjm: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <Label>TJM client (€)</Label>
                  <Input type="number" value={editMission.tjm_client} onChange={e => setEditMission((m: any) => ({ ...m, tjm_client: parseFloat(e.target.value) || 0 }))} />
                </div>
              </div>
              <div>
                <Label>Durée</Label>
                <Input value={editMission.duration} onChange={e => setEditMission((m: any) => ({ ...m, duration: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditOpen(false)}>Annuler</Button>
                <Button onClick={handleSaveEdit}>Enregistrer</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette mission ?</AlertDialogTitle>
            <AlertDialogDescription>
              La mission sera supprimée et le candidat sera libéré. Les commissions associées seront conservées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Confirmation */}
      <AlertDialog open={!!statusConfirm} onOpenChange={(open) => !open && setStatusConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Changer le statut ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le statut de la mission passera à « {statusConfirm?.status} ».
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusUpdate}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminMissions;
