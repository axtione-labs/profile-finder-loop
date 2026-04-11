import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Zap, ShieldAlert } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { Separator } from "@/components/ui/separator";
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

    // Check if user is blocked
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
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-md"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-white">DealFlowNetwork</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Transformez vos contacts en <span className="text-gradient">commissions</span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed">
            Déclarez un besoin IT en 2 minutes, nous trouvons le profil adapté et vous touchez votre commission en quelques clics.
          </p>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-background relative">
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
          className="w-full max-w-md space-y-8"
        >
          <div className="lg:hidden flex items-center gap-2 mb-4 mt-6">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-display font-bold text-foreground">DealFlowNetwork</span>
          </div>

          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Connexion</h1>
            <p className="text-muted-foreground mt-1">Accédez à votre espace apporteur</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>

            <Button type="submit" className="w-full h-11 gradient-primary text-white font-semibold" disabled={isLoading}>
              {isLoading ? "Connexion..." : "Se connecter"}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">ou</span>
            <Separator className="flex-1" />
          </div>

          <Button
            variant="outline"
            className="w-full h-11 font-medium"
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
            <Link to="/register" className="text-primary font-medium hover:underline">
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
