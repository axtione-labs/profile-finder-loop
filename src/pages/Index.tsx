import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, TrendingUp, Shield, Clock, Calculator, ChevronDown, X, Rocket, Code, Server, FolderKanban, Database, Cloud, Cpu, BookOpen, HelpCircle, Mail, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap as ZapLogo } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const blogArticles = [
  {
    title: "Qu'est-ce qu'un apporteur d'affaires IT ?",
    summary: "Un apporteur d'affaires IT est un intermédiaire qui met en relation des entreprises ayant des besoins en recrutement IT avec des ESN ou des cabinets de recrutement. Il identifie les opportunités dans son réseau professionnel et les transmet à un partenaire capable de les traiter. En échange, il perçoit une commission sur chaque placement réussi.",
    icon: BookOpen,
  },
  {
    title: "Comment devenir apporteur d'affaires dans l'IT ?",
    summary: "Pas besoin de diplôme spécifique ni de carte professionnelle. Si vous travaillez dans l'écosystème IT — en tant que commercial, consultant, manager, ou même freelance — vous avez déjà le réseau nécessaire. Il suffit de détecter les besoins autour de vous : un client qui cherche un DevOps, une DSI qui a besoin d'un chef de projet… Vous déclarez le besoin, et votre partenaire s'occupe du reste.",
    icon: Rocket,
  },
  {
    title: "Combien gagne un apporteur d'affaires IT ?",
    summary: "La rémunération est proportionnelle au TJM du consultant placé. Avec une commission de 5 à 10% sur un TJM moyen de 550€, cela représente entre 27€ et 55€ par jour travaillé par le consultant. Sur 20 jours mensuels, un seul placement peut rapporter entre 550€ et 1 100€/mois. En cumulant plusieurs placements, les revenus deviennent très significatifs.",
    icon: TrendingUp,
  },
];

const contactRoles = [
  "ESN / Cabinet de recrutement",
  "Commercial IT",
  "Consultant indépendant",
  "Manager / DSI",
  "Freelance IT",
  "Autre",
];

