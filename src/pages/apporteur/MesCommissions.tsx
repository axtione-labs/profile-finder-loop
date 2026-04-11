import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMissions, useCommissions } from "@/hooks/useMissions";
import ApporteurLayout from "@/components/apporteur/ApporteurLayout";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MesCommissions = () => {
  const { user } = useAuth();
  const { data: missions = [] } = useMissions();
  const { data: commissions = [], isLoading } = useCommissions();

  const currentYear = new Date().getFullYear();
  const [filterYear, setFilterYear] = useState(String(currentYear));

  const myCommissions = commissions.filter((c) => c.apporteur_id === user?.id);
  const yearComms = myCommissions.filter((c) => c.commission_year === parseInt(filterYear));

  const paidAmount = yearComms.filter((c) => c.status === "Payée").reduce((s, c) => s + c.amount, 0);
  const pendingAmount = yearComms.filter((c) => c.status !== "Payée").reduce((s, c) => s + c.amount, 0);

  const years = [...new Set(myCommissions.map((c) => c.commission_year))].sort((a, b) => b - a);
  if (!years.includes(currentYear)) years.unshift(currentYear);

  return (
    <ApporteurLayout title="Mes commissions">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Mes commissions</h1>
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="gradient-card rounded-xl border border-border/50 p-5">
          <div className="flex items-center gap-3">
            <Coins className="h-5 w-5 text-success" />
            <span className="text-sm text-muted-foreground">Payées</span>
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-success">{paidAmount.toLocaleString("fr-FR")}€</div>
        </div>
        <div className="gradient-card rounded-xl border border-border/50 p-5">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-warning" />
            <span className="text-sm text-muted-foreground">En attente</span>
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-warning">{pendingAmount.toLocaleString("fr-FR")}€</div>
        </div>
        <div className="gradient-card rounded-xl border border-border/50 p-5">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Total {filterYear}</span>
          </div>
          <div className="mt-2 font-display text-2xl font-bold">{(paidAmount + pendingAmount).toLocaleString("fr-FR")}€</div>
        </div>
      </div>

      {/* Commissions list */}
      {isLoading ? (
        <div className="text-center text-muted-foreground">Chargement...</div>
      ) : yearComms.length === 0 ? (
        <div className="gradient-card rounded-xl border border-border/50 p-8 text-center">
          <Coins className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Aucune commission pour {filterYear}.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-muted-foreground">
                <th className="pb-3 font-medium">Mission</th>
                <th className="pb-3 font-medium">Mois</th>
                <th className="pb-3 font-medium">Jours</th>
                <th className="pb-3 font-medium">Montant</th>
                <th className="pb-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {yearComms.map((c) => {
                const mission = missions.find((m) => m.id === c.mission_id);
                return (
                  <tr key={c.id} className="border-b border-border/30">
                    <td className="py-3 font-medium">{mission?.consultant_name || "—"} — {mission?.client || ""}</td>
                    <td className="py-3 text-muted-foreground">{c.commission_month}/{c.commission_year}</td>
                    <td className="py-3 text-muted-foreground">{c.days_worked}j</td>
                    <td className="py-3 font-semibold">{c.amount.toLocaleString("fr-FR")}€</td>
                    <td className="py-3">
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
        </div>
      )}
    </ApporteurLayout>
  );
};

export default MesCommissions;
