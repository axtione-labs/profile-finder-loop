import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Zap, Mail } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center p-8 bg-background relative">
      <Link to="/login" className="absolute top-6 left-6">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-display font-bold text-foreground">DealFlowNetwork</span>
        </div>

        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Mot de passe oublié</h1>
          <p className="text-muted-foreground mt-1">
            {sent
              ? "Vérifiez votre boîte mail pour le lien de réinitialisation."
              : "Entrez votre email pour recevoir un lien de réinitialisation."}
          </p>
        </div>

        {!sent ? (
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

            <Button type="submit" className="w-full h-11 gradient-primary text-white font-semibold" disabled={isLoading}>
              <Mail className="w-4 h-4 mr-1.5" />
              {isLoading ? "Envoi..." : "Envoyer le lien"}
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
              <Button variant="outline" className="mt-4">Retour à la connexion</Button>
            </Link>
          </div>
        )}

        {!sent && (
          <p className="text-center text-sm text-muted-foreground">
            Vous vous souvenez ?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