const Index = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { user } = useAuth();

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

  // Contact form
  const [contactForm, setContactForm] = useState({
    firstName: "", lastName: "", email: "", role: "", subject: "", message: "",
  });
  const [sendingContact, setSendingContact] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingContact(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: contactForm,
      });
      if (error) throw error;
      toast.success("Message envoyé avec succès ! Nous reviendrons vers vous rapidement.");
      setContactForm({ firstName: "", lastName: "", email: "", role: "", subject: "", message: "" });
    } catch (err: any) {
      toast.error("Erreur lors de l'envoi du message. Réessayez plus tard.");
      console.error(err);
    } finally {
      setSendingContact(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 gradient-primary rounded-xl flex items-center justify-center">
              <ZapLogo className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="font-display text-lg sm:text-xl font-bold text-gradient">DealFlowNetwork</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <a href="#blog" className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</a>
            <a href="#faq" className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
            <a href="#contact" className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button size="sm" className="gradient-primary border-0 text-xs sm:text-sm px-3 sm:px-4">
                    Mon Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">Connexion</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="gradient-primary border-0 text-xs sm:text-sm px-3 sm:px-4">
                    S'inscrire
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(circle at 30% 50%, hsl(173 80% 45% / 0.15), transparent 50%), radial-gradient(circle at 70% 30%, hsl(190 80% 50% / 0.1), transparent 50%)"
        }} />
        <div className="container relative mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-6 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              🐺 La meute qui chasse vos commissions
            </span>
          </motion.div>

          <motion.h1
            className="mx-auto mt-6 max-w-4xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          >
            Votre réseau vaut de l'<span className="text-gradient">or</span>.{" "}
            Transformez chaque contact en <span className="text-gradient">revenu passif</span>.
          </motion.h1>

          <motion.div className="mx-auto mt-8 max-w-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2 text-base sm:text-lg">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 border border-primary/25 px-4 py-2 font-medium text-primary">
                <Zap className="h-4 w-4" /> Besoin IT détecté
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <ChevronDown className="h-4 w-4 text-muted-foreground sm:hidden" />
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 border border-primary/25 px-4 py-2 font-medium text-primary">
                <Clock className="h-4 w-4" /> 2 min pour déclarer
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <ChevronDown className="h-4 w-4 text-muted-foreground sm:hidden" />
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 border border-primary/25 px-4 py-2 font-medium text-primary">
                <TrendingUp className="h-4 w-4" /> 5 à 10% chaque jour
              </span>
            </div>
            <p className="mt-4 text-muted-foreground text-center text-base">
              On trouve le profil. Vous touchez la commission.{" "}
              <motion.span
                className="relative inline-block text-foreground font-extrabold text-lg sm:text-xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8, type: "spring", stiffness: 200 }}
              >
                <motion.span
                  className="absolute -inset-x-2 -inset-y-1 rounded-lg bg-primary/20 -z-10"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.4, delay: 1.2 }}
                  style={{ originX: 0 }}
                />
                <motion.span
                  animate={{ 
                    textShadow: [
                      "0 0 0px hsl(var(--primary))",
                      "0 0 20px hsl(var(--primary))",
                      "0 0 0px hsl(var(--primary))"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  Sans recruter.
                </motion.span>
              </motion.span>
            </p>
          </motion.div>

          <motion.div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            <Link to="/register">
              <Button size="lg" className="gradient-primary glow-primary border-0 px-6 sm:px-8 text-sm sm:text-base font-semibold">
                Rejoindre la meute
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#blog">
              <Button variant="outline" size="lg" className="text-base">
                En savoir plus
              </Button>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div className="mx-auto mt-12 grid max-w-xl grid-cols-3 gap-4 sm:gap-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-display text-3xl font-bold text-gradient">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Commission Simulator */}
      <section className="py-24 border-t border-border/50">
        <div className="container mx-auto px-6">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold flex items-center justify-center gap-3">
              <Calculator className="h-8 w-8 text-primary" />
              Simulez vos gains
            </h2>
            <p className="mt-3 text-muted-foreground">Découvrez combien vous pouvez gagner en apportant des affaires</p>
          </motion.div>

          <motion.div className="mx-auto max-w-2xl gradient-card rounded-2xl border border-border/50 p-5 sm:p-8" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-foreground">TJM du consultant (€)</Label>
                <Input type="number" value={simTjm} onChange={e => setSimTjm(Number(e.target.value) || 0)} min={0} className="h-12 text-lg font-semibold bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Votre taux de commission</Label>
                <div className="flex gap-3">
                  {[5, 7, 10].map(rate => (
                    <Button key={rate} variant={simRate === rate ? "default" : "outline"} className={simRate === rate ? "gradient-primary border-0 flex-1" : "flex-1"} onClick={() => setSimRate(rate)}>
                      {rate}%
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 grid-cols-3">
              <div className="rounded-xl bg-background/30 border border-border/30 p-3 sm:p-5 text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Par jour</p>
                <p className="mt-1 sm:mt-2 font-display text-lg sm:text-2xl font-bold text-gradient">{dailyCommission.toFixed(0)}€</p>
              </div>
              <div className="rounded-xl bg-background/30 border border-primary/30 p-3 sm:p-5 text-center glow-primary">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Par mois</p>
                <p className="mt-1 sm:mt-2 font-display text-lg sm:text-2xl font-bold text-gradient">{monthlyCommission.toLocaleString("fr-FR")}€</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">20 jours travaillés</p>
              </div>
              <div className="rounded-xl bg-background/30 border border-border/30 p-3 sm:p-5 text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Par an</p>
                <p className="mt-1 sm:mt-2 font-display text-lg sm:text-2xl font-bold text-gradient">{yearlyCommission.toLocaleString("fr-FR")}€</p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button variant="outline" size="default" className="text-primary border-primary/40 hover:bg-primary/10 font-semibold gap-2 text-sm sm:text-base px-4 sm:px-6" onClick={() => setShowPopup(true)}>
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
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold">
              Des besoins <span className="text-gradient">IT</span> partout autour de vous
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              DevOps, développeurs, chefs de projet… Vous les connaissez. Remontez le besoin, on s'occupe de trouver le profil.
            </p>
          </motion.div>

          <div className="mx-auto max-w-3xl">
            <div className="relative min-h-[180px]">
              <AnimatePresence mode="wait">
                {itNeeds.map((need, i) => i === activeNeed && (
                  <motion.div key={need.role} className="gradient-card rounded-2xl border border-border/50 p-6 sm:p-8" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.4, ease: "easeInOut" }}>
                    <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                      <div className="flex h-11 w-11 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl gradient-primary">
                        <need.icon className="h-5 w-5 sm:h-7 sm:w-7 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-display text-xl font-bold">{need.role}</h3>
                          {need.urgency === "Urgent" && (
                            <span className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-medium text-destructive">🔴 Urgent</span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Client : <span className="text-foreground font-medium">{need.client}</span>
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {need.stack.split(" · ").map(tech => (
                            <span key={tech} className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-medium text-primary">{tech}</span>
                          ))}
                          <span className="ml-auto font-display text-lg font-bold text-gradient">{need.tjm}/j</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-6 flex justify-center gap-2">
              {itNeeds.map((_, i) => (
                <button key={i} onClick={() => setActiveNeed(i)} className={`h-2 rounded-full transition-all duration-300 ${i === activeNeed ? "w-8 bg-primary" : "w-2 bg-border hover:bg-muted-foreground"}`} />
              ))}
            </div>

            <motion.div className="mt-8 text-center" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-muted-foreground mb-4">
                Vous avez un besoin similaire ? <span className="text-foreground font-medium">2 minutes suffisent.</span>
              </p>
              <Link to="/register">
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
          <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold">Comment ça marche</h2>
            <p className="mt-3 text-muted-foreground">4 étapes pour transformer un contact en commission</p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div key={step.title} className="gradient-card rounded-xl border border-border/50 p-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
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

      {/* Blog Section */}
      <section id="blog" className="py-24 border-t border-border/50">
        <div className="container mx-auto px-6">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold flex items-center justify-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              L'apport d'affaires IT, comment ça marche ?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Tout comprendre sur le métier d'apporteur d'affaires dans le secteur IT
            </p>
          </motion.div>

          <div className="mx-auto max-w-4xl grid gap-6 md:grid-cols-3">
            {blogArticles.map((article, i) => (
              <motion.div
                key={article.title}
                className="gradient-card rounded-xl border border-border/50 p-6 flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary mb-4">
                  <article.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-3">{article.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{article.summary}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Marketing Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPopup(false)}>
            <motion.div className="relative w-full max-w-md gradient-card rounded-2xl border border-primary/30 p-8 glow-primary" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowPopup(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
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
                  <p className="mt-2 font-display text-3xl font-bold text-gradient">{tenLeadsMonthly.toLocaleString("fr-FR")}€</p>
                </div>
                <div className="rounded-xl bg-background/30 border border-primary/30 p-4 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Par an</p>
                  <p className="mt-2 font-display text-3xl font-bold text-gradient">{tenLeadsYearly.toLocaleString("fr-FR")}€</p>
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
      <section id="faq" className="py-24 border-t border-border/50">
        <div className="container mx-auto px-6">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold flex items-center justify-center gap-3">
              <HelpCircle className="h-8 w-8 text-primary" />
              Questions fréquentes
            </h2>
            <p className="mt-3 text-muted-foreground">Tout ce que vous devez savoir avant de vous lancer</p>
          </motion.div>

          <div className="mx-auto max-w-2xl space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} className="gradient-card rounded-xl border border-border/50 overflow-hidden" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <button className="flex w-full items-center justify-between p-5 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-medium text-foreground pr-4">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 border-t border-border/50">
        <div className="container mx-auto px-6">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold flex items-center justify-center gap-3">
              <Mail className="h-8 w-8 text-primary" />
              Nous contacter
            </h2>
            <p className="mt-3 text-muted-foreground">Une question ? Un partenariat ? Envoyez-nous un message.</p>
          </motion.div>

          <motion.div className="mx-auto max-w-xl gradient-card rounded-2xl border border-border/50 p-6 sm:p-8" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prénom <span className="text-destructive">*</span></Label>
                  <Input value={contactForm.firstName} onChange={e => setContactForm(f => ({ ...f, firstName: e.target.value }))} required className="h-11" placeholder="Jean" />
                </div>
                <div className="space-y-2">
                  <Label>Nom <span className="text-destructive">*</span></Label>
                  <Input value={contactForm.lastName} onChange={e => setContactForm(f => ({ ...f, lastName: e.target.value }))} required className="h-11" placeholder="Dupont" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} required className="h-11" placeholder="jean@exemple.com" />
              </div>

              <div className="space-y-2">
                <Label>Rôle <span className="text-destructive">*</span></Label>
                <Select value={contactForm.role} onValueChange={v => setContactForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Sélectionnez votre rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactRoles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sujet <span className="text-destructive">*</span></Label>
                <Input value={contactForm.subject} onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))} required className="h-11" placeholder="Objet de votre demande" />
              </div>

              <div className="space-y-2">
                <Label>Message <span className="text-destructive">*</span></Label>
                <Textarea value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} required rows={4} placeholder="Décrivez votre demande..." className="resize-none" />
              </div>

              <Button type="submit" className="w-full h-11 gradient-primary border-0 font-semibold" disabled={sendingContact || !contactForm.role}>
                <Send className="h-4 w-4 mr-2" />
                {sendingContact ? "Envoi en cours..." : "Envoyer le message"}
              </Button>
            </form>
          </motion.div>
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
          © 2026 DealFlowNetwork. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default Index;
