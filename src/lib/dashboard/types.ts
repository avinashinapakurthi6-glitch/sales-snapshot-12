export type Region = "North" | "South" | "East" | "West";
export type Category = "Electronics" | "Apparel" | "Food & Bev" | "Home & Garden";

export interface SalesRow {
  date: string; // ISO yyyy-mm-dd
  product: string;
  category: string;
  region: string;
  revenue: number;
  orders: number;
  cost: number;
}

export type Period = "All" | "Q1" | "Q2" | "Q3" | "Q4";

export interface Filters {
  period: Period;
  region: "All" | Region | string;
  category: "All" | Category | string;
}