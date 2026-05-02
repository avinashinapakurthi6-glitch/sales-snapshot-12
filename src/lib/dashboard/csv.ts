import Papa from "papaparse";
import type { SalesRow } from "./types";

const REQUIRED = ["date", "product", "category", "region", "revenue", "orders", "cost"] as const;

export interface ParseResult {
  rows?: SalesRow[];
  error?: string;
}

export function parseCsv(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        if (!res.data || res.data.length === 0) {
          resolve({ error: "CSV is empty" });
          return;
        }
        const first = res.data[0];
        const lcMap: Record<string, string> = {};
        for (const k of Object.keys(first)) lcMap[k.toLowerCase().trim()] = k;
        const missing = REQUIRED.filter((c) => !(c in lcMap));
        if (missing.length) {
          resolve({ error: `Missing columns: ${missing.join(", ")}` });
          return;
        }
        const rows: SalesRow[] = [];
        for (const r of res.data) {
          const get = (c: string) => r[lcMap[c]];
          const revenue = Number(get("revenue"));
          const orders = Number(get("orders"));
          const cost = Number(get("cost"));
          if (!isFinite(revenue) || !isFinite(orders) || !isFinite(cost)) continue;
          rows.push({
            date: String(get("date")),
            product: String(get("product")),
            category: String(get("category")),
            region: String(get("region")),
            revenue,
            orders,
            cost,
          });
        }
        if (rows.length === 0) {
          resolve({ error: "No valid rows found" });
          return;
        }
        resolve({ rows });
      },
      error: (err) => resolve({ error: err.message }),
    });
  });
}