import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { FileText, Users, Handshake, Coins, Clock } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { useCandidates } from "@/hooks/useCandidates";
import { useMissions, useCommissions } from "@/hooks/useMissions";
import { useProfiles } from "@/hooks/useProfiles";

const statusColor: Record<string, string> = {
  "Déclaré": "bg-amber-100 text-amber-700 border-amber-200",
  "À qualifier": "bg-amber-100 text-amber-700 border-amber-200",
  "Qualifié": "bg-blue-100 text-blue-700 border-blue-200",
  "En sourcing": "bg-blue-100 text-blue-700 border-blue-200",
  "Profil trouvé": "bg-green-100 text-green-700 border-green-200",
  "Envoyé client": "bg-purple-100 text-purple-700 border-purple-200",
  "Négociation": "bg-amber-100 text-amber-700 border-amber-200",
  "Gagné": "bg-green-100 text-green-700 border-green-200",
  "Perdu": "bg-red-100 text-red-700 border-red-200",
};

const AdminOverview = () => {
  const { data: leads = [] } = useLeads();
  const { data: candidates = [] } = useCandidates();
  const { data: missions = [] } = useMissions();
  const { data: commissions = [] } = useCommissions();
  const { data: profiles = [] } = useProfiles();

  const activeLeads = leads.filter(l => !["Gagné", "Perdu"].includes(l.status));
  const inSourcing = leads.filter(l => l.status === "En sourcing");
  const activeMissions = missions.filter(m => m.status === "En cours");
  const totalPending = commissions.filter(c => c.status !== "Payée").reduce((s, c) => s + c.amount, 0);

  const getApporteurName = (userId: string) => {
    const p = profiles.find(pr => pr.user_id === userId);
    return p ? `${p.first_name} ${p.last_name}` : "—";
  };

  const cards = [
    { label: "Leads actifs", value: String(activeLeads.length), icon: FileText, change: `${leads.length} total` },
    { label: "En sourcing", value: String(inSourcing.length), icon: Users, change: `${candidates.length} candidats` },
    { label: "Missions en cours", value: String(activeMissions.length), icon: Handshake, change: `${missions.length} total` },
    { label: "Commissions à payer", value: `${totalPending.toLocaleString("fr-FR")}€`, icon: Coins, change: `${commissions.filter(c => c.status !== "Payée").length} en attente` },
  ];

  const recentLeads = leads.slice(0, 8);

  return (
    <AdminLayout>
      <div className="space-y-6 px-6 py-5">
        <div>
          <h1 className="font-display text-lg font-bold text-gray-900">Vue d'ensemble</h1>
          <p className="text-[11px] text-gray-500">Tableau de bord administrateur</p>
        </div>

        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {cards.map((card) => (
            <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-500">{card.label}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                  <card.icon className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="mt-1 font-display text-[22px] font-bold text-gray-900">{card.value}</div>
              <p className="mt-0.5 text-[11px] text-gray-500">{card.change}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="mb-4 font-display text-lg font-semibold flex items-center gap-2 text-gray-900">
            <Clock className="h-4 w-4 text-blue-600" /> Derniers besoins
          </h2>
          {recentLeads.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-400 text-[11px]">
              Aucun lead pour le moment.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">Apporteur</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">Client</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">Poste</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500 w-[140px]">Statut</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">Priorité</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500 w-[100px]">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead, idx) => (
                    <tr key={lead.id} className={`h-11 border-b border-gray-100 hover:bg-blue-50/40 transition-colors duration-100 ${idx % 2 === 1 ? "bg-gray-50/30" : "bg-white"}`}>
                      <td className="px-3 py-2.5 max-w-0 truncate font-medium text-gray-900">{getApporteurName(lead.user_id)}</td>
                      <td className="px-3 py-2.5 max-w-0 truncate text-gray-600">{lead.client}</td>
                      <td className="px-3 py-2.5 max-w-0 truncate text-gray-900">{lead.position}</td>
                      <td className="px-3 py-2.5 w-[140px]">
                        <span className={`inline-block rounded border px-2 py-0.5 text-[11px] font-medium ${statusColor[lead.status] || ""}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        {lead.priority === "urgent" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border bg-red-100 text-red-600 border-red-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> Urgent
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded border bg-gray-100 text-gray-600 border-gray-200">Normal</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 w-[100px] tabular-nums text-gray-500">{new Date(lead.created_at).toLocaleDateString("fr-FR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
