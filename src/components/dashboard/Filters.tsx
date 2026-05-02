import { CATEGORIES, PERIODS, REGIONS } from "@/lib/dashboard/sample-data";
import type { Filters as F } from "@/lib/dashboard/types";

interface Props {
  value: F;
  onChange: (f: F) => void;
}

const selectClass =
  "h-9 rounded-md border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

export function Filters({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="f-period">Period</label>
      <select
        id="f-period"
        className={selectClass}
        value={value.period}
        onChange={(e) => onChange({ ...value, period: e.target.value as F["period"] })}
      >
        {PERIODS.map((p) => (
          <option key={p} value={p}>
            Period: {p}
          </option>
        ))}
      </select>
      <label className="sr-only" htmlFor="f-region">Region</label>
      <select
        id="f-region"
        className={selectClass}
        value={value.region}
        onChange={(e) => onChange({ ...value, region: e.target.value })}
      >
        {REGIONS.map((r) => (
          <option key={r} value={r}>
            Region: {r}
          </option>
        ))}
      </select>
      <label className="sr-only" htmlFor="f-category">Category</label>
      <select
        id="f-category"
        className={selectClass}
        value={value.category}
        onChange={(e) => onChange({ ...value, category: e.target.value })}
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            Category: {c}
          </option>
        ))}
      </select>
    </div>
  );
}