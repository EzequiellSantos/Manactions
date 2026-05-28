import { useMemo, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

interface FileUploadProps {
  onFilesChange?: (files: File[]) => void;
}

export function FileUpload({ onFilesChange }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const previews = useMemo(() => files.map((file) => ({ file, key: `${file.name}-${file.size}` })), [files]);

  function setNextFiles(nextFiles: File[]) {
    setFiles(nextFiles);
    onFilesChange?.(nextFiles);
  }

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface p-6 text-center transition hover:border-primary/40 hover:bg-background">
        <Upload className="h-6 w-6 text-muted-foreground" />
        <span className="mt-2 text-sm font-medium">Adicionar anexos</span>
        <span className="mt-1 text-xs text-muted-foreground">PDF, imagens, planilhas ou documentos</span>
        <Input
          type="file"
          multiple
          className="sr-only"
          onChange={(event) => setNextFiles([...files, ...Array.from(event.target.files ?? [])])}
        />
      </label>

      {previews.length > 0 && (
        <div className="space-y-2">
          {previews.map(({ file, key }) => (
            <div key={key} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
              <FileText className="h-4 w-4 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setNextFiles(files.filter((item) => item !== file))}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
