import type { SalesRow } from "./types";

const products: { name: string; category: string; basePrice: number; baseMargin: number }[] = [
  { name: "Aurora Headphones", category: "Electronics", basePrice: 180, baseMargin: 0.42 },
  { name: "Nimbus Smartwatch", category: "Electronics", basePrice: 240, baseMargin: 0.38 },
  { name: "Pulse Earbuds", category: "Electronics", basePrice: 95, baseMargin: 0.46 },
  { name: "Vertex Laptop Stand", category: "Electronics", basePrice: 65, baseMargin: 0.55 },
  { name: "Drift Hoodie", category: "Apparel", basePrice: 75, baseMargin: 0.50 },
  { name: "Trail Runner Shoes", category: "Apparel", basePrice: 130, baseMargin: 0.44 },
  { name: "Field Jacket", category: "Apparel", basePrice: 220, baseMargin: 0.40 },
  { name: "Cold Brew Concentrate", category: "Food & Bev", basePrice: 18, baseMargin: 0.58 },
  { name: "Single-Origin Beans", category: "Food & Bev", basePrice: 22, baseMargin: 0.52 },
  { name: "Sparkling Water 12pk", category: "Food & Bev", basePrice: 14, baseMargin: 0.36 },
  { name: "Linen Throw", category: "Home & Garden", basePrice: 85, baseMargin: 0.48 },
  { name: "Ceramic Planter", category: "Home & Garden", basePrice: 42, baseMargin: 0.55 },
  { name: "Brass Floor Lamp", category: "Home & Garden", basePrice: 260, baseMargin: 0.42 },
];

const regions = ["North", "South", "East", "West"];

// Deterministic pseudo-random for stable sample data
function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function buildSampleData(): SalesRow[] {
  const r = rand(42);
  const rows: SalesRow[] = [];
  const year = 2024;
  for (let m = 0; m < 12; m++) {
    const monthStr = String(m + 1).padStart(2, "0");
    const seasonal = 1 + 0.25 * Math.sin((m / 12) * Math.PI * 2 - 1) + (m / 12) * 0.35;
    for (const region of regions) {
      const regionMul = { North: 1.15, South: 0.9, East: 1.05, West: 1.25 }[region as "North"]!;
      for (const p of products) {
        // not every product sells in every region every month
        if (r() < 0.18) continue;
        const day = Math.min(28, 1 + Math.floor(r() * 27));
        const orders = Math.max(3, Math.round((20 + r() * 90) * seasonal * regionMul * (p.basePrice < 50 ? 2.2 : 1)));
        const revenue = Math.round(orders * p.basePrice * (0.85 + r() * 0.3));
        const cost = Math.round(revenue * (1 - p.baseMargin) * (0.92 + r() * 0.16));
        rows.push({
          date: `${year}-${monthStr}-${String(day).padStart(2, "0")}`,
          product: p.name,
          category: p.category,
          region,
          revenue,
          orders,
          cost,
        });
      }
    }
  }
  return rows;
}

export const SAMPLE_DATA: SalesRow[] = buildSampleData();

export const PERIODS = ["All", "Q1", "Q2", "Q3", "Q4"] as const;
export const REGIONS = ["All", "North", "South", "East", "West"] as const;
export const CATEGORIES = ["All", "Electronics", "Apparel", "Food & Bev", "Home & Garden"] as const;