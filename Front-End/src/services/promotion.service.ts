import axiosClient from '@/configurations/axios.config';
import type { CreatePromotionRequest, PromotionListResponse, PromotionResponse, UpdatePromotionRequest } from '@/types/promotion.type';
import type {
  ApiResponse,
  TopPromotionResponse,
  PromotionComparisonResponse
} from '@/types/voucher-promotion.type';
interface GetPromotionsParams {
  page: number;
  size: number;
  name?: string;
  type?: string;
  active?: boolean;
  startDate?: string;
  priority?: number;
}

export const promotionService = {
  // Top promotions by day
  getTopPromotionsByDay: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await axiosClient.get<ApiResponse<TopPromotionResponse[]>>(
      `/dashboard/top-promotions-by-day${queryString}`
    );
    return response.data;
  },

  // Top promotions by month
  getTopPromotionsByMonth: async (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await axiosClient.get<ApiResponse<TopPromotionResponse[]>>(
      `/dashboard/top-promotions-by-month${queryString}`
    );
    return response.data;
  },

  // Top promotions by year
  getTopPromotionsByYear: async (year?: number) => {
    const params = year ? `?year=${year}` : '';
    const response = await axiosClient.get<ApiResponse<TopPromotionResponse[]>>(
      `/dashboard/top-promotions-by-year${params}`
    );
    return response.data;
  },

  // Compare promotions between 2 periods
  comparePromotion: async (
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
    
    const response = await axiosClient.get<ApiResponse<PromotionComparisonResponse>>(
      `/dashboard/compare-promotion?${params.toString()}`
    );
    return response.data;
  },

  // Get all promotions by day
  getAllPromotionsByDay: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await axiosClient.get<ApiResponse<TopPromotionResponse[]>>(
      `/dashboard/all-promotions-by-day${queryString}`
    );
    return response.data;
  },

  // Get all promotions by month
  getAllPromotionsByMonth: async (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await axiosClient.get<ApiResponse<TopPromotionResponse[]>>(
      `/dashboard/all-promotions-by-month${queryString}`
    );
    return response.data;
  },

  // Get all promotions by year
  getAllPromotionsByYear: async (year?: number) => {
    const params = year ? `?year=${year}` : '';
    const response = await axiosClient.get<ApiResponse<TopPromotionResponse[]>>(
      `/dashboard/all-promotions-by-year${params}`
    );
    return response.data;
  },

  // Get promotion detail
  getPromotionDetail: async (promotionId: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await axiosClient.get<ApiResponse<import('@/types/voucher-promotion.type').PromotionDetailResponse>>(
      `/dashboard/promotion-detail/${promotionId}${queryString}`
    );
    return response.data;
  },

  // Export promotion dashboard to Excel (uses common dashboard export endpoint)
  exportDashboardExcel: async (startDate?: string, endDate?: string): Promise<void> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await axiosClient.get(`/dashboard/export-excel${queryString}`, {
      responseType: 'blob',
    });
    
    const blob = response.data;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `promotion_dashboard_${startDate}_${endDate}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
  getPromotions: async ({
    page,
    size,
    name,
    type,
    active,
    startDate,
    priority,
  }: GetPromotionsParams) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: size.toString(),
    });

    if (name) params.append("name", name);
    if (type) params.append("type", type);
    if (active !== undefined) params.append("active", active.toString());
    if (startDate) params.append("startDate", startDate);
    if (priority !== undefined) params.append("priority", priority.toString());

    const response = await axiosClient.get<PromotionListResponse>(
      `/promotions?${params.toString()}`
    );
    return response.data;
  },

  getPromotionById: async (id: number) => {
    const response = await axiosClient.get<PromotionResponse>(`/promotions/${id}`);
    return response.data;
  },

  createPromotion: async (request: CreatePromotionRequest) => {
    const response = await axiosClient.post<PromotionResponse>('/promotions', request);
    return response.data;
  },

  updatePromotion: async (id: number, data: UpdatePromotionRequest) => {
    const response = await axiosClient.put<PromotionResponse>(`/promotions/${id}`, data);
    return response.data;
  },

  deletePromotion: async (id: number) => {
    await axiosClient.delete(`/promotions/${id}`);
  },

  changeStatusPromotion: async (id: number) => {
    await axiosClient.put(`/promotions/change-status/${id}`);
  }
};
