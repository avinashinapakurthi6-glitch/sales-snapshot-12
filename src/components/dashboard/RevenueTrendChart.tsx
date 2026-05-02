import { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { formatMoneyShort } from "@/lib/dashboard/format";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
  Legend,
);

interface Props {
  labels: string[];
  revenue: number[];
  target: number[];
}

export function RevenueTrendChart({ labels, revenue, target }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(ref.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Revenue",
            data: revenue,
            borderColor: "#3B82F6",
            backgroundColor: "rgba(59,130,246,0.12)",
            borderWidth: 2,
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointBackgroundColor: "#3B82F6",
          },
          {
            label: "Target",
            data: target,
            borderColor: "#94A3B8",
            borderDash: [5, 4],
            borderWidth: 1.5,
            fill: false,
            tension: 0.35,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "bottom",
            labels: { boxWidth: 10, boxHeight: 10, font: { size: 11 } },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${formatMoneyShort(ctx.parsed.y as number)}`,
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
  }, [labels, revenue, target]);

  return (
    <div className="relative h-72">
      <canvas ref={ref} aria-label="Monthly revenue trend with target" />
    </div>
  );
}