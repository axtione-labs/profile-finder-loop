import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, TrendingUp, Shield, Clock, Calculator, ChevronDown, X, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import logoWolf from "@/assets/logo-wolf.png";

const steps = [
  { icon: Zap, title: "Détectez", desc: "Vous identifiez un besoin IT chez un client" },
  { icon: Clock, title: "Déclarez", desc: "Remplissez le formulaire en 2 minutes" },
  { icon: TrendingUp, title: "Suivez", desc: "Nous trouvons le profil, vous validez" },
  { icon: Shield, title: "Gagnez", desc: "Mission signée = commission versée" },
];

const stats = [
  { value: "48h", label: "Délai moyen de réponse" },
  { value: "5-10%", label: "Commission sur le TJM" },
  { value: "92%", label: "Taux de satisfaction" },
];

const faqs = [
  { q: "Comment fonctionne la commission ?", a: "Vous touchez entre 5% et 10% du TJM du consultant placé, chaque mois, pendant toute la durée de la mission. Plus vous déclarez de besoins, plus vos revenus augmentent." },
  { q: "Combien de temps faut-il pour déclarer un besoin ?", a: "Moins de 2 minutes. Il suffit de renseigner le client, le poste recherché et quelques détails. On s'occupe du reste." },
  { q: "Qui trouve le consultant ?", a: "Notre équipe de sourcing identifie et présente les meilleurs profils IT. Vous n'avez pas besoin de recruter." },
  { q: "Quand suis-je payé ?", a: "Les commissions sont versées mensuellement, dès que le consultant travaille. Vous pouvez suivre vos gains en temps réel sur votre dashboard." },
  { q: "Y a-t-il un engagement ?", a: "Aucun engagement. Inscription gratuite. Vous déclarez quand vous voulez, à votre rythme." },
  { q: "Puis-je suivre l'état de mes leads ?", a: "Oui, votre tableau de bord vous donne une visibilité complète : statut du lead, avancement du sourcing, et détail de vos commissions." },
];

// Fake animated data for the dashboard preview
const generateGrowthData = (seed: number) => {
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  return months.map((m, i) => ({
    month: m,
    gains: Math.round((300 + i * 420 + Math.sin(i + seed) * 200) * (1 + seed * 0.05)),
    leads: Math.round(2 + i * 1.5 + Math.cos(i + seed) * 1.5),
  }));
};

const barData = [
  { name: "Sem 1", value: 1200 },
  { name: "Sem 2", value: 1800 },
  { name: "Sem 3", value: 2400 },
  { name: "Sem 4", value: 3100 },
];

