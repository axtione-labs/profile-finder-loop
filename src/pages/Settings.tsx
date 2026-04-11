import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Save, User, Building, Phone, Mail, Lock, LogOut, Settings as SettingsIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import DocumentUploadSection from "@/components/DocumentUploadSection";

const Settings = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [company, setCompany] = useState(profile?.company || "");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ first_name: firstName, last_name: lastName, phone, company })
      .eq("user_id", user.id);

    setSaving(false);
    if (error) {
      toast.error("Erreur lors de la mise à jour du profil.");
    } else {
      toast.success("Profil mis à jour avec succès.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      toast.error("Erreur lors du changement de mot de passe.");
    } else {
      toast.success("Mot de passe modifié avec succès.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="font-display text-xl font-bold text-gradient-gold">DealFlowNetwork</Link>
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button size="sm" variant="ghost" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <Button size="sm" variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto max-w-2xl px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-8">
            <SettingsIcon className="h-6 w-6 text-primary" />
            <h1 className="font-display text-2xl font-bold">Paramètres du compte</h1>
          </div>

          {/* Profile Section */}
          <div className="gradient-card rounded-xl border border-border/50 p-6">
            <div className="flex items-center gap-2 mb-6">
              <User className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Informations personnelles</h2>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center gap-1.5">
                    Prénom <span className="text-destructive">*</span>
                  </Label>
                  <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="flex items-center gap-1.5">
                    Nom <span className="text-destructive">*</span>
                  </Label>
                  <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} required className="h-11" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email
                </Label>
                <Input id="email" type="email" value={user?.email || ""} disabled className="h-11 opacity-60" />
                <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Téléphone
                </Label>
                <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" /> Société
                </Label>
                <Input id="company" value={company} onChange={e => setCompany(e.target.value)} className="h-11" />
              </div>

              <Button type="submit" className="gradient-primary border-0 font-semibold" disabled={saving}>
                <Save className="h-4 w-4 mr-1.5" />
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </form>
          </div>

          <Separator className="my-8" />

          {/* Password Section */}
          <div className="gradient-card rounded-xl border border-border/50 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Changer le mot de passe</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input id="newPassword" type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} className="h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} className="h-11" />
              </div>

              <Button type="submit" variant="outline" disabled={changingPassword}>
                <Lock className="h-4 w-4 mr-1.5" />
                {changingPassword ? "Modification..." : "Modifier le mot de passe"}
              </Button>
            </form>
          </div>

          <Separator className="my-8" />

          {/* Documents Section */}
          <DocumentUploadSection />
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
