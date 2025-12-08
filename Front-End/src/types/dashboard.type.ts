export interface RevenueByMonthResponse {
  month: number;
  year: number;
  revenue: number;
  orderCount: number;
}

export interface RevenueByDayResponse {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface RevenueByYearResponse {
  year: number;
  revenue: number;
  orderCount: number;
}

export interface TopProductResponse {
  productId: number;
  productName: string;
  productImage: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface DashboardApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface ComparisonPeriod {
  type: 'day' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
  year?: number;
  month?: number;
}

export interface RevenueComparison {
  period1: ComparisonPeriod;
  period2: ComparisonPeriod;
  data1: RevenueByDayResponse[] | RevenueByMonthResponse[] | RevenueByYearResponse[];
  data2: RevenueByDayResponse[] | RevenueByMonthResponse[] | RevenueByYearResponse[];
}

export interface ComparisonResponse {
  period1Label: string;
  period2Label: string;
  revenue1: number;
  revenue2: number;
  orderCount1: number;
  orderCount2: number;
  revenueDifference: number;
  revenueGrowthPercent: number;
  orderDifference: number;
  orderGrowthPercent: number;
}
