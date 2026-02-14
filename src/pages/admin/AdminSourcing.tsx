import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Search } from "lucide-react";
import { toast } from "sonner";
import { useCandidates, useCreateCandidate, useUpdateCandidate, type Candidate } from "@/hooks/useCandidates";
import { useLeads } from "@/hooks/useLeads";
import { useProfiles } from "@/hooks/useProfiles";

const statusColor: Record<string, string> = {
  "Proposé": "bg-warning/15 text-warning",
  "Validé apporteur": "bg-primary/15 text-primary",
  "Refusé apporteur": "bg-destructive/15 text-destructive",
  "Envoyé client": "bg-primary/15 text-primary",
  "Retenu": "bg-success/15 text-success",
  "Rejeté": "bg-destructive/15 text-destructive",
};

const candidateStatuses = ["Proposé", "Validé apporteur", "Refusé apporteur", "Envoyé client", "Retenu", "Rejeté"];

const AdminSourcing = () => {
  const { data: candidates = [], isLoading } = useCandidates();
  const { data: leads = [] } = useLeads();
  const { data: profiles = [] } = useProfiles();
  const createCandidate = useCreateCandidate();
  const updateCandidate = useUpdateCandidate();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: "", experience: "", stack: "", tjm: "", lead_id: "" });

  const getApporteurName = (userId: string) => {
    const p = profiles.find(pr => pr.user_id === userId);
    return p ? `${p.first_name} ${p.last_name}` : "—";
  };

  const enriched = candidates.map(c => {
    const lead = leads.find(l => l.id === c.lead_id);
    return { ...c, leadPosition: lead?.position || "—", client: lead?.client || "—", apporteurName: lead ? getApporteurName(lead.user_id) : "—" };
  });

  const filtered = enriched.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.leadPosition.toLowerCase().includes(search.toLowerCase()) ||
    c.client.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdateStatus = (id: string, status: string) => {
    updateCandidate.mutate({ id, status }, {
      onSuccess: () => toast.success(`Statut candidat mis à jour : ${status}`),
    });
  };

  const handleAdd = () => {
    if (!newCandidate.name || !newCandidate.lead_id) return;
    createCandidate.mutate({
      lead_id: newCandidate.lead_id,
      name: newCandidate.name,
      experience: newCandidate.experience,
      stack: newCandidate.stack.split(",").map(s => s.trim()).filter(Boolean),
      tjm: parseFloat(newCandidate.tjm) || 0,
      status: "Proposé",
      cv_url: null,
    }, {
      onSuccess: () => {
        setAddOpen(false);
        setNewCandidate({ name: "", experience: "", stack: "", tjm: "", lead_id: "" });
      },
    });
  };

  const sourcingLeads = leads.filter(l => ["Qualifié", "En sourcing", "Profil trouvé"].includes(l.status));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Sourcing</h1>
            <p className="text-sm text-muted-foreground">Gérer les candidats et profils par lead</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary border-0">
                <UserPlus className="mr-2 h-4 w-4" /> Ajouter un candidat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Nouveau candidat</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Lead associé</Label>
                  <Select value={newCandidate.lead_id} onValueChange={v => setNewCandidate(p => ({ ...p, lead_id: v }))}>
                    <SelectTrigger className="mt-1.5 bg-background/50"><SelectValue placeholder="Sélectionner un lead" /></SelectTrigger>
                    <SelectContent>
                      {sourcingLeads.map(l => (
                        <SelectItem key={l.id} value={l.id}>{l.position} — {l.client}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nom complet</Label>
                  <Input className="mt-1.5 bg-background/50" value={newCandidate.name} onChange={e => setNewCandidate(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Jean Dupont" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Expérience</Label>
                    <Input className="mt-1.5 bg-background/50" value={newCandidate.experience} onChange={e => setNewCandidate(p => ({ ...p, experience: e.target.value }))} placeholder="Ex: 5 ans" />
                  </div>
                  <div>
                    <Label>TJM (€)</Label>
                    <Input className="mt-1.5 bg-background/50" type="number" value={newCandidate.tjm} onChange={e => setNewCandidate(p => ({ ...p, tjm: e.target.value }))} placeholder="Ex: 550" />
                  </div>
                </div>
                <div>
                  <Label>Stack (séparées par des virgules)</Label>
                  <Input className="mt-1.5 bg-background/50" value={newCandidate.stack} onChange={e => setNewCandidate(p => ({ ...p, stack: e.target.value }))} placeholder="React, TypeScript, Node.js" />
                </div>
                <Button onClick={handleAdd} disabled={createCandidate.isPending} className="gradient-primary border-0 w-full">
                  {createCandidate.isPending ? "Ajout..." : "Ajouter"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher candidat, poste, client..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-background/50" />
        </div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isLoading ? (
            <div className="text-center text-muted-foreground py-12">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="gradient-card rounded-xl border border-border/50 p-8 text-center text-muted-foreground">
              Aucun candidat trouvé.
            </div>
          ) : (
            filtered.map((candidate) => (
              <div key={candidate.id} className="gradient-card rounded-xl border border-border/50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{candidate.name}</span>
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[candidate.status] || ""}`}>
                        {candidate.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {candidate.leadPosition} — {candidate.client} · {candidate.experience} · {candidate.tjm}€/jour
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {candidate.stack.map(t => (
                        <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={candidate.status} onValueChange={(v) => handleUpdateStatus(candidate.id, v)}>
                      <SelectTrigger className="h-8 w-[150px] bg-background/50 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {candidateStatuses.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminSourcing;
