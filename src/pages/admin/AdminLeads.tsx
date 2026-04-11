import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Eye, Trash2, Pencil, Check, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useLeads, useUpdateLead, type Lead } from "@/hooks/useLeads";
import { useMissions, useDeleteMission } from "@/hooks/useMissions";
import { useUpdateCandidate } from "@/hooks/useCandidates";
import { useProfiles, type Profile } from "@/hooks/useProfiles";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";

const marginStatusLabel = (status: string) => {
  switch (status) {
    case "accepted": return "✅ Acceptée";
    case "refused": return "❌ Refusée";
    case "adapted": return "🔄 Ajustée";
    default: return "⏳ En attente";
  }
};

const marginStatusColor: Record<string, string> = {
  pending: "bg-warning/15 text-warning border-warning/30",
  accepted: "bg-success/15 text-success border-success/30",
  refused: "bg-destructive/15 text-destructive border-destructive/30",
  adapted: "bg-primary/15 text-primary border-primary/30",
};

const sendMarginEmail = async (lead: Lead, marginStatus: string, adminMargin: number, profiles: Profile[]) => {
  const profile = profiles.find(p => p.user_id === lead.user_id);
  if (!profile) return;
  try {
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-margin-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        userId: lead.user_id,
        firstName: profile.first_name,
        position: lead.position,
        client: lead.client,
        marginStatus,
        requestedMargin: lead.margin,
        adminMargin,
      }),
    });
  } catch (e) {
    console.error("Failed to send margin email:", e);
  }
};

interface MarginCellProps {
  lead: Lead;
  profiles: Profile[];
  updateLead: ReturnType<typeof useUpdateLead>;
}

