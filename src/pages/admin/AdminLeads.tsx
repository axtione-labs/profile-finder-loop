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
import { Search, Eye, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useLeads, useUpdateLead, useDeleteLead, type Lead } from "@/hooks/useLeads";
import { useProfiles } from "@/hooks/useProfiles";

type LeadStatus = "Déclaré" | "À qualifier" | "Qualifié" | "En sourcing" | "Profil trouvé" | "Envoyé client";

const allStatuses: LeadStatus[] = ["Déclaré", "À qualifier", "Qualifié", "En sourcing", "Profil trouvé", "Envoyé client"];

const statusColor: Record<string, string> = {
  "Déclaré": "bg-warning/15 text-warning border-warning/30",
  "À qualifier": "bg-warning/15 text-warning border-warning/30",
  "Qualifié": "bg-primary/15 text-primary border-primary/30",
  "En sourcing": "bg-primary/15 text-primary border-primary/30",
  "Profil trouvé": "bg-success/15 text-success border-success/30",
  "Envoyé client": "bg-primary/15 text-primary border-primary/30",
};

const AdminLeads = () => {
  const { data: leads = [], isLoading } = useLeads();
  const { data: profiles = [] } = useProfiles();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editLead, setEditLead] = useState<Lead | null>(null);

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
      onSuccess: () => toast.success(`Statut mis à jour : ${status}`),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Supprimer ce besoin ?")) {
      deleteLead.mutate(id);
    }
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
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(lead.id)}>
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
      </div>
    </AdminLayout>
  );
};

export default AdminLeads;
