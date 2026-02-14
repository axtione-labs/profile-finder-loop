import { useState, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Search, Trash2, FileUp, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useCandidates, useCreateCandidate, useUpdateCandidate, useDeleteCandidate, type Candidate } from "@/hooks/useCandidates";
import { supabase } from "@/integrations/supabase/client";

const statusColor: Record<string, string> = {
  "Disponible": "bg-success/15 text-success",
  "En process": "bg-primary/15 text-primary",
  "Placé": "bg-warning/15 text-warning",
  "Indisponible": "bg-destructive/15 text-destructive",
};

const candidateStatuses = ["Disponible", "En process", "Placé", "Indisponible"];

const AdminSourcing = () => {
  const { data: candidates = [], isLoading } = useCandidates();
  const createCandidate = useCreateCandidate();
  const updateCandidate = useUpdateCandidate();
  const deleteCandidate = useDeleteCandidate();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newCandidate, setNewCandidate] = useState({
    first_name: "", last_name: "", phone: "", position: "",
    experience: "", stack: "", tjm: "", availability: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);

  const filtered = candidates.filter(c => {
    const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
    return fullName.includes(search.toLowerCase()) ||
      c.position?.toLowerCase().includes(search.toLowerCase()) ||
      c.stack.some(s => s.toLowerCase().includes(search.toLowerCase()));
  });

  const handleUpdateStatus = (id: string, status: string) => {
    updateCandidate.mutate({ id, status }, {
      onSuccess: () => toast.success(`Statut candidat mis à jour : ${status}`),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Supprimer ce candidat ?")) {
      deleteCandidate.mutate(id);
    }
  };

  const handleAdd = async () => {
    if (!newCandidate.first_name || !newCandidate.last_name) return;

    let cv_url: string | null = null;

    if (cvFile) {
      setUploading(true);
      const fileName = `${Date.now()}_${cvFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("cvs")
        .upload(fileName, cvFile, { contentType: cvFile.type });
      setUploading(false);

      if (uploadError) {
        toast.error("Erreur upload CV: " + uploadError.message);
        return;
      }
      const { data: urlData } = supabase.storage.from("cvs").getPublicUrl(fileName);
      cv_url = urlData.publicUrl;
    }

    createCandidate.mutate({
      lead_id: null,
      name: `${newCandidate.first_name} ${newCandidate.last_name}`,
      first_name: newCandidate.first_name,
      last_name: newCandidate.last_name,
      phone: newCandidate.phone,
      position: newCandidate.position,
      availability: newCandidate.availability,
      experience: newCandidate.experience,
      stack: newCandidate.stack.split(",").map(s => s.trim()).filter(Boolean),
      tjm: parseFloat(newCandidate.tjm) || 0,
      status: "Disponible",
      cv_url,
    }, {
      onSuccess: () => {
        setAddOpen(false);
        setNewCandidate({ first_name: "", last_name: "", phone: "", position: "", experience: "", stack: "", tjm: "", availability: "" });
        setCvFile(null);
      },
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Sourcing</h1>
            <p className="text-sm text-muted-foreground">Gérer les candidats et profils</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary border-0">
                <UserPlus className="mr-2 h-4 w-4" /> Ajouter un candidat
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">Nouveau candidat</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Prénom</Label>
                    <Input className="mt-1.5 bg-background/50" value={newCandidate.first_name} onChange={e => setNewCandidate(p => ({ ...p, first_name: e.target.value }))} placeholder="Jean" />
                  </div>
                  <div>
                    <Label>Nom</Label>
                    <Input className="mt-1.5 bg-background/50" value={newCandidate.last_name} onChange={e => setNewCandidate(p => ({ ...p, last_name: e.target.value }))} placeholder="Dupont" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Téléphone</Label>
                    <Input className="mt-1.5 bg-background/50" value={newCandidate.phone} onChange={e => setNewCandidate(p => ({ ...p, phone: e.target.value }))} placeholder="06 12 34 56 78" />
                  </div>
                  <div>
                    <Label>Poste</Label>
                    <Input className="mt-1.5 bg-background/50" value={newCandidate.position} onChange={e => setNewCandidate(p => ({ ...p, position: e.target.value }))} placeholder="Dev Fullstack" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Expérience</Label>
                    <Input className="mt-1.5 bg-background/50" value={newCandidate.experience} onChange={e => setNewCandidate(p => ({ ...p, experience: e.target.value }))} placeholder="5 ans" />
                  </div>
                  <div>
                    <Label>TJM (€)</Label>
                    <Input className="mt-1.5 bg-background/50" type="number" value={newCandidate.tjm} onChange={e => setNewCandidate(p => ({ ...p, tjm: e.target.value }))} placeholder="450" />
                  </div>
                  <div>
                    <Label>Disponibilité</Label>
                    <Input className="mt-1.5 bg-background/50" value={newCandidate.availability} onChange={e => setNewCandidate(p => ({ ...p, availability: e.target.value }))} placeholder="Immédiate" />
                  </div>
                </div>
                <div>
                  <Label>Stack (séparées par des virgules)</Label>
                  <Input className="mt-1.5 bg-background/50" value={newCandidate.stack} onChange={e => setNewCandidate(p => ({ ...p, stack: e.target.value }))} placeholder="React, TypeScript, Node.js" />
                </div>
                <div>
                  <Label>CV (PDF)</Label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={e => setCvFile(e.target.files?.[0] || null)}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <FileUp className="mr-2 h-4 w-4" /> {cvFile ? cvFile.name : "Choisir un fichier"}
                    </Button>
                    {cvFile && <span className="text-xs text-muted-foreground">{(cvFile.size / 1024).toFixed(0)} Ko</span>}
                  </div>
                </div>
                <Button onClick={handleAdd} disabled={createCandidate.isPending || uploading} className="gradient-primary border-0 w-full">
                  {uploading ? "Upload CV..." : createCandidate.isPending ? "Ajout..." : "Ajouter"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher candidat, poste, stack..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-background/50" />
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
                      <span className="font-semibold">{candidate.first_name} {candidate.last_name}</span>
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[candidate.status] || "bg-secondary text-muted-foreground"}`}>
                        {candidate.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {candidate.position || "—"} · {candidate.experience} · {candidate.tjm}€/jour
                      {candidate.availability && ` · Dispo: ${candidate.availability}`}
                    </p>
                    {candidate.phone && (
                      <p className="text-xs text-muted-foreground mt-0.5">📞 {candidate.phone}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {candidate.stack.map(t => (
                        <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {candidate.cv_url && (
                      <a href={candidate.cv_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="mr-1 h-3 w-3" /> CV
                        </Button>
                      </a>
                    )}
                    <Select value={candidate.status} onValueChange={(v) => handleUpdateStatus(candidate.id, v)}>
                      <SelectTrigger className="h-8 w-[140px] bg-background/50 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {candidateStatuses.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(candidate.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
