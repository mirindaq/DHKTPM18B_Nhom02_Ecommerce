import axiosClient from '@/configurations/axios.config';
import type { 
  CreateVariantRequest, 
  VariantResponse, 
  VariantListResponse,
  VariantValueResponse,
  VariantListResponseForCreateProduct
} from '@/types/variant.type';

export const variantService = {
  getVariants: async (page: number = 1, size: number = 10, search: string = "") => {
    const response = await axiosClient.get<VariantListResponse>(`/variants?page=${page}&size=${size}&variantName=${search}`);
    return response.data;
  },
  getVariantsForCreateProduct: async (categoryId: number) => {
    const response = await axiosClient.get<VariantListResponseForCreateProduct>(`/variants/category/${categoryId}`);
    return response.data;
  },

  getVariantById: async (id: number) => {
    const response = await axiosClient.get<VariantResponse>(`/variants/${id}`);
    return response.data;
  },

  createVariant: async (request: CreateVariantRequest) => {
    const response = await axiosClient.post<VariantResponse>('/variants', request);
    return response.data;
  },

  updateVariant: async (id: number, request: CreateVariantRequest) => {
    const response = await axiosClient.put<VariantResponse>(`/variants/${id}`, request);
    return response.data;
  },

  changeStatusVariant: async (id: number) => {
    await axiosClient.put(`/variants/change-status/${id}`);
  },

  getVariantValuesByVariantId: async (id: number) => {
    const response = await axiosClient.get<VariantValueResponse>(`/variant-values/variant/${id}`);
    return response.data;
  }
};
