import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, TrendingUp, Shield, Clock, Calculator, ChevronDown, X, Rocket, Code, Server, FolderKanban, Database, Cloud, Cpu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const itNeeds = [
  { icon: Server, role: "Ingénieur DevOps", client: "Banque Nationale", stack: "AWS · Kubernetes · Terraform", tjm: "650€", urgency: "Urgent" },
  { icon: Code, role: "Développeur Full-Stack", client: "Startup FinTech", stack: "React · Node.js · TypeScript", tjm: "550€", urgency: "Normal" },
  { icon: FolderKanban, role: "Chef de Projet IT", client: "Groupe Industriel", stack: "Agile · Jira · SAFe", tjm: "700€", urgency: "Urgent" },
  { icon: Database, role: "Data Engineer", client: "Assurance Européenne", stack: "Python · Spark · Airflow", tjm: "600€", urgency: "Normal" },
  { icon: Cloud, role: "Architecte Cloud", client: "Ministère de la Défense", stack: "Azure · Docker · CI/CD", tjm: "750€", urgency: "Urgent" },
  { icon: Cpu, role: "Ingénieur IA / ML", client: "Laboratoire Pharma", stack: "Python · TensorFlow · MLOps", tjm: "800€", urgency: "Normal" },
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

  // Animated IT needs carousel
  const [activeNeed, setActiveNeed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setActiveNeed(i => (i + 1) % itNeeds.length), 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoWolf} alt="DealFlow" className="h-12 w-12" />
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
                variant="outline"
                size="lg"
                className="text-primary border-primary/40 hover:bg-primary/10 font-semibold gap-2 text-base px-6"
                onClick={() => setShowPopup(true)}
              >
                <Rocket className="h-5 w-5" />
                Et si vous placiez 10 besoins ? 🚀
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Animated IT Needs Showcase */}
      <section className="py-24 border-t border-border/50 overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold">
              Des besoins <span className="text-gradient">IT</span> partout autour de vous
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              DevOps, développeurs, chefs de projet… Vous les connaissez. Remontez le besoin, on s'occupe de trouver le profil.
            </p>
          </motion.div>

          <div className="mx-auto max-w-3xl">
            {/* Carousel of needs */}
            <div className="relative min-h-[180px]">
              <AnimatePresence mode="wait">
                {itNeeds.map((need, i) => i === activeNeed && (
                  <motion.div
                    key={need.role}
                    className="gradient-card rounded-2xl border border-border/50 p-6 sm:p-8"
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -60 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl gradient-primary">
                        <need.icon className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-display text-xl font-bold">{need.role}</h3>
                          {need.urgency === "Urgent" && (
                            <span className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-medium text-destructive">
                              🔴 Urgent
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Client : <span className="text-foreground font-medium">{need.client}</span>
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {need.stack.split(" · ").map(tech => (
                            <span key={tech} className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                              {tech}
                            </span>
                          ))}
                          <span className="ml-auto font-display text-lg font-bold text-gradient">{need.tjm}/j</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Dots */}
            <div className="mt-6 flex justify-center gap-2">
              {itNeeds.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveNeed(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === activeNeed ? "w-8 bg-primary" : "w-2 bg-border hover:bg-muted-foreground"
                  }`}
                />
              ))}
            </div>

            {/* CTA */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-muted-foreground mb-4">
                Vous avez un besoin similaire ? <span className="text-foreground font-medium">2 minutes suffisent.</span>
              </p>
              <Link to="/declare">
                <Button size="lg" className="gradient-primary glow-primary border-0 px-8 text-base font-semibold">
                  Déclarer ce besoin
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
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
