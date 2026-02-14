import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Send, FileSearch, Users, CheckCircle2, Handshake, Receipt, Coins, Clock, TrendingUp, Plus, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const summaryCards = [
  { label: "Besoins envoyés", value: "12", icon: Send, color: "text-primary" },
  { label: "Profils en cours", value: "5", icon: FileSearch, color: "text-warning" },
  { label: "Missions signées", value: "3", icon: Handshake, color: "text-success" },
  { label: "Commissions en attente", value: "4 200€", icon: Clock, color: "text-warning" },
  { label: "Commissions payées", value: "8 750€", icon: Coins, color: "text-success" },
];

const workflowSteps = [
  "Déclaré", "Qualifié", "Sourcing", "Profil trouvé", "Envoyé client", "Négociation", "Signé"
];

type Lead = {
  id: number;
  client: string;
  position: string;
  currentStep: number;
  date: string;
  priority: string;
  hasProfile?: boolean;
};

const mockLeads: Lead[] = [
  { id: 1, client: "BNP Paribas", position: "Tech Lead React", currentStep: 3, date: "2026-02-10", priority: "urgent", hasProfile: true },
  { id: 2, client: "Société Générale", position: "DevOps Senior", currentStep: 5, date: "2026-02-08", priority: "normal" },
  { id: 3, client: "Anonyme", position: "Data Engineer", currentStep: 1, date: "2026-02-12", priority: "normal" },
  { id: 4, client: "AXA", position: "Architecte Cloud", currentStep: 6, date: "2026-01-25", priority: "urgent" },
];

const commissions = [
  { mission: "DevOps — SG", tjm: "600€", duration: "6 mois", pct: "10%", amount: "7 920€", status: "Payée", paid: true },
  { mission: "Tech Lead — BNP", tjm: "700€", duration: "3 mois", pct: "12%", amount: "5 544€", status: "En attente", paid: false },
  { mission: "Fullstack — Engie", tjm: "550€", duration: "4 mois", pct: "10%", amount: "4 620€", status: "En cours", paid: false },
];

const priorityBadge = (p: string) => {
  if (p === "urgent") return <Badge className="bg-destructive/20 text-destructive border-0 text-xs">Urgent</Badge>;
  return <Badge variant="outline" className="text-xs">Normal</Badge>;
};

const Dashboard = () => {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="font-display text-xl font-bold text-gradient">DealFlow</Link>
          <div className="flex items-center gap-3">
            <Link to="/declare">
              <Button size="sm" className="gradient-primary border-0">
                <Plus className="mr-1.5 h-4 w-4" /> Nouveau besoin
              </Button>
            </Link>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
              JD
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
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
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Suivi des besoins</h2>
            <Link to="/declare">
              <Button variant="ghost" size="sm">
                Voir tout <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-4 space-y-4">
            {mockLeads.map((lead) => (
              <div
                key={lead.id}
                className="gradient-card rounded-xl border border-border/50 p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{lead.position}</span>
                      {priorityBadge(lead.priority)}
                    </div>
                    <span className="mt-1 text-sm text-muted-foreground">{lead.client} · {lead.date}</span>
                  </div>
                  {lead.hasProfile && (
                    <div className="flex gap-2">
                      <Button size="sm" className="gradient-primary border-0">
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Valider profil
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="mr-1 h-3.5 w-3.5" /> Commenter
                      </Button>
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div className="mt-4 flex items-center gap-1">
                  {workflowSteps.map((s, i) => (
                    <div key={s} className="flex flex-1 items-center">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                        i < lead.currentStep
                          ? "gradient-primary text-primary-foreground"
                          : i === lead.currentStep
                          ? "border-2 border-primary bg-primary/20 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }`}>
                        {i < lead.currentStep ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                      </div>
                      {i < workflowSteps.length - 1 && (
                        <div className={`mx-1 h-0.5 flex-1 rounded ${i < lead.currentStep ? "bg-primary" : "bg-border"}`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                  {workflowSteps.map(s => (
                    <span key={s} className="flex-1 text-center">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Commissions */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Commissions</h2>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Mission</th>
                  <th className="pb-3 font-medium">TJM</th>
                  <th className="pb-3 font-medium">Durée</th>
                  <th className="pb-3 font-medium">%</th>
                  <th className="pb-3 font-medium">Montant</th>
                  <th className="pb-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c.mission} className="border-b border-border/30">
                    <td className="py-3 font-medium">{c.mission}</td>
                    <td className="py-3 text-muted-foreground">{c.tjm}</td>
                    <td className="py-3 text-muted-foreground">{c.duration}</td>
                    <td className="py-3 text-muted-foreground">{c.pct}</td>
                    <td className="py-3 font-semibold text-gradient">{c.amount}</td>
                    <td className="py-3">
                      <Badge
                        variant="outline"
                        className={c.paid ? "border-success/30 bg-success/10 text-success" : "border-warning/30 bg-warning/10 text-warning"}
                      >
                        {c.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
