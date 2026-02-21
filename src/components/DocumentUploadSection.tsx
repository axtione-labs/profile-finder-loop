import { useRef } from "react";
import { FileText, Upload, CheckCircle2, Clock, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDocuments, useUploadDocument, Document } from "@/hooks/useDocuments";
import { supabase } from "@/integrations/supabase/client";

const docTypes: { type: Document["type"]; label: string; description: string }[] = [
  { type: "rib", label: "RIB", description: "Relevé d'identité bancaire" },
  { type: "kbis", label: "KBIS", description: "Extrait Kbis de votre société" },
  { type: "id_card", label: "Pièce d'identité", description: "CNI ou passeport" },
];

const statusConfig = {
  pending: { icon: Clock, label: "En attente de validation", className: "border-warning/30 bg-warning/10 text-warning" },
  validated: { icon: CheckCircle2, label: "Validé", className: "border-success/30 bg-success/10 text-success" },
  rejected: { icon: XCircle, label: "Rejeté — veuillez renvoyer", className: "border-destructive/30 bg-destructive/10 text-destructive" },
};

const DocumentUploadSection = () => {
  const { data: documents = [] } = useDocuments();
  const uploadDoc = useUploadDocument();

  const getDoc = (type: Document["type"]) => documents.find(d => d.type === type);

  const handleUpload = (type: Document["type"], file: File) => {
    uploadDoc.mutate({ file, type });
  };

  return (
    <div className="gradient-card rounded-xl border border-border/50 p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-semibold">Mes Documents</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Uploadez vos documents pour pouvoir recevoir vos commissions. Ils seront vérifiés par notre équipe.
      </p>

      <div className="space-y-4">
        {docTypes.map(({ type, label, description }) => {
          const doc = getDoc(type);
          const status = doc ? statusConfig[doc.status] : null;

          return (
            <div key={type} className="flex items-center justify-between rounded-lg border border-border/30 bg-background/30 p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{label}</span>
                  {status && (
                    <Badge variant="outline" className={status.className}>
                      <status.icon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
                {doc && <p className="text-xs text-muted-foreground mt-0.5">Fichier : {doc.file_name}</p>}
              </div>
              <div className="flex items-center gap-2">
                {doc && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const { data } = supabase.storage.from("documents").getPublicUrl(doc.file_url);
                      window.open(data.publicUrl, "_blank");
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                <FileUploadButton
                  onSelect={(file) => handleUpload(type, file)}
                  loading={uploadDoc.isPending}
                  hasDoc={!!doc}
                  rejected={doc?.status === "rejected"}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FileUploadButton = ({ onSelect, loading, hasDoc, rejected }: {
  onSelect: (file: File) => void;
  loading: boolean;
  hasDoc: boolean;
  rejected: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          e.target.value = "";
        }}
      />
      <Button
        size="sm"
        variant={rejected ? "destructive" : hasDoc ? "outline" : "default"}
        className={!hasDoc ? "gradient-primary border-0" : ""}
        onClick={() => inputRef.current?.click()}
        disabled={loading}
      >
        <Upload className="h-4 w-4 mr-1" />
        {loading ? "Upload..." : hasDoc ? "Remplacer" : "Uploader"}
      </Button>
    </>
  );
};

export default DocumentUploadSection;
