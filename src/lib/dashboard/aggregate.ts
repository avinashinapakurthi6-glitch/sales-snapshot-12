import type { Filters, SalesRow } from "./types";

export const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function monthOf(date: string): number {
  // expects yyyy-mm-dd
  return parseInt(date.slice(5, 7), 10) - 1;
}

function quarterOfMonth(m: number): 1 | 2 | 3 | 4 {
  return (Math.floor(m / 3) + 1) as 1 | 2 | 3 | 4;
}

export function applyFilters(rows: SalesRow[], f: Filters): SalesRow[] {
  return rows.filter((row) => {
    if (f.region !== "All" && row.region !== f.region) return false;
    if (f.category !== "All" && row.category !== f.category) return false;
    if (f.period !== "All") {
      const q = quarterOfMonth(monthOf(row.date));
      if (`Q${q}` !== f.period) return false;
    }
    return true;
  });
}

/**
 * The "previous period" used for delta badges. We compare against the same
 * filter applied to the rows preceding the filtered window.
 * Simple heuristic: take the prior quarter (or prior year if Q1/All).
 */
export function previousPeriodRows(allRows: SalesRow[], f: Filters): SalesRow[] {
  if (f.period === "All") {
    // No previous-year data in sample; compare against H1 vs H2 swap
    return applyFilters(allRows, { ...f, period: "Q1" });
  }
  const map: Record<string, "Q1" | "Q2" | "Q3" | "Q4"> = {
    Q1: "Q4",
    Q2: "Q1",
    Q3: "Q2",
    Q4: "Q3",
  };
  return applyFilters(allRows, { ...f, period: map[f.period] });
}

export interface Kpis {
  revenue: number;
  orders: number;
  aov: number;
  margin: number; // percentage 0-100
  newCustomers: number;
}

export function computeKpis(rows: SalesRow[]): Kpis {
  const revenue = rows.reduce((s, r) => s + r.revenue, 0);
  const orders = rows.reduce((s, r) => s + r.orders, 0);
  const cost = rows.reduce((s, r) => s + r.cost, 0);
  const aov = orders > 0 ? revenue / orders : 0;
  const margin = revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0;
  // synthetic "new customers" derived from orders so it tracks with data
  const newCustomers = Math.round(orders * 0.32);
  return { revenue, orders, aov, margin, newCustomers };
}

export function pctChange(curr: number, prev: number): number {
  if (prev === 0) return curr === 0 ? 0 : 100;
  return ((curr - prev) / prev) * 100;
}

/** Monthly revenue series for the filtered rows. Returns 12 months. */
export function monthlyRevenueSeries(rows: SalesRow[]): {
  labels: string[];
  revenue: number[];
  target: number[];
} {
  const buckets = new Array(12).fill(0) as number[];
  for (const r of rows) buckets[monthOf(r.date)] += r.revenue;
  // Target: a smoothly growing line that the actuals roughly track
  const total = buckets.reduce((a, b) => a + b, 0);
  const avg = total / 12 || 1;
  const target = buckets.map((_, i) => Math.round(avg * (0.85 + i * 0.025)));
  return { labels: MONTH_LABELS, revenue: buckets, target };
}

export function categoryTotals(rows: SalesRow[]): { name: string; revenue: number }[] {
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.category, (m.get(r.category) ?? 0) + r.revenue);
  return Array.from(m, ([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue);
}

export function regionTotals(rows: SalesRow[]): { name: string; revenue: number }[] {
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.region, (m.get(r.region) ?? 0) + r.revenue);
  return Array.from(m, ([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue);
}

export interface ProductRow {
  product: string;
  category: string;
  revenue: number;
  margin: number; // %
  delta: number; // % vs previous
}

export function topProducts(rows: SalesRow[], prevRows: SalesRow[]): ProductRow[] {
  const aggregate = (src: SalesRow[]) => {
    const m = new Map<string, { category: string; revenue: number; cost: number }>();
    for (const r of src) {
      const cur = m.get(r.product) ?? { category: r.category, revenue: 0, cost: 0 };
      cur.revenue += r.revenue;
      cur.cost += r.cost;
      m.set(r.product, cur);
    }
    return m;
  };
  const cur = aggregate(rows);
  const prev = aggregate(prevRows);
  const out: ProductRow[] = [];
  for (const [product, v] of cur) {
    const prevRev = prev.get(product)?.revenue ?? 0;
    out.push({
      product,
      category: v.category,
      revenue: v.revenue,
      margin: v.revenue > 0 ? ((v.revenue - v.cost) / v.revenue) * 100 : 0,
      delta: pctChange(v.revenue, prevRev),
    });
  }
  return out.sort((a, b) => b.revenue - a.revenue);
}