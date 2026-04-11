import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coins, TrendingUp, Calendar, LogOut, Settings, ArrowLeft, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useMissions, useCommissions } from "@/hooks/useMissions";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";

const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

const CommissionsDashboard = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: missions = [] } = useMissions();
  const { data: commissions = [] } = useCommissions();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [filterYear, setFilterYear] = useState(String(currentYear));
  const [view, setView] = useState<"year" | "month">("year");

  const myCommissions = commissions.filter(c => c.apporteur_id === user?.id);
  const yearComms = myCommissions.filter(c => c.commission_year === parseInt(filterYear));

  const totalEarned = yearComms.filter(c => c.status === "Payée").reduce((s, c) => s + (c.days_worked * c.amount), 0);
  const totalPending = yearComms.filter(c => c.status !== "Payée").reduce((s, c) => s + (c.days_worked * c.amount), 0);

  // Estimation: if consultant works ~20 days/month for remaining months
  const remainingMonths = Math.max(0, 12 - currentMonth);
  const avgPerDay = yearComms.length > 0 ? yearComms.reduce((s, c) => s + c.amount, 0) / yearComms.length : 0;
  const activeConsultants = new Set(yearComms.map(c => c.mission_id)).size;
  const estimation = avgPerDay * 20 * remainingMonths * activeConsultants;

  // Monthly chart data
  const monthlyData = months.map((m, i) => {
    const monthComms = yearComms.filter(c => c.commission_month === i + 1);
    const paid = monthComms.filter(c => c.status === "Payée").reduce((s, c) => s + (c.days_worked * c.amount), 0);
    const pending = monthComms.filter(c => c.status !== "Payée").reduce((s, c) => s + (c.days_worked * c.amount), 0);
    return { name: m, payé: paid, en_attente: pending, total: paid + pending };
  });

  const years = [...new Set(myCommissions.map(c => c.commission_year))].sort((a, b) => b - a);
  if (!years.includes(currentYear)) years.unshift(currentYear);

  const initials = profile ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() : "?";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/lynx-logo.png" alt="Lynx" className="w-8 h-8" />
            <span className="font-display text-xl font-bold text-gradient-gold">Lynx</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button size="sm" variant="outline"><ArrowLeft className="mr-1.5 h-4 w-4" /> Dashboard</Button>
            </Link>
            {isAdmin && (
              <Link to="/admin"><Button size="sm" variant="outline"><Settings className="mr-1.5 h-4 w-4" /> Admin</Button></Link>
            )}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">{initials}</div>
            <Button size="sm" variant="ghost" onClick={() => { signOut(); navigate("/login"); }}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Coins className="h-6 w-6 text-primary" /> Mes Commissions
          </h1>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Summary cards */}
        <motion.div className="grid gap-4 sm:grid-cols-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="gradient-card rounded-xl border border-border/50 p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Coins className="h-4 w-4" /> Payé ({filterYear})</div>
            <div className="mt-2 font-display text-2xl font-bold text-success">{totalEarned.toLocaleString("fr-FR")} €</div>
          </div>
          <div className="gradient-card rounded-xl border border-border/50 p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" /> En attente</div>
            <div className="mt-2 font-display text-2xl font-bold text-warning">{totalPending.toLocaleString("fr-FR")} €</div>
          </div>
          <div className="gradient-card rounded-xl border border-border/50 p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><TrendingUp className="h-4 w-4" /> Total ({filterYear})</div>
            <div className="mt-2 font-display text-2xl font-bold text-gradient">{(totalEarned + totalPending).toLocaleString("fr-FR")} €</div>
          </div>
          <div className="gradient-card rounded-xl border border-border/50 p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4" /> Estimation annuelle</div>
            <div className="mt-2 font-display text-2xl font-bold text-primary">{Math.round(totalEarned + totalPending + estimation).toLocaleString("fr-FR")} €</div>
            <p className="mt-1 text-[10px] text-muted-foreground">Si les consultants travaillent 20j/mois</p>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          className="mt-8 gradient-card rounded-xl border border-border/50 p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="mb-4 font-display text-lg font-semibold">Évolution mensuelle ({filterYear})</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }}
                formatter={(value: number) => `${value.toLocaleString("fr-FR")} €`}
              />
              <Legend />
              <Bar dataKey="payé" name="Payé" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="en_attente" name="En attente" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly detail table */}
        <motion.div
          className="mt-8 overflow-x-auto rounded-xl border border-border/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="px-4 pt-4 font-display text-lg font-semibold">Détail par mois</h2>
          {yearComms.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">Aucune commission pour {filterYear}.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Mois</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Consultant</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Jours</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Comm/jour</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut</th>
                </tr>
              </thead>
              <tbody>
                {yearComms
                  .sort((a, b) => a.commission_month - b.commission_month)
                  .map((c) => {
                    const mission = missions.find(m => m.id === c.mission_id);
                    return (
                      <tr key={c.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{months[(c.commission_month || 1) - 1]}</td>
                        <td className="px-4 py-3 font-medium">{mission?.consultant_name || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{mission?.client || "—"}</td>
                        <td className="px-4 py-3 font-medium">{c.days_worked || 0}</td>
                        <td className="px-4 py-3 font-medium">{c.amount.toLocaleString("fr-FR")} €</td>
                        <td className="px-4 py-3 font-semibold text-gradient">{(c.days_worked * c.amount).toLocaleString("fr-FR")} €</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={c.status === "Payée" ? "border-success/30 bg-success/10 text-success" : "border-warning/30 bg-warning/10 text-warning"}
                          >
                            {c.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CommissionsDashboard;
