import { useState, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Coins, Upload, FileText, AlertTriangle, Eye } from "lucide-react";
import { toast } from "sonner";
import { useCommissions, useUpdateCommission, useMissions } from "@/hooks/useMissions";
import { useProfiles } from "@/hooks/useProfiles";
import { useAllDocuments } from "@/hooks/useDocuments";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const commStatusColor: Record<string, string> = {
  "À générer": "bg-amber-100 text-amber-700 border-amber-200",
  "Générée": "bg-blue-100 text-blue-700 border-blue-200",
  "Payée": "bg-green-100 text-green-700 border-green-200",
};

const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

const AdminCommissions = () => {
  const { data: commissions = [], isLoading } = useCommissions();
  const { data: missions = [] } = useMissions();
  const { data: profiles = [] } = useProfiles();
  const { data: allDocuments = [] } = useAllDocuments();
  const updateCommission = useUpdateCommission();
  const queryClient = useQueryClient();

  const [payConfirm, setPayConfirm] = useState<string | null>(null);
  const [invoiceUploadId, setInvoiceUploadId] = useState<string | null>(null);
  const invoiceInputRef = useRef<HTMLInputElement>(null);
  const currentYear = new Date().getFullYear();
  const [filterYear, setFilterYear] = useState(String(currentYear));

  const getApporteurName = (userId: string) => {
    const p = profiles.find(pr => pr.user_id === userId);
    return p ? `${p.first_name} ${p.last_name}` : "—";
  };

  const getMissionInfo = (missionId: string) => missions.find(m => m.id === missionId);

  const handleUpdateStatus = (id: string, status: string) => {
    if (status === "Payée") {
      // Check documents and invoice before paying
      const commission = commissions.find(c => c.id === id);
      if (!commission) return;

      const userDocs = allDocuments.filter(d => d.user_id === commission.apporteur_id);
      const rib = userDocs.find(d => d.type === "rib");
      const kbis = userDocs.find(d => d.type === "kbis");
      const idCard = userDocs.find(d => d.type === "id_card");

      const missingDocs = [];
      if (!rib || rib.status !== "validated") missingDocs.push("RIB");
      if (!kbis || kbis.status !== "validated") missingDocs.push("KBIS");
      if (!idCard || idCard.status !== "validated") missingDocs.push("Pièce d'identité");

      if (missingDocs.length > 0) {
        const hasAnyDoc = userDocs.length > 0;
        if (hasAnyDoc) {
          toast.error(`Documents non validés : ${missingDocs.join(", ")}. Veuillez les valider dans la section Apporteurs avant de payer.`);
        } else {
          toast.error(`L'apporteur n'a pas envoyé ses documents (${missingDocs.join(", ")}). Un email lui sera envoyé pour les demander.`);
          // TODO: send email notification
        }
        return;
      }

      // Check invoice
      if (!(commission as any).invoice_url) {
        toast.error("Facture manquante. L'apporteur doit uploader sa facture avant le paiement.");
        setInvoiceUploadId(id);
        return;
      }

      setPayConfirm(id);
      return;
    }
    updateCommission.mutate({ id, status } as any, {
      onSuccess: () => toast.success(`Commission : ${status}`),
    });
  };

  const handleConfirmPay = () => {
    if (!payConfirm) return;
    updateCommission.mutate({ id: payConfirm, status: "Payée" } as any, {
      onSuccess: () => {
        toast.success("Commission marquée comme payée");
        setPayConfirm(null);
      },
    });
  };

  const handleInvoiceUpload = async (commissionId: string, file: File) => {
    const commission = commissions.find(c => c.id === commissionId);
    if (!commission) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `${commission.apporteur_id}/invoices/${commissionId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file, { upsert: true });
    if (uploadError) {
      toast.error("Erreur upload facture: " + uploadError.message);
      return;
    }

    const { error: dbError } = await supabase
      .from("commissions" as any)
      .update({ invoice_url: filePath } as any)
      .eq("id", commissionId);
    if (dbError) {
      toast.error("Erreur: " + dbError.message);
      return;
    }

    toast.success("Facture uploadée avec succès");
    queryClient.invalidateQueries({ queryKey: ["commissions"] });
    setInvoiceUploadId(null);
  };

  const handleUpdateDaysWorked = (id: string, days: number) => {
    const commission = commissions.find(c => c.id === id);
    if (!commission) return;
    const newAmount = days * commission.amount / (commission.days_worked || 1 );
    // Recalculate: amount = days_worked * rate_per_day (amount / old_days or original rate)
    updateCommission.mutate({ id, days_worked: days } as any, {
      onSuccess: () => toast.success(`Jours travaillés mis à jour`),
    });
  };

  // Stats
  const yearCommissions = commissions.filter(c => c.commission_year === parseInt(filterYear));
  const totalPaid = yearCommissions.filter(c => c.status === "Payée").reduce((s, c) => s + (c.days_worked * c.amount), 0);
  const totalPending = yearCommissions.filter(c => c.status !== "Payée").reduce((s, c) => s + (c.days_worked * c.amount), 0);
  const totalAdmin = yearCommissions.reduce((s, c) => s + (c.days_worked * c.admin_amount), 0);

  // Chart data: monthly breakdown
  const chartData = months.map((m, i) => {
    const monthComms = yearCommissions.filter(c => c.commission_month === i + 1);
    return {
      name: m,
      apporteurs: monthComms.reduce((s, c) => s + (c.days_worked * c.amount), 0),
      admin: monthComms.reduce((s, c) => s + (c.days_worked * c.admin_amount), 0),
    };
  });

  const years = [...new Set(commissions.map(c => c.commission_year))].sort((a, b) => b - a);
  if (!years.includes(currentYear)) years.unshift(currentYear);

  return (
    <AdminLayout>
      <div className="space-y-6 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-bold text-gray-900">Commissions</h1>
            <p className="text-[11px] text-gray-500">Suivi financier et jours travaillés</p>
          </div>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-[120px] bg-white border-gray-200"><SelectValue /></SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Summary cards */}
        <motion.div className="grid gap-4 sm:grid-cols-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-xl p-5 text-white" style={{ background: "linear-gradient(135deg, #1a73e8 0%, #34a4f0 50%, #4fc3f7 100%)" }}>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Coins className="h-4 w-4" /> Total {filterYear}
            </div>
            <div className="mt-2 font-display text-2xl font-bold">{(totalPaid + totalPending).toLocaleString("fr-FR")} €</div>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" /> Payées
            </div>
            <div className="mt-2 font-display text-2xl font-bold text-success">{totalPaid.toLocaleString("fr-FR")} €</div>
            <p className="mt-1 text-[10px] text-muted-foreground">{yearCommissions.filter(c => c.status === "Payée").length} commissions</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Coins className="h-4 w-4" /> En attente
            </div>
            <div className="mt-2 font-display text-2xl font-bold text-warning">{totalPending.toLocaleString("fr-FR")} €</div>
            <p className="mt-1 text-[10px] text-muted-foreground">{yearCommissions.filter(c => c.status !== "Payée").length} commissions</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" /> Apporteurs
            </div>
            <div className="mt-2 font-display text-2xl font-bold text-primary">{new Set(yearCommissions.map(c => c.apporteur_id)).size}</div>
            <p className="mt-1 text-[10px] text-muted-foreground">{profiles.filter(p => !p.blocked).length} qualifiés</p>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          className="rounded-xl border border-gray-200 bg-white p-5"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="mb-4 font-display text-lg font-semibold text-gray-900">Répartition mensuelle ({filterYear})</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={35} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                cursor={{ fill: '#F9FAFB' }}
                formatter={(value: number) => `${value.toLocaleString("fr-FR")} €`}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="apporteurs" name="Comm. apporteurs" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="admin" name="Marge admin" fill="#F97316" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Commissions table */}
        <motion.div
          className="overflow-hidden rounded-lg border border-gray-200"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-3 h-11 border-b border-gray-100">
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : yearCommissions.length === 0 ? (
            <div className="py-12 text-center text-[11px] text-gray-400">Aucune commission pour {filterYear}.</div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">Mois</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">Apporteur</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">Consultant</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">Jours</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-medium uppercase text-gray-500 w-[100px]">Total comm.</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-medium uppercase text-gray-500 w-[100px]">Marge admin</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">Facture</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500 w-[140px]">Statut</th>
                </tr>
              </thead>
              <tbody>
                {yearCommissions.map((c, idx) => {
                  const mission = getMissionInfo(c.mission_id);
                  return (
                    <tr key={c.id} className={`h-11 border-b border-gray-100 hover:bg-blue-50/40 transition-colors duration-100 ${idx % 2 === 1 ? "bg-gray-50/30" : "bg-white"}`}>
                      <td className="px-3 py-2.5 text-gray-500 w-[100px] tabular-nums">{months[(c.commission_month || 1) - 1]} {c.commission_year}</td>
                      <td className="px-3 py-2.5 max-w-0 truncate font-medium text-gray-900">{getApporteurName(c.apporteur_id)}</td>
                      <td className="px-3 py-2.5 max-w-0 truncate text-gray-600">{mission?.consultant_name || "—"}</td>
                      <td className="px-3 py-2.5">
                        {c.status === "Payée" ? (
                          <span className="text-xs font-medium text-gray-900">{c.days_worked}</span>
                        ) : (
                          <Input
                            type="number"
                            className="h-7 w-20 bg-white border-gray-200 text-xs"
                            value={c.days_worked || 0}
                            onChange={(e) => handleUpdateDaysWorked(c.id, parseFloat(e.target.value) || 0)}
                            min={0}
                            max={31}
                          />
                        )}
                      </td>
                      <td className="px-3 py-2.5 w-[100px] text-right tabular-nums font-medium text-gray-900">{(c.days_worked * c.amount).toLocaleString("fr-FR")} €</td>
                      <td className="px-3 py-2.5 w-[100px] text-right tabular-nums font-medium text-blue-600">{(c.days_worked * c.admin_amount).toLocaleString("fr-FR")} €</td>
                      <td className="px-3 py-2.5">
                        {(c as any).invoice_url ? (
                          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-green-600" onClick={() => {
                            const { data } = supabase.storage.from("documents").getPublicUrl((c as any).invoice_url);
                            window.open(data.publicUrl, "_blank");
                          }}>
                            <Eye className="h-3 w-3" /> Voir
                          </Button>
                        ) : c.status === "Générée" ? (
                          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs border-gray-200" onClick={() => setInvoiceUploadId(c.id)}>
                            <Upload className="h-3 w-3" /> Uploader
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 w-[140px]">
                        {c.status === "Payée" ? (
                          <span className="inline-block rounded border px-2 py-0.5 text-[11px] font-medium bg-green-100 text-green-700 border-green-200">Payée</span>
                        ) : (
                          <Select value={c.status} onValueChange={(v) => handleUpdateStatus(c.id, v)}>
                            <SelectTrigger className={`h-6 w-[120px] border text-[11px] font-medium ${commStatusColor[c.status] || ""}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="À générer">À générer</SelectItem>
                              <SelectItem value="Générée">Générée</SelectItem>
                              <SelectItem value="Payée">Payée</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </motion.div>
      </div>

      {/* Pay Confirmation */}
      <AlertDialog open={!!payConfirm} onOpenChange={(open) => !open && setPayConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer le paiement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette commission sera marquée comme payée. Les documents de l'apporteur sont validés et la facture est présente. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPay} className="gradient-primary border-0">Confirmer le paiement</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invoice Upload Dialog */}
      <Dialog open={!!invoiceUploadId} onOpenChange={(open) => !open && setInvoiceUploadId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Uploader la facture
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            L'apporteur doit fournir sa facture avant le paiement de la commission.
          </p>
          <input
            ref={invoiceInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && invoiceUploadId) {
                handleInvoiceUpload(invoiceUploadId, file);
              }
              e.target.value = "";
            }}
          />
          <Button className="gradient-primary border-0 w-full" onClick={() => invoiceInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Sélectionner la facture
          </Button>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCommissions;
