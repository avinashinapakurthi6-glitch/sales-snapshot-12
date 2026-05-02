import { useRef, useState } from "react";
import { parseCsv } from "@/lib/dashboard/csv";
import type { SalesRow } from "@/lib/dashboard/types";

interface Props {
  onImported: (rows: SalesRow[], filename: string) => void;
}

export function ImportButton({ onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    const result = await parseCsv(file);
    if (result.error || !result.rows) {
      setError(result.error ?? "Failed to parse CSV");
      return;
    }
    onImported(result.rows, file.name);
  };

  return (
    <div className="flex items-center gap-3">
      {error && <span className="text-xs" style={{ color: "var(--negative)" }}>{error}</span>}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex h-9 items-center gap-1 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        + Import data
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}