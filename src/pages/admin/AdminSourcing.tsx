import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, FileUp, CheckCircle2, XCircle, MessageSquare, Search } from "lucide-react";
import { toast } from "sonner";

interface Candidate {
  id: number;
  leadId: number;
  leadPosition: string;
  client: string;
  name: string;
  experience: string;
  stack: string[];
  tjm: string;
  status: "Proposé" | "Validé apporteur" | "Refusé apporteur" | "Envoyé client" | "Retenu" | "Rejeté";
  cvUrl?: string;
}

const mockCandidates: Candidate[] = [
  { id: 1, leadId: 1, leadPosition: "Tech Lead React", client: "BNP Paribas", name: "Alexandre Martin", experience: "8 ans", stack: ["React", "TypeScript", "Node.js"], tjm: "680€", status: "Proposé" },
  { id: 2, leadId: 1, leadPosition: "Tech Lead React", client: "BNP Paribas", name: "Claire Lefevre", experience: "6 ans", stack: ["React", "Next.js", "AWS"], tjm: "650€", status: "Validé apporteur" },
  { id: 3, leadId: 2, leadPosition: "DevOps Senior", client: "Société Générale", name: "Thomas Girard", experience: "10 ans", stack: ["AWS", "Docker", "Terraform"], tjm: "700€", status: "Envoyé client" },
  { id: 4, leadId: 4, leadPosition: "Architecte Cloud", client: "AXA", name: "Nadia Bouzid", experience: "12 ans", stack: ["Azure", "Kubernetes", "DevOps"], tjm: "780€", status: "Retenu" },
];

const statusColor: Record<string, string> = {
  "Proposé": "bg-warning/15 text-warning",
  "Validé apporteur": "bg-primary/15 text-primary",
  "Refusé apporteur": "bg-destructive/15 text-destructive",
  "Envoyé client": "bg-primary/15 text-primary",
  "Retenu": "bg-success/15 text-success",
  "Rejeté": "bg-destructive/15 text-destructive",
};

const AdminSourcing = () => {
  const [candidates, setCandidates] = useState(mockCandidates);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: "", experience: "", stack: "", tjm: "", leadId: "" });

  const filtered = candidates.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.leadPosition.toLowerCase().includes(search.toLowerCase()) ||
    c.client.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = (id: number, status: Candidate["status"]) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    toast.success(`Statut candidat mis à jour : ${status}`);
  };

  const addCandidate = () => {
    if (!newCandidate.name || !newCandidate.leadId) return;
    const lead = mockCandidates.find(c => c.leadId === parseInt(newCandidate.leadId));
    setCandidates(prev => [...prev, {
      id: Date.now(),
      leadId: parseInt(newCandidate.leadId),
      leadPosition: "Nouveau poste",
      client: "Client",
      name: newCandidate.name,
      experience: newCandidate.experience,
      stack: newCandidate.stack.split(",").map(s => s.trim()),
      tjm: newCandidate.tjm,
      status: "Proposé",
    }]);
    setAddOpen(false);
    setNewCandidate({ name: "", experience: "", stack: "", tjm: "", leadId: "" });
    toast.success("Candidat ajouté");
  };

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
                  <Label>Nom complet</Label>
                  <Input className="mt-1.5 bg-background/50" value={newCandidate.name} onChange={e => setNewCandidate(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Jean Dupont" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Expérience</Label>
                    <Input className="mt-1.5 bg-background/50" value={newCandidate.experience} onChange={e => setNewCandidate(p => ({ ...p, experience: e.target.value }))} placeholder="Ex: 5 ans" />
                  </div>
                  <div>
                    <Label>TJM</Label>
                    <Input className="mt-1.5 bg-background/50" value={newCandidate.tjm} onChange={e => setNewCandidate(p => ({ ...p, tjm: e.target.value }))} placeholder="Ex: 550€" />
                  </div>
                </div>
                <div>
                  <Label>Stack (séparées par des virgules)</Label>
                  <Input className="mt-1.5 bg-background/50" value={newCandidate.stack} onChange={e => setNewCandidate(p => ({ ...p, stack: e.target.value }))} placeholder="React, TypeScript, Node.js" />
                </div>
                <Button onClick={addCandidate} className="gradient-primary border-0 w-full">Ajouter</Button>
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
          {filtered.map((candidate) => (
            <div key={candidate.id} className="gradient-card rounded-xl border border-border/50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{candidate.name}</span>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[candidate.status]}`}>
                      {candidate.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {candidate.leadPosition} — {candidate.client} · {candidate.experience} · {candidate.tjm}/jour
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {candidate.stack.map(t => (
                      <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast.info("Fonctionnalité CV à venir avec Cloud")}>
                    <FileUp className="mr-1 h-3.5 w-3.5" /> CV
                  </Button>
                  <Select value={candidate.status} onValueChange={(v) => updateStatus(candidate.id, v as Candidate["status"])}>
                    <SelectTrigger className="h-8 w-[150px] bg-background/50 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Proposé", "Validé apporteur", "Refusé apporteur", "Envoyé client", "Retenu", "Rejeté"].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminSourcing;
