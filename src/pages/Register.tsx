import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Zap, CheckCircle } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";

const benefits = [
  "Déclarez un besoin en 2 minutes",
  "Suivi en temps réel de vos leads",
  "Gains transparents et versés mensuellement",
];

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setIsLoading(true);
    const { error } = await signUp(email, password, {
      first_name: firstName,
      last_name: lastName,
      phone,
      company,
    });
    setIsLoading(false);

    if (error) {
      if (error.message?.toLowerCase().includes("already registered") || error.message?.toLowerCase().includes("already been registered") || error.message?.toLowerCase().includes("user already registered")) {
        toast.error("Cette adresse email est déjà utilisée. Connectez-vous ou utilisez une autre adresse.");
      } else {
        toast.error(error.message);
      }
    } else {
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-welcome-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ record: { first_name: firstName, last_name: lastName, email } }),
      }).catch(() => {});
      toast.success("Vérifiez votre email pour confirmer votre compte.");
      navigate("/login");
    }
  };

  return (
    <div className="flex min-h-screen w-full antialiased bg-background">
      {/* Left Panel — Obsidian Spark */}
      <div
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden lg:flex p-12 text-white"
        style={{ background: "linear-gradient(135deg, #020617 0%, #0f172a 100%)" }}
      >
        {/* Mesh overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(at 0% 0%, rgba(59,130,246,0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(99,102,241,0.15) 0px, transparent 50%)",
          }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="size-10 rounded-lg flex items-center justify-center shadow-lg gradient-primary">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight">
            DealFlow<span className="text-primary">Network</span>
          </span>
        </motion.div>

        {/* Centered content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative z-10 max-w-md"
        >
          <h1 className="text-[2.75rem] font-display font-bold leading-[1.1] tracking-tight text-balance mb-6">
            Rejoignez le réseau{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(to right, #fcd34d, #fef3c7)" }}
            >
              DealFlowNetwork
            </span>
          </h1>

          <div className="space-y-4 mt-8">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.15 }}
                className="flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-slate-300">{b}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-6 text-xs font-mono text-slate-500 uppercase tracking-widest">
          <span>Inscription gratuite</span>
          <div className="size-1 bg-primary rounded-full" />
          <span>Sans engagement</span>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex w-full flex-col justify-center px-6 sm:px-8 lg:w-1/2 lg:px-24 xl:px-32 relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 sm:top-6 sm:left-6 gap-1.5 text-muted-foreground hover:text-foreground text-xs sm:text-sm z-10"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Retour
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-sm space-y-6"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-4 mt-6">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-display font-bold text-foreground">DealFlowNetwork</span>
          </div>

          <div>
            <h2 className="text-3xl font-display font-bold tracking-tight text-foreground mb-2">Créer un compte</h2>
            <p className="text-muted-foreground">Inscription rapide en quelques secondes.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Prénom <span className="text-destructive">*</span>
                </Label>
                <Input id="firstName" placeholder="Jean" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="h-12 rounded-lg border-border bg-muted/30" />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Nom <span className="text-destructive">*</span>
                </Label>
                <Input id="lastName" placeholder="Dupont" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="h-12 rounded-lg border-border bg-muted/30" />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input id="email" type="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 rounded-lg border-border bg-muted/30" />
            </div>

            <div>
              <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Téléphone</Label>
              <Input id="phone" type="tel" placeholder="+33 6 12 34 56 78" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 rounded-lg border-border bg-muted/30" />
            </div>

            <div>
              <Label htmlFor="company" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Société <span className="text-muted-foreground font-normal normal-case tracking-normal">(optionnel)</span>
              </Label>
              <Input id="company" placeholder="Ma Société" value={company} onChange={(e) => setCompany(e.target.value)} className="h-12 rounded-lg border-border bg-muted/30" />
            </div>

            <div>
              <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Mot de passe <span className="text-destructive">*</span>
              </Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-12 rounded-lg border-border bg-muted/30" />
              <p className="text-xs text-muted-foreground mt-1">Minimum 6 caractères</p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-lg bg-foreground text-background font-semibold shadow-xl hover:bg-foreground/90 transition-all active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? "Création..." : "Créer mon compte →"}
            </Button>
          </form>

          <div className="relative flex items-center py-1">
            <div className="grow border-t border-border" />
            <span className="mx-4 shrink-0 text-xs font-medium text-muted-foreground uppercase tracking-widest">ou</span>
            <div className="grow border-t border-border" />
          </div>

          <Button
            variant="outline"
            className="w-full h-12 rounded-lg font-medium border-border hover:bg-muted/50 transition-all active:scale-[0.98]"
            onClick={async () => {
              await lovable.auth.signInWithOAuth("google", {
                redirect_uri: window.location.origin,
              });
            }}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continuer avec Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link to="/login" className="font-semibold text-foreground hover:text-primary transition-colors">
              Se connecter
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
