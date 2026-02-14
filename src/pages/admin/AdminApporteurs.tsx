import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserCheck, Phone, Building2, Eye, Trash2, ShieldOff, ShieldCheck, RotateCcw } from "lucide-react";
import { useProfiles } from "@/hooks/useProfiles";
import { useLeads } from "@/hooks/useLeads";
import { useMissions, useCommissions } from "@/hooks/useMissions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const AdminApporteurs = () => {
  const { data: profiles = [], isLoading } = useProfiles();
  const { data: leads = [] } = useLeads();
  const { data: missions = [] } = useMissions();
  const { data: commissions = [] } = useCommissions();
  const [search, setSearch] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", phone: "", company: "", admin_comment: "" });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [blockConfirm, setBlockConfirm] = useState<{ id: string; blocked: boolean } | null>(null);
  const [restoreConfirmId, setRestoreConfirmId] = useState<string | null>(null);
  const [tab, setTab] = useState("active");
  const queryClient = useQueryClient();

  // Separate active and trashed profiles
  const activeProfiles = profiles.filter(p => !(p as any).deleted_at);
  const trashedProfiles = profiles.filter(p => !!(p as any).deleted_at);

  const currentList = tab === "active" ? activeProfiles : trashedProfiles;

  const filtered = currentList.filter(p => {
    const term = search.toLowerCase();
    return (
      p.first_name.toLowerCase().includes(term) ||
      p.last_name.toLowerCase().includes(term) ||
      (p.company || "").toLowerCase().includes(term)
    );
  });

  const getStats = (userId: string) => {
    const userLeads = leads.filter(l => l.user_id === userId);
    const userMissions = missions.filter(m => m.apporteur_id === userId);
    const userCommissions = commissions.filter(c => c.apporteur_id === userId);
    const totalEarned = userCommissions
      .filter(c => c.status === "Payée")
      .reduce((s, c) => s + c.days_worked * c.amount, 0);
    const totalPending = userCommissions
      .filter(c => c.status !== "Payée")
      .reduce((s, c) => s + c.days_worked * c.amount, 0);
    return { leads: userLeads.length, missions: userMissions.length, totalEarned, totalPending };
  };

  const openDetail = (profile: any) => {
    setSelectedProfile(profile);
    setEditForm({
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone: profile.phone || "",
      company: profile.company || "",
      admin_comment: profile.admin_comment || "",
    });
    setEditMode(false);
  };

  const handleSave = async () => {
    if (!selectedProfile) return;
    const { error } = await supabase
      .from("profiles")
      .update(editForm as any)
      .eq("id", selectedProfile.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profil mis à jour");
    queryClient.invalidateQueries({ queryKey: ["profiles"] });
    setEditMode(false);
    setSelectedProfile({ ...selectedProfile, ...editForm });
  };

  // Soft delete: set deleted_at instead of hard delete
  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    const { error } = await supabase
      .from("profiles")
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq("id", deleteConfirmId);
    if (error) {
      toast.error("Erreur suppression: " + error.message);
    } else {
      toast.success("Apporteur déplacé dans la corbeille (suppression définitive dans 60 jours)");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    }
    setDeleteConfirmId(null);
  };

  // Restore from trash
  const handleRestore = async () => {
    if (!restoreConfirmId) return;
    const { error } = await supabase
      .from("profiles")
      .update({ deleted_at: null } as any)
      .eq("id", restoreConfirmId);
    if (error) {
      toast.error("Erreur restauration: " + error.message);
    } else {
      toast.success("Apporteur restauré avec succès");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    }
    setRestoreConfirmId(null);
  };

  const handleToggleBlock = async () => {
    if (!blockConfirm) return;
    const newBlocked = !blockConfirm.blocked;
    const { error } = await supabase
      .from("profiles")
      .update({ blocked: newBlocked } as any)
      .eq("id", blockConfirm.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(newBlocked ? "Compte bloqué" : "Compte débloqué");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    }
    setBlockConfirm(null);
  };

  const getDaysUntilPurge = (deletedAt: string) => {
    const deleteDate = new Date(deletedAt);
    const purgeDate = new Date(deleteDate.getTime() + 60 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysLeft = Math.ceil((purgeDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return Math.max(0, daysLeft);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Apporteurs d'affaires</h1>
          <p className="text-sm text-muted-foreground">Gérer les profils et suivre l'activité</p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="active">Actifs ({activeProfiles.length})</TabsTrigger>
            <TabsTrigger value="trash">Corbeille ({trashedProfiles.length})</TabsTrigger>
          </TabsList>
        </Tabs>

        <motion.div className="relative max-w-md" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher par nom ou entreprise..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-background/50" />
        </motion.div>

        <motion.div className="overflow-x-auto rounded-xl border border-border/50" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {tab === "trash" ? "La corbeille est vide" : "Aucun apporteur trouvé"}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nom</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Entreprise</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Téléphone</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Leads</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Missions</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Gagné</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">En attente</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tab === "trash" ? "Suppression dans" : "Statut"}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const stats = getStats(p.user_id);
                  const deletedAt = (p as any).deleted_at;
                  return (
                    <tr key={p.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-primary" />
                          {p.first_name} {p.last_name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.company || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.phone || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">{stats.leads}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent-foreground">{stats.missions}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-success">{stats.totalEarned.toLocaleString("fr-FR")} €</td>
                      <td className="px-4 py-3 text-warning">{stats.totalPending.toLocaleString("fr-FR")} €</td>
                      <td className="px-4 py-3">
                        {tab === "trash" && deletedAt ? (
                          <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
                            {getDaysUntilPurge(deletedAt)} jours
                          </span>
                        ) : p.blocked ? (
                          <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive">Bloqué</span>
                        ) : (
                          <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">Actif</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {tab === "trash" ? (
                            <Button variant="ghost" size="sm" onClick={() => setRestoreConfirmId(p.id)} title="Restaurer">
                              <RotateCcw className="h-4 w-4 text-primary" />
                            </Button>
                          ) : (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => openDetail(p)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setBlockConfirm({ id: p.id, blocked: p.blocked })}
                                title={p.blocked ? "Débloquer" : "Bloquer"}
                              >
                                {p.blocked ? <ShieldCheck className="h-4 w-4 text-success" /> : <ShieldOff className="h-4 w-4 text-warning" />}
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteConfirmId(p.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </motion.div>
      </div>

      {/* Detail / Edit Dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={(open) => !open && setSelectedProfile(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Modifier l'apporteur" : "Détails de l'apporteur"}
            </DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4">
              {editMode ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Prénom</Label>
                      <Input value={editForm.first_name} onChange={e => setEditForm(f => ({ ...f, first_name: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Nom</Label>
                      <Input value={editForm.last_name} onChange={e => setEditForm(f => ({ ...f, last_name: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <Input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Entreprise</Label>
                    <Input value={editForm.company} onChange={e => setEditForm(f => ({ ...f, company: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Commentaire admin</Label>
                    <Textarea 
                      value={editForm.admin_comment} 
                      onChange={e => setEditForm(f => ({ ...f, admin_comment: e.target.value }))} 
                      placeholder="Notes internes sur cet apporteur..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setEditMode(false)}>Annuler</Button>
                    <Button onClick={handleSave}>Enregistrer</Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{selectedProfile.first_name} {selectedProfile.last_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedProfile.phone || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedProfile.company || "—"}</span>
                    </div>
                    {selectedProfile.admin_comment && (
                      <div className="rounded-lg bg-secondary/30 p-3 text-sm">
                        <p className="text-xs text-muted-foreground mb-1">Commentaire admin</p>
                        <p>{selectedProfile.admin_comment}</p>
                      </div>
                    )}
                  </div>
                  {(() => {
                    const stats = getStats(selectedProfile.user_id);
                    return (
                      <div className="grid grid-cols-2 gap-3 rounded-lg bg-secondary/30 p-3 text-sm">
                        <div><span className="text-muted-foreground">Leads :</span> <span className="font-medium">{stats.leads}</span></div>
                        <div><span className="text-muted-foreground">Missions :</span> <span className="font-medium">{stats.missions}</span></div>
                        <div><span className="text-muted-foreground">Gagné :</span> <span className="font-medium text-success">{stats.totalEarned.toLocaleString("fr-FR")} €</span></div>
                        <div><span className="text-muted-foreground">En attente :</span> <span className="font-medium text-warning">{stats.totalPending.toLocaleString("fr-FR")} €</span></div>
                      </div>
                    );
                  })()}
                  <div className="flex justify-end">
                    <Button onClick={() => setEditMode(true)}>Modifier</Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation (soft) */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet apporteur ?</AlertDialogTitle>
            <AlertDialogDescription>
              L'apporteur sera déplacé dans la corbeille pendant 60 jours avant suppression définitive. Ses commissions seront conservées dans le tableau de bord global. Vous pouvez le restaurer à tout moment depuis la corbeille.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Déplacer dans la corbeille
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation */}
      <AlertDialog open={!!restoreConfirmId} onOpenChange={(open) => !open && setRestoreConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurer cet apporteur ?</AlertDialogTitle>
            <AlertDialogDescription>
              L'apporteur sera réactivé et pourra à nouveau accéder à son espace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>Restaurer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block/Unblock Confirmation */}
      <AlertDialog open={!!blockConfirm} onOpenChange={(open) => !open && setBlockConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{blockConfirm?.blocked ? "Débloquer ce compte ?" : "Bloquer ce compte ?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {blockConfirm?.blocked
                ? "L'apporteur pourra à nouveau accéder à son espace."
                : "L'apporteur ne pourra plus accéder à son espace tant que le compte est bloqué."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleBlock}>
              {blockConfirm?.blocked ? "Débloquer" : "Bloquer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminApporteurs;
