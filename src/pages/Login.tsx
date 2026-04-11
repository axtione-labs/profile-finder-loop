import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Zap, ShieldAlert } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [blockedDialogOpen, setBlockedDialogOpen] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(email, password);

    if (error) {
      setIsLoading(false);
      toast.error("Identifiants incorrects. Vérifiez votre email et mot de passe.");
      return;
    }

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("blocked")
        .eq("user_id", authUser.id)
        .single();

      if (profileData?.blocked) {
        await supabase.auth.signOut();
        setIsLoading(false);
        setBlockedDialogOpen(true);
        return;
      }
    }

    setIsLoading(false);
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen w-full antialiased bg-background">
      {/* Left Panel — Obsidian Spark */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden lg:flex p-12 text-white"
        style={{ background: "linear-gradient(135deg, #020617 0%, #0f172a 100%)" }}
      >
        {/* Mesh overlay */}
        <div className="absolute inset-0"
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
            Transformez vos contacts en{" "}
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(to right, #fcd34d, #fef3c7)" }}
            >
              revenus passifs
            </span>
          </h1>
          <p className="text-slate-400 text-lg mb-10 max-w-[40ch]">
            Déclarez un besoin IT en 2 minutes, nous trouvons le profil adapté et vous touchez vos gains.
          </p>

          {/* Live feed cards */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-between"
            >
              <div>
                <div className="text-[10px] font-mono text-primary uppercase tracking-widest mb-1">Nouveau besoin</div>
                <div className="text-sm font-medium">Dev Full-Stack React/Node</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">550€/j</div>
                <div className="text-[10px] font-mono text-slate-500">il y a 2min</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 }}
              className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between opacity-80"
            >
              <div>
                <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mb-1">Mission gagnée</div>
                <div className="text-sm font-medium">Architecte Cloud AWS</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-emerald-400">+1 100€/mois</div>
                <div className="text-[10px] font-mono text-slate-500">il y a 14min</div>
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
          onClick={() => navigate("/")}
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
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-display font-bold text-foreground">DealFlowNetwork</span>
          </div>

          <div>
            <h2 className="text-3xl font-display font-bold tracking-tight text-foreground mb-2">Connexion</h2>
            <p className="text-muted-foreground">Accédez à votre espace apporteur d'affaires.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Email</Label>
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

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mot de passe</Label>
                <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-lg border-border bg-muted/30"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-lg bg-foreground text-background font-semibold shadow-xl hover:bg-foreground/90 transition-all active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? "Connexion..." : "Se connecter →"}
            </Button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="grow border-t border-border" />
            <span className="mx-4 shrink-0 text-xs font-medium text-muted-foreground uppercase tracking-widest">ou</span>
            <div className="grow border-t border-border" />
          </div>

          <Button
            variant="outline"
            className="w-full h-12 rounded-lg font-medium border-border hover:bg-muted/50 transition-all active:scale-[0.98]"
            onClick={async () => {
              await lovable.auth.signInWithOAuth("google", {
                redirect_uri: `${window.location.origin}/dashboard`,
              });
            }}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continuer avec Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link to="/register" className="font-semibold text-foreground hover:text-primary transition-colors">
              Créer un compte
            </Link>
          </p>
        </motion.div>

        {/* Blocked Account Dialog */}
        <AlertDialog open={blockedDialogOpen} onOpenChange={setBlockedDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <ShieldAlert className="h-7 w-7 text-destructive" />
              </div>
              <AlertDialogTitle className="text-center">Compte bloqué</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Votre compte a été suspendu. Pour toute question, veuillez contacter le support à l'adresse{" "}
                <a href="mailto:support@dealflownetwork.fr" className="text-primary font-medium hover:underline">
                  support@dealflownetwork.fr
                </a>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center">
              <AlertDialogAction onClick={() => setBlockedDialogOpen(false)}>
                Compris
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Login;
