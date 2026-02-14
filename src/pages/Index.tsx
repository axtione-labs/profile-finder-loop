import { motion } from "framer-motion";
import { ArrowRight, Zap, TrendingUp, Shield, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  { icon: Zap, title: "Détectez", desc: "Vous identifiez un besoin IT chez un client" },
  { icon: Clock, title: "Déclarez", desc: "Remplissez le formulaire en 2 minutes" },
  { icon: TrendingUp, title: "Suivez", desc: "Nous trouvons le profil, vous validez" },
  { icon: Shield, title: "Gagnez", desc: "Mission signée = commission versée" },
];

const stats = [
  { value: "48h", label: "Délai moyen de réponse" },
  { value: "15%", label: "Commission moyenne" },
  { value: "92%", label: "Taux de satisfaction" },
];

const Index = () => {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="font-display text-xl font-bold text-gradient">
            DealFlow
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
              Plateforme d'apport d'affaires IT
            </span>
          </motion.div>

          <motion.h1
            className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Vous connaissez un{" "}
            <span className="text-gradient">besoin IT</span> ?{" "}
            Déclarez-le, on s'occupe du reste.
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Déclarez un besoin en 2 minutes. Nous trouvons le profil. Vous touchez votre commission. Sans recruter.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link to="/declare">
              <Button size="lg" className="gradient-primary glow-primary border-0 px-8 text-base font-semibold">
                Déclarer un besoin
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

      {/* How it works */}
      <section className="py-24">
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

      {/* CTA */}
      <section className="border-t border-border/50 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-3xl font-bold">
            Prêt à <span className="text-gradient">monétiser</span> votre réseau ?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Inscription gratuite. Pas d'engagement. Commission dès la première mission.
          </p>
          <Link to="/register">
            <Button size="lg" className="gradient-primary glow-primary mt-8 border-0 px-8 text-base font-semibold">
              Commencer maintenant
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
