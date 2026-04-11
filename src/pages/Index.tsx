import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, TrendingUp, Shield, Clock, Calculator, ChevronDown, X, Rocket, Code, Server, FolderKanban, Database, Cloud, Cpu, BookOpen, HelpCircle, Mail, Send, Target, Eye, Crosshair } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const steps = [
  { icon: Eye, title: "Repérez", desc: "Identifiez un besoin IT dans votre réseau" },
  { icon: Target, title: "Déclarez", desc: "Remplissez le formulaire en 2 minutes" },
  { icon: Crosshair, title: "Traquez", desc: "On trouve le profil, vous validez" },
  { icon: Shield, title: "Encaissez", desc: "Mission signée = gains versés" },
];

const stats = [
  { value: "48h", label: "Temps de réponse" },
  { value: "5-10%", label: "Taux de commission" },
  { value: "92%", label: "Satisfaction" },
];

const faqs = [
  { q: "Comment sont calculés vos gains ?", a: "Vous touchez entre 5% et 10% du TJM du consultant placé, chaque mois, pendant toute la durée de la mission. Plus vous déclarez de besoins, plus vos revenus augmentent." },
  { q: "Combien de temps faut-il pour déclarer un besoin ?", a: "Moins de 2 minutes. Il suffit de renseigner le client, le poste recherché et quelques détails. On s'occupe du reste." },
  { q: "Qui trouve le consultant ?", a: "Notre équipe de sourcing identifie et présente les meilleurs profils IT. Vous n'avez pas besoin de recruter." },
  { q: "Quand suis-je payé ?", a: "Les gains sont versés mensuellement, dès que le consultant travaille. Vous pouvez suivre vos revenus en temps réel sur votre dashboard." },
  { q: "Y a-t-il un engagement ?", a: "Aucun engagement. Inscription gratuite. Vous déclarez quand vous voulez, à votre rythme." },
  { q: "Puis-je suivre l'état de mes leads ?", a: "Oui, votre tableau de bord vous donne une visibilité complète : statut du lead, avancement du sourcing, et détail de vos gains." },
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
    summary: "Un apporteur d'affaires IT est un intermédiaire qui met en relation des entreprises ayant des besoins en recrutement IT avec des ESN ou des cabinets de recrutement. Il identifie les opportunités dans son réseau professionnel et les transmet à un partenaire capable de les traiter.",
    icon: BookOpen,
  },
  {
    title: "Comment devenir apporteur d'affaires dans l'IT ?",
    summary: "Pas besoin de diplôme spécifique ni de carte professionnelle. Si vous travaillez dans l'écosystème IT — en tant que commercial, consultant, manager, ou même freelance — vous avez déjà le réseau nécessaire.",
    icon: Rocket,
  },
  {
    title: "Combien gagne un apporteur d'affaires IT ?",
    summary: "La rémunération est proportionnelle au TJM du consultant placé. Avec un taux de 5 à 10% sur un TJM moyen de 550€, cela représente entre 27€ et 55€ par jour travaillé par le consultant.",
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

  const [simTjm, setSimTjm] = useState(500);
  const [simRate, setSimRate] = useState(5);
  const dailyCommission = simTjm * simRate / 100;
  const monthlyCommission = dailyCommission * 20;
  const yearlyCommission = monthlyCommission * 12;

  const [showPopup, setShowPopup] = useState(false);
  const tenLeadsMonthly = monthlyCommission * 10;
  const tenLeadsYearly = yearlyCommission * 10;

  const [activeNeed, setActiveNeed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setActiveNeed(i => (i + 1) % itNeeds.length), 3500);
    return () => clearInterval(interval);
  }, []);

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
      toast.success("Message envoyé avec succès !");
      setContactForm({ firstName: "", lastName: "", email: "", role: "", subject: "", message: "" });
    } catch (err: any) {
      toast.error("Erreur lors de l'envoi du message.");
      console.error(err);
    } finally {
      setSendingContact(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/lynx-logo.png" alt="Lynx" className="w-9 h-9 sm:w-10 sm:h-10" />
            <span className="font-display text-xl sm:text-2xl font-extrabold text-gradient-gold tracking-tight">Lynx</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <a href="#comment-ca-marche" className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Comment ça marche</a>
            <a href="#blog" className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Blog</a>
            <a href="#faq" className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">FAQ</a>
            <a href="#contact" className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Contact</a>
            {user ? (
              <Link to="/dashboard">
                <Button size="sm" className="gradient-primary border-0 text-xs sm:text-sm px-3 sm:px-5 font-semibold">
                  Mon Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 font-medium">Connexion</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="gradient-primary border-0 text-xs sm:text-sm px-3 sm:px-5 font-semibold">
                    Rejoindre Lynx
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        {/* Accent glow */}
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(ellipse at 25% 50%, hsl(150 40% 22% / 0.08), transparent 60%), radial-gradient(ellipse at 75% 30%, hsl(35 60% 50% / 0.06), transparent 50%)"
        }} />

        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent-foreground">
                <Crosshair className="w-3.5 h-3.5" />
                La précision du lynx au service de vos gains
              </span>
            </motion.div>

            <motion.h1
              className="mt-8 font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            >
              Repérez. Déclarez.{" "}
              <span className="text-gradient-gold">Encaissez.</span>
            </motion.h1>

            <motion.p
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            >
              Lynx transforme votre réseau IT en source de revenus récurrents.
              Détectez un besoin, on chasse le profil.{" "}
              <span className="font-semibold text-foreground">5 à 10% de commission chaque mois.</span>
            </motion.p>

            {/* Pipeline pills */}
            <motion.div
              className="mx-auto mt-10 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                {[
                  { icon: Eye, label: "Besoin IT\nrepéré" },
                  { icon: Target, label: "2 min pour\ndéclarer" },
                  { icon: TrendingUp, label: "Gains versés\nchaque mois" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 sm:gap-4">
                    <motion.div
                      className="flex items-center gap-2.5 rounded-full bg-primary/8 border border-primary/20 pl-3 pr-5 py-2.5"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.45 + i * 0.12 }}
                      whileHover={{ scale: 1.03 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-semibold text-primary whitespace-pre-line leading-tight">
                        {item.label}
                      </span>
                    </motion.div>
                    {i < 2 && (
                      <>
                        <ArrowRight className="hidden sm:block h-4 w-4 text-muted-foreground/40" />
                        <ChevronDown className="sm:hidden h-4 w-4 text-muted-foreground/40" />
                      </>
                    )}
                  </div>
                ))}
              </div>

              <motion.p
                className="mt-6 text-muted-foreground text-center"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
              >
                On traque le profil. Vous touchez vos gains.{" "}
                <motion.span
                  className="relative inline-block text-foreground font-extrabold text-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.1, type: "spring" }}
                >
                  <motion.span
                    className="absolute -inset-x-2 -inset-y-1 rounded-lg bg-accent/15 -z-10"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3, delay: 1.3 }}
                    style={{ originX: 0 }}
                  />
                  Sans recruter.
                </motion.span>
              </motion.p>
            </motion.div>

            <motion.div
              className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link to="/register">
                <Button size="lg" className="gradient-primary glow-primary border-0 px-8 text-base font-semibold h-12">
                  Commencer la chasse
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#comment-ca-marche">
                <Button variant="outline" size="lg" className="text-base h-12 border-border hover:bg-secondary">
                  Comment ça marche
                </Button>
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="mx-auto mt-16 grid max-w-lg grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}
            >
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-display text-3xl font-extrabold text-gradient-gold">{s.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Commission Simulator */}
      <section className="py-20 border-t border-border/50 bg-secondary/30">
        <div className="container mx-auto px-6">
          <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold flex items-center justify-center gap-3">
              <Calculator className="h-7 w-7 text-accent" />
              Simulez vos gains
            </h2>
            <p className="mt-3 text-muted-foreground">Estimez vos revenus passifs en quelques clics</p>
          </motion.div>

          <motion.div
            className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">TJM du consultant (€)</Label>
                <Input type="number" value={simTjm} onChange={e => setSimTjm(Number(e.target.value) || 0)} min={0} className="h-12 text-lg font-semibold" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Votre taux de commission</Label>
                <div className="flex gap-3">
                  {[5, 7, 10].map(rate => (
                    <Button
                      key={rate}
                      variant={simRate === rate ? "default" : "outline"}
                      className={`flex-1 ${simRate === rate ? "gradient-primary border-0" : ""}`}
                      onClick={() => setSimRate(rate)}
                    >
                      {rate}%
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 grid-cols-3">
              <div className="rounded-xl border border-border bg-background p-4 text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">Par jour</p>
                <p className="mt-2 font-display text-xl sm:text-2xl font-bold text-gradient-gold">{dailyCommission.toFixed(0)}€</p>
              </div>
              <div className="rounded-xl border-2 border-accent/40 bg-accent/5 p-4 text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">Par mois</p>
                <p className="mt-2 font-display text-xl sm:text-2xl font-bold text-gradient-gold">{monthlyCommission.toLocaleString("fr-FR")}€</p>
                <p className="text-[10px] text-muted-foreground mt-1 hidden sm:block">20 jours travaillés</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4 text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">Par an</p>
                <p className="mt-2 font-display text-xl sm:text-2xl font-bold text-gradient-gold">{yearlyCommission.toLocaleString("fr-FR")}€</p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button
                variant="outline"
                className="text-accent-foreground border-accent/40 hover:bg-accent/10 font-semibold gap-2"
                onClick={() => setShowPopup(true)}
              >
                <Rocket className="h-4 w-4" />
                Et si vous placiez 10 besoins ?
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* IT Needs Carousel */}
      <section className="py-20 border-t border-border/50 overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold">
              Des proies <span className="text-gradient-gold">partout</span> autour de vous
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              DevOps, développeurs, chefs de projet… Remontez le besoin, on traque le profil.
            </p>
          </motion.div>

          <div className="mx-auto max-w-3xl">
            <div className="relative min-h-[180px]">
              <AnimatePresence mode="wait">
                {itNeeds.map((need, i) => i === activeNeed && (
                  <motion.div
                    key={need.role}
                    className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm"
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -60 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                      <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl gradient-primary">
                        <need.icon className="h-5 w-5 sm:h-7 sm:w-7 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-display text-xl font-bold">{need.role}</h3>
                          {need.urgency === "Urgent" && (
                            <span className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-medium text-destructive">Urgent</span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Client : <span className="text-foreground font-medium">{need.client}</span>
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {need.stack.split(" · ").map(tech => (
                            <span key={tech} className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-medium text-primary">{tech}</span>
                          ))}
                          <span className="ml-auto font-display text-lg font-bold text-gradient-gold">{need.tjm}/j</span>
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

            <motion.div className="mt-8 text-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <p className="text-muted-foreground mb-4">
                Vous avez un besoin similaire ? <span className="text-foreground font-medium">2 minutes suffisent.</span>
              </p>
              <Link to="/register">
                <Button size="lg" className="gradient-primary glow-primary border-0 px-8 font-semibold">
                  Déclarer ce besoin
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="comment-ca-marche" className="py-20 border-t border-border/50 bg-secondary/30">
        <div className="container mx-auto px-6">
          <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold">La stratégie du <span className="text-gradient-gold">lynx</span></h2>
            <p className="mt-3 text-muted-foreground">4 étapes pour transformer un contact en revenus récurrents</p>
          </motion.div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary text-primary-foreground font-bold text-sm">
                    {i + 1}
                  </div>
                  <step.icon className="h-5 w-5 text-accent" />
                </div>
                <div className="font-display text-lg font-semibold">{step.title}</div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      <section id="blog" className="py-20 border-t border-border/50">
        <div className="container mx-auto px-6">
          <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold flex items-center justify-center gap-3">
              <BookOpen className="h-7 w-7 text-accent" />
              L'apport d'affaires IT
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Tout comprendre sur le métier d'apporteur d'affaires dans le secteur IT
            </p>
          </motion.div>

          <div className="mx-auto max-w-4xl grid gap-6 md:grid-cols-3">
            {blogArticles.map((article, i) => (
              <motion.div
                key={article.title}
                className="rounded-xl border border-border bg-card p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow"
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
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowPopup(false)}
          >
            <motion.div
              className="relative w-full max-w-md rounded-2xl border border-accent/30 bg-card p-8 shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowPopup(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full gradient-primary">
                  <Rocket className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-display text-2xl font-bold">
                  Imaginez <span className="text-gradient-gold">10 proies</span> capturées
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Avec un TJM de {simTjm}€ et {simRate}% de commission
                </p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-background p-4 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Par mois</p>
                  <p className="mt-2 font-display text-3xl font-bold text-gradient-gold">{tenLeadsMonthly.toLocaleString("fr-FR")}€</p>
                </div>
                <div className="rounded-xl border-2 border-accent/40 bg-accent/5 p-4 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Par an</p>
                  <p className="mt-2 font-display text-3xl font-bold text-gradient-gold">{tenLeadsYearly.toLocaleString("fr-FR")}€</p>
                </div>
              </div>
              <Link to="/register" className="block mt-6">
                <Button className="w-full gradient-primary border-0 font-semibold text-base h-12">
                  Commencer la chasse
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQ */}
      <section id="faq" className="py-20 border-t border-border/50 bg-secondary/30">
        <div className="container mx-auto px-6">
          <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold flex items-center justify-center gap-3">
              <HelpCircle className="h-7 w-7 text-accent" />
              Questions fréquentes
            </h2>
            <p className="mt-3 text-muted-foreground">Tout ce que vous devez savoir avant de vous lancer</p>
          </motion.div>

          <div className="mx-auto max-w-2xl space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                className="rounded-xl border border-border bg-card overflow-hidden shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
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

      {/* Contact */}
      <section id="contact" className="py-20 border-t border-border/50">
        <div className="container mx-auto px-6">
          <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold flex items-center justify-center gap-3">
              <Mail className="h-7 w-7 text-accent" />
              Nous contacter
            </h2>
            <p className="mt-3 text-muted-foreground">Une question ? Un partenariat ? Envoyez-nous un message.</p>
          </motion.div>

          <motion.div
            className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
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
                  <SelectTrigger className="h-11"><SelectValue placeholder="Sélectionnez votre rôle" /></SelectTrigger>
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
      <section className="border-t border-border/50 py-20 bg-secondary/30">
        <div className="container mx-auto px-6 text-center">
          <img src="/lynx-logo.png" alt="Lynx" className="mx-auto w-16 h-16 mb-6 opacity-80" loading="lazy" width={512} height={512} />
          <h2 className="font-display text-3xl font-bold">
            Prêt à <span className="text-gradient-gold">chasser</span> ?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            Inscription gratuite. Pas d'engagement. Commission entre 5% et 10% dès la première mission.
          </p>
          <Link to="/register">
            <Button size="lg" className="gradient-primary glow-primary mt-8 border-0 px-8 text-base font-semibold h-12">
              Rejoindre Lynx
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 bg-background">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/lynx-logo.png" alt="Lynx" className="w-6 h-6 opacity-60" loading="lazy" width={512} height={512} />
            <span className="text-sm text-muted-foreground">© 2026 Lynx. Tous droits réservés.</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
