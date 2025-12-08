import axiosClient from '@/configurations/axios.config';
import type {
  RevenueByMonthResponse,
  RevenueByDayResponse,
  RevenueByYearResponse,
  TopProductResponse,
  DashboardApiResponse,
  ComparisonResponse,
  DashboardStatsResponse
} from '@/types/dashboard.type';

export const dashboardService = {
  // Doanh thu theo tháng
  getRevenueByMonth: async (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await axiosClient.get<DashboardApiResponse<RevenueByMonthResponse[]>>(
      `/dashboard/revenue-by-month${queryString}`
    );
    return response.data;
  },

  // Doanh thu theo ngày
  getRevenueByDay: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await axiosClient.get<DashboardApiResponse<RevenueByDayResponse[]>>(
      `/dashboard/revenue-by-day${queryString}`
    );
    return response.data;
  },

  // Doanh thu theo năm
  getRevenueByYear: async (year?: number) => {
    const params = year ? `?year=${year}` : '';
    const response = await axiosClient.get<DashboardApiResponse<RevenueByYearResponse[]>>(
      `/dashboard/revenue-by-year${params}`
    );
    return response.data;
  },

  // Top sản phẩm theo ngày
  getTopProductsByDay: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await axiosClient.get<DashboardApiResponse<TopProductResponse[]>>(
      `/dashboard/top-products-by-day${queryString}`
    );
    return response.data;
  },

  // Top sản phẩm theo tháng
  getTopProductsByMonth: async (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await axiosClient.get<DashboardApiResponse<TopProductResponse[]>>(
      `/dashboard/top-products-by-month${queryString}`
    );
    return response.data;
  },

  // Top sản phẩm theo năm
  getTopProductsByYear: async (year?: number) => {
    const params = year ? `?year=${year}` : '';
    const response = await axiosClient.get<DashboardApiResponse<TopProductResponse[]>>(
      `/dashboard/top-products-by-year${params}`
    );
    return response.data;
  },

  // So sánh doanh thu
  compareRevenue: async (
    timeType: string,
    startDate1: string,
    endDate1: string,
    startDate2: string,
    endDate2: string
  ) => {
    const params = new URLSearchParams();
    params.append('timeType', timeType);
    params.append('startDate1', startDate1);
    params.append('endDate1', endDate1);
    params.append('startDate2', startDate2);
    params.append('endDate2', endDate2);
    
    const response = await axiosClient.get<DashboardApiResponse<ComparisonResponse>>(
      `/dashboard/compare-revenue?${params.toString()}`
    );
    return response.data;
  },

  // Thống kê tổng quan
  getDashboardStats: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await axiosClient.get<DashboardApiResponse<DashboardStatsResponse>>(
      `/dashboard/stats${queryString}`
    );
    return response.data;
  },

  // Export Excel
  exportExcel: async (startDate?: string, endDate?: string): Promise<Blob> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await axiosClient.get(`/dashboard/export-excel${queryString}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get all products by day
  getAllProductsByDay: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await axiosClient.get<DashboardApiResponse<TopProductResponse[]>>(
      `/dashboard/all-products-by-day${queryString}`
  // Statistics API - Dashboard overview
  getStatisticsDashboard: async () => {
    const response = await axiosClient.get<DashboardApiResponse<any>>(
      '/statistics/dashboard'
    );
    return response.data;
  },

  // Get all products by month
  getAllProductsByMonth: async (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await axiosClient.get<DashboardApiResponse<TopProductResponse[]>>(
      `/dashboard/all-products-by-month${queryString}`
    );
    return response.data;
  },

  // Get all products by year
  getAllProductsByYear: async (year?: number) => {
    const params = year ? `?year=${year}` : '';
    const response = await axiosClient.get<DashboardApiResponse<TopProductResponse[]>>(
      `/dashboard/all-products-by-year${params}`
    );
    return response.data;
  },

  // Get product detail
  getProductDetail: async (productId: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await axiosClient.get<DashboardApiResponse<import('@/types/dashboard.type').ProductDetailResponse>>(
      `/dashboard/product-detail/${productId}${queryString}`
    );
    return response.data;
  },

  // Get orders by date range
  getOrdersByDateRange: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await axiosClient.get<DashboardApiResponse<import('@/types/dashboard.type').OrderSummary[]>>(
      `/dashboard/orders-by-date-range${queryString}`
  // Statistics API - Monthly revenue
  getStatisticsMonthlyRevenue: async () => {
    const response = await axiosClient.get<DashboardApiResponse<any[]>>(
      '/statistics/monthly-revenue'
    );
    return response.data;
  }
};
