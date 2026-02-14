import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Filter, Eye, UserPlus, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

type LeadStatus = "À qualifier" | "Qualifié" | "En sourcing" | "Profil trouvé" | "Envoyé client" | "Négociation" | "Gagné" | "Perdu";

interface Lead {
  id: number;
  apporteur: string;
  client: string;
  position: string;
  stack: string[];
  sector: string;
  location: string;
  remote: string;
  tjm: string;
  duration: string;
  priority: string;
  status: LeadStatus;
  recruiter: string;
  date: string;
  description: string;
}

const mockLeads: Lead[] = [
  { id: 1, apporteur: "Jean Dupont", client: "BNP Paribas", position: "Tech Lead React", stack: ["React", "TypeScript", "Node.js"], sector: "Banque / Finance", location: "Paris", remote: "Hybride", tjm: "700€", duration: "6 mois", priority: "urgent", status: "À qualifier", recruiter: "", date: "14/02/2026", description: "Besoin d'un tech lead pour piloter l'équipe frontend." },
  { id: 2, apporteur: "Marie Martin", client: "Société Générale", position: "DevOps Senior", stack: ["AWS", "Docker", "Kubernetes"], sector: "Banque / Finance", location: "La Défense", remote: "Hybride", tjm: "650€", duration: "12 mois", priority: "normal", status: "En sourcing", recruiter: "Alice R.", date: "13/02/2026", description: "Migration cloud AWS à grande échelle." },
  { id: 3, apporteur: "Pierre Durand", client: "Anonyme", position: "Data Engineer", stack: ["Python", "SQL", "GCP"], sector: "Tech", location: "Lyon", remote: "Full remote", tjm: "550€", duration: "3 mois", priority: "normal", status: "À qualifier", recruiter: "", date: "12/02/2026", description: "Mise en place d'un data lake." },
  { id: 4, apporteur: "Sophie Bernard", client: "AXA", position: "Architecte Cloud", stack: ["Azure", "Kubernetes", "DevOps"], sector: "Assurance", location: "Paris", remote: "Sur site", tjm: "800€", duration: "6 mois", priority: "urgent", status: "Profil trouvé", recruiter: "Marc D.", date: "11/02/2026", description: "Architecture multi-cloud pour la DSI." },
  { id: 5, apporteur: "Lucas Moreau", client: "Engie", position: "Développeur Java", stack: ["Java", ".NET", "SQL"], sector: "Énergie", location: "Nantes", remote: "Hybride", tjm: "500€", duration: "4 mois", priority: "normal", status: "Qualifié", recruiter: "Alice R.", date: "10/02/2026", description: "Refonte du SI facturation." },
];

const allStatuses: LeadStatus[] = ["À qualifier", "Qualifié", "En sourcing", "Profil trouvé", "Envoyé client", "Négociation", "Gagné", "Perdu"];

const statusColor: Record<string, string> = {
  "À qualifier": "bg-warning/15 text-warning border-warning/30",
  "Qualifié": "bg-primary/15 text-primary border-primary/30",
  "En sourcing": "bg-primary/15 text-primary border-primary/30",
  "Profil trouvé": "bg-success/15 text-success border-success/30",
  "Envoyé client": "bg-primary/15 text-primary border-primary/30",
  "Négociation": "bg-warning/15 text-warning border-warning/30",
  "Gagné": "bg-success/15 text-success border-success/30",
  "Perdu": "bg-destructive/15 text-destructive border-destructive/30",
};

const recruiters = ["Alice R.", "Marc D.", "Julie L.", "Thomas B."];

const AdminLeads = () => {
  const [leads, setLeads] = useState(mockLeads);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filtered = leads.filter(l => {
    const matchSearch = l.position.toLowerCase().includes(search.toLowerCase()) || l.client.toLowerCase().includes(search.toLowerCase()) || l.apporteur.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    const matchPriority = priorityFilter === "all" || l.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const updateLeadStatus = (id: number, status: LeadStatus) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    toast.success(`Statut mis à jour : ${status}`);
  };

  const assignRecruiter = (id: number, recruiter: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, recruiter, status: l.status === "À qualifier" ? "Qualifié" : l.status } : l));
    toast.success(`Recruteur assigné : ${recruiter}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Gestion des besoins</h1>
          <p className="text-sm text-muted-foreground">Qualifier, affecter et suivre les leads</p>
        </div>

        {/* Filters */}
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

        {/* Table */}
        <motion.div
          className="overflow-x-auto rounded-xl border border-border/50"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Poste</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Apporteur</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">TJM</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Recruteur</th>
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
                  <td className="px-4 py-3 text-muted-foreground">{lead.apporteur}</td>
                  <td className="px-4 py-3 font-medium">{lead.tjm}</td>
                  <td className="px-4 py-3">
                    <Select value={lead.status} onValueChange={(v) => updateLeadStatus(lead.id, v as LeadStatus)}>
                      <SelectTrigger className={`h-7 w-[130px] border text-xs font-medium ${statusColor[lead.status]}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Select value={lead.recruiter || "none"} onValueChange={(v) => v !== "none" && assignRecruiter(lead.id, v)}>
                      <SelectTrigger className="h-7 w-[120px] bg-background/50 text-xs">
                        <SelectValue placeholder="Assigner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" disabled>Assigner</SelectItem>
                        {recruiters.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedLead(lead)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="font-display">{lead.position}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 text-sm">
                          <div className="grid grid-cols-2 gap-3">
                            <div><span className="text-muted-foreground">Client :</span> <span className="font-medium">{lead.client}</span></div>
                            <div><span className="text-muted-foreground">Apporteur :</span> <span className="font-medium">{lead.apporteur}</span></div>
                            <div><span className="text-muted-foreground">Secteur :</span> <span>{lead.sector}</span></div>
                            <div><span className="text-muted-foreground">Localisation :</span> <span>{lead.location}</span></div>
                            <div><span className="text-muted-foreground">Mode :</span> <span>{lead.remote}</span></div>
                            <div><span className="text-muted-foreground">TJM :</span> <span className="font-medium">{lead.tjm}</span></div>
                            <div><span className="text-muted-foreground">Durée :</span> <span>{lead.duration}</span></div>
                            <div><span className="text-muted-foreground">Priorité :</span> <span>{lead.priority === "urgent" ? "🔴 Urgent" : "Normal"}</span></div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Stack :</span>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {lead.stack.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Description :</span>
                            <p className="mt-1 text-foreground">{lead.description}</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">Aucun résultat trouvé</div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminLeads;
