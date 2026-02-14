import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, UserCheck, Mail, Phone, Building2, Eye } from "lucide-react";
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
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", phone: "", company: "" });
  const queryClient = useQueryClient();

  const filtered = profiles.filter(p => {
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
    });
    setEditMode(false);
  };

  const handleSave = async () => {
    if (!selectedProfile) return;
    const { error } = await supabase
      .from("profiles")
      .update(editForm)
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Apporteurs d'affaires</h1>
          <p className="text-sm text-muted-foreground">Gérer les profils et suivre l'activité</p>
        </div>

        <motion.div className="relative max-w-md" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher par nom ou entreprise..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-background/50" />
        </motion.div>

        <motion.div className="overflow-x-auto rounded-xl border border-border/50" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">Aucun apporteur trouvé</div>
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
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const stats = getStats(p.user_id);
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
                        <Button variant="ghost" size="sm" onClick={() => openDetail(p)}>
                          <Eye className="h-4 w-4" />
                        </Button>
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
    </AdminLayout>
  );
};

export default AdminApporteurs;
