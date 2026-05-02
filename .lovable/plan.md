
# Sales & Revenue Analysis Dashboard

A clean, flat analytics dashboard built as the home route (`/`). Loads with hardcoded sample data instantly, supports CSV upload, and re-renders all KPIs and charts on filter changes.

## Page layout

```text
┌─────────────────────────────────────────────────────────────┐
│ Sales & Revenue Analysis            [Period][Region][Cat]  │
│ Showing: sample-data.csv                    [+ Import data] │
├─────────────────────────────────────────────────────────────┤
│ [Revenue] [Orders] [AOV] [Gross Margin] [New Customers]    │  KPI row
├──────────────────────────────┬──────────────────────────────┤
│ Monthly Revenue Trend        │ Revenue by Category          │
│ (line + filled area, target) │ (doughnut + HTML legend %)   │
├──────────────────────────────┼──────────────────────────────┤
│ Top Products (sortable table)│ Regional Breakdown (bars)    │
└──────────────────────────────┴──────────────────────────────┘
```

On narrow viewports the chart grid collapses to a single column; KPI cards wrap to 2 per row, then 1.

## KPI cards

Five cards, muted secondary background, no shadow:
- Total Revenue, Total Orders, Average Order Value, Gross Margin %, New Customers
- Each card: label, large value (money formatted as `$42K` / `$1.2M`), delta badge (`↑ 14.2% vs last period` green / `↓ 3.1% vs last period` red).
- Delta is computed by comparing the filtered period vs. the immediately prior equivalent window in the dataset.

## Charts (Chart.js)

1. **Monthly Revenue Trend** — line chart, two datasets:
   - Actual revenue: solid line with filled area beneath (light primary tint).
   - Target: dashed line, no fill.
   - X axis: months in current filter range. Tooltip shows formatted currency.
2. **Revenue by Category** — doughnut. Custom HTML legend rendered next to the chart with category swatch, name, and `%` of total.
3. **Regional Breakdown** — vertical bar chart, one bar per region, distinct color per region from a fixed palette.

## Top Products table

Sortable columns: Product, Category, Revenue, Share, Margin %, Δ vs prior.
- Share column: inline mini progress bar (full bar = top product's revenue).
- Δ column: colored up/down badge (green #1D9E75 / red #E24B4A).
- Click a header to toggle asc/desc sort. Default: revenue desc, top 8 rows.

## Filters

Three native `<select>` dropdowns in the top bar:
- Period: All / Q1 / Q2 / Q3 / Q4
- Region: All / North / South / East / West
- Category: All / Electronics / Apparel / Food & Bev / Home & Garden

State is held with `useState`. A `useMemo` derives the filtered row set; KPIs, charts, and the table all read from this memo, so any filter change instantly updates everything.

## Data import

- "+ Import data" button triggers a hidden `<input type="file" accept=".csv">`.
- PapaParse parses the file with `header: true`, `skipEmptyLines: true`.
- Column mapping is case-insensitive: `date`, `product`, `category`, `region`, `revenue`, `orders`, `cost`. Unknown columns ignored; missing required columns shows a toast error and keeps existing data.
- On success: replace dataset, reset filters to All, show filename in subtitle (`Showing: filename.csv`).

## Sample data

~120 hardcoded rows spanning 12 months across 4 regions and 4 categories with realistic revenue, orders, cost values, and product names. Dashboard renders fully on first paint with no upload required.

## Design system (Cloud White)

Update `src/styles.css` design tokens:
- background `#fafbfc`, foreground near-black, muted/secondary `#e8ecf1`, border `#e8ecf1` at 0.5px effective weight, primary `#3b82f6`, muted-foreground `#94a3b8`.
- Positive `#1D9E75`, negative `#E24B4A` exposed as `--color-positive` / `--color-negative`.
- No gradients, no drop shadows anywhere. Cards use solid backgrounds with a hairline border.
- Metric cards: secondary background. Chart cards: white background with `border: 0.5px solid var(--border)`.
- Font: Inter (already default-ish via system stack; add Inter via Google Fonts link in `__root.tsx` head).

## Technical notes

- Stack: TanStack Start route at `src/routes/index.tsx` (replaces placeholder). Client-only component since Chart.js needs the DOM — guard with a mount effect or dynamic import of `chart.js/auto`.
- New deps: `chart.js`, `react-chartjs-2`, `papaparse`, `@types/papaparse`.
- Files:
  - `src/routes/index.tsx` — route shell + page composition.
  - `src/components/dashboard/` — `KpiCard.tsx`, `Filters.tsx`, `RevenueTrendChart.tsx`, `CategoryDoughnut.tsx`, `RegionBars.tsx`, `TopProductsTable.tsx`, `ImportButton.tsx`.
  - `src/lib/dashboard/sample-data.ts` — hardcoded rows.
  - `src/lib/dashboard/format.ts` — `formatMoneyShort` (`$42K`/`$1.2M`), `formatPct`, delta helpers.
  - `src/lib/dashboard/aggregate.ts` — pure functions: filter rows, compute KPIs, monthly series, category totals, region totals, top products, period-over-period deltas.
- Update `src/routes/__root.tsx` head: title "Sales & Revenue Analysis", Inter font link.
- Accessibility: selects have labels, table headers are `<th scope="col">` buttons for sort, charts have `aria-label` summaries.

## Out of scope

- Persistence of uploaded data across reloads.
- Auth, multi-tenant data, exporting filtered data.
- Date-range picker beyond the quarter selector.
