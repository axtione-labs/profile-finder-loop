import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Zap, Mail, ShieldCheck, Lock } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/settings`,
    });
    setIsLoading(false);
    if (error) {
      toast.error("Erreur lors de l'envoi du lien de réinitialisation.");
    } else {
      setSent(true);
      toast.success("Un email de réinitialisation a été envoyé.");
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
            Récupérez votre{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(to right, #fcd34d, #fef3c7)" }}
            >
              accès en toute sécurité
            </span>
          </h1>
          <p className="text-slate-400 text-lg mb-10 max-w-[40ch]">
            Un lien sécurisé vous sera envoyé par email pour réinitialiser votre mot de passe en quelques secondes.
          </p>

          {/* Trust cards */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm flex items-center gap-4"
            >
              <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">Lien sécurisé à usage unique</div>
                <div className="text-xs text-slate-500">Expire après 24 heures</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 }}
              className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-4 opacity-80"
            >
              <div className="size-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-sm font-medium">Vos données restent protégées</div>
                <div className="text-xs text-slate-500">Chiffrement de bout en bout</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-6 text-xs font-mono text-slate-500 uppercase tracking-widest">
          <span>Plateforme sécurisée</span>
          <div className="size-1 bg-primary rounded-full" />
          <span>Partenaires vérifiés</span>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex w-full flex-col justify-center px-6 sm:px-8 lg:w-1/2 lg:px-24 xl:px-32 relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 sm:top-6 sm:left-6 gap-1.5 text-muted-foreground hover:text-foreground text-xs sm:text-sm z-10"
          onClick={() => navigate("/login")}
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Retour
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-sm space-y-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-4 mt-6">
            <img src="/lynx-logo.png" alt="Lynx" className="w-8 h-8" />
            <span className="text-lg font-display font-bold text-foreground">Lynx</span>
          </div>

          <div>
            <h2 className="text-3xl font-display font-bold tracking-tight text-foreground mb-2">
              Mot de passe oublié
            </h2>
            <p className="text-muted-foreground">
              {sent
                ? "Vérifiez votre boîte mail pour le lien de réinitialisation."
                : "Entrez votre email pour recevoir un lien de réinitialisation."}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-lg border-border bg-muted/30"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-lg bg-foreground text-background font-semibold shadow-xl hover:bg-foreground/90 transition-all active:scale-[0.98]"
                disabled={isLoading}
              >
                <Mail className="w-4 h-4 mr-1.5" />
                {isLoading ? "Envoi..." : "Envoyer le lien →"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Si un compte existe avec cette adresse, vous recevrez un email avec un lien pour réinitialiser votre mot de passe.
              </p>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="mt-4 h-12 rounded-lg font-medium border-border hover:bg-muted/50"
                >
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          )}

          {!sent && (
            <p className="text-center text-sm text-muted-foreground">
              Vous vous souvenez ?{" "}
              <Link to="/login" className="font-semibold text-foreground hover:text-primary transition-colors">
                Se connecter
              </Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
