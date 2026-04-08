import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Building2, Briefcase, DollarSign, FileText, Info, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link, useNavigate } from "react-router-dom";
import { useCreateLead } from "@/hooks/useLeads";

const stepsConfig = [
  { icon: Building2, label: "Contexte" },
  { icon: Briefcase, label: "Mission" },
  { icon: DollarSign, label: "Budget" },
  { icon: FileText, label: "Fiche mission" },
];

const DeclareLead = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const createLead = useCreateLead();
  const [form, setForm] = useState({
    client: "", sector: "", location: "", remote: "",
    client_secret: false,
    contact_name: "", contact_phone: "", contact_email: "",
    position: "", seniority: "", start_date: "", duration: "",
    french_nationality_required: false,
    tjm: "", margin: "5", priority: "",
    description: "",
  });

  const update = (field: string, value: string | string[] | boolean) => setForm(f => ({ ...f, [field]: value }));

  const handleClientSecretChange = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      client_secret: checked,
      ...(checked
        ? {
            client: "",
            contact_name: "",
            contact_phone: "",
            contact_email: "",
          }
        : {}),
    }));
  };

  const submit = () => {
    createLead.mutate(
      {
        client: form.client_secret ? "Confidentiel" : form.client,
        sector: form.sector,
        location: form.location,
        remote: form.remote,
        contact_name: form.contact_name,
        contact_phone: form.contact_phone,
        contact_email: form.contact_email,
        position: form.position,
        seniority: form.seniority,
        stack: [],
        start_date: form.start_date,
        duration: form.duration,
        tjm: 0,
        margin: parseFloat(form.margin) || 5,
        priority: form.priority || "normal",
        description: form.description,
      },
      {
        onSuccess: (data) => {
          const leadId = (data as any)?.id;
          if (leadId) {
            navigate(`/sign-contract?lead_id=${leadId}`);
          } else {
            navigate("/dashboard");
          }
        },
      }
    );
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center px-6">
          <Link to="/" className="font-display text-xl font-bold text-gradient">DealFlowNetwork</Link>
        </div>
      </nav>

      <div className="container mx-auto max-w-2xl px-6 py-12">
        {/* Progress */}
        <div className="mb-10 flex items-center justify-between">
          {stepsConfig.map((s, i) => (
            <div key={s.label} className="flex flex-1 items-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                i <= step ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`ml-2 hidden text-sm font-medium sm:block ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
              {i < stepsConfig.length - 1 && (
                <div className={`mx-3 h-px flex-1 ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="gradient-card rounded-2xl border border-border/50 p-8"
          >
            {step === 0 && (
              <div className="space-y-5">
                <h2 className="font-display text-2xl font-bold">Contexte de la mission</h2>

                {/* Client secret toggle */}
                <div className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-4">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Client confidentiel</p>
                      <p className="text-xs text-muted-foreground">Le nom du client sera communiqué lors de la réunion de qualification</p>
                    </div>
                  </div>
                  <Switch
                    checked={form.client_secret}
                    onCheckedChange={handleClientSecretChange}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {!form.client_secret && (
                    <div className="sm:col-span-2">
                      <Label>Client</Label>
                      <Input placeholder="Nom du client" value={form.client} onChange={e => update("client", e.target.value)} className="mt-1.5 bg-background/50" />
                    </div>
                  )}
                  <div>
                    <Label>Secteur</Label>
                    <Select value={form.sector} onValueChange={v => update("sector", v)}>
                      <SelectTrigger className="mt-1.5 bg-background/50"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        {["Banque / Finance", "Assurance", "Énergie", "Santé", "Retail", "Industrie", "Tech", "Telecom", "Public", "Autre"].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Localisation</Label>
                    <Input placeholder="Paris, Lyon, Remote..." value={form.location} onChange={e => update("location", e.target.value)} className="mt-1.5 bg-background/50" />
                  </div>
                  <div>
                    <Label>Mode de travail</Label>
                    <Select value={form.remote} onValueChange={v => update("remote", v)}>
                      <SelectTrigger className="mt-1.5 bg-background/50"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="onsite">Sur site</SelectItem>
                        <SelectItem value="hybrid">Hybride</SelectItem>
                        <SelectItem value="remote">Full remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {!form.client_secret && (
                  <div className="border-t border-border/30 pt-4">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">Responsable recrutement côté client</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Label>Nom du responsable</Label>
                        <Input placeholder="Ex: Marie Martin" value={form.contact_name} onChange={e => update("contact_name", e.target.value)} className="mt-1.5 bg-background/50" />
                      </div>
                      <div>
                        <Label>Téléphone <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
                        <Input placeholder="06 12 34 56 78" value={form.contact_phone} onChange={e => update("contact_phone", e.target.value)} className="mt-1.5 bg-background/50" />
                      </div>
                      <div>
                        <Label>Email <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
                        <Input type="email" placeholder="marie@client.com" value={form.contact_email} onChange={e => update("contact_email", e.target.value)} className="mt-1.5 bg-background/50" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-display text-2xl font-bold">Détails de la mission</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Poste recherché</Label>
                    <Input placeholder="Ex: Développeur Fullstack" value={form.position} onChange={e => update("position", e.target.value)} className="mt-1.5 bg-background/50" />
                  </div>
                  <div>
                    <Label>Seniorité</Label>
                    <Select value={form.seniority} onValueChange={v => update("seniority", v)}>
                      <SelectTrigger className="mt-1.5 bg-background/50"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior (0-2 ans)</SelectItem>
                        <SelectItem value="mid">Confirmé (3-5 ans)</SelectItem>
                        <SelectItem value="senior">Senior (5-8 ans)</SelectItem>
                        <SelectItem value="expert">Expert (8+ ans)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Démarrage</Label>
                    <Input type="date" min={todayStr} value={form.start_date} onChange={e => update("start_date", e.target.value)} className="mt-1.5 bg-background/50" />
                  </div>
                  <div>
                    <Label>Durée estimée</Label>
                    <Select value={form.duration} onValueChange={v => update("duration", v)}>
                      <SelectTrigger className="mt-1.5 bg-background/50"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-3">1 à 3 mois</SelectItem>
                        <SelectItem value="3-6">3 à 6 mois</SelectItem>
                        <SelectItem value="6-12">6 à 12 mois</SelectItem>
                        <SelectItem value="12+">12+ mois</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Nationalité française obligatoire */}
                <div className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-4">
                  <div>
                    <p className="text-sm font-medium">Nationalité française obligatoire</p>
                    <p className="text-xs text-muted-foreground">Le candidat doit obligatoirement être de nationalité française</p>
                  </div>
                  <Switch
                    checked={form.french_nationality_required}
                    onCheckedChange={(v) => update("french_nationality_required", v)}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display text-2xl font-bold">Budget client & Commission</h2>

                <div>
                  <Label>TJM client (€ HT / jour)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 550"
                    value={form.tjm || ""}
                    onChange={e => update("tjm", e.target.value)}
                    className="mt-1.5 bg-background/50"
                    min={0}
                  />
                </div>

                <div>
                  <Label>Pourcentage de commission souhaité</Label>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {["5", "7", "10"].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => update("margin", pct)}
                        className={`rounded-xl border-2 p-4 text-center transition-all ${
                          form.margin === pct
                            ? "border-primary bg-primary/10 shadow-md"
                            : "border-border hover:border-primary/50 hover:bg-secondary/50"
                        }`}
                      >
                        <span className="text-2xl font-bold text-primary">{pct}%</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info popup */}
                <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
                  <Info className="h-5 w-5 mt-0.5 shrink-0" />
                  <p>
                    La marge sera qualifiée pendant la réunion de qualification du besoin.
                    Pas d'inquiétude, vous gardez <strong>au minimum 5%</strong> de commission sur la mission.
                  </p>
                </div>

                <div>
                  <Label>Priorité</Label>
                  <Select value={form.priority} onValueChange={v => update("priority", v)}>
                    <SelectTrigger className="mt-1.5 bg-background/50"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">🔴 Urgent</SelectItem>
                      <SelectItem value="normal">🟡 Normal</SelectItem>
                      <SelectItem value="low">🟢 Pas pressé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-display text-2xl font-bold">Fiche mission</h2>
                <p className="text-sm text-muted-foreground">Facultatif — ajoutez des détails supplémentaires si vous le souhaitez.</p>
                <Textarea
                  placeholder="Décrivez le besoin, le contexte, les contraintes spécifiques..."
                  value={form.description}
                  onChange={e => update("description", e.target.value)}
                  className="min-h-[160px] bg-background/50"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep(s => s + 1)} className="gradient-primary border-0">
              Suivant <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={createLead.isPending} className="gradient-primary glow-primary border-0">
              <Check className="mr-2 h-4 w-4" /> {createLead.isPending ? "Envoi..." : "Envoyer le besoin"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeclareLead;
