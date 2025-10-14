import axiosClient from '@/configurations/axios.config';
import type {
  CreatePromotionRequest,
  UpdatePromotionRequest,
  PromotionListResponse,
  PromotionResponse,
} from "@/types/promotion.type";

interface GetPromotionsParams {
  page: number;
  size: number;
  name?: string;
  type?: string;
  active?: boolean;
  startDate?: string;
  endDate?: string;
}

export const promotionService = {
  getPromotions: async ({
    page,
    size,
    name,
    type,
    active,
    startDate,
    endDate,
  }: GetPromotionsParams) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: size.toString(),
    });

    if (name) params.append("name", name);
    if (type) params.append("type", type);
    if (active !== undefined) params.append("active", active.toString());
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

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