const MarginCell = ({ lead, profiles, updateLead }: MarginCellProps) => {
  const [adaptValue, setAdaptValue] = useState("");
  const [showAdapt, setShowAdapt] = useState(false);
  const status = (lead as any).margin_status || "pending";

  const handleMarginAction = (action: "accepted" | "refused" | "adapted", adminMargin?: number) => {
    const updates: any = { id: lead.id, margin_status: action };
    if (action === "adapted" && adminMargin !== undefined) {
      updates.admin_margin = adminMargin;
    }
    updateLead.mutate(updates, {
      onSuccess: () => {
        toast.success(`Marge ${action === "accepted" ? "acceptée" : action === "refused" ? "refusée" : "ajustée"}`);
        sendMarginEmail(lead, action, adminMargin || lead.margin, profiles);
        setShowAdapt(false);
      },
    });
  };

  if (status !== "pending") {
    return (
      <div className="text-xs">
        <Badge variant="outline" className={`${marginStatusColor[status] || ""}`}>
          {marginStatusLabel(status)}
        </Badge>
        <div className="mt-0.5 text-muted-foreground">
          {lead.margin}€/j{status === "adapted" ? ` → ${(lead as any).admin_margin}€/j` : ""}
        </div>
      </div>
    );
  }

  return (
    <div className="text-xs space-y-1">
      <div className="font-medium">{lead.margin}€/jour</div>
      {showAdapt ? (
        <div className="flex items-center gap-1">
          <Input
            type="number"
            placeholder="Nouvelle marge"
            value={adaptValue}
            onChange={e => setAdaptValue(e.target.value)}
            className="h-7 w-20 text-xs"
          />
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => {
            const val = parseFloat(adaptValue);
            if (val > 0) handleMarginAction("adapted", val);
          }}><Check className="h-3 w-3" /></Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setShowAdapt(false)}><X className="h-3 w-3" /></Button>
        </div>
      ) : (
        <div className="flex gap-0.5">
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-success hover:text-success" onClick={() => handleMarginAction("accepted")} title="Accepter">
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive hover:text-destructive" onClick={() => handleMarginAction("refused")} title="Refuser">
            <X className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-primary hover:text-primary" onClick={() => setShowAdapt(true)} title="Adapter">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};

type LeadStatus = "Déclaré" | "À qualifier" | "Qualifié" | "En sourcing" | "Profil trouvé" | "Envoyé client" | "Perdu" | "Gagné";

const allStatuses: LeadStatus[] = ["Déclaré", "À qualifier", "Qualifié", "En sourcing", "Profil trouvé", "Envoyé client", "Perdu", "Gagné"];

const statusColor: Record<string, string> = {
  "Déclaré": "bg-warning/15 text-warning border-warning/30",
  "À qualifier": "bg-warning/15 text-warning border-warning/30",
  "Qualifié": "bg-primary/15 text-primary border-primary/30",
  "En sourcing": "bg-primary/15 text-primary border-primary/30",
  "Profil trouvé": "bg-success/15 text-success border-success/30",
  "Envoyé client": "bg-primary/15 text-primary border-primary/30",
  "Perdu": "bg-destructive/15 text-destructive border-destructive/30",
  "Gagné": "bg-success/15 text-success border-success/30",
};

const AdminLeads = () => {
  const { data: leads = [], isLoading } = useLeads();
  const { data: profiles = [] } = useProfiles();
  const { data: missions = [] } = useMissions();
  const updateLead = useUpdateLead();
  const updateCandidate = useUpdateCandidate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const getLinkedMissions = (leadId: string) => missions.filter(m => m.lead_id === leadId);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const linked = getLinkedMissions(id);
      // Free candidates and delete missions
      for (const m of linked) {
        updateCandidate.mutate({ id: m.candidate_id, status: "Disponible" });
        // Delete non-paid commissions
        await supabase.from("commissions" as any).delete().eq("mission_id", m.id).neq("status", "Payée");
        // Detach paid commissions from mission so FK doesn't block deletion
        await supabase.from("commissions" as any).update({ mission_id: null }).eq("mission_id", m.id).eq("status", "Payée");
        await supabase.from("missions" as any).delete().eq("id", m.id);
      }
      // Hard delete the lead
      const { error } = await supabase.from("leads" as any).delete().eq("id", id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["missions"] });
      qc.invalidateQueries({ queryKey: ["commissions"] });
      toast.success("Besoin supprimé (commissions payées conservées)");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const getApporteurName = (userId: string) => {
    const p = profiles.find(pr => pr.user_id === userId);
    return p ? `${p.first_name} ${p.last_name}` : "—";
  };

  const filtered = leads.filter(l => {
    const apporteurName = getApporteurName(l.user_id).toLowerCase();
    const matchSearch = l.position.toLowerCase().includes(search.toLowerCase()) || l.client.toLowerCase().includes(search.toLowerCase()) || apporteurName.includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    const matchPriority = priorityFilter === "all" || l.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const handleUpdateStatus = (id: string, status: string) => {
    updateLead.mutate({ id, status }, {
      onSuccess: () => {
        toast.success(`Statut mis à jour : ${status}`);
        // Sync linked missions with the same status
        const linked = getLinkedMissions(id);
        for (const m of linked) {
          supabase.from("missions" as any).update({ status } as any).eq("id", m.id);
        }
      },
    });
  };

  const handleSaveEdit = () => {
    if (!editLead) return;
    const { id, ...rest } = editLead;
    updateLead.mutate({ id, ...rest }, {
      onSuccess: () => {
        toast.success("Besoin mis à jour");
        setEditLead(null);
      },
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Gestion des besoins</h1>
          <p className="text-sm text-muted-foreground">Qualifier, affecter et suivre les leads</p>
        </div>

        <motion.div
          className="flex flex-wrap items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher poste, client, apporteur..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-background/50" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-background/50"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {allStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px] bg-background/50"><SelectValue placeholder="Priorité" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div
          className="overflow-x-auto rounded-xl border border-border/50"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Chargement...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Poste</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Apporteur</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">TJM</th>
                  
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium">{lead.position}</span>
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {lead.stack.slice(0, 3).map(t => (
                            <span key={t} className="rounded bg-secondary/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">{t}</span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.client}</td>
                    <td className="px-4 py-3 text-muted-foreground">{getApporteurName(lead.user_id)}</td>
                    <td className="px-4 py-3 font-medium">{lead.tjm}€</td>
                    <td className="px-4 py-3">
                      <Select value={lead.status} onValueChange={(v) => handleUpdateStatus(lead.id, v)}>
                        <SelectTrigger className={`h-7 w-[130px] border text-xs font-medium ${statusColor[lead.status] || ""}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedLead(lead)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditLead({ ...lead })}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(lead.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!isLoading && filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">Aucun résultat trouvé</div>
          )}
        </motion.div>

        {/* Detail Dialog */}
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">{selectedLead?.position}</DialogTitle>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-muted-foreground">Client :</span> <span className="font-medium">{selectedLead.client}</span></div>
                  <div><span className="text-muted-foreground">Apporteur :</span> <span className="font-medium">{getApporteurName(selectedLead.user_id)}</span></div>
                  <div><span className="text-muted-foreground">Secteur :</span> <span>{selectedLead.sector}</span></div>
                  <div><span className="text-muted-foreground">Localisation :</span> <span>{selectedLead.location}</span></div>
                  <div><span className="text-muted-foreground">Mode :</span> <span>{selectedLead.remote}</span></div>
                  <div><span className="text-muted-foreground">TJM :</span> <span className="font-medium">{selectedLead.tjm}€</span></div>
                  <div><span className="text-muted-foreground">Marge souhaitée :</span> <span className="font-medium">{selectedLead.margin}€/jour</span></div>
                  <div><span className="text-muted-foreground">Statut marge :</span> <span className="font-medium">{marginStatusLabel((selectedLead as any).margin_status)}</span></div>
                  <div><span className="text-muted-foreground">Durée :</span> <span>{selectedLead.duration}</span></div>
                  <div><span className="text-muted-foreground">Priorité :</span> <span>{selectedLead.priority === "urgent" ? "🔴 Urgent" : "Normal"}</span></div>
                </div>
                {selectedLead.contact_name && (
                  <div className="border-t border-border/30 pt-3">
                    <span className="text-muted-foreground font-medium">Contact recrutement :</span>
                    <p className="mt-1">{selectedLead.contact_name} {selectedLead.contact_phone && `· ${selectedLead.contact_phone}`} {selectedLead.contact_email && `· ${selectedLead.contact_email}`}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Stack :</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {selectedLead.stack.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Description :</span>
                  <p className="mt-1 text-foreground">{selectedLead.description}</p>
                </div>
                {(selectedLead as any).admin_comment && (
                  <div className="border-t border-border/30 pt-3">
                    <span className="text-muted-foreground font-medium">Commentaire admin :</span>
                    <p className="mt-1 text-foreground">{(selectedLead as any).admin_comment}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editLead} onOpenChange={() => setEditLead(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Modifier le besoin</DialogTitle>
            </DialogHeader>
            {editLead && (
              <div className="space-y-4">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Déclaré par :</span>
                  <span className="text-sm font-semibold text-primary">{getApporteurName(editLead.user_id)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Poste</Label>
                    <Input className="mt-1.5 bg-background/50" value={editLead.position} onChange={e => setEditLead(p => p ? { ...p, position: e.target.value } : null)} />
                  </div>
                  <div>
                    <Label>Client</Label>
                    <Input className="mt-1.5 bg-background/50" value={editLead.client} onChange={e => setEditLead(p => p ? { ...p, client: e.target.value } : null)} />
                  </div>
                  <div>
                    <Label>Secteur</Label>
                    <Input className="mt-1.5 bg-background/50" value={editLead.sector} onChange={e => setEditLead(p => p ? { ...p, sector: e.target.value } : null)} />
                  </div>
                  <div>
                    <Label>Localisation</Label>
                    <Input className="mt-1.5 bg-background/50" value={editLead.location} onChange={e => setEditLead(p => p ? { ...p, location: e.target.value } : null)} />
                  </div>
                  <div>
                    <Label>Mode</Label>
                    <Select value={editLead.remote} onValueChange={v => setEditLead(p => p ? { ...p, remote: v } : null)}>
                      <SelectTrigger className="mt-1.5 bg-background/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sur site">Sur site</SelectItem>
                        <SelectItem value="Hybride">Hybride</SelectItem>
                        <SelectItem value="Full remote">Full remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>TJM (€)</Label>
                    <Input className="mt-1.5 bg-background/50" type="number" value={editLead.tjm} onChange={e => setEditLead(p => p ? { ...p, tjm: parseFloat(e.target.value) || 0 } : null)} />
                  </div>
                  <div>
                    <Label>Durée</Label>
                    <Input className="mt-1.5 bg-background/50" value={editLead.duration} onChange={e => setEditLead(p => p ? { ...p, duration: e.target.value } : null)} />
                  </div>
                  <div>
                    <Label>Priorité</Label>
                    <Select value={editLead.priority} onValueChange={v => setEditLead(p => p ? { ...p, priority: v } : null)}>
                      <SelectTrigger className="mt-1.5 bg-background/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Séniorité</Label>
                    <Input className="mt-1.5 bg-background/50" value={editLead.seniority} onChange={e => setEditLead(p => p ? { ...p, seniority: e.target.value } : null)} />
                  </div>
                  <div>
                    <Label>Contact</Label>
                    <Input className="mt-1.5 bg-background/50" value={editLead.contact_name} onChange={e => setEditLead(p => p ? { ...p, contact_name: e.target.value } : null)} />
                  </div>
                  <div>
                    <Label>Tél. contact</Label>
                    <Input className="mt-1.5 bg-background/50" value={editLead.contact_phone} onChange={e => setEditLead(p => p ? { ...p, contact_phone: e.target.value } : null)} />
                  </div>
                  <div>
                    <Label>Email contact</Label>
                    <Input className="mt-1.5 bg-background/50" value={editLead.contact_email} onChange={e => setEditLead(p => p ? { ...p, contact_email: e.target.value } : null)} />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea className="mt-1.5 bg-background/50" rows={3} value={editLead.description} onChange={e => setEditLead(p => p ? { ...p, description: e.target.value } : null)} />
                </div>
                <div>
                  <Label>Commentaire admin (texte libre)</Label>
                  <Textarea className="mt-1.5 bg-background/50" rows={3} value={(editLead as any).admin_comment || ""} onChange={e => setEditLead(p => p ? { ...p, admin_comment: e.target.value } as any : null)} placeholder="Ajouter un commentaire interne..." />
                </div>
                <Button onClick={handleSaveEdit} disabled={updateLead.isPending} className="gradient-primary border-0 w-full">
                  {updateLead.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce besoin ?</AlertDialogTitle>
              <AlertDialogDescription>
                ⚠️ Cette action est irréversible. La suppression du besoin entraînera :
                <br />• La suppression des missions associées
                <br />• La suppression des commissions <strong>non payées</strong>
                <br />• Les commissions déjà <strong>payées seront conservées</strong> dans le dashboard de l'apporteur
                <br />• La remise en disponibilité des candidats concernés
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? "Suppression..." : "Supprimer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminLeads;
