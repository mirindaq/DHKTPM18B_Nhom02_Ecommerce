import axiosClient from '@/configurations/axios.config';
import type {
  ApiResponse,
  TopPromotionResponse,
  PromotionComparisonResponse
} from '@/types/voucher-promotion.type';

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
  }
};
