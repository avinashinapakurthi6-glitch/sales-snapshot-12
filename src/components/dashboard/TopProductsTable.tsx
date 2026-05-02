import { useState } from "react";
import { formatMoneyShort, formatPct } from "@/lib/dashboard/format";
import type { ProductRow } from "@/lib/dashboard/aggregate";

type SortKey = "product" | "category" | "revenue" | "margin" | "delta";

interface Props {
  rows: ProductRow[];
}

export function TopProductsTable({ rows }: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "revenue",
    dir: "desc",
  });

  const sorted = [...rows].sort((a, b) => {
    const av = a[sort.key];
    const bv = b[sort.key];
    let cmp = 0;
    if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
    else cmp = String(av).localeCompare(String(bv));
    return sort.dir === "asc" ? cmp : -cmp;
  });
  const top = sorted.slice(0, 8);
  const maxRev = Math.max(...rows.map((r) => r.revenue), 1);

  const toggle = (key: SortKey) =>
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" },
    );

  const arrow = (key: SortKey) =>
    sort.key === key ? <span className="ml-1 text-muted-foreground">{sort.dir === "asc" ? "↑" : "↓"}</span> : null;

  const Th = ({ k, label, align = "left" }: { k: SortKey; label: string; align?: "left" | "right" }) => (
    <th scope="col" className={`px-3 py-2 text-${align}`}>
      <button
        type="button"
        onClick={() => toggle(k)}
        className="inline-flex items-center text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
      >
        {label}
        {arrow(k)}
      </button>
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr style={{ borderBottom: "0.5px solid var(--border)" }}>
            <Th k="product" label="Product" />
            <Th k="category" label="Category" />
            <Th k="revenue" label="Revenue" align="right" />
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Share
            </th>
            <Th k="margin" label="Margin" align="right" />
            <Th k="delta" label="Δ" align="right" />
          </tr>
        </thead>
        <tbody>
          {top.map((r) => {
            const share = (r.revenue / maxRev) * 100;
            const positive = r.delta >= 0;
            return (
              <tr key={r.product} style={{ borderBottom: "0.5px solid var(--border)" }}>
                <td className="px-3 py-3 font-medium text-foreground">{r.product}</td>
                <td className="px-3 py-3 text-muted-foreground">{r.category}</td>
                <td className="px-3 py-3 text-right tabular-nums text-foreground">
                  {formatMoneyShort(r.revenue)}
                </td>
                <td className="px-3 py-3">
                  <div className="h-1.5 w-32 rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${share}%`, backgroundColor: "var(--primary)" }}
                    />
                  </div>
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-foreground">
                  {formatPct(r.margin)}
                </td>
                <td className="px-3 py-3 text-right">
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      color: positive ? "var(--positive)" : "var(--negative)",
                      backgroundColor: positive
                        ? "rgba(29,158,117,0.10)"
                        : "rgba(226,75,74,0.10)",
                    }}
                  >
                    {positive ? "↑" : "↓"} {Math.abs(r.delta).toFixed(1)}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}