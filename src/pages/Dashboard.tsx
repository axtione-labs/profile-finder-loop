import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Send, FileSearch, Handshake, Coins, Clock, TrendingUp, Plus, CheckCircle2, LogOut, Settings, Trash2, XCircle, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useLeads, useDeleteLead } from "@/hooks/useLeads";
import { useMissions, useCommissions } from "@/hooks/useMissions";
import { useCandidates } from "@/hooks/useCandidates";
import { toast } from "sonner";
import ApporteurLayout from "@/components/apporteur/ApporteurLayout";

const workflowSteps = [
  "Déclaré", "Qualifié", "En sourcing", "Profil trouvé", "Envoyé client"
];

const statusToStep: Record<string, number> = {
  "Déclaré": 0, "À qualifier": 0, "Qualifié": 1, "En sourcing": 2,
  "Profil trouvé": 3, "Envoyé client": 4, "Gagné": 5, "Perdu": -1,
};

const stepIcons = [Send, FileSearch, Handshake, CheckCircle2, Send];

const priorityBadge = (p: string) => {
  if (p === "urgent") return <Badge className="bg-destructive/20 text-destructive border-0 text-xs">Urgent</Badge>;
  return <Badge variant="outline" className="text-xs">Normal</Badge>;
};

const Dashboard = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { data: missions = [] } = useMissions();
  const { data: commissions = [] } = useCommissions();
  const { data: candidates = [] } = useCandidates();
  const deleteLead = useDeleteLead();

  const myLeads = leads.filter(l => l.user_id === user?.id && !(l as any).hidden_by_user);
  const myMissions = missions.filter(m => m.apporteur_id === user?.id);
  const myCommissions = commissions.filter(c => c.apporteur_id === user?.id);

  const paidAmount = myCommissions.filter(c => c.status === "Payée").reduce((s, c) => s + c.amount, 0);
  const pendingAmount = myCommissions.filter(c => c.status !== "Payée").reduce((s, c) => s + c.amount, 0);

  const initials = profile ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() : "?";

  const summaryCards = [
    { label: "Besoins envoyés", value: String(myLeads.length), icon: Send, color: "text-primary" },
    { label: "Profils en cours", value: String(candidates.filter(c => myLeads.some(l => l.id === c.lead_id)).length), icon: FileSearch, color: "text-warning" },
    { label: "Missions signées", value: String(myMissions.length), icon: Handshake, color: "text-success" },
    { label: "Commissions en attente", value: `${pendingAmount.toLocaleString("fr-FR")}€`, icon: Clock, color: "text-warning" },
    { label: "Commissions payées", value: `${paidAmount.toLocaleString("fr-FR")}€`, icon: Coins, color: "text-success" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleDeleteLead = (id: string) => {
    if (confirm("Supprimer ce besoin ?")) {
      deleteLead.mutate(id);
    }
  };

  return (
    <ApporteurLayout title="Dashboard">
      <div>
        <h1 className="mb-6 font-display text-2xl font-bold">
          Bonjour {profile?.first_name || ""}
        </h1>

        {/* Summary */}
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {summaryCards.map((card) => (
            <div key={card.label} className="gradient-card rounded-xl border border-border/50 p-5">
              <div className="flex items-center gap-3">
                <card.icon className={`h-5 w-5 ${card.color}`} />
                <span className="text-sm text-muted-foreground">{card.label}</span>
              </div>
              <div className="mt-2 font-display text-2xl font-bold">{card.value}</div>
            </div>
          ))}
        </motion.div>

        {/* Leads */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="font-display text-xl font-bold">Suivi des besoins</h2>

          {leadsLoading ? (
            <div className="mt-4 text-center text-muted-foreground">Chargement...</div>
          ) : myLeads.length === 0 ? (
            <div className="mt-4 gradient-card rounded-xl border border-border/50 p-8 text-center">
              <p className="text-muted-foreground">Aucun besoin déclaré pour le moment.</p>
              <Link to="/declare">
                <Button className="mt-4 gradient-primary border-0">
                  <Plus className="mr-1.5 h-4 w-4" /> Déclarer un besoin
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {myLeads.map((lead) => {
                const currentStep = statusToStep[lead.status] ?? 0;
                return (
                  <div key={lead.id} className="gradient-card rounded-xl border border-border/50 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{lead.position}</span>
                          {priorityBadge(lead.priority)}
                        </div>
                        <span className="mt-1 text-sm text-muted-foreground">
                          {lead.client} · {new Date(lead.created_at).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteLead(lead.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Workflow Timeline */}
                    {lead.status === "Perdu" ? (
                      <div className="mt-4 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/15">
                          <XCircle className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-destructive">Besoin perdu</p>
                          <p className="text-xs text-muted-foreground">Ce besoin n'a pas abouti</p>
                        </div>
                      </div>
                    ) : lead.status === "Gagné" ? (
                      <div className="mt-4 flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 p-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success/15">
                          <Trophy className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-success">Mission gagnée 🎉</p>
                          <p className="text-xs text-muted-foreground">Félicitations ! Le besoin a abouti en mission</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <div className="relative flex items-center">
                          {workflowSteps.map((s, i) => {
                            const isCompleted = i < currentStep;
                            const isCurrent = i === currentStep;
                            return (
                              <div key={s} className="flex flex-1 items-center">
                                <motion.div
                                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                                    isCompleted
                                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                      : isCurrent
                                      ? "border-2 border-primary bg-primary/10 text-primary ring-4 ring-primary/10"
                                      : "border border-border bg-muted/50 text-muted-foreground"
                                  }`}
                                  initial={false}
                                  animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
                                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                                </motion.div>
                                {i < workflowSteps.length - 1 && (
                                  <div className="relative mx-1 h-1 flex-1 overflow-hidden rounded-full bg-border/50">
                                    <motion.div
                                      className="absolute inset-y-0 left-0 rounded-full bg-primary"
                                      initial={{ width: "0%" }}
                                      animate={{ width: isCompleted ? "100%" : "0%" }}
                                      transition={{ duration: 0.5, delay: i * 0.1 }}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-2 flex justify-between">
                          {workflowSteps.map((s, i) => {
                            const isCompleted = i < currentStep;
                            const isCurrent = i === currentStep;
                            return (
                              <span
                                key={s}
                                className={`flex-1 text-center text-[10px] font-medium transition-colors ${
                                  isCompleted ? "text-primary" : isCurrent ? "text-foreground" : "text-muted-foreground/60"
                                }`}
                              >
                                {s}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Commissions */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-bold">Commissions</h2>
            </div>
            <Link to="/commissions">
              <Button size="sm" variant="outline">Voir le détail</Button>
            </Link>
          </div>

          {myCommissions.length === 0 ? (
            <div className="mt-4 gradient-card rounded-xl border border-border/50 p-8 text-center">
              <p className="text-muted-foreground">Aucune commission pour le moment.</p>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Mission</th>
                    <th className="pb-3 font-medium">Montant</th>
                    <th className="pb-3 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {myCommissions.map((c) => {
                    const mission = missions.find(m => m.id === c.mission_id);
                    return (
                      <tr key={c.id} className="border-b border-border/30">
                        <td className="py-3 font-medium">{mission?.consultant_name || "—"} — {mission?.client || ""}</td>
                        <td className="py-3 font-semibold text-gradient">{c.amount.toLocaleString("fr-FR")}€</td>
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
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
