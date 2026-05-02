import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Filters as FiltersBar } from "@/components/dashboard/Filters";
import { ImportButton } from "@/components/dashboard/ImportButton";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { RevenueTrendChart } from "@/components/dashboard/RevenueTrendChart";
import { CategoryDoughnut } from "@/components/dashboard/CategoryDoughnut";
import { RegionBars } from "@/components/dashboard/RegionBars";
import { TopProductsTable } from "@/components/dashboard/TopProductsTable";
import { SAMPLE_DATA } from "@/lib/dashboard/sample-data";
import {
  applyFilters,
  categoryTotals,
  computeKpis,
  monthlyRevenueSeries,
  pctChange,
  previousPeriodRows,
  regionTotals,
  topProducts,
} from "@/lib/dashboard/aggregate";
import { formatInt, formatMoneyShort, formatPct } from "@/lib/dashboard/format";
import type { Filters, SalesRow } from "@/lib/dashboard/types";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const [data, setData] = useState<SalesRow[]>(SAMPLE_DATA);
  const [source, setSource] = useState<string>("Sample dataset");
  const [filters, setFilters] = useState<Filters>({
    period: "All",
    region: "All",
    category: "All",
  });

  const filtered = useMemo(() => applyFilters(data, filters), [data, filters]);
  const prev = useMemo(() => previousPeriodRows(data, filters), [data, filters]);

  const kpis = useMemo(() => computeKpis(filtered), [filtered]);
  const prevKpis = useMemo(() => computeKpis(prev), [prev]);

  const trend = useMemo(() => monthlyRevenueSeries(filtered), [filtered]);
  const cats = useMemo(() => categoryTotals(filtered), [filtered]);
  const regions = useMemo(() => regionTotals(filtered), [filtered]);
  const products = useMemo(() => topProducts(filtered, prev), [filtered, prev]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Sales &amp; Revenue Analysis
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Showing: {source}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FiltersBar value={filters} onChange={setFilters} />
            <ImportButton
              onImported={(rows, name) => {
                setData(rows);
                setSource(name);
                setFilters({ period: "All", region: "All", category: "All" });
              }}
            />
          </div>
        </header>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <KpiCard
            label="Total Revenue"
            value={formatMoneyShort(kpis.revenue)}
            deltaPct={pctChange(kpis.revenue, prevKpis.revenue)}
          />
          <KpiCard
            label="Total Orders"
            value={formatInt(kpis.orders)}
            deltaPct={pctChange(kpis.orders, prevKpis.orders)}
          />
          <KpiCard
            label="Avg. Order Value"
            value={formatMoneyShort(kpis.aov)}
            deltaPct={pctChange(kpis.aov, prevKpis.aov)}
          />
          <KpiCard
            label="Gross Margin"
            value={formatPct(kpis.margin)}
            deltaPct={pctChange(kpis.margin, prevKpis.margin)}
          />
          <KpiCard
            label="New Customers"
            value={formatInt(kpis.newCustomers)}
            deltaPct={pctChange(kpis.newCustomers, prevKpis.newCustomers)}
          />
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Monthly Revenue Trend" subtitle="Actual vs. target">
            <RevenueTrendChart
              labels={trend.labels}
              revenue={trend.revenue}
              target={trend.target}
            />
          </ChartCard>
          <ChartCard title="Revenue by Category">
            <CategoryDoughnut data={cats} />
          </ChartCard>
          <ChartCard title="Top Products" className="lg:col-span-1">
            <TopProductsTable rows={products} />
          </ChartCard>
          <ChartCard title="Regional Breakdown">
            <RegionBars data={regions} />
          </ChartCard>
        </section>
      </div>
    </div>
  );
}
