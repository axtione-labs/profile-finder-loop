import { useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Building2 } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { useProfiles } from "@/hooks/useProfiles";

interface ClientInfo {
  name: string;
  sector: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  leadCount: number;
  latestDate: string;
}

const AdminClients = () => {
  const { data: leads = [], isLoading } = useLeads();
  const { data: profiles = [] } = useProfiles();
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");

  const clients = useMemo(() => {
    const map = new Map<string, ClientInfo>();
    for (const lead of leads) {
      const key = lead.client.toLowerCase().trim();
      if (!key) continue;
      const existing = map.get(key);
      if (existing) {
        existing.leadCount++;
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
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact_name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact_email.toLowerCase().includes(search.toLowerCase());
    const matchSector = sectorFilter === "all" || c.sector === sectorFilter;
    return matchSearch && matchSector;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Clients</h1>
          <p className="text-sm text-muted-foreground">Liste des clients et contacts</p>
        </div>

        <motion.div
          className="flex flex-wrap items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher client, contact, email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-background/50" />
          </div>
          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-[180px] bg-background/50"><SelectValue placeholder="Secteur" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les secteurs</SelectItem>
              {sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">Aucun client trouvé</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Secteur</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Contact</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Téléphone</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Besoins</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => (
                  <tr key={client.name} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{client.sector || "—"}</td>
                    <td className="px-4 py-3">{client.contact_name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{client.contact_phone || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{client.contact_email || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">{client.leadCount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminClients;
