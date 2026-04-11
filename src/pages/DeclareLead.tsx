import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, Building2, Briefcase, DollarSign,
  FileText, Info, Lock, FileSignature, Shield, Sparkles, Download, Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Link, useNavigate } from "react-router-dom";
import { useCreateLead } from "@/hooks/useLeads";
import { useCreateContract } from "@/hooks/useContracts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SignaturePad from "@/components/SignaturePad";
import ContractContent from "@/components/ContractContent";

const stepsConfig = [
  { icon: Building2, label: "Contexte" },
  { icon: Briefcase, label: "Mission" },
  { icon: DollarSign, label: "Budget & Priorité" },
  { icon: FileText, label: "Fiche mission" },
  { icon: FileSignature, label: "Contrat" },
];

const TOTAL_STEPS = stepsConfig.length;

type FormErrors = Record<string, string>;

const FieldError = ({ error }: { error?: string }) => {
  if (!error) return null;
  return <p className="text-sm text-destructive mt-1">{error}</p>;
};

const phoneRegex = /^(\+?\d{1,4}[\s.-]?)?(\(?\d{1,}\)?[\s.-]?){1,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[a-zA-ZÀ-ÿ0-9\s\-']+$/;

const DeclareLead = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const createLead = useCreateLead();
  const createContract = useCreateContract();
  const formRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    client: "", sector: "", location: "", remote: "",
    client_secret: false,
    contact_name: "", contact_phone: "", contact_email: "",
    position: "", seniority: "", start_date: "", duration: "",
    french_nationality_required: false,
    tjm: "", margin: "5", priority: "",
    description: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [leadId, setLeadId] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState("");
  const [signatureType, setSignatureType] = useState<"draw" | "text">("draw");
  const [signed, setSigned] = useState(false);
  const [signedAt, setSignedAt] = useState<Date | null>(null);
  const [contractUrl, setContractUrl] = useState<string | null>(null);
  const [signatureError, setSignatureError] = useState("");

  const apporteurName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim() || "[Apporteur d'affaires — à compléter]"
    : "[Apporteur d'affaires — à compléter]";

  const update = (field: string, value: string | string[] | boolean) => {
    setForm(f => ({ ...f, [field]: value }));
    setTouched(t => ({ ...t, [field]: true }));
    // Clear error on change
    setErrors(e => {
      const next = { ...e };
      delete next[field];
      return next;
    });
  };

  const handleClientSecretChange = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      client_secret: checked,
      ...(checked ? { client: "", contact_name: "", contact_phone: "", contact_email: "" } : {}),
    }));
    if (checked) {
      setErrors(e => {
        const next = { ...e };
        delete next.client;
        delete next.contact_name;
        delete next.contact_phone;
        delete next.contact_email;
        return next;
      });
    }
  };

  // Validation per step
  const validateStep = useCallback((stepIndex: number): FormErrors => {
    const e: FormErrors = {};

    if (stepIndex === 0) {
      if (!form.client_secret) {
        if (!form.client.trim()) {
          e.client = "Le nom du client est obligatoire";
        } else if (form.client.trim().length < 2) {
          e.client = "Le nom du client doit contenir au moins 2 caractères";
        } else if (form.client.trim().length > 100) {
          e.client = "Le nom du client ne doit pas dépasser 100 caractères";
        } else if (!nameRegex.test(form.client.trim())) {
          e.client = "Le nom du client contient des caractères non autorisés";
        }
      }
      if (!form.sector) e.sector = "Veuillez sélectionner un secteur";
      if (!form.location.trim()) {
        e.location = "Veuillez renseigner la localisation";
      } else if (form.location.trim().length < 2) {
        e.location = "Veuillez renseigner la localisation";
      }
      if (!form.remote) e.remote = "Veuillez sélectionner le mode de travail";

      if (!form.client_secret) {
        if (!form.contact_name.trim()) {
          e.contact_name = "Le nom du responsable est obligatoire";
        } else if (form.contact_name.trim().length < 2) {
          e.contact_name = "Le nom du responsable doit contenir au moins 2 caractères";
        } else if (form.contact_name.trim().length > 100) {
          e.contact_name = "Le nom du responsable ne doit pas dépasser 100 caractères";
        }

        if (!form.contact_phone.trim()) {
          e.contact_phone = "Le téléphone est obligatoire";
        } else if (!phoneRegex.test(form.contact_phone.trim())) {
          e.contact_phone = "Format de téléphone invalide";
        }

        if (!form.contact_email.trim()) {
          e.contact_email = "Adresse email invalide";
        } else if (!emailRegex.test(form.contact_email.trim())) {
          e.contact_email = "Adresse email invalide";
        }
      }
    }

    if (stepIndex === 1) {
      if (!form.position.trim()) {
        e.position = "Veuillez renseigner le poste recherché";
      } else if (form.position.trim().length < 3) {
        e.position = "Veuillez renseigner le poste recherché";
      } else if (form.position.trim().length > 100) {
        e.position = "Le poste ne doit pas dépasser 100 caractères";
      }
      if (!form.seniority) e.seniority = "Veuillez sélectionner la seniorité";
      if (!form.start_date) e.start_date = "Veuillez sélectionner une date de démarrage valide";
      if (!form.duration) e.duration = "Veuillez sélectionner une durée";
    }

    if (stepIndex === 2) {
      if (!form.tjm.trim() || isNaN(Number(form.tjm)) || Number(form.tjm) <= 0) {
        e.tjm = "Veuillez renseigner un TJM valide";
      }
      if (!form.priority) e.priority = "Veuillez sélectionner une priorité";
    }

    return e;
  }, [form]);

  const scrollToFirstError = () => {
    setTimeout(() => {
      const firstErrorEl = formRef.current?.querySelector('[data-field-error="true"]');
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
  };

  const submitLead = () => {
    createLead.mutate(
      {
        client: form.client_secret ? "Confidentiel" : form.client,
        sector: form.sector, location: form.location, remote: form.remote,
        contact_name: form.contact_name, contact_phone: form.contact_phone,
        contact_email: form.contact_email, position: form.position,
        seniority: form.seniority, stack: [], start_date: form.start_date,
        duration: form.duration, tjm: parseFloat(form.tjm) || 0,
        margin: parseFloat(form.margin) || 5, priority: form.priority || "normal",
        description: form.description,
      },
      {
        onSuccess: (data) => {
          const id = (data as any)?.id;
          setLeadId(id || null);
          setStep(4);
        },
      }
    );
  };

  const handleSignatureChange = (data: string, type: "draw" | "text") => {
    setSignatureData(data);
    setSignatureType(type);
    if (data) setSignatureError("");
  };

  const handleSign = async () => {
    if (!signatureData) {
      setSignatureError("La signature est obligatoire avant de valider le contrat");
      return;
    }
    if (!leadId) return;
    const now = new Date();
    setSignedAt(now);
    const result = await createContract.mutateAsync({ leadId, signatureData, signatureType });
    let signedUrl: string | null = null;
    if (result?.contract_pdf_url) {
      const { data } = await supabase.storage.from("contracts").createSignedUrl(result.contract_pdf_url, 3600);
      if (data?.signedUrl) {
        signedUrl = data.signedUrl;
        setContractUrl(data.signedUrl);
      }
    }
    setSigned(true);

    try {
      await supabase.functions.invoke("send-contract-email", {
        body: {
          email: user?.email,
          firstName: user?.user_metadata?.first_name || "",
          contractUrl: signedUrl,
        },
      });
    } catch (e) {
      console.error("Failed to send contract email:", e);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const progressPercent = ((step + 1) / TOTAL_STEPS) * 100;

  const handleNext = () => {
    if (step === 3) {
      // Validate all steps 0-2 before submitting
      const allErrors: FormErrors = {
        ...validateStep(0),
        ...validateStep(1),
        ...validateStep(2),
      };
      if (Object.keys(allErrors).length > 0) {
        setErrors(allErrors);
        // Go to first step with error
        const step0Errors = validateStep(0);
        if (Object.keys(step0Errors).length > 0) { setStep(0); }
        else {
          const step1Errors = validateStep(1);
          if (Object.keys(step1Errors).length > 0) { setStep(1); }
          else { setStep(2); }
        }
        scrollToFirstError();
        return;
      }
      submitLead();
    } else if (step < TOTAL_STEPS - 1) {
      const stepErrors = validateStep(step);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...stepErrors }));
        scrollToFirstError();
        return;
      }
      setStep(s => s + 1);
    }
  };

  const hasFieldError = (field: string) => !!errors[field];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/lynx-logo.png" alt="Lynx" className="w-8 h-8" />
            <span className="font-display text-xl font-bold text-gradient-gold">Lynx</span>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto max-w-2xl px-6 py-12" ref={formRef}>
        {/* Progress bar */}
        <div className="mb-2">
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full gradient-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="mb-10 flex items-center justify-between">
          {stepsConfig.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex flex-1 items-center">
                <motion.div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    i <= step ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                  animate={i === step ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {i < step ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </motion.div>
                <span className={`ml-2 hidden text-xs font-medium lg:block ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
                {i < TOTAL_STEPS - 1 && (
                  <div className={`mx-2 h-px flex-1 transition-colors duration-500 ${i < step ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Success screen after signing */}
        {signed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center space-y-8 py-8"
          >
            <motion.div
              className="relative mx-auto w-32 h-32"
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.div
                className="absolute inset-0 rounded-full gradient-primary opacity-20"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full gradient-primary glow-primary">
                  <Rocket className="h-12 w-12 text-primary-foreground" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="font-display text-3xl font-bold">
                <span className="text-gradient">Félicitations</span> 🎉
              </h1>
              <p className="text-lg text-muted-foreground mt-2 max-w-md mx-auto">
                Votre besoin a été déclaré et votre contrat d'apport d'affaires signé avec succès.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {[
                { label: "Commission", value: "À définir", icon: DollarSign },
                { label: "TJM Client", value: form.tjm ? `${form.tjm}€` : "N/A", icon: Briefcase },
                { label: "Statut", value: "En cours", icon: Shield },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="gradient-card rounded-xl border border-border/50 p-4 text-center"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="flex justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {contractUrl && (
                <Button variant="outline" onClick={() => window.open(contractUrl, "_blank")}>
                  <Download className="mr-2 h-4 w-4" /> Télécharger le contrat
                </Button>
              )}
              <Button onClick={() => navigate("/dashboard")} className="gradient-primary glow-primary border-0">
                <Sparkles className="mr-2 h-4 w-4" /> Accéder au dashboard
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className={step === 4 ? "" : "gradient-card rounded-2xl border border-border/50 p-8"}
              >
                {step === 0 && (
                  <div className="space-y-5">
                    <h2 className="font-display text-2xl font-bold">Contexte de la mission</h2>
                    <div className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-4">
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Client confidentiel</p>
                          <p className="text-xs text-muted-foreground">Le nom du client sera communiqué lors de la réunion de qualification</p>
                        </div>
                      </div>
                      <Switch checked={form.client_secret} onCheckedChange={handleClientSecretChange} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {!form.client_secret && (
                        <div className="sm:col-span-2" data-field-error={hasFieldError("client") || undefined}>
                          <Label>Client <span className="text-destructive">*</span></Label>
                          <Input
                            placeholder="Nom du client"
                            value={form.client}
                            onChange={e => update("client", e.target.value)}
                            className={`mt-1.5 bg-background/50 ${hasFieldError("client") ? "border-destructive" : ""}`}
                            maxLength={100}
                          />
                          <FieldError error={errors.client} />
                        </div>
                      )}
                      <div data-field-error={hasFieldError("sector") || undefined}>
                        <Label>Secteur <span className="text-destructive">*</span></Label>
                        <Select value={form.sector} onValueChange={v => update("sector", v)}>
                          <SelectTrigger className={`mt-1.5 bg-background/50 ${hasFieldError("sector") ? "border-destructive" : ""}`}>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Banque / Finance", "Assurance", "Énergie", "Santé", "Retail", "Industrie", "Tech", "Telecom", "Public", "Autre"].map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError error={errors.sector} />
                      </div>
                      <div data-field-error={hasFieldError("location") || undefined}>
                        <Label>Localisation <span className="text-destructive">*</span></Label>
                        <Input
                          placeholder="Paris, Lyon, Remote..."
                          value={form.location}
                          onChange={e => update("location", e.target.value)}
                          className={`mt-1.5 bg-background/50 ${hasFieldError("location") ? "border-destructive" : ""}`}
                        />
                        <FieldError error={errors.location} />
                      </div>
                      <div data-field-error={hasFieldError("remote") || undefined}>
                        <Label>Mode de travail <span className="text-destructive">*</span></Label>
                        <Select value={form.remote} onValueChange={v => update("remote", v)}>
                          <SelectTrigger className={`mt-1.5 bg-background/50 ${hasFieldError("remote") ? "border-destructive" : ""}`}>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="onsite">Sur site</SelectItem>
                            <SelectItem value="hybrid">Hybride</SelectItem>
                            <SelectItem value="remote">Full remote</SelectItem>
                          </SelectContent>
                        </Select>
                        <FieldError error={errors.remote} />
                      </div>
                    </div>
                    {!form.client_secret && (
                      <div className="border-t border-border/30 pt-4">
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Responsable recrutement côté client</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="sm:col-span-2" data-field-error={hasFieldError("contact_name") || undefined}>
                            <Label>Nom du responsable <span className="text-destructive">*</span></Label>
                            <Input
                              placeholder="Ex: Marie Martin"
                              value={form.contact_name}
                              onChange={e => update("contact_name", e.target.value)}
                              className={`mt-1.5 bg-background/50 ${hasFieldError("contact_name") ? "border-destructive" : ""}`}
                              maxLength={100}
                            />
                            <FieldError error={errors.contact_name} />
                          </div>
                          <div data-field-error={hasFieldError("contact_phone") || undefined}>
                            <Label>Téléphone <span className="text-destructive">*</span></Label>
                            <Input
                              placeholder="06 12 34 56 78"
                              value={form.contact_phone}
                              onChange={e => update("contact_phone", e.target.value)}
                              className={`mt-1.5 bg-background/50 ${hasFieldError("contact_phone") ? "border-destructive" : ""}`}
                            />
                            <FieldError error={errors.contact_phone} />
                          </div>
                          <div data-field-error={hasFieldError("contact_email") || undefined}>
                            <Label>Email <span className="text-destructive">*</span></Label>
                            <Input
                              type="email"
                              placeholder="marie@client.com"
                              value={form.contact_email}
                              onChange={e => update("contact_email", e.target.value)}
                              className={`mt-1.5 bg-background/50 ${hasFieldError("contact_email") ? "border-destructive" : ""}`}
                            />
                            <FieldError error={errors.contact_email} />
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
                      <div data-field-error={hasFieldError("position") || undefined}>
                        <Label>Poste recherché <span className="text-destructive">*</span></Label>
                        <Input
                          placeholder="Ex: Développeur Fullstack"
                          value={form.position}
                          onChange={e => update("position", e.target.value)}
                          className={`mt-1.5 bg-background/50 ${hasFieldError("position") ? "border-destructive" : ""}`}
                          maxLength={100}
                        />
                        <FieldError error={errors.position} />
                      </div>
                      <div data-field-error={hasFieldError("seniority") || undefined}>
                        <Label>Seniorité <span className="text-destructive">*</span></Label>
                        <Select value={form.seniority} onValueChange={v => update("seniority", v)}>
                          <SelectTrigger className={`mt-1.5 bg-background/50 ${hasFieldError("seniority") ? "border-destructive" : ""}`}>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="junior">Junior (0-2 ans)</SelectItem>
                            <SelectItem value="mid">Confirmé (3-5 ans)</SelectItem>
                            <SelectItem value="senior">Senior (5-8 ans)</SelectItem>
                            <SelectItem value="expert">Expert (8+ ans)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FieldError error={errors.seniority} />
                      </div>
                      <div data-field-error={hasFieldError("start_date") || undefined}>
                        <Label>Démarrage <span className="text-destructive">*</span></Label>
                        <Input
                          type="date"
                          min={todayStr}
                          value={form.start_date}
                          onChange={e => update("start_date", e.target.value)}
                          className={`mt-1.5 bg-background/50 ${hasFieldError("start_date") ? "border-destructive" : ""}`}
                        />
                        <FieldError error={errors.start_date} />
                      </div>
                      <div data-field-error={hasFieldError("duration") || undefined}>
                        <Label>Durée estimée <span className="text-destructive">*</span></Label>
                        <Select value={form.duration} onValueChange={v => update("duration", v)}>
                          <SelectTrigger className={`mt-1.5 bg-background/50 ${hasFieldError("duration") ? "border-destructive" : ""}`}>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-3">1 à 3 mois</SelectItem>
                            <SelectItem value="3-6">3 à 6 mois</SelectItem>
                            <SelectItem value="6-12">6 à 12 mois</SelectItem>
                            <SelectItem value="12+">12+ mois</SelectItem>
                          </SelectContent>
                        </Select>
                        <FieldError error={errors.duration} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-4">
                      <div>
                        <p className="text-sm font-medium">Nationalité française obligatoire</p>
                        <p className="text-xs text-muted-foreground">Le candidat doit obligatoirement être de nationalité française</p>
                      </div>
                      <Switch checked={form.french_nationality_required} onCheckedChange={(v) => update("french_nationality_required", v)} />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <h2 className="font-display text-2xl font-bold">Budget client</h2>
                    <div data-field-error={hasFieldError("tjm") || undefined}>
                      <Label>TJM client (€ HT / jour) <span className="text-destructive">*</span></Label>
                      <Input
                        type="number"
                        placeholder="Ex: 550"
                        value={form.tjm || ""}
                        onChange={e => update("tjm", e.target.value)}
                        className={`mt-1.5 bg-background/50 ${hasFieldError("tjm") ? "border-destructive" : ""}`}
                        min={0}
                      />
                      <FieldError error={errors.tjm} />
                    </div>
                    <div data-field-error={hasFieldError("priority") || undefined}>
                      <Label>Priorité <span className="text-destructive">*</span></Label>
                      <Select value={form.priority} onValueChange={v => update("priority", v)}>
                        <SelectTrigger className={`mt-1.5 bg-background/50 ${hasFieldError("priority") ? "border-destructive" : ""}`}>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgent">🔴 Urgent</SelectItem>
                          <SelectItem value="normal">🟡 Normal</SelectItem>
                          <SelectItem value="low">🟢 Pas pressé</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError error={errors.priority} />
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

                {step === 4 && (
                  <div className="space-y-8">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative overflow-hidden rounded-2xl gradient-primary p-8 text-primary-foreground"
                    >
                      <motion.div
                        className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10"
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                        transition={{ duration: 8, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white/5"
                        animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
                        transition={{ duration: 6, repeat: Infinity }}
                      />
                      <div className="relative z-10 flex items-center gap-4">
                        <motion.div
                          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm"
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <FileSignature className="h-8 w-8" />
                        </motion.div>
                        <div>
                          <h2 className="font-display text-2xl font-bold">Dernière étape !</h2>
                          <p className="text-sm text-primary-foreground/80 mt-1">
                            Signez votre contrat d'apport d'affaires pour officialiser votre collaboration et débloquer vos commissions.
                          </p>
                        </div>
                      </div>

                      <div className="relative z-10 flex flex-wrap gap-3 mt-6">
                        {[
                          { icon: Shield, text: "Signature sécurisée" },
                          { icon: DollarSign, text: "Commission garantie" },
                          { icon: Sparkles, text: "Commissions débloquées" },
                        ].map((badge, i) => (
                          <motion.div
                            key={badge.text}
                            className="flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1.5 text-xs font-medium"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.15 }}
                          >
                            <badge.icon className="h-3.5 w-3.5" />
                            {badge.text}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="gradient-card rounded-2xl border border-border/50 p-8"
                    >
                      <div className="max-h-[400px] overflow-y-auto pr-4">
                        <ContractContent apporteurName={apporteurName} donneurOrdre="Lynx" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="gradient-card rounded-2xl border-2 border-primary/30 p-8"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <FileSignature className="h-5 w-5 text-primary" />
                        <h2 className="font-display text-lg font-semibold">Votre signature</h2>
                      </div>
                      <SignaturePad onSignatureChange={handleSignatureChange} />
                      {signatureError && (
                        <div className="flex items-center gap-2 mt-3 text-destructive text-sm">
                          <Info className="h-4 w-4 shrink-0" />
                          <span>{signatureError}</span>
                        </div>
                      )}
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0 || step === 4}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
              </Button>

              {step < 3 && (
                <Button onClick={handleNext} className="gradient-primary border-0">
                  Suivant <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}

              {step === 3 && (
                <Button onClick={handleNext} disabled={createLead.isPending} className="gradient-primary glow-primary border-0">
                  {createLead.isPending ? "Envoi du besoin..." : "Valider & Signer le contrat"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}

              {step === 4 && (
                <Button
                  onClick={handleSign}
                  disabled={!signatureData || createContract.isPending}
                  className="gradient-primary glow-primary border-0 text-base px-8"
                >
                  <FileSignature className="mr-2 h-5 w-5" />
                  {createContract.isPending ? "Signature en cours..." : "Signer le contrat"}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeclareLead;
