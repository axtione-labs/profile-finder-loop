import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Calendar, Coins } from "lucide-react";
import { toast } from "sonner";
import { useCommissions, useUpdateCommission, useMissions } from "@/hooks/useMissions";
import { useProfiles } from "@/hooks/useProfiles";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const commStatusColor: Record<string, string> = {
  "À générer": "bg-warning/15 text-warning",
  "Générée": "bg-primary/15 text-primary",
  "Payée": "bg-success/15 text-success",
};

const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

const AdminCommissions = () => {
  const { data: commissions = [], isLoading } = useCommissions();
  const { data: missions = [] } = useMissions();
  const { data: profiles = [] } = useProfiles();
  const updateCommission = useUpdateCommission();

  const currentYear = new Date().getFullYear();
  const [filterYear, setFilterYear] = useState(String(currentYear));

  const getApporteurName = (userId: string) => {
    const p = profiles.find(pr => pr.user_id === userId);
    return p ? `${p.first_name} ${p.last_name}` : "—";
  };

  const getMissionInfo = (missionId: string) => missions.find(m => m.id === missionId);

  const handleUpdateStatus = (id: string, status: string) => {
    updateCommission.mutate({ id, status } as any, {
      onSuccess: () => toast.success(`Commission : ${status}`),
    });
  };

  const handleUpdateDaysWorked = (id: string, days: number) => {
    const commission = commissions.find(c => c.id === id);
    if (!commission) return;
    const newAmount = days * commission.amount / (commission.days_worked || 1 );
    // Recalculate: amount = days_worked * rate_per_day (amount / old_days or original rate)
    updateCommission.mutate({ id, days_worked: days } as any, {
      onSuccess: () => toast.success(`Jours travaillés mis à jour`),
    });
  };

  // Stats
  const yearCommissions = commissions.filter(c => c.commission_year === parseInt(filterYear));
  const totalPaid = yearCommissions.filter(c => c.status === "Payée").reduce((s, c) => s + (c.days_worked * c.amount), 0);
  const totalPending = yearCommissions.filter(c => c.status !== "Payée").reduce((s, c) => s + (c.days_worked * c.amount), 0);
  const totalAdmin = yearCommissions.reduce((s, c) => s + (c.days_worked * c.admin_amount), 0);

  // Chart data: monthly breakdown
  const chartData = months.map((m, i) => {
    const monthComms = yearCommissions.filter(c => c.commission_month === i + 1);
    return {
      name: m,
      apporteurs: monthComms.reduce((s, c) => s + (c.days_worked * c.amount), 0),
      admin: monthComms.reduce((s, c) => s + (c.days_worked * c.admin_amount), 0),
    };
  });

  const years = [...new Set(commissions.map(c => c.commission_year))].sort((a, b) => b - a);
  if (!years.includes(currentYear)) years.unshift(currentYear);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Commissions</h1>
            <p className="text-sm text-muted-foreground">Suivi financier et jours travaillés</p>
          </div>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Summary cards */}
        <motion.div className="grid gap-4 sm:grid-cols-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="gradient-card rounded-xl border border-border/50 p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" /> Marge admin ({filterYear})
            </div>
            <div className="mt-2 font-display text-2xl font-bold text-gradient">{totalAdmin.toLocaleString("fr-FR")} €</div>
          </div>
          <div className="gradient-card rounded-xl border border-border/50 p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Coins className="h-4 w-4" /> Commissions en attente
            </div>
            <div className="mt-2 font-display text-2xl font-bold text-warning">{totalPending.toLocaleString("fr-FR")} €</div>
          </div>
          <div className="gradient-card rounded-xl border border-border/50 p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" /> Payées ({filterYear})
            </div>
            <div className="mt-2 font-display text-2xl font-bold text-success">{totalPaid.toLocaleString("fr-FR")} €</div>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          className="gradient-card rounded-xl border border-border/50 p-5"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="mb-4 font-display text-lg font-semibold">Répartition mensuelle ({filterYear})</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }}
                formatter={(value: number) => `${value.toLocaleString("fr-FR")} €`}
              />
              <Legend />
              <Bar dataKey="apporteurs" name="Comm. apporteurs" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="admin" name="Marge admin" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Commissions table */}
        <motion.div
          className="overflow-x-auto rounded-xl border border-border/50"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Chargement...</div>
          ) : yearCommissions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">Aucune commission pour {filterYear}.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Mois</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Apporteur</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Consultant</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Jours travaillés</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Comm/jour</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total comm.</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Marge admin</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut</th>
                </tr>
              </thead>
              <tbody>
                {yearCommissions.map((c) => {
                  const mission = getMissionInfo(c.mission_id);
                  return (
                    <tr key={c.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">{months[(c.commission_month || 1) - 1]} {c.commission_year}</td>
                      <td className="px-4 py-3 font-medium">{getApporteurName(c.apporteur_id)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{mission?.consultant_name || "—"}</td>
                      <td className="px-4 py-3">
                        {c.status === "Payée" ? (
                          <span className="text-xs font-medium">{c.days_worked}</span>
                        ) : (
                          <Input
                            type="number"
                            className="h-7 w-20 bg-background/50 text-xs"
                            value={c.days_worked || 0}
                            onChange={(e) => handleUpdateDaysWorked(c.id, parseFloat(e.target.value) || 0)}
                            min={0}
                            max={31}
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">{c.amount.toLocaleString("fr-FR")} €</td>
                      <td className="px-4 py-3 font-semibold">{(c.days_worked * c.amount).toLocaleString("fr-FR")} €</td>
                      <td className="px-4 py-3 font-semibold text-gradient">{(c.days_worked * c.admin_amount).toLocaleString("fr-FR")} €</td>
                      <td className="px-4 py-3">
                        {c.status === "Payée" ? (
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${commStatusColor["Payée"]}`}>Payée</span>
                        ) : (
                          <Select value={c.status} onValueChange={(v) => handleUpdateStatus(c.id, v)}>
                            <SelectTrigger className={`h-7 w-[120px] border text-xs font-medium ${commStatusColor[c.status] || ""}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="À générer">À générer</SelectItem>
                              <SelectItem value="Générée">Générée</SelectItem>
                              <SelectItem value="Payée">Payée</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminCommissions;
