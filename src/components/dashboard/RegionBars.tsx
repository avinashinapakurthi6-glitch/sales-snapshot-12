import { useEffect, useRef } from "react";
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from "chart.js";
import { formatMoneyShort } from "@/lib/dashboard/format";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

const REGION_COLORS: Record<string, string> = {
  North: "#3B82F6",
  South: "#F59E0B",
  East: "#22C55E",
  West: "#A855F7",
};
const FALLBACK = ["#EC4899", "#14B8A6", "#6366F1", "#F97316"];

interface Props {
  data: { name: string; revenue: number }[];
}

export function RegionBars({ data }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(ref.current, {
      type: "bar",
      data: {
        labels: data.map((d) => d.name),
        datasets: [
          {
            label: "Revenue",
            data: data.map((d) => d.revenue),
            backgroundColor: data.map(
              (d, i) => REGION_COLORS[d.name] ?? FALLBACK[i % FALLBACK.length],
            ),
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => formatMoneyShort(ctx.parsed.y as number),
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: {
            grid: { color: "rgba(148,163,184,0.15)" },
            ticks: {
              font: { size: 11 },
              callback: (v) => formatMoneyShort(Number(v)),
            },
          },
        },
      },
    });
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data]);

  return (
    <div className="relative h-72">
      <canvas ref={ref} aria-label="Revenue by region" />
    </div>
  );
}