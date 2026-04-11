import { useState, useMemo } from "react";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/admin/TablePagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Building2, Pencil, Trash2 } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ClientInfo {
  name: string;
  sector: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  leadCount: number;
  latestDate: string;
  leadIds: string[];
}

const AdminClients = () => {
  const { data: leads = [], isLoading } = useLeads();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [sectorFilter, setSectorFilter] = useState("all");
  const [editClient, setEditClient] = useState<ClientInfo | null>(null);
  const [editForm, setEditForm] = useState({ name: "", sector: "", contact_name: "", contact_phone: "", contact_email: "" });
  const [deleteClient, setDeleteClient] = useState<ClientInfo | null>(null);

  const clients = useMemo(() => {
    const map = new Map<string, ClientInfo>();
    for (const lead of leads) {
      const key = lead.client.toLowerCase().trim();
      if (!key) continue;
      const existing = map.get(key);
      if (existing) {
        existing.leadCount++;
        existing.leadIds.push(lead.id);
        if (lead.created_at > existing.latestDate) existing.latestDate = lead.created_at;
        if (!existing.contact_name && lead.contact_name) existing.contact_name = lead.contact_name;
        if (!existing.contact_phone && lead.contact_phone) existing.contact_phone = lead.contact_phone;
        if (!existing.contact_email && lead.contact_email) existing.contact_email = lead.contact_email;
        if (!existing.sector && lead.sector) existing.sector = lead.sector;
      } else {
        map.set(key, {
          name: lead.client,
          sector: lead.sector,
          contact_name: lead.contact_name || "",
          contact_phone: lead.contact_phone || "",
          contact_email: lead.contact_email || "",
          leadCount: 1,
          latestDate: lead.created_at,
          leadIds: [lead.id],
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.latestDate.localeCompare(a.latestDate));
  }, [leads]);

  const sectors = useMemo(() => {
    const s = new Set(clients.map(c => c.sector).filter(Boolean));
    return Array.from(s).sort();
  }, [clients]);

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      c.contact_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      c.contact_email.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchSector = sectorFilter === "all" || c.sector === sectorFilter;
    return matchSearch && matchSector;
  });

  const openEdit = (client: ClientInfo) => {
    setEditClient(client);
    setEditForm({
      name: client.name,
      sector: client.sector,
      contact_name: client.contact_name,
      contact_phone: client.contact_phone,
      contact_email: client.contact_email,
    });
  };

  const handleSave = async () => {
    if (!editClient) return;
    // Update all leads that belong to this client
    const { error } = await supabase
      .from("leads")
      .update({
        client: editForm.name,
        sector: editForm.sector,
        contact_name: editForm.contact_name,
        contact_phone: editForm.contact_phone,
        contact_email: editForm.contact_email,
      })
      .in("id", editClient.leadIds);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Client mis à jour");
    queryClient.invalidateQueries({ queryKey: ["leads"] });
    setEditClient(null);
  };

  const handleDelete = async () => {
    if (!deleteClient) return;
    const { error } = await supabase
      .from("leads")
      .delete()
      .in("id", deleteClient.leadIds);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Client et ses besoins supprimés");
    queryClient.invalidateQueries({ queryKey: ["leads"] });
    setDeleteClient(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-4 px-6 py-5">
        <div>
          <h1 className="font-display text-lg font-bold text-gray-900">Clients</h1>
          <p className="text-[11px] text-gray-500">Gérer les clients et leurs informations · {filtered.length} client(s)</p>
        </div>

        <motion.div className="flex flex-wrap items-center gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Rechercher client, contact, email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white border-gray-200" />
          </div>
          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-[180px] bg-white border-gray-200"><SelectValue placeholder="Secteur" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les secteurs</SelectItem>
              {sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div className="overflow-hidden rounded-lg border border-gray-200" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-3 h-11 border-b border-gray-100">
                  <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-[11px] text-gray-400">Aucun client trouvé</div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">Client</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">Secteur</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">Contact</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">Téléphone</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">Email</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">Besoins</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-medium uppercase text-gray-500 w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client, idx) => (
                  <tr key={client.name} className={`h-11 border-b border-gray-100 hover:bg-blue-50/40 transition-colors duration-100 ${idx % 2 === 1 ? "bg-gray-50/30" : "bg-white"}`}>
                    <td className="px-3 py-2.5 max-w-0">
                      <div className="flex items-center gap-2 truncate">
                        <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="font-medium text-gray-900 truncate">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 max-w-0 truncate text-gray-600">{client.sector || "—"}</td>
                    <td className="px-3 py-2.5 max-w-0 truncate text-gray-900">{client.contact_name || "—"}</td>
                    <td className="px-3 py-2.5 max-w-0 truncate text-gray-500 tabular-nums">{client.contact_phone || "—"}</td>
                    <td className="px-3 py-2.5 max-w-0 truncate text-gray-500">{client.contact_email || "—"}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-block rounded border px-2 py-0.5 text-[11px] font-medium bg-blue-100 text-blue-700 border-blue-200">{client.leadCount}</span>
                    </td>
                    <td className="px-3 py-2.5 w-[120px] text-right">
                      <div className="flex justify-end gap-0.5">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(client)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDeleteClient(client)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editClient} onOpenChange={(open) => !open && setEditClient(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom du client</Label>
              <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>Secteur</Label>
              <Input value={editForm.sector} onChange={e => setEditForm(f => ({ ...f, sector: e.target.value }))} />
            </div>
            <div>
              <Label>Nom du contact</Label>
              <Input value={editForm.contact_name} onChange={e => setEditForm(f => ({ ...f, contact_name: e.target.value }))} />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input value={editForm.contact_phone} onChange={e => setEditForm(f => ({ ...f, contact_phone: e.target.value }))} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={editForm.contact_email} onChange={e => setEditForm(f => ({ ...f, contact_email: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditClient(null)}>Annuler</Button>
              <Button onClick={handleSave}>Enregistrer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteClient} onOpenChange={(open) => !open && setDeleteClient(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer le client</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Êtes-vous sûr de vouloir supprimer <strong>{deleteClient?.name}</strong> et ses {deleteClient?.leadCount} besoin(s) associé(s) ? Cette action est irréversible.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteClient(null)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminClients;
