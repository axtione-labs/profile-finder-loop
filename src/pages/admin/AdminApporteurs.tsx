import { useState } from "react";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/admin/TablePagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, UserCheck, Phone, Building2, Eye, Trash2, ShieldOff, ShieldCheck, RotateCcw, FileText, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useProfiles } from "@/hooks/useProfiles";
import { useLeads } from "@/hooks/useLeads";
import { useMissions, useCommissions } from "@/hooks/useMissions";
import { useAllDocuments, useValidateDocument, Document } from "@/hooks/useDocuments";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const AdminApporteurs = () => {
  const { data: profiles = [], isLoading } = useProfiles();
  const { data: leads = [] } = useLeads();
  const { data: missions = [] } = useMissions();
  const { data: commissions = [] } = useCommissions();
  const { data: allDocuments = [] } = useAllDocuments();
  const validateDocument = useValidateDocument();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
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
    const term = debouncedSearch.toLowerCase();
    return (
      p.first_name.toLowerCase().includes(term) ||
      p.last_name.toLowerCase().includes(term) ||
      (p.company || "").toLowerCase().includes(term)
    );
  });
  const { page, setPage, totalPages, paginated, total, from, to } = usePagination(filtered, 25);

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

  const getDocStatus = (userId: string, type: Document["type"]) => {
    return allDocuments.find(d => d.user_id === userId && d.type === type);
  };

  const DocStatusBadge = ({ doc }: { doc?: Document }) => {
    if (!doc) return <span className="text-xs text-muted-foreground">—</span>;
    const config = {
      pending: { icon: Clock, label: "En attente", className: "border-warning/30 bg-warning/10 text-warning" },
      validated: { icon: CheckCircle2, label: "Validé", className: "border-success/30 bg-success/10 text-success" },
      rejected: { icon: XCircle, label: "Rejeté", className: "border-destructive/30 bg-destructive/10 text-destructive" },
    }[doc.status];
    return (
      <div className="flex items-center gap-1">
        <Badge variant="outline" className={`text-[10px] ${config.className}`}>
          <config.icon className="h-2.5 w-2.5 mr-0.5" />
          {config.label}
        </Badge>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => {
          e.stopPropagation();
          const { data } = supabase.storage.from("documents").getPublicUrl(doc.file_url);
          window.open(data.publicUrl, "_blank");
        }}>
          <Eye className="h-3 w-3" />
        </Button>
        {doc.status !== "validated" && (
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-success" onClick={(e) => {
            e.stopPropagation();
            validateDocument.mutate({ id: doc.id, status: "validated" });
          }}>
            <CheckCircle2 className="h-3 w-3" />
          </Button>
        )}
        {doc.status !== "rejected" && (
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={(e) => {
            e.stopPropagation();
            validateDocument.mutate({ id: doc.id, status: "rejected" });
          }}>
            <XCircle className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
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
      <div className="space-y-4 px-6 py-5">
        <div>
          <h1 className="font-display text-lg font-bold text-gray-900">Apporteurs d'affaires</h1>
          <p className="text-[11px] text-gray-500">Gérer les profils et suivre l'activité</p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="active">Actifs ({activeProfiles.length})</TabsTrigger>
            <TabsTrigger value="trash">Corbeille ({trashedProfiles.length})</TabsTrigger>
          </TabsList>
        </Tabs>

        <motion.div className="relative max-w-md" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Rechercher par nom ou entreprise..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white border-gray-200" />
        </motion.div>

        <motion.div className="overflow-hidden rounded-lg border border-gray-200" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-3 h-11 border-b border-gray-100">
                  <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-[11px] text-gray-400">
              {tab === "trash" ? "La corbeille est vide" : "Aucun apporteur trouvé"}
            </div>
          ) : (
            <>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">Nom</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">Entreprise</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">Leads</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">Missions</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">RIB</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">KBIS</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">Pièce d'identité</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">{tab === "trash" ? "Suppression dans" : "Statut"}</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-medium uppercase text-gray-500 w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p, idx) => {
                  const stats = getStats(p.user_id);
                  const deletedAt = (p as any).deleted_at;
                  return (
                    <tr key={p.id} className={`h-11 border-b border-gray-100 hover:bg-blue-50/40 transition-colors duration-100 ${idx % 2 === 1 ? "bg-gray-50/30" : "bg-white"}`}>
                      <td className="px-3 py-2.5 max-w-0">
                        <div className="flex items-center gap-2 truncate">
                          <UserCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          <span className="font-medium text-gray-900 truncate">{p.first_name} {p.last_name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 max-w-0 truncate text-gray-600">{p.company || "—"}</td>
                      <td className="px-3 py-2.5">
                        <span className="inline-block rounded border px-2 py-0.5 text-[11px] font-medium bg-blue-100 text-blue-700 border-blue-200">{stats.leads}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-block rounded border px-2 py-0.5 text-[11px] font-medium bg-purple-100 text-purple-700 border-purple-200">{stats.missions}</span>
                      </td>
                      <td className="px-3 py-2.5"><DocStatusBadge doc={getDocStatus(p.user_id, "rib")} /></td>
                      <td className="px-3 py-2.5"><DocStatusBadge doc={getDocStatus(p.user_id, "kbis")} /></td>
                      <td className="px-3 py-2.5"><DocStatusBadge doc={getDocStatus(p.user_id, "id_card")} /></td>
                      <td className="px-3 py-2.5">
                        {tab === "trash" && deletedAt ? (
                          <span className="inline-block rounded border px-2 py-0.5 text-[11px] font-medium bg-amber-100 text-amber-700 border-amber-200">
                            {getDaysUntilPurge(deletedAt)} jours
                          </span>
                        ) : p.blocked ? (
                          <span className="inline-block rounded border px-2 py-0.5 text-[11px] font-medium bg-red-100 text-red-700 border-red-200">Bloqué</span>
                        ) : (
                          <span className="inline-block rounded border px-2 py-0.5 text-[11px] font-medium bg-green-100 text-green-700 border-green-200">Actif</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 w-[120px] text-right">
                        <div className="flex justify-end gap-0.5">
                          {tab === "trash" ? (
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setRestoreConfirmId(p.id)} title="Restaurer">
                              <RotateCcw className="h-3.5 w-3.5 text-blue-500" />
                            </Button>
                          ) : (
                            <>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openDetail(p)}>
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setBlockConfirm({ id: p.id, blocked: p.blocked })} title={p.blocked ? "Débloquer" : "Bloquer"}>
                                {p.blocked ? <ShieldCheck className="h-3.5 w-3.5 text-green-500" /> : <ShieldOff className="h-3.5 w-3.5 text-amber-500" />}
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDeleteConfirmId(p.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
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
            <TablePagination page={page} totalPages={totalPages} total={total} from={from} to={to} setPage={setPage} />
            </>
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
