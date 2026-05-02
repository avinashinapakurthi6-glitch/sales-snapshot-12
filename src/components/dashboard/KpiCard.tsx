import { formatDelta } from "@/lib/dashboard/format";

interface Props {
  label: string;
  value: string;
  deltaPct: number;
}

export function KpiCard({ label, value, deltaPct }: Props) {
  const positive = deltaPct >= 0;
  return (
    <div className="rounded-lg bg-secondary p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</div>
      <div
        className="mt-2 inline-flex items-center text-xs font-medium"
        style={{ color: positive ? "var(--positive)" : "var(--negative)" }}
      >
        {formatDelta(deltaPct)}
      </div>
    </div>
  );
}