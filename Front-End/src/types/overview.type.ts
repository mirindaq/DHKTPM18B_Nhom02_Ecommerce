export interface StatItem {
  current: number;
  previous: number;
  percentChange: number;
  trend: "up" | "down";
}

export interface DashboardStatsPayload {
  revenue: StatItem;
  orders: StatItem;
  products: StatItem;
  customers: StatItem;
}

export interface MonthlyRevenue {
  name: string;
  revenue: number;
}
