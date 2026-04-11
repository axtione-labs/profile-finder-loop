import { useState, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/admin/TablePagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Search, Trash2, FileUp, ExternalLink, Pencil } from "lucide-react";
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
  const debouncedSearch = useDebouncedValue(search);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editCandidate, setEditCandidate] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [statusConfirm, setStatusConfirm] = useState<{ id: string; status: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);
  const [newCandidate, setNewCandidate] = useState({
    first_name: "", last_name: "", phone: "", position: "",
    experience: "", stack: "", tjm: "", availability: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [editCvFile, setEditCvFile] = useState<File | null>(null);

  const filtered = candidates.filter(c => {
    const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
    return fullName.includes(search.toLowerCase()) ||
      c.position?.toLowerCase().includes(search.toLowerCase()) ||
      c.stack.some(s => s.toLowerCase().includes(search.toLowerCase()));
  });

  const handleUpdateStatus = (id: string, status: string) => {
    setStatusConfirm({ id, status });
  };

  const confirmStatusUpdate = () => {
    if (!statusConfirm) return;
    updateCandidate.mutate({ id: statusConfirm.id, status: statusConfirm.status }, {
      onSuccess: () => toast.success(`Statut mis à jour : ${statusConfirm.status}`),
    });
    setStatusConfirm(null);
  };

  const handleDelete = () => {
    if (!deleteConfirmId) return;
    deleteCandidate.mutate(deleteConfirmId, {
      onSuccess: () => setDeleteConfirmId(null),
    });
  };

  const openEdit = (c: Candidate) => {
    setEditCandidate({
      ...c,
      stack: c.stack.join(", "),
    });
    setEditCvFile(null);
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editCandidate) return;

    let cv_url = editCandidate.cv_url;

    if (editCvFile) {
      setUploading(true);
      const fileName = `${Date.now()}_${editCvFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("cvs")
        .upload(fileName, editCvFile, { contentType: editCvFile.type });
      setUploading(false);
      if (uploadError) {
        toast.error("Erreur upload CV: " + uploadError.message);
        return;
      }
      const { data: urlData } = supabase.storage.from("cvs").getPublicUrl(fileName);
      cv_url = urlData.publicUrl;
    }

    updateCandidate.mutate({
      id: editCandidate.id,
      first_name: editCandidate.first_name,
      last_name: editCandidate.last_name,
      name: `${editCandidate.first_name} ${editCandidate.last_name}`,
      phone: editCandidate.phone,
      position: editCandidate.position,
      experience: editCandidate.experience,
      availability: editCandidate.availability,
      stack: editCandidate.stack.split(",").map((s: string) => s.trim()).filter(Boolean),
      tjm: parseFloat(editCandidate.tjm) || 0,
      cv_url,
    }, {
      onSuccess: () => {
        toast.success("Candidat mis à jour");
        setEditOpen(false);
      },
    });
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

  const getStatusBadge = (status: string) => {
    const color = Object.entries(statusColor).find(([key]) => status.startsWith(key))?.[1] || "bg-secondary text-muted-foreground";
    return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${color}`}>{status}</span>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-bold">Sourcing</h1>
            <p className="text-xs text-muted-foreground">Gérer les candidats et profils</p>
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
                    <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={e => setCvFile(e.target.files?.[0] || null)} />
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
          className="overflow-x-auto rounded-xl border border-border/50"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isLoading ? (
            <div className="text-center text-muted-foreground py-12">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">Aucun candidat trouvé.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead>Nom</TableHead>
                  <TableHead>Poste</TableHead>
                  <TableHead>Expérience</TableHead>
                  <TableHead>TJM</TableHead>
                  <TableHead>Disponibilité</TableHead>
                  <TableHead>Stack</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>CV</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium whitespace-nowrap">{candidate.first_name} {candidate.last_name}</TableCell>
                    <TableCell>{candidate.position || "—"}</TableCell>
                    <TableCell>{candidate.experience || "—"}</TableCell>
                    <TableCell className="font-medium">{candidate.tjm}€/j</TableCell>
                    <TableCell>{candidate.availability || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {candidate.stack.map(t => (
                          <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{candidate.phone || "—"}</TableCell>
                    <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                    <TableCell>
                      {candidate.cv_url ? (
                        <a href={candidate.cv_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="mr-1 h-3 w-3" /> CV
                          </Button>
                        </a>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Select value={candidate.status} onValueChange={(v) => handleUpdateStatus(candidate.id, v)}>
                          <SelectTrigger className="h-7 w-[130px] bg-background/50 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {candidateStatuses.map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(candidate)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteConfirmId(candidate.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </motion.div>
      </div>

      {/* Edit Candidate Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Modifier le candidat</DialogTitle>
          </DialogHeader>
          {editCandidate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Prénom</Label>
                  <Input className="mt-1.5" value={editCandidate.first_name} onChange={e => setEditCandidate((c: any) => ({ ...c, first_name: e.target.value }))} />
                </div>
                <div>
                  <Label>Nom</Label>
                  <Input className="mt-1.5" value={editCandidate.last_name} onChange={e => setEditCandidate((c: any) => ({ ...c, last_name: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Téléphone</Label>
                  <Input className="mt-1.5" value={editCandidate.phone || ""} onChange={e => setEditCandidate((c: any) => ({ ...c, phone: e.target.value }))} />
                </div>
                <div>
                  <Label>Poste</Label>
                  <Input className="mt-1.5" value={editCandidate.position} onChange={e => setEditCandidate((c: any) => ({ ...c, position: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Expérience</Label>
                  <Input className="mt-1.5" value={editCandidate.experience} onChange={e => setEditCandidate((c: any) => ({ ...c, experience: e.target.value }))} />
                </div>
                <div>
                  <Label>TJM (€)</Label>
                  <Input className="mt-1.5" type="number" value={editCandidate.tjm} onChange={e => setEditCandidate((c: any) => ({ ...c, tjm: e.target.value }))} />
                </div>
                <div>
                  <Label>Disponibilité</Label>
                  <Input className="mt-1.5" value={editCandidate.availability} onChange={e => setEditCandidate((c: any) => ({ ...c, availability: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Stack (séparées par des virgules)</Label>
                <Input className="mt-1.5" value={editCandidate.stack} onChange={e => setEditCandidate((c: any) => ({ ...c, stack: e.target.value }))} />
              </div>
              <div>
                <Label>CV (PDF)</Label>
                <div className="mt-1.5 flex items-center gap-2">
                  <input ref={editFileRef} type="file" accept=".pdf" className="hidden" onChange={e => setEditCvFile(e.target.files?.[0] || null)} />
                  <Button type="button" variant="outline" size="sm" onClick={() => editFileRef.current?.click()}>
                    <FileUp className="mr-2 h-4 w-4" /> {editCvFile ? editCvFile.name : editCandidate.cv_url ? "Remplacer le CV" : "Ajouter un CV"}
                  </Button>
                  {editCvFile && <span className="text-xs text-muted-foreground">{(editCvFile.size / 1024).toFixed(0)} Ko</span>}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditOpen(false)}>Annuler</Button>
                <Button onClick={handleSaveEdit} disabled={uploading}>
                  {uploading ? "Upload..." : "Enregistrer"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce candidat ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le candidat sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
              Le statut du candidat passera à « {statusConfirm?.status} ».
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

export default AdminSourcing;
