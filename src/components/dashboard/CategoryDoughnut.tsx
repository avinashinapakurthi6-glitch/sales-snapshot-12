import { useEffect, useRef } from "react";
import { Chart, DoughnutController, ArcElement, Tooltip } from "chart.js";
import { formatMoneyShort } from "@/lib/dashboard/format";

Chart.register(DoughnutController, ArcElement, Tooltip);

const COLORS = ["#3B82F6", "#22C55E", "#F59E0B", "#A855F7", "#EC4899", "#14B8A6"];

interface Props {
  data: { name: string; revenue: number }[];
}

export function CategoryDoughnut({ data }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);
  const total = data.reduce((s, d) => s + d.revenue, 0) || 1;

  useEffect(() => {
    if (!ref.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(ref.current, {
      type: "doughnut",
      data: {
        labels: data.map((d) => d.name),
        datasets: [
          {
            data: data.map((d) => d.revenue),
            backgroundColor: data.map((_, i) => COLORS[i % COLORS.length]),
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const v = ctx.parsed as number;
                const pct = ((v / total) * 100).toFixed(1);
                return `${ctx.label}: ${formatMoneyShort(v)} (${pct}%)`;
              },
            },
          },
        },
      },
    });
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data, total]);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-56 w-56 shrink-0">
        <canvas ref={ref} aria-label="Revenue by category" />
      </div>
      <ul className="flex-1 space-y-2 text-sm">
        {data.map((d, i) => {
          const pct = ((d.revenue / total) * 100).toFixed(1);
          return (
            <li key={d.name} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-foreground">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                {d.name}
              </span>
              <span className="text-muted-foreground tabular-nums">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}