const Index = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Simulator state
  const [simTjm, setSimTjm] = useState(500);
  const [simRate, setSimRate] = useState(5);
  const dailyCommission = simTjm * simRate / 100;
  const monthlyCommission = dailyCommission * 20;
  const yearlyCommission = monthlyCommission * 12;

  // Marketing popup
  const [showPopup, setShowPopup] = useState(false);
  const tenLeadsMonthly = monthlyCommission * 10;
  const tenLeadsYearly = yearlyCommission * 10;

  // Animated dashboard counter
  const [tick, setTick] = useState(0);
  const [animatedTotal, setAnimatedTotal] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const target = 42750 + tick * 1250;
    const step = Math.ceil((target - animatedTotal) / 20);
    if (animatedTotal < target) {
      const timer = setTimeout(() => setAnimatedTotal(prev => Math.min(prev + step, target)), 30);
      return () => clearTimeout(timer);
    }
  }, [tick, animatedTotal]);

  const chartData = generateGrowthData(tick % 5);

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoWolf} alt="DealFlow" className="h-9 w-9" />
            <span className="font-display text-xl font-bold text-gradient">DealFlow</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="gradient-primary border-0">
                S'inscrire
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(circle at 30% 50%, hsl(173 80% 45% / 0.15), transparent 50%), radial-gradient(circle at 70% 30%, hsl(190 80% 50% / 0.1), transparent 50%)"
        }} />
        <div className="container relative mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-6 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              🐺 La meute qui chasse vos commissions
            </span>
          </motion.div>

          <motion.h1
            className="mx-auto mt-6 max-w-4xl font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Votre réseau vaut de l'<span className="text-gradient">or</span>.{" "}
            Transformez chaque contact en{" "}
            <span className="text-gradient">revenu passif</span>.
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Un besoin IT détecté → 2 min pour le déclarer → nous trouvons le profil → vous touchez 5 à 10% de commission. Chaque mois. Sans recruter.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link to="/register">
              <Button size="lg" className="gradient-primary glow-primary border-0 px-8 text-base font-semibold">
                Rejoindre la meute
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="lg" className="text-base">
                Voir le dashboard
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mx-auto mt-16 grid max-w-xl grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-display text-3xl font-bold text-gradient">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Commission Simulator - MOVED UP */}
      <section className="py-24 border-t border-border/50">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold flex items-center justify-center gap-3">
              <Calculator className="h-8 w-8 text-primary" />
              Simulez vos gains
            </h2>
            <p className="mt-3 text-muted-foreground">Découvrez combien vous pouvez gagner en apportant des affaires</p>
          </motion.div>

          <motion.div
            className="mx-auto max-w-2xl gradient-card rounded-2xl border border-border/50 p-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-foreground">TJM du consultant (€)</Label>
                <Input
                  type="number"
                  value={simTjm}
                  onChange={e => setSimTjm(Number(e.target.value) || 0)}
                  min={0}
                  className="h-12 text-lg font-semibold bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Votre taux de commission</Label>
                <div className="flex gap-3">
                  {[5, 7, 10].map(rate => (
                    <Button
                      key={rate}
                      variant={simRate === rate ? "default" : "outline"}
                      className={simRate === rate ? "gradient-primary border-0 flex-1" : "flex-1"}
                      onClick={() => setSimRate(rate)}
                    >
                      {rate}%
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-background/30 border border-border/30 p-5 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Par jour</p>
                <p className="mt-2 font-display text-2xl font-bold text-gradient">{dailyCommission.toFixed(0)}€</p>
              </div>
              <div className="rounded-xl bg-background/30 border border-primary/30 p-5 text-center glow-primary">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Par mois</p>
                <p className="mt-2 font-display text-2xl font-bold text-gradient">{monthlyCommission.toLocaleString("fr-FR")}€</p>
                <p className="text-xs text-muted-foreground mt-1">20 jours travaillés</p>
              </div>
              <div className="rounded-xl bg-background/30 border border-border/30 p-5 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Par an</p>
                <p className="mt-2 font-display text-2xl font-bold text-gradient">{yearlyCommission.toLocaleString("fr-FR")}€</p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                className="text-primary hover:text-primary/80 font-medium gap-2"
                onClick={() => setShowPopup(true)}
              >
                <Rocket className="h-4 w-4" />
                Et si vous placiez 10 besoins ? 🚀
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Animated Dashboard Preview */}
      <section className="py-24 border-t border-border/50 overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold">
              Un dashboard qui <span className="text-gradient">fait plaisir</span>
            </h2>
            <p className="mt-3 text-muted-foreground">Suivez vos gains en temps réel et regardez-les monter</p>
          </motion.div>

          <motion.div
            className="mx-auto max-w-4xl gradient-card rounded-2xl border border-border/50 p-6 sm:p-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Top stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="rounded-xl bg-background/40 border border-border/30 p-4">
                <p className="text-xs text-muted-foreground">Total gagné</p>
                <motion.p
                  className="mt-1 font-display text-xl sm:text-2xl font-bold text-gradient"
                  key={animatedTotal}
                >
                  {animatedTotal.toLocaleString("fr-FR")}€
                </motion.p>
              </div>
              <div className="rounded-xl bg-background/40 border border-border/30 p-4">
                <p className="text-xs text-muted-foreground">Ce mois</p>
                <p className="mt-1 font-display text-xl sm:text-2xl font-bold text-success">
                  +{(3100 + tick * 150).toLocaleString("fr-FR")}€
                </p>
              </div>
              <div className="rounded-xl bg-background/40 border border-border/30 p-4">
                <p className="text-xs text-muted-foreground">Leads actifs</p>
                <p className="mt-1 font-display text-xl sm:text-2xl font-bold text-foreground">{7 + (tick % 3)}</p>
              </div>
              <div className="rounded-xl bg-background/40 border border-primary/20 p-4">
                <p className="text-xs text-muted-foreground">Missions</p>
                <p className="mt-1 font-display text-xl sm:text-2xl font-bold text-primary">{3 + Math.floor(tick / 2)}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3 rounded-xl bg-background/30 border border-border/30 p-4">
                <p className="text-sm font-medium text-muted-foreground mb-4">📈 Évolution des gains</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="gainGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(173, 80%, 45%)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(173, 80%, 45%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(224, 25%, 12%)', border: '1px solid hsl(224, 20%, 20%)', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: 'hsl(210, 20%, 95%)' }}
                      formatter={(v: number) => [`${v.toLocaleString("fr-FR")}€`, "Gains"]}
                    />
                    <Area type="monotone" dataKey="gains" stroke="hsl(173, 80%, 45%)" fill="url(#gainGradient)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="lg:col-span-2 rounded-xl bg-background/30 border border-border/30 p-4">
                <p className="text-sm font-medium text-muted-foreground mb-4">💰 Revenus hebdo</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData.map((d, i) => ({ ...d, value: d.value + tick * 80 * (i + 1) }))}>
                    <XAxis dataKey="name" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(224, 25%, 12%)', border: '1px solid hsl(224, 20%, 20%)', borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => [`${v.toLocaleString("fr-FR")}€`, "Revenu"]}
                    />
                    <Bar dataKey="value" fill="hsl(173, 80%, 45%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Fake notification */}
            <AnimatePresence mode="wait">
              <motion.div
                key={tick}
                className="mt-6 flex items-center gap-3 rounded-lg border border-success/20 bg-success/5 px-4 py-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <span className="text-success text-lg">💸</span>
                <span className="text-sm text-success font-medium">
                  Nouvelle commission créditée : +{(250 + tick * 50).toLocaleString("fr-FR")}€
                </span>
                <span className="ml-auto text-xs text-muted-foreground">à l'instant</span>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t border-border/50">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold">Comment ça marche</h2>
            <p className="mt-3 text-muted-foreground">4 étapes pour transformer un contact en commission</p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                className="gradient-card rounded-xl border border-border/50 p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                  <step.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="mt-4 font-display text-lg font-semibold">{step.title}</div>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Marketing Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPopup(false)}
          >
            <motion.div
              className="relative w-full max-w-md gradient-card rounded-2xl border border-primary/30 p-8 glow-primary"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full gradient-primary">
                  <Rocket className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-display text-2xl font-bold">
                  Imaginez <span className="text-gradient">10 besoins</span> placés
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Avec un TJM de {simTjm}€ et {simRate}% de commission
                </p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-background/30 border border-border/30 p-4 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Par mois</p>
                  <p className="mt-2 font-display text-3xl font-bold text-gradient">
                    {tenLeadsMonthly.toLocaleString("fr-FR")}€
                  </p>
                </div>
                <div className="rounded-xl bg-background/30 border border-primary/30 p-4 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Par an</p>
                  <p className="mt-2 font-display text-3xl font-bold text-gradient">
                    {tenLeadsYearly.toLocaleString("fr-FR")}€
                  </p>
                </div>
              </div>
              <Link to="/register" className="block mt-6">
                <Button className="w-full gradient-primary border-0 font-semibold text-base h-12">
                  Commencer à gagner maintenant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQ */}
      <section className="py-24 border-t border-border/50">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold">Questions fréquentes</h2>
            <p className="mt-3 text-muted-foreground">Tout ce que vous devez savoir avant de vous lancer</p>
          </motion.div>

          <div className="mx-auto max-w-2xl space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                className="gradient-card rounded-xl border border-border/50 overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  className="flex w-full items-center justify-between p-5 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-foreground pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-3xl font-bold">
            Prêt à <span className="text-gradient">monétiser</span> votre réseau ?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Inscription gratuite. Pas d'engagement. Commission entre 5% et 10% dès la première mission.
          </p>
          <Link to="/register">
            <Button size="lg" className="gradient-primary glow-primary mt-8 border-0 px-8 text-base font-semibold">
              Rejoindre la meute 🐺
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          © 2026 DealFlow. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default Index;